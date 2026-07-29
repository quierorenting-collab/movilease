import { ImageResponse } from "next/og";

/**
 * Imagen para compartir. No existía ninguna: los enlaces en WhatsApp — canal
 * principal del negocio — salían como texto pelado. Se genera en build, así
 * que no añade nada al peso de la web.
 */
export const alt = "MoviLease — Renting de coches sin entrada, todo incluido";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(140deg, #123068 0%, #071A3D 55%, #04102A 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Resplandor azul de marca */}
        <div
          style={{
            position: "absolute",
            top: -160,
            right: -120,
            width: 640,
            height: 640,
            borderRadius: 640,
            background: "radial-gradient(circle, rgba(0,104,255,0.35) 0%, rgba(0,104,255,0) 70%)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 44, height: 4, background: "#5AA0FF" }} />
          <div
            style={{
              color: "#5AA0FF",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 6,
              textTransform: "uppercase",
            }}
          >
            MoviLease
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#FFFFFF",
              fontSize: 82,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -2.5,
            }}
          >
            Estrena coche
          </div>
          <div
            style={{
              color: "#5AA0FF",
              fontSize: 82,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -2.5,
            }}
          >
            sin complicaciones.
          </div>
        </div>

        <div style={{ display: "flex", gap: 44, alignItems: "center" }}>
          {["0 € de entrada", "Seguro y mantenimiento incluidos", "Respuesta en 48 h"].map(
            (item) => (
              <div
                key={item}
                style={{ display: "flex", alignItems: "center", gap: 12, color: "#C7D7F0", fontSize: 24 }}
              >
                <div style={{ width: 10, height: 10, borderRadius: 10, background: "#5AA0FF" }} />
                {item}
              </div>
            )
          )}
        </div>
      </div>
    ),
    size
  );
}
