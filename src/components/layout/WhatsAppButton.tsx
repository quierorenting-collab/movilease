"use client";

import { motion } from "framer-motion";
import { buildWhatsAppLink } from "@/lib/constants";

export function WhatsAppButton() {
  return (
    <motion.a
      href={buildWhatsAppLink("Hola, me gustaría más información sobre renting.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-[#0A0A0A]/85 shadow-float backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-[#25D366]/40 hover:shadow-[0_8px_32px_rgba(37,211,102,0.25)]"
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-[#25D366]" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12.004 2C6.478 2 2 6.477 2 12c0 1.848.505 3.58 1.383 5.065L2 22l5.062-1.362A9.94 9.94 0 0 0 12.004 22C17.53 22 22 17.523 22 12S17.53 2 12.004 2zm0 18.045a8.02 8.02 0 0 1-4.086-1.117l-.293-.174-3.006.809.805-2.933-.19-.303A8.05 8.05 0 1 1 20.05 12a8.05 8.05 0 0 1-8.046 8.045z" />
      </svg>
    </motion.a>
  );
}
