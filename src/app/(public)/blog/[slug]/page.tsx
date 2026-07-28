import { notFound } from "next/navigation";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await params;
  // La consulta real a blog_posts llega en la Fase 4 junto al resto del panel de blog.
  notFound();
}
