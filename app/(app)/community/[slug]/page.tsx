import { redirect } from "next/navigation";

interface CommunityThreadRedirectProps {
  params: Promise<{ slug: string }>;
}

export default async function CommunityThreadRedirectPage({
  params,
}: CommunityThreadRedirectProps) {
  const { slug } = await params;
  redirect(`/forum/${slug}`);
}
