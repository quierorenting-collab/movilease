# DOCUMENTACIÓN POR PERFIL DE CLIENTE

> Fuente: Adrián, 02/09/2026. Transcrito literalmente de las plantillas que usa
> hoy por WhatsApp. **Esta es la única fuente válida**: ni la IA ni ninguna
> sesión futura debe deducir, ampliar ni "completar" estas listas.
>
> Destino: alimentará la base de conocimientos del asesor IA y será editable
> desde el panel sin tocar código.

## Cuándo se pide

**Cuando el cliente ya ha elegido coche.** Nunca antes: pedir el DNI mientras
el cliente todavía está comparando espanta la conversación. El flujo es
dudas → perfil → recomendación → coche elegido → datos de contacto → documentación.

## Vía de entrega

Por el chat, o al correo **adrian@movilease.es**.

⚠️ Ver "Decisiones pendientes" al final: la vía del correo deja el expediente
desincronizado, porque el sistema no se entera de lo que llega a esa bandeja.

---

## PARTICULAR

Texto que usa Adrián hoy: *"Para pasar tu solicitud como particular necesito
que me envíes la siguiente documentación:"*

1. Foto del DNI
2. 2 últimas nóminas
3. Última declaración de la renta
4. Vida laboral
5. Certificado de titularidad bancario actualizado
6. Carnet de conducir

---

## AUTÓNOMO

Texto que usa Adrián hoy: *"Para pasar tu solicitud como autónomo necesito que
me envíes la siguiente documentación:"*

1. DNI o NIE del titular
2. Vida laboral
3. Última declaración de la renta presentada — **hoy: ejercicio 2025**
4. Resumen anual de IVA, Modelo 390 — **hoy: ejercicio 2025**
5. Trimestres de IVA del año en curso (Modelos 303) — hoy: los de 2026 ya presentados
6. Certificado de titularidad bancario actualizado
7. Modelo 036 o 037 de alta censal
8. Carnet de conducir

---

## EMPRESA

Texto que usa Adrián hoy: *"Para pasar tu solicitud por empresa necesito que me
envíes la siguiente documentación:"*

1. CIF definitivo de la empresa
2. DNI o NIE del apoderado/s
3. Balance de pérdidas y ganancias
4. Escrituras de constitución
5. Último Impuesto de Sociedades presentado, Modelo 200 — **hoy: ejercicio 2025**
6. Resumen anual de IVA, Modelo 390 — **hoy: ejercicio 2025**
7. Trimestres de IVA del año en curso (Modelos 303) — hoy: los de 2026 ya presentados
8. Recibo de titularidad bancaria
9. Carnet de conducir

---

## Obligatoriedad

**Los tres perfiles: todos los documentos son obligatorios.** No hay opcionales.
Confirmado por Adrián el 02/09/2026.

Consecuencia para el sistema: un expediente solo pasa a "documentación
completa" con la lista íntegra de su perfil. Cualquier ausencia lo deja en
"incompleta", y la IA debe poder nombrar exactamente lo que falta.

---

## Observaciones sobre el modelo de datos

Estas listas obligan a que **un tipo de documento no sea una fila, sino una
lista**. Hay tres casos claros:

- **"2 últimas nóminas"** — cantidad fija, dos archivos.
- **"Trimestres IVA año en curso (Mod. 303)"** — número variable según el mes
  en que se solicite: en enero es uno, en octubre son tres.
- **"DNI o NIE del apoderado/s"** — plural. Una sociedad puede tener varios
  apoderados mancomunados.

Por tanto cada requisito documental necesita saber cuántos archivos espera
(exacto, mínimo, o variable) para que el sistema pueda decir con propiedad
"te falta una nómina" en lugar de dar el requisito por cumplido con la primera.

---

## Decisiones pendientes

**1. RESUELTO — el periodo fiscal se guarda como regla, no como año fijo.**
Las plantillas originales decían "23/24" y "2024/25", escritas para la campaña
de 2025 y ya caducadas en septiembre de 2026. Adrián confirma el 02/09/2026
que hoy corresponde el **ejercicio 2025** para la renta, el Modelo 390 y el
Modelo 200.

Se guarda como **regla relativa** —"última declaración presentada", "trimestres
del año en curso"— y el sistema resuelve el ejercicio concreto según la fecha.
El nombre del documento sigue siendo texto editable desde el panel.

Motivo: con año fijo, esto vuelve a caducar en enero y la IA acabaría pidiendo
documentos de hace dos ejercicios delante de una gestoría. Con regla relativa
no hay nada que recordar.

Falta definir el detalle de la regla de la renta: entre enero y junio, la
declaración del ejercicio anterior aún no se ha presentado, así que "la última
presentada" retrocede un año más. Lo dejo resuelto en el diseño de la base de
conocimientos.

**2. En empresa, ¿carnet de conducir de quién?**
Resuelto que sí se pide (02/09/2026), pero no de quién: del apoderado que
firma o del conductor habitual, que en una empresa no tienen por qué ser la
misma persona. Detalle menor para el flujo, no bloquea el modelo de datos.

**3. La alternativa del correo rompe el seguimiento.**
Si el cliente manda la documentación a adrian@movilease.es, el expediente no
se entera y la IA seguirá diciendo que falta. Opciones: quitar esa vía del
chat, o mantenerla y marcar a mano en el panel lo recibido por correo.
