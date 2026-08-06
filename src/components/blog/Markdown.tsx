import Link from "next/link";
import React from "react";

/**
 * Renderizador de Markdown mínimo para los artículos del blog.
 *
 * Cubre sólo lo que se usa al escribir: h2, h3, párrafos, listas con viñeta y
 * numeradas, citas, negrita, cursiva y enlaces. No interpreta HTML en bruto y
 * no usa dangerouslySetInnerHTML en ningún punto: todo sale como nodos de
 * React, así que un artículo mal escrito no puede inyectar nada.
 *
 * Se hace a mano en vez de añadir una dependencia porque el subconjunto es
 * pequeño y estable, y evita arrastrar un parser entero al bundle.
 */

/** Negrita, cursiva y enlaces dentro de una línea. */
function inline(texto: string, keyBase: string): React.ReactNode[] {
  const nodos: React.ReactNode[] = [];
  // el orden importa: ** antes que *
  const patron = /(\[([^\]]+)\]\(([^)\s]+)\))|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g;
  let ultimo = 0;
  let m: RegExpExecArray | null;
  let i = 0;

  while ((m = patron.exec(texto)) !== null) {
    if (m.index > ultimo) nodos.push(texto.slice(ultimo, m.index));
    const key = `${keyBase}-i${i++}`;

    if (m[1]) {
      const href = m[3];
      const externo = /^https?:\/\//.test(href);
      nodos.push(
        externo ? (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#0057D6] underline underline-offset-2 hover:text-[#0A0A0A]"
          >
            {m[2]}
          </a>
        ) : (
          <Link
            key={key}
            href={href}
            className="font-medium text-[#0057D6] underline underline-offset-2 hover:text-[#0A0A0A]"
          >
            {m[2]}
          </Link>
        )
      );
    } else if (m[4]) {
      nodos.push(
        <strong key={key} className="font-semibold text-[#0A0A0A]">
          {m[5]}
        </strong>
      );
    } else if (m[6]) {
      nodos.push(<em key={key}>{m[7]}</em>);
    }
    ultimo = patron.lastIndex;
  }
  if (ultimo < texto.length) nodos.push(texto.slice(ultimo));
  return nodos;
}

/** Ancla estable para los h2, para poder enlazar a una sección concreta. */
function slugify(t: string) {
  return t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function Markdown({ content }: { content: string }) {
  const lineas = content.replace(/\r\n/g, "\n").split("\n");
  const salida: React.ReactNode[] = [];
  let i = 0;

  while (i < lineas.length) {
    const linea = lineas[i];

    if (!linea.trim()) {
      i++;
      continue;
    }

    if (linea.startsWith("### ")) {
      const t = linea.slice(4).trim();
      salida.push(
        <h3
          key={`h3-${i}`}
          className="mt-10 text-[21px] font-bold leading-snug text-[#0A0A0A]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          {inline(t, `h3-${i}`)}
        </h3>
      );
      i++;
      continue;
    }

    if (linea.startsWith("## ")) {
      const t = linea.slice(3).trim();
      salida.push(
        <h2
          key={`h2-${i}`}
          id={slugify(t)}
          className="mt-14 scroll-mt-28 text-[27px] font-bold leading-tight text-[#0A0A0A]"
          style={{ fontFamily: "var(--font-space-grotesk)", letterSpacing: "-0.02em" }}
        >
          {inline(t, `h2-${i}`)}
        </h2>
      );
      i++;
      continue;
    }

    if (linea.startsWith("> ")) {
      const bloque: string[] = [];
      while (i < lineas.length && lineas[i].startsWith("> ")) {
        bloque.push(lineas[i].slice(2).trim());
        i++;
      }
      salida.push(
        <blockquote
          key={`q-${i}`}
          className="my-8 border-l-[3px] border-[#0057D6] bg-[#F4F6FA] px-6 py-5 text-[16.5px] leading-[1.75] text-[#33415C]"
        >
          {inline(bloque.join(" "), `q-${i}`)}
        </blockquote>
      );
      continue;
    }

    if (/^[-*] /.test(linea)) {
      const items: string[] = [];
      while (i < lineas.length && /^[-*] /.test(lineas[i])) {
        items.push(lineas[i].slice(2).trim());
        i++;
      }
      salida.push(
        <ul key={`ul-${i}`} role="list" className="mt-5 flex flex-col gap-3">
          {items.map((it, k) => (
            <li key={k} className="flex gap-3 text-[17px] leading-[1.75] text-[#33415C]">
              <span aria-hidden="true" className="mt-[10px] h-[6px] w-[6px] shrink-0 rounded-full bg-[#0057D6]" />
              <span>{inline(it, `ul-${i}-${k}`)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\. /.test(linea)) {
      const items: string[] = [];
      while (i < lineas.length && /^\d+\. /.test(lineas[i])) {
        items.push(lineas[i].replace(/^\d+\.\s*/, "").trim());
        i++;
      }
      salida.push(
        <ol key={`ol-${i}`} role="list" className="mt-5 flex flex-col gap-3">
          {items.map((it, k) => (
            <li key={k} className="flex gap-3 text-[17px] leading-[1.75] text-[#33415C]">
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0057D6]/10 text-[12px] font-bold text-[#0057D6]"
              >
                {k + 1}
              </span>
              <span>{inline(it, `ol-${i}-${k}`)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // párrafo: junta líneas seguidas hasta el próximo bloque
    const parrafo: string[] = [];
    while (
      i < lineas.length &&
      lineas[i].trim() &&
      !/^(#{2,3} |[-*] |\d+\. |> )/.test(lineas[i])
    ) {
      parrafo.push(lineas[i].trim());
      i++;
    }
    salida.push(
      <p key={`p-${i}`} className="mt-5 text-[17px] leading-[1.8] text-[#33415C]">
        {inline(parrafo.join(" "), `p-${i}`)}
      </p>
    );
  }

  return <>{salida}</>;
}

/** Índice de contenidos a partir de los h2, para artículos largos. */
export function extraerIndice(content: string) {
  return content
    .split("\n")
    .filter((l) => l.startsWith("## "))
    .map((l) => {
      const t = l.slice(3).trim();
      return { titulo: t, ancla: slugify(t) };
    });
}
