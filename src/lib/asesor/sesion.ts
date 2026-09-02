import "server-only";
import { createHash, randomBytes } from "node:crypto";

/**
 * Identidad de la sesión del asesor, para clientes anónimos.
 *
 * El visitante del chat no tiene cuenta. En lugar de inventarle una identidad
 * en Supabase para que RLS la gobierne, se le entrega un token aleatorio que
 * guarda su navegador, y en la base de datos se almacena solo su **hash**
 * (`conversations.session_token_hash`).
 *
 * Guardar el hash y no el token es lo que evita que quien lea esa tabla —una
 * copia de seguridad, un volcado, cualquiera con acceso de lectura— se lleve
 * las llaves de los expedientes ajenos. Al otro lado de esos expedientes hay
 * DNI y nóminas.
 */

/** 32 bytes de aleatoriedad criptográfica. Es lo que ve el navegador. */
export function nuevoTokenSesion(): string {
  return randomBytes(32).toString("base64url");
}

/** Lo único que se guarda. SHA-256 basta: el token ya es aleatorio y largo,
 *  así que no hay diccionario que atacar y no hace falta un KDF lento. */
export function hashTokenSesion(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
