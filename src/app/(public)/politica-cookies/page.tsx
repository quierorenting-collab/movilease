import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT } from "@/lib/constants";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Política de cookies",
  description: "Qué cookies utiliza MoviLease y cómo gestionar tus preferencias.",
  path: "/politica-cookies",
});

export default function PoliticaCookiesPage() {
  return (
    <>
      <section className="surface-black relative pt-32 pb-24">
        <div className="ambient-blue-top" aria-hidden />
        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6">
          <p className="section-label mb-6">Legal</p>
          <h1 className="display-md text-white">Política de cookies</h1>
          <p className="mt-6 text-sm text-white/70">
            Última actualización: 1 de septiembre de 2026
          </p>
        </div>
      </section>

      <section className="surface-graphite py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2
            className="text-xl text-white"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            1. Qué usa realmente esta web
          </h2>
          <p className="mt-4 text-[15px] leading-[1.8] text-white/70">
            MoviLease no instala cookies propias. Lo que guardamos en tu
            navegador para que la web funcione se almacena en el
            <em> almacenamiento local</em> del propio dispositivo, no se envía a
            ningún servidor y puedes borrarlo cuando quieras. La única cookie que
            puede llegar a instalarse es la de la herramienta de analítica, y solo
            si tú la aceptas.
          </p>

          <h2
            className="mt-14 text-xl text-white"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            2. Almacenamiento local necesario
          </h2>
          <p className="mt-4 text-[15px] leading-[1.8] text-white/70">
            Se guarda siempre, porque sin ello la web pierde funciones básicas.
            No requiere consentimiento y no permite identificarte.
          </p>
          <ul className="mt-4 space-y-2 text-[15px] leading-[1.8] text-white/70">
            <li>
              <span className="text-white">ml_cookie_pref</span> — recuerda si
              aceptaste o rechazaste las cookies analíticas, para no volver a
              preguntártelo en cada visita.
            </li>
            <li>
              <span className="text-white">movilease:favorites:v1</span> — la
              lista de coches que marcas como favoritos.
            </li>
            <li>
              <span className="text-white">movilease:comparison:v1</span> — los
              coches que añades al comparador.
            </li>
            <li>
              <span className="text-white">qr_popup_v4</span> — recuerda que ya
              se te ha mostrado el aviso de asesoramiento, para no repetirlo.
              Este se guarda en el almacenamiento <em>de sesión</em>: se borra
              solo al cerrar la pestaña.
            </li>
          </ul>

          <h2
            className="mt-14 text-xl text-white"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            3. Cookies analíticas (solo con tu permiso)
          </h2>
          <p className="mt-4 text-[15px] leading-[1.8] text-white/70">
            Usamos Google Analytics 4 para saber cuántas personas visitan la web
            y qué páginas les interesan, siempre en conjunto y nunca para
            identificarte de forma individual. La herramienta arranca con el
            consentimiento denegado y solo empieza a medir si pulsas
            &laquo;Aceptar&raquo; en el aviso de cookies. Si lo rechazas, no se
            instala ninguna cookie.
          </p>
          <ul className="mt-4 space-y-2 text-[15px] leading-[1.8] text-white/70">
            <li>
              <span className="text-white">_ga</span> — distingue navegadores
              entre sí. Caducidad: 2 años. Titular: Google.
            </li>
            <li>
              <span className="text-white">_ga_&lt;identificador&gt;</span> —
              mantiene el estado de la sesión de medición. Caducidad: 2 años.
              Titular: Google.
            </li>
          </ul>
          <p className="mt-4 text-[15px] leading-[1.8] text-white/70">
            El tratamiento que hace Google de esos datos se rige por sus propias
            condiciones y puede implicar transferencias internacionales, con las
            garantías descritas en nuestra{" "}
            <Link href="/politica-privacidad" className="underline">
              política de privacidad
            </Link>
            .
          </p>

          <h2
            className="mt-14 text-xl text-white"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            4. Cómo cambiar o retirar tu decisión
          </h2>
          <p className="mt-4 text-[15px] leading-[1.8] text-white/70">
            Puedes cambiar de opinión en cualquier momento borrando los datos que
            este sitio guarda en tu navegador: al hacerlo se olvida tu
            preferencia y el aviso de cookies vuelve a aparecer para que elijas de
            nuevo. La ruta depende del navegador, pero suele estar en
            <em>
              {" "}
              Configuración &rsaquo; Privacidad y seguridad &rsaquo; Datos de
              sitios
            </em>
            , buscando movilease.es.
          </p>
          <p className="mt-4 text-[15px] leading-[1.8] text-white/70">
            También puedes bloquear las cookies de forma general desde la
            configuración de tu navegador, o instalar el{" "}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              complemento de inhabilitación de Google Analytics
            </a>
            . Rechazar las cookies analíticas no limita ninguna función de la web.
          </p>

          <h2
            className="mt-14 text-xl text-white"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            5. Dudas
          </h2>
          <p className="mt-4 text-[15px] leading-[1.8] text-white/70">
            Si algo de esta política no te queda claro, escríbenos a{" "}
            <a href={`mailto:${CONTACT.email}`} className="underline">
              {CONTACT.email}
            </a>{" "}
            y te lo explicamos.
          </p>
        </div>
      </section>
    </>
  );
}
