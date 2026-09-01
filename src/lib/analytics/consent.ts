declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Clave de la preferencia de cookies. Vive aquí, y no dentro del CookieBanner,
 * porque la lee también el script de arranque de Google Analytics: si cada uno
 * llevara su propia cadena, cambiar una y olvidar la otra dejaría la analítica
 * en "denegado" para siempre sin que nada avisara.
 */
export const COOKIE_PREF_KEY = "ml_cookie_pref";

/** Actualiza el consentimiento de Google Consent Mode v2 tras la decisión del usuario en el CookieBanner. */
export function updateAnalyticsConsent(granted: boolean) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
  });
}
