import type { Metadata } from "next";
import Link from "next/link";

import { getPublishedPosts } from "@/lib/data/blog";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { buildWhatsAppLink } from "@/lib/constants";
import { pageMetadata } from "@/lib/metadata";
import { BreadcrumbJsonLd, ItemListJsonLd, WebPageJsonLd } from "@/components/seo/JsonLd";

export const revalidate = 1800;

export const metadata: Metadata = pageMetadata({
  title: "Blog de renting",
  description:
    "Guías y artículos sobre renting de coches para particulares, autónomos y empresas: cuotas, fiscalidad y comparativas.",
  path: "/blog",
});

function formatearFecha(iso: string | null) {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

export default async function BlogPage() {
  const posts = await getPublishedPosts(30);
  const [destacado, ...resto] = posts;

  return (
    <>
      <WebPageJsonLd
        tipo="CollectionPage"
        nombre="Blog de renting"
        descripcion="Guías y artículos sobre renting de coches para particulares, autónomos y empresas."
        path="/blog"
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", path: "/" },
          { name: "Blog de renting", path: "/blog" },
        ]}
      />
      {posts.length > 0 && (
        <ItemListJsonLd
          name="Artículos sobre renting"
          items={posts.map((p) => ({ name: p.title, path: `/blog/${p.slug}` }))}
        />
      )}

      <section className="surface-black relative overflow-hidden pt-32 pb-20">
        <div className="ambient-blue-top" aria-hidden />

        <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-10">
          <Reveal className="max-w-2xl">
            <p className="section-label">Blog</p>
            <h1 className="display-lg mt-4 text-white">Guías de renting.</h1>
            <p className="mt-5 max-w-xl text-[17px] leading-[1.7] text-white/80">
              Lo que conviene saber antes de firmar: cómo se compara una oferta con
              otra, qué incluye de verdad una cuota y cómo elegir el kilometraje.
            </p>
          </Reveal>
        </div>
      </section>

      {posts.length === 0 ? (
        <section className="bg-white py-24">
          <div className="mx-auto max-w-2xl px-6 text-center sm:px-10">
            <h2 className="display-sm text-[#0A0A0A]">Todavía no hay artículos</h2>
            <p className="mt-4 text-[16px] leading-relaxed text-[#4B5563]">
              Estamos preparando las primeras guías. Mientras tanto, si tienes una duda
              concreta, pregúntanos directamente y te la resolvemos.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/contacto" className="btn-primary">
                Preguntar
              </Link>
              <Link href="/catalogo" className="btn-white">
                Ver catálogo
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-6 sm:px-10">
            {/* Destacado: el más reciente ocupa el ancho completo */}
            <Reveal>
              <Link
                href={`/blog/${destacado.slug}`}
                className="card-lift group block rounded-3xl border border-[#E5E9F0] bg-[#F8FAFC] p-8 sm:p-11"
              >
                <p className="eyebrow text-[#4B5563]">Lo último</p>
                <h2
                  className="mt-4 max-w-3xl text-[28px] font-bold leading-tight text-[#0A0A0A] group-hover:text-[#0057D6] sm:text-[34px]"
                  style={{ fontFamily: "var(--font-space-grotesk)", letterSpacing: "-0.02em" }}
                >
                  {destacado.title}
                </h2>
                {destacado.excerpt && (
                  <p className="mt-5 max-w-2xl text-[16.5px] leading-[1.75] text-[#33415C]">
                    {destacado.excerpt}
                  </p>
                )}
                <span className="mt-7 inline-flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-[0.1em] text-[#0057D6]">
                  Leer el artículo
                  <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </Link>
            </Reveal>

            {resto.length > 0 && (
              <RevealGroup stagger={0.07} className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {resto.map((post) => {
                  const fecha = formatearFecha(post.publishedAt);
                  return (
                    <RevealItem key={post.id}>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="card-lift group flex h-full flex-col rounded-2xl bg-white p-7"
                        style={{ boxShadow: "var(--shadow-card)" }}
                      >
                        {fecha && (
                          <time
                            dateTime={post.publishedAt ?? undefined}
                            className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#6B7280]"
                          >
                            {fecha}
                          </time>
                        )}
                        <h3
                          className="mt-3 text-[19px] font-bold leading-snug text-[#0A0A0A] group-hover:text-[#0057D6]"
                          style={{ fontFamily: "var(--font-space-grotesk)" }}
                        >
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="mt-3 line-clamp-4 text-[14.5px] leading-relaxed text-[#5B6472]">
                            {post.excerpt}
                          </p>
                        )}
                        <span className="mt-auto pt-6 text-[11.5px] font-bold uppercase tracking-[0.1em] text-[#0057D6]">
                          Leer →
                        </span>
                      </Link>
                    </RevealItem>
                  );
                })}
              </RevealGroup>
            )}
          </div>
        </section>
      )}

      <section className="surface-carbon section-y-sm">
        <Reveal className="mx-auto flex max-w-4xl flex-col items-center gap-7 px-6 text-center sm:px-10">
          <div>
            <h2 className="display-sm text-white">¿Tienes una duda que no está aquí?</h2>
            <p className="mx-auto mt-4 max-w-xl text-[15.5px] leading-[1.72] text-white/80">
              Pregúntanos lo que sea sobre tu caso concreto. Te contestamos una persona,
              sin compromiso y sin insistir después.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={buildWhatsAppLink("Hola, tengo una duda sobre renting.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              Preguntar por WhatsApp
            </a>
            <Link href="/catalogo" className="btn-ghost">
              Ver catálogo
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
