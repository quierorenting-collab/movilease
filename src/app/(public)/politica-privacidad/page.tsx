import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT } from "@/lib/constants";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Política de privacidad",
  description: "Cómo trata MoviLease tus datos personales y qué derechos tienes.",
  path: "/politica-privacidad",
});

export default function PoliticaPrivacidadPage() {
  return (
    <>
      <section className="surface-black relative pt-32 pb-24">
        <div className="ambient-blue-top" aria-hidden />
        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6">
          <p className="section-label mb-6">Legal</p>
          <h1 className="display-md text-white">Política de privacidad</h1>
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
            1. Responsable del tratamiento
          </h2>
          <ul className="mt-4 space-y-2 text-[15px] leading-[1.8] text-white/70">
            <li>
              <span className="text-white">Responsable:</span> MOVILEASE RENTING,
              S.L.
            </li>
            <li>
              <span className="text-white">NIF:</span> B93944635
            </li>
            <li>
              <span className="text-white">Domicilio:</span> Calle Infanta
              Mercedes 31, 2 — 28020 Madrid (España)
            </li>
            <li>
              <span className="text-white">Contacto:</span>{" "}
              <a href={`mailto:${CONTACT.email}`} className="underline">
                {CONTACT.email}
              </a>
            </li>
          </ul>

          <h2
            className="mt-14 text-xl text-white"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            2. Qué datos recogemos
          </h2>
          <p className="mt-4 text-[15px] leading-[1.8] text-white/70">
            Solo tratamos los datos que nos facilitas al rellenar un formulario
            de la web, junto con unos pocos datos técnicos de la propia petición:
          </p>
          <ul className="mt-4 space-y-2 text-[15px] leading-[1.8] text-white/70">
            <li>
              <span className="text-white">Obligatorios:</span> nombre y teléfono.
            </li>
            <li>
              <span className="text-white">Opcionales:</span> apellidos, correo
              electrónico, empresa, provincia, tipo de cliente (particular,
              autónomo o empresa) y el mensaje que quieras escribirnos.
            </li>
            <li>
              <span className="text-white">De contexto:</span> el vehículo o
              modelo sobre el que consultas y la página desde la que envías el
              formulario, para poder responderte con la oferta correcta.
            </li>
            <li>
              <span className="text-white">Técnicos:</span> dirección IP y
              navegador desde el que se envía, junto con la fecha, para dejar
              constancia del consentimiento y frenar los envíos automatizados.
            </li>
          </ul>
          <p className="mt-4 text-[15px] leading-[1.8] text-white/70">
            No pedimos datos bancarios, ni documentos de identidad, ni ninguna
            categoría especial de datos a través de la web.
          </p>

          <h2
            className="mt-14 text-xl text-white"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            3. Para qué los usamos y con qué base legal
          </h2>
          <ul className="mt-4 space-y-2 text-[15px] leading-[1.8] text-white/70">
            <li>
              <span className="text-white">
                Atender tu solicitud y prepararte una propuesta de renting,
              </span>{" "}
              contactándote por teléfono, WhatsApp o correo electrónico. Base
              legal: tu consentimiento, que otorgas al marcar la casilla del
              formulario (art. 6.1.a del RGPD), y la aplicación de medidas
              precontractuales a petición tuya (art. 6.1.b).
            </li>
            <li>
              <span className="text-white">
                Proteger el formulario frente al spam
              </span>{" "}
              y dejar constancia de cuándo y desde dónde se envió. Base legal:
              nuestro interés legítimo en la seguridad del servicio (art. 6.1.f).
            </li>
            <li>
              <span className="text-white">
                Medir de forma agregada cómo se usa la web
              </span>{" "}
              para mejorarla. Base legal: tu consentimiento, que puedes aceptar o
              rechazar en el aviso de cookies (art. 6.1.a). Si lo rechazas, la
              analítica no se activa.
            </li>
          </ul>
          <p className="mt-4 text-[15px] leading-[1.8] text-white/70">
            No enviamos comunicaciones comerciales ajenas a la solicitud que nos
            hayas hecho, ni cedemos tus datos a terceros para que te ofrezcan sus
            productos. Tampoco tomamos decisiones automatizadas ni elaboramos
            perfiles con efectos jurídicos sobre ti.
          </p>

          <h2
            className="mt-14 text-xl text-white"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            4. Quién más accede a tus datos
          </h2>
          <p className="mt-4 text-[15px] leading-[1.8] text-white/70">
            Para prestar el servicio nos apoyamos en proveedores que actúan como
            encargados del tratamiento y solo tratan los datos siguiendo nuestras
            instrucciones:
          </p>
          <ul className="mt-4 space-y-2 text-[15px] leading-[1.8] text-white/70">
            <li>
              <span className="text-white">Supabase:</span> base de datos donde se
              guarda tu solicitud.
            </li>
            <li>
              <span className="text-white">Vercel:</span> alojamiento y
              distribución del sitio web.
            </li>
            <li>
              <span className="text-white">Web3Forms:</span> envío del aviso por
              correo electrónico cuando recibimos una solicitud.
            </li>
            <li>
              <span className="text-white">Telegram:</span> aviso instantáneo al
              equipo comercial de que hay una solicitud nueva.
            </li>
            <li>
              <span className="text-white">Google (Analytics 4):</span> medición
              de uso de la web, únicamente si aceptas las cookies analíticas.
            </li>
          </ul>
          <p className="mt-4 text-[15px] leading-[1.8] text-white/70">
            Si eliges continuar la conversación por WhatsApp, ese canal se rige
            además por las condiciones de su propio proveedor. Cuando la gestión
            de tu renting lo requiera, comunicaremos los datos necesarios a la
            entidad financiera o al proveedor del vehículo que corresponda, y te
            informaremos de ello. También pueden comunicarse datos a las
            administraciones públicas cuando una norma lo exija.
          </p>
          <p className="mt-4 text-[15px] leading-[1.8] text-white/70">
            Algunos de estos proveedores están ubicados fuera del Espacio
            Económico Europeo, por lo que puede haber transferencias
            internacionales de datos. En ese caso se realizan al amparo de las
            garantías previstas en el capítulo V del RGPD, como las decisiones de
            adecuación de la Comisión Europea o las cláusulas contractuales tipo.
          </p>

          <h2
            className="mt-14 text-xl text-white"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            5. Cuánto tiempo los conservamos
          </h2>
          <p className="mt-4 text-[15px] leading-[1.8] text-white/70">
            Conservamos tu solicitud mientras siga viva la gestión que nos
            pediste y, después, mientras exista una relación contractual o
            comercial contigo. Si nos pides que suprimamos tus datos, dejamos de
            tratarlos de inmediato y solo los mantenemos bloqueados durante los
            plazos legales de prescripción, para atender posibles
            responsabilidades. Los datos de analítica se conservan de forma
            agregada según los plazos configurados en Google Analytics.
          </p>

          <h2
            className="mt-14 text-xl text-white"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            6. Tus derechos
          </h2>
          <p className="mt-4 text-[15px] leading-[1.8] text-white/70">
            Puedes ejercer en cualquier momento los derechos de acceso,
            rectificación, supresión, oposición, limitación del tratamiento y
            portabilidad, así como retirar el consentimiento que nos hayas dado,
            sin que ello afecte a la licitud del tratamiento anterior. Para
            hacerlo, escríbenos a{" "}
            <a href={`mailto:${CONTACT.email}`} className="underline">
              {CONTACT.email}
            </a>{" "}
            indicando qué derecho quieres ejercer. Te responderemos en el plazo
            máximo de un mes.
          </p>
          <p className="mt-4 text-[15px] leading-[1.8] text-white/70">
            Si consideras que no hemos atendido correctamente tu solicitud,
            puedes presentar una reclamación ante la Agencia Española de
            Protección de Datos (
            <a
              href="https://www.aepd.es"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              www.aepd.es
            </a>
            ), C/ Jorge Juan 6, 28001 Madrid.
          </p>

          <h2
            className="mt-14 text-xl text-white"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            7. Menores de edad
          </h2>
          <p className="mt-4 text-[15px] leading-[1.8] text-white/70">
            Este sitio no está dirigido a menores de 14 años y no recogemos sus
            datos de forma consciente. Si detectamos que hemos recibido datos de
            un menor sin autorización de sus tutores, los eliminaremos.
          </p>

          <h2
            className="mt-14 text-xl text-white"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            8. Cookies y cambios en esta política
          </h2>
          <p className="mt-4 text-[15px] leading-[1.8] text-white/70">
            El detalle de las cookies y del almacenamiento local que usa el sitio
            está en la{" "}
            <Link href="/politica-cookies" className="underline">
              política de cookies
            </Link>
            . Podemos actualizar esta política si cambian los servicios o la
            normativa; en ese caso, actualizaremos la fecha que figura al
            principio.
          </p>
        </div>
      </section>
    </>
  );
}
