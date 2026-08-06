import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getPublishedPosts, getRelatedPosts } from "@/lib/data/blog";
import { Markdown, extraerIndice } from "@/components/blog/Markdown";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/metadata";
import { buildWhatsAppLink } from "@/lib/constants";
import { Reveal } from "@/components/ui/Reveal";

export const revalidate = 3600;

type Params = { slug: string };

/** Los artículos publicados se generan en el build: son estáticos por naturaleza. */
export async function generateStaticParams() {
  const posts = await getPublishedPosts(100);
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  return pageMetadata({
    title: post.title,
    description: post.excerpt ?? `${post.title}. Guía de renting de coches de MoviLease.`,
    path: `/blog/${post.slug}`,
    images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
  });
}

function formatearFecha(iso: string | null) {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

/** ~200 palabras por minuto de lectura. */
function minutosLectura(content: string) {
  const palabras = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(palabras / 200));
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const relacionados = await getRelatedPosts(slug, 3);
  const indice = extraerIndice(post.content);
  const fecha = formatearFecha(post.publishedAt);
  const minutos = minutosLectura(post.content);

  return (
    <>
      <ArticleJsonLd
        title={post.title}
        slug={post.slug}
        excerpt={post.excerpt}
        image={post.coverImageUrl}
        publishedAt={post.publishedAt}
        updatedAt={post.updatedAt}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      />

      {/* Cabecera */}
      <header className="surface-black ambient-blue-top relative overflow-hidden pt-32 pb-16">
        <div className="relative z-10 mx-auto max-w-3xl px-6 sm:px-10">
          <nav aria-label="Ruta de navegación" className="mb-8">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-white/70">
              <li>
                <Link href="/" className="transition-colors hover:text-white">
                  Inicio
                </Link>
              </li>
              <li aria-hidden="true" className="text-white/45">
                /
              </li>
              <li>
                <Link href="/blog" className="transition-colors hover:text-white">
                  Blog
                </Link>
              </li>
            </ol>
          </nav>

          <Reveal>
            <h1 className="display-md text-white">{post.title}</h1>
            {post.excerpt && (
              <p className="mt-6 text-[18px] leading-[1.7] text-white/80">{post.excerpt}</p>
            )}
            <p className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-white/70">
              {fecha && <time dateTime={post.publishedAt ?? undefined}>{fecha}</time>}
              {fecha && <span aria-hidden="true">·</span>}
              <span>{minutos} min de lectura</span>
            </p>
          </Reveal>
        </div>
      </header>

      {/* Cuerpo */}
      <article className="bg-white pb-24 pt-16">
        <div className="mx-auto max-w-3xl px-6 sm:px-10">
          {post.coverImageUrl && (
            <div className="relative mb-12 aspect-[16/9] overflow-hidden rounded-2xl bg-[#F4F6FA]">
              <Image
                src={post.coverImageUrl}
                alt=""
                fill
                priority
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
            </div>
          )}

          {indice.length > 2 && (
            <nav
              aria-label="Contenido del artículo"
              className="mb-12 rounded-2xl border border-[#E5E9F0] bg-[#F8FAFC] p-6"
            >
              <p className="eyebrow mb-4 text-[#4B5563]">En este artículo</p>
              <ol role="list" className="flex flex-col gap-2.5">
                {indice.map((s, i) => (
                  <li key={s.ancla} className="flex gap-3 text-[15px] leading-snug">
                    <span aria-hidden="true" className="font-semibold text-[#0057D6]">
                      {i + 1}.
                    </span>
                    <a
                      href={`#${s.ancla}`}
                      className="text-[#33415C] underline-offset-2 hover:text-[#0057D6] hover:underline"
                    >
                      {s.titulo}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div>
            <Markdown content={post.content} />
          </div>

          {/* Cierre: de leer a pedir presupuesto */}
          <aside className="mt-16 rounded-3xl bg-gradient-to-b from-[#1B4080] to-[#0C2454] p-8 sm:p-10">
            <h2
              className="text-[24px] font-bold leading-tight text-white"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              ¿Te hacemos números con tu caso?
            </h2>
            <p className="mt-3 max-w-lg text-[15.5px] leading-relaxed text-white/80">
              Dinos qué coche te interesa y te mandamos la cuota cerrada, sin entrada y
              con todo incluido. Sin compromiso.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/contacto" className="btn-primary">
                Pedir mi propuesta
              </Link>
              <a
                href={buildWhatsAppLink(
                  "Hola, he leído un artículo del blog y quiero información."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
              >
                Preguntar por WhatsApp
              </a>
            </div>
          </aside>
        </div>
      </article>

      {relacionados.length > 0 && (
        <section className="bg-[#F4F6FA] py-20">
          <div className="mx-auto max-w-5xl px-6 sm:px-10">
            <h2 className="display-sm mb-10 text-[#0A0A0A]">Seguir leyendo</h2>
            <ul role="list" className="grid gap-6 sm:grid-cols-3">
              {relacionados.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="card-lift group flex h-full flex-col rounded-2xl bg-white p-6"
                    style={{ boxShadow: "var(--shadow-card)" }}
                  >
                    <h3
                      className="text-[17px] font-bold leading-snug text-[#0A0A0A] group-hover:text-[#0057D6]"
                      style={{ fontFamily: "var(--font-space-grotesk)" }}
                    >
                      {p.title}
                    </h3>
                    {p.excerpt && (
                      <p className="mt-3 line-clamp-3 text-[14.5px] leading-relaxed text-[#5B6472]">
                        {p.excerpt}
                      </p>
                    )}
                    <span className="mt-auto pt-5 text-[11.5px] font-bold uppercase tracking-[0.1em] text-[#0057D6]">
                      Leer →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
