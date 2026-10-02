/* ═══════════════════════════════════════════════════════════════
   PROYECTOS DEL PORTAFOLIO
   ───────────────────────────────────────────────────────────────
   Para AGREGAR una tarjeta: copia un bloque completo { ... },
   pégalo dentro del array PROJECTS y edita sus datos.
   La web lo renderiza automáticamente, sin tocar nada más.

   Campos de cada proyecto:
     · visible     → true muestra la tarjeta / false la oculta
     · name        → nombre del proyecto (se usa para el monograma)
     · nameHtml    → OPCIONAL. Nombre con HTML (tipografía especial,
                     como la R invertida de MORFI). Si no existe,
                     se usa `name`.
     · description → descripción breve
     · url         → sitio que se abre en una pestaña nueva
     · logo        → ruta a la imagen dentro de /assets
                     (ej: "assets/logos/miapp.png") o URL completa.
                     Se usa como FONDO de la tarjeta, oscurecido.
                     Si queda vacío (""), se muestra un monograma.
   ═══════════════════════════════════════════════════════════════ */

const PROJECTS = [
  // ── Proyecto 1 ──────────────────────────────────────────────
  {
    visible: true,
    name: "MORFI",
    nameHtml: 'MO<span class="flip">R</span>FI',
    description:
      "Sistema de gestión para restaurantes. Pedidos, comandas y cuenta: del QR a la cuenta, sin fricción.",
    url: "https://kuzzzman-stack.github.io/MORFI-landing/",
    logo: "assets/logos/logo-morfi.png",
  },

  // ── Plantilla para duplicar (oculta con visible: false) ─────
  {
    visible: false,
    name: "Lorem Ipsum",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis.",
    url: "https://example.com",
    logo: "",
  },

];