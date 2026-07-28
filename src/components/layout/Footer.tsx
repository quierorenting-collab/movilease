import Link from "next/link";
import { CONTACT } from "@/lib/constants";
import { getCurrentBrand } from "@/lib/brand";
import { Container } from "@/components/ui/Container";

export async function Footer() {
  const brand = await getCurrentBrand();

  return (
    <footer className="border-t border-border-subtle py-10 text-sm text-muted">
      <Container className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-base font-semibold text-foreground">{brand.name}</p>
          <p className="mt-1 max-w-xs">{brand.description}</p>
        </div>
        <div className="flex flex-col gap-2">
          <a href={`mailto:${CONTACT.email}`} className="hover:text-foreground">
            {CONTACT.email}
          </a>
          <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
            Instagram
          </a>
        </div>
        <div className="flex flex-col gap-2">
          <Link href="/aviso-legal" className="hover:text-foreground">
            Aviso legal
          </Link>
          <Link href="/politica-privacidad" className="hover:text-foreground">
            Política de privacidad
          </Link>
          <Link href="/politica-cookies" className="hover:text-foreground">
            Política de cookies
          </Link>
        </div>
      </Container>
      <p className="mt-8 text-center text-xs text-muted-2">
        © {new Date().getFullYear()} {brand.name}. Todos los derechos reservados.
      </p>
    </footer>
  );
}
