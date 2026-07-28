import type { Metadata } from "next";
import { CONTACT } from "@/lib/constants";
import { Container, Section } from "@/components/ui/Container";
import { LeadForm } from "@/components/forms/LeadForm";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Ponte en contacto con el equipo para solicitar una oferta de renting.",
};

export default function ContactoPage() {
  return (
    <Section className="pt-12">
      <Container className="max-w-lg">
        <h1 className="text-3xl font-semibold tracking-tight">Contacto</h1>
        <p className="mt-2 text-muted">
          Cuéntanos qué buscas y te contactamos por WhatsApp. También puedes escribirnos a{" "}
          <a href={`mailto:${CONTACT.email}`} className="underline">
            {CONTACT.email}
          </a>
          .
        </p>
        <div className="mt-8">
          <LeadForm source="contact_form" />
        </div>
      </Container>
    </Section>
  );
}
