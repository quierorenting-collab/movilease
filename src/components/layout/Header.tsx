import Link from "next/link";
import { buildWhatsAppLink } from "@/lib/constants";
import { getCurrentBrand } from "@/lib/brand";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

const NAV_LINKS = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/comparador", label: "Comparador" },
  { href: "/calculadora", label: "Calculadora" },
  { href: "/blog", label: "Blog" },
  { href: "/contacto", label: "Contacto" },
];

export async function Header() {
  const brand = await getCurrentBrand();

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-background/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {brand.name}
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
        <ButtonLink
          href={buildWhatsAppLink("Hola, me gustaría más información sobre renting.")}
          target="_blank"
          rel="noopener noreferrer"
          variant="whatsapp"
          className="px-4 py-2"
        >
          WhatsApp
        </ButtonLink>
      </Container>
    </header>
  );
}
