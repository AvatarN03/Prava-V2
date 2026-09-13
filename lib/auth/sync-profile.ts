import { db } from "@/lib/db";
import type { User } from "@supabase/supabase-js";
import { generateSmartUniqueUsername } from "@/features/profile/username-generator";

/**
 * Ensures a Supabase auth user is reliably synced with the Postgres Profile table.
 * Handles edge cases such as:
 * 1. Normal sync by user.id
 * 2. Stale profile rows where a user was re-registered or re-authenticated in Supabase
 *    with the same email but a new user UUID (resolves `profiles_email_key` unique constraint errors)
 * 3. Migrating any existing trips/data to the active user UUID
 */
export async function syncUserProfile(user: User) {
  const email = user.email ?? "";
  const fullName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? null;
  const avatarUrl = user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null;

  // 1. Check if profile exists by user.id (Primary Key)
  const existingById = await db.profile.findUnique({
    where: { id: user.id },
  });

  if (existingById) {
    let username = existingById.username;
    if (!username) {
      username = await generateSmartUniqueUsername(fullName || email || "traveler", user.id);
    }

    return await db.profile.update({
      where: { id: user.id },
      data: {
        email: email || existingById.email,
        fullName: fullName ?? existingById.fullName,
        avatarUrl: avatarUrl ?? existingById.avatarUrl,
        username,
      },
    });
  }

  // 2. If not found by ID, check if a profile exists with this email (under an older/stale Supabase auth ID)
  if (email) {
    const existingByEmail = await db.profile.findFirst({
      where: { email },
    });

    if (existingByEmail) {
      // Migrate orphaned records to the new user.id and update profile
      // To avoid unique constraint collision on email during transition:
      const tempEmail = `${email}__migrating__${Date.now()}`;
      await db.profile.update({
        where: { id: existingByEmail.id },
        data: { email: tempEmail },
      });

      const initialUsername =
        existingByEmail.username ||
        (await generateSmartUniqueUsername(fullName || email || "traveler", user.id));

      const newProfile = await db.profile.create({
        data: {
          id: user.id,
          email: email,
          fullName: fullName ?? existingByEmail.fullName,
          avatarUrl: avatarUrl ?? existingByEmail.avatarUrl,
          username: initialUsername,
          bio: existingByEmail.bio,
          isPublic: existingByEmail.isPublic,
        },
      });

      // Relink all foreign-key linked data to the new user.id
      await db.trip.updateMany({
        where: { profileId: existingByEmail.id },
        data: { profileId: user.id },
      });

      await db.aiConversation.updateMany({
        where: { profileId: existingByEmail.id },
        data: { profileId: user.id },
      });

      await db.blogPost.updateMany({
        where: { profileId: existingByEmail.id },
        data: { profileId: user.id },
      });

      await db.expense.updateMany({
        where: { profileId: existingByEmail.id },
        data: { profileId: user.id },
      });

      await db.link.updateMany({
        where: { profileId: existingByEmail.id },
        data: { profileId: user.id },
      });

      // Delete the old profile row
      await db.profile.delete({
        where: { id: existingByEmail.id },
      });

      return newProfile;
    }
  }

  // 3. Brand new profile creation
  const initialUsername = await generateSmartUniqueUsername(
    fullName || email || "traveler",
    user.id
  );

  return await db.profile.create({
    data: {
      id: user.id,
      email: email,
      fullName: fullName,
      avatarUrl: avatarUrl,
      username: initialUsername,
    },
  });
}
