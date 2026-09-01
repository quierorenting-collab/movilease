import Script from "next/script";
import { COOKIE_PREF_KEY } from "@/lib/analytics/consent";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Google Analytics 4, solo en producción y solo para movilease.es
 * (quierorenting.es comparte código pero hoy no se sirve desde esta aplicación
 * y no lleva analítica). Arranca con Consent Mode v2 y el CookieBanner
 * actualiza el consentimiento con updateAnalyticsConsent().
 */
export function GoogleAnalytics() {
  // Ya no se comprueba el dominio con getCurrentBrand(). Esa comprobacion leia
  // headers(), y este componente va en el layout raiz: bastaba con eso para
  // que ninguna pagina del sitio se cachease. Como quierorenting.es no se
  // sirve desde aqui, la comprobacion no filtraba nada y costaba el TTFB de
  // toda la web. Si algun dia se sirve, se vuelve a poner el filtro sabiendo
  // lo que cuesta, o se usa una variable de entorno por despliegue.
  if (process.env.NODE_ENV !== "production" || !GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          // El consentimiento por defecto sale de lo que el visitante ya decidió.
          // Leerlo aquí, y no desde un efecto de React, es lo que hace que a quien
          // ya aceptó se le mida: este script y el banner cargan los dos con
          // afterInteractive, así que el efecto del banner corría antes de que
          // existiera gtag y su "consent update" se perdía en silencio.
          var mlPref = null;
          try { mlPref = localStorage.getItem('${COOKIE_PREF_KEY}'); } catch (e) {}
          gtag('consent', 'default', {
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'analytics_storage': mlPref === 'accept' ? 'granted' : 'denied'
          });
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
