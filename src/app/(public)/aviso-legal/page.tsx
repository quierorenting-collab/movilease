import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT } from "@/lib/constants";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Aviso legal",
  description: "Información legal y condiciones de uso de MoviLease.",
  path: "/aviso-legal",
});

export default function AvisoLegalPage() {
  return (
    <>
      <section className="surface-black relative pt-32 pb-24">
        <div className="ambient-blue-top" aria-hidden />
        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6">
          <p className="section-label mb-6">Legal</p>
          <h1 className="display-md text-white">Aviso legal</h1>
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
            1. Identificación del titular
          </h2>
          <p className="mt-4 text-[15px] leading-[1.8] text-white/70">
            En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de
            Servicios de la Sociedad de la Información y de Comercio Electrónico
            (LSSI-CE), se facilitan los datos identificativos del titular de este
            sitio web:
          </p>
          <ul className="mt-4 space-y-2 text-[15px] leading-[1.8] text-white/70">
            <li>
              <span className="text-white">Denominación social:</span> MOVILEASE
              RENTING, S.L.
            </li>
            <li>
              <span className="text-white">NIF:</span> B93944635
            </li>
            <li>
              <span className="text-white">Domicilio social:</span> Calle Infanta
              Mercedes 31, 2 — 28020 Madrid (España)
            </li>
            <li>
              <span className="text-white">Correo electrónico:</span>{" "}
              <a href={`mailto:${CONTACT.email}`} className="underline">
                {CONTACT.email}
              </a>
            </li>
            <li>
              <span className="text-white">Teléfono:</span>{" "}
              <a href={`tel:${CONTACT.phone}`} className="underline">
                {CONTACT.phoneDisplay}
              </a>
            </li>
            <li>
              <span className="text-white">Sitio web:</span> movilease.es
            </li>
          </ul>

          <h2
            className="mt-14 text-xl text-white"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            2. Objeto y actividad
          </h2>
          <p className="mt-4 text-[15px] leading-[1.8] text-white/70">
            Este sitio web presenta ofertas de renting de vehículos para
            particulares, autónomos y empresas, y permite ponerse en contacto con
            MoviLease para recibir una propuesta personalizada. MoviLease actúa
            como intermediario: el contrato de renting se formaliza con la
            entidad financiera o el proveedor que corresponda en cada caso, y
            queda sujeto a su aprobación y a la disponibilidad del vehículo.
          </p>

          <h2
            className="mt-14 text-xl text-white"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            3. Precios y disponibilidad
          </h2>
          <p className="mt-4 text-[15px] leading-[1.8] text-white/70">
            Las cuotas publicadas se muestran en euros con el IVA incluido y
            corresponden al plazo y al kilometraje anual indicados en cada ficha.
            Son precios orientativos, elaborados a partir de la información
            facilitada por los proveedores, y no constituyen una oferta
            contractual vinculante: pueden variar según las condiciones finales
            del contrato, el perfil del solicitante y la disponibilidad del
            vehículo. La cuota definitiva se confirma por escrito antes de la
            firma.
          </p>

          <h2
            className="mt-14 text-xl text-white"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            4. Condiciones de uso
          </h2>
          <p className="mt-4 text-[15px] leading-[1.8] text-white/70">
            El acceso a este sitio es gratuito y atribuye la condición de
            usuario. El usuario se compromete a hacer un uso diligente de la web
            y a no emplearla para actividades contrarias a la ley, a la buena fe
            o al orden público, ni para introducir contenidos que puedan dañar
            los sistemas del titular o de terceros. Los datos facilitados a
            través de los formularios deben ser veraces y estar actualizados.
          </p>

          <h2
            className="mt-14 text-xl text-white"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            5. Propiedad intelectual e industrial
          </h2>
          <p className="mt-4 text-[15px] leading-[1.8] text-white/70">
            Los contenidos de este sitio —textos, diseño, código y fotografías—
            pertenecen a MOVILEASE RENTING, S.L. o se utilizan con autorización
            de sus titulares. Las marcas, logotipos y nombres comerciales de los
            fabricantes de vehículos que aparecen en la web son propiedad de sus
            respectivos titulares y se muestran únicamente para identificar los
            modelos ofertados. Queda prohibida su reproducción o explotación sin
            autorización expresa.
          </p>

          <h2
            className="mt-14 text-xl text-white"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            6. Responsabilidad
          </h2>
          <p className="mt-4 text-[15px] leading-[1.8] text-white/70">
            MoviLease procura que la información publicada sea correcta y esté
            actualizada, pero no garantiza la ausencia de errores tipográficos ni
            la disponibilidad ininterrumpida del sitio. No se responsabiliza de
            los daños derivados del uso de la web ni de los contenidos de sitios
            de terceros a los que se pueda acceder mediante enlaces, sobre los
            que no ejerce control alguno.
          </p>

          <h2
            className="mt-14 text-xl text-white"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            7. Protección de datos y cookies
          </h2>
          <p className="mt-4 text-[15px] leading-[1.8] text-white/70">
            El tratamiento de los datos personales facilitados a través del sitio
            se describe en la{" "}
            <Link href="/politica-privacidad" className="underline">
              política de privacidad
            </Link>
            . El uso de cookies y tecnologías similares se detalla en la{" "}
            <Link href="/politica-cookies" className="underline">
              política de cookies
            </Link>
            .
          </p>

          <h2
            className="mt-14 text-xl text-white"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            8. Legislación aplicable
          </h2>
          <p className="mt-4 text-[15px] leading-[1.8] text-white/70">
            Este aviso legal se rige por la legislación española. Para cualquier
            controversia derivada del uso del sitio, las partes se someten a los
            juzgados y tribunales del domicilio del titular, salvo que la
            normativa de consumidores y usuarios establezca un fuero distinto de
            carácter imperativo.
          </p>
        </div>
      </section>
    </>
  );
}
