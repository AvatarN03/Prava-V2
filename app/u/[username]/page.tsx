import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicCreatorProfile } from "@/features/profile/actions";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import {
  Compass,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  User,
  Globe,
  ListTodo,
  BedDouble,
  Copy,
  BookOpen,
  Clock,
} from "lucide-react";
import { CloneTripButton } from "./clone-trip-button";
import { StoryCard } from "@/features/blog/components/story-card";

interface PublicProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function PublicCreatorProfilePage({ params }: PublicProfilePageProps) {
  const { username } = await params;
  const res = await getPublicCreatorProfile(username);

  if (!res.success || !res.creator) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
        <header className="border-b border-border py-4 px-6 bg-background">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary text-primary-foreground">
                <Compass className="h-4 w-4" />
              </div>
              <span>Prava AI</span>
            </Link>
            <Link href="/community">
              <Button variant="ghost" size="sm">Explore Community</Button>
            </Link>
          </div>
        </header>

        <div className="max-w-md mx-auto text-center py-20 px-4 space-y-4">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <User className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold">Profile Not Available</h1>
          <p className="text-xs text-muted-foreground">
            The creator profile <span className="font-semibold text-foreground">@{username}</span> either does not exist or has set their profile to private.
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <Link href="/community">
              <Button size="sm">Explore Published Trips</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm">Back Home</Button>
            </Link>
          </div>
        </div>

        <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
          Prava AI — Workspace First, AI Second.
        </footer>
      </div>
    );
  }

  const { creator } = res;

  // Check current session
  let currentUser = null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    currentUser = user;
  } catch {
    currentUser = null;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
            <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary text-primary-foreground shadow-xs">
              <Compass className="h-4 w-4" />
            </div>
            <span>Prava AI</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/stories">
              <Button variant="ghost" size="sm" className="text-xs">
                Stories
              </Button>
            </Link>
            <Link href="/community">
              <Button variant="ghost" size="sm" className="text-xs">
                Community
              </Button>
            </Link>
            {currentUser ? (
              <Link href="/dashboard">
                <Button size="sm" className="text-xs shadow-xs">
                  My Workspace
                </Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button size="sm" className="text-xs shadow-xs">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Creator Identity Hero */}
      <section className="border-b border-border bg-muted/20 py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
            {/* Avatar */}
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden border-2 border-border bg-card shadow-xs shrink-0 flex items-center justify-center text-xl font-bold text-foreground">
              {creator.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={creator.avatarUrl}
                  alt={creator.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{getInitials(creator.fullName)}</span>
              )}
            </div>

            {/* Identity Info */}
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground truncate">
                  {creator.fullName}
                </h1>
                <Badge variant="secondary" className="gap-1 text-[11px] font-mono">
                  <Globe className="h-3 w-3 text-primary" /> @{creator.username}
                </Badge>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
                {creator.bio}
              </p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                <span>Member since {creator.memberSince}</span>
                <span>•</span>
                <span className="font-semibold text-foreground">
                  {creator.trips.length} {creator.trips.length === 1 ? "Trip" : "Trips"}
                </span>
                <span>•</span>
                <span className="font-semibold text-foreground">
                  {creator.stories.length} {creator.stories.length === 1 ? "Story" : "Stories"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-12">
          {/* Creator Stories Showcase */}
          {creator.stories && creator.stories.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" /> Travel Stories & Guides
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Articles and guides authored by @{creator.username}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {creator.stories.map((story) => (
                  <StoryCard
                    key={story.id}
                    story={{
                      ...story,
                      profile: {
                        fullName: creator.fullName,
                        username: creator.username,
                        avatarUrl: creator.avatarUrl,
                        isPublic: true,
                      },
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Creator Published Trips Grid */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                  <Compass className="h-4 w-4 text-primary" /> Published Itineraries
                </h2>
                <p className="text-xs text-muted-foreground">
                  Public travel frameworks and itineraries designed by @{creator.username}
                </p>
              </div>
            </div>

            {creator.trips.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-12 text-center space-y-2">
                <p className="text-sm font-semibold">No public itineraries yet</p>
                <p className="text-xs text-muted-foreground">
                  This creator hasn't published any trips to the community yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {creator.trips.map((trip) => (
                  <Card
                    key={trip.id}
                    className="group relative flex flex-col justify-between overflow-hidden border-border bg-card hover:border-primary/40 transition-colors shadow-2xs"
                  >
                    {/* Cover Image */}
                    {trip.coverImageUrl ? (
                      <div className="relative h-36 w-full overflow-hidden border-b border-border bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={trip.coverImageUrl}
                          alt={trip.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </div>
                    ) : (
                      <div className="h-24 w-full bg-gradient-to-r from-sky-100 to-slate-100 flex items-center justify-between px-4 border-b border-border">
                        <div className="text-xs font-semibold text-primary flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {trip.destination || "Destination"}
                        </div>
                      </div>
                    )}

                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="planning" className="text-[10px]">
                          {trip.durationDays} {trip.durationDays === 1 ? "Day" : "Days"}
                        </Badge>
                        {trip.destination && (
                          <span className="text-xs text-muted-foreground truncate">
                            {trip.destination}
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-base font-bold text-foreground leading-snug line-clamp-1 pt-1 group-hover:text-primary transition-colors">
                        {trip.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="p-4 pt-0 pb-3 space-y-3">
                      {trip.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {trip.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1 border-t border-border/60">
                        <span className="flex items-center gap-1">
                          <ListTodo className="h-3 w-3 text-primary" /> {trip.activityCount} activities
                        </span>
                        <span className="flex items-center gap-1">
                          <BedDouble className="h-3 w-3 text-primary" /> {trip.accommodationCount} stays
                        </span>
                      </div>
                    </CardContent>

                    <CardFooter className="p-3 border-t border-border bg-muted/20 flex items-center justify-end">
                      <CloneTripButton tripId={trip.id} tripTitle={trip.title} />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-xs text-muted-foreground">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Compass className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold text-foreground">Prava AI</span>
            <span>— Workspace First, AI Second.</span>
          </div>
          <div>
            <Link href="/stories" className="hover:text-foreground transition-colors mr-4">
              Stories
            </Link>
            <Link href="/community" className="hover:text-foreground transition-colors mr-4">
              Community Hub
            </Link>
            <Link href="/auth" className="hover:text-foreground transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
