import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface BlogPostCard {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  publishedAt: string | null;
}

export interface BlogPost extends BlogPostCard {
  content: string;
  updatedAt: string | null;
}

const CARD_COLUMNS = "id, title, slug, excerpt, cover_image_url, published_at";

type Row = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  content?: string;
  updated_at?: string | null;
};

function toCard(r: Row): BlogPostCard {
  return {
    id: r.id,
    title: r.title,
    slug: r.slug,
    excerpt: r.excerpt,
    coverImageUrl: r.cover_image_url,
    publishedAt: r.published_at,
  };
}

/** Nunca lanza: si Supabase no responde, el blog se queda vacío en vez de romper. */
export async function getPublishedPosts(limit = 50): Promise<BlogPostCard[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select(CARD_COLUMNS)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return (data as Row[]).map(toCard);
  } catch {
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("blog_posts")
      .select(`${CARD_COLUMNS}, content, updated_at`)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (!data) return null;
    const r = data as Row;
    return { ...toCard(r), content: r.content ?? "", updatedAt: r.updated_at ?? null };
  } catch {
    return null;
  }
}

/** Otros artículos para enlazar al final de uno, sin repetir el actual. */
export async function getRelatedPosts(slugActual: string, limit = 3): Promise<BlogPostCard[]> {
  const todos = await getPublishedPosts(limit + 1);
  return todos.filter((p) => p.slug !== slugActual).slice(0, limit);
}
