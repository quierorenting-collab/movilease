import Script from "next/script";
import { getCurrentBrand } from "@/lib/brand";
import { COOKIE_PREF_KEY } from "@/lib/analytics/consent";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Google Analytics 4, solo en producción y solo para movilease.es
 * (quierorenting.es comparte código pero hoy no se sirve desde esta aplicación
 * y no lleva analítica). Arranca con Consent Mode v2 y el CookieBanner
 * actualiza el consentimiento con updateAnalyticsConsent().
 */
export async function GoogleAnalytics() {
  if (process.env.NODE_ENV !== "production" || !GA_MEASUREMENT_ID) return null;

  const brand = await getCurrentBrand();
  if (brand.domain !== "movilease.es") return null;

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
