import { notFound } from "next/navigation";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await params;
  // La plantilla de artículo llega con la fase de datos del blog; hasta entonces, 404.
  notFound();
}
