// Mock data for the Pooly admin UI kit. Attached to window for the
// Babel-scoped screen scripts to share.
window.PoolyData = {
  user: { name: "Ana Rivera", store: "Tienda Lumo" },

  stats: [
    { icon: "clipboard-list", tone: "brand", value: "12", label: "Encuestas", trend: "+3", trendDir: "up" },
    { icon: "message-square", tone: "info", value: "8,420", label: "Respuestas", trend: "+18%", trendDir: "up" },
    { icon: "activity", tone: "success", value: "4", label: "Activas" },
    { icon: "timer", tone: "warning", value: "1.4k", label: "Prom. respuestas" },
  ],

  events: [
    { id: "lumo-post-compra", title: "Feedback post-compra — Marzo", status: "active", responses: 1284, days: 6, moment: "Post-compra" },
    { id: "devoluciones-q1", title: "¿Por qué nos devolviste?", status: "urgent", responses: 318, days: 1, moment: "Devoluciones" },
    { id: "nps-suscripcion", title: "NPS cualitativo — Suscriptores", status: "closing", responses: 902, days: 2, moment: "NPS" },
    { id: "soporte-cx", title: "Después de hablar con soporte", status: "active", responses: 547, days: 11, moment: "Soporte" },
    { id: "lanzamiento-serum", title: "Validación: nuevo sérum", status: "ended", responses: 1640, days: 0, moment: "Producto" },
    { id: "checkout-friccion", title: "¿Qué te hizo dudar al comprar?", status: "paused", responses: 211, days: 0, moment: "Checkout" },
  ],

  // Journey-moment templates Pooly suggests (e-commerce, not civic)
  templates: [
    { icon: "shopping-bag", title: "Post-compra", desc: "¿Qué te hizo dudar antes de comprar?" },
    { icon: "package", title: "Post-entrega / NPS", desc: "¿Cómo fue recibir tu pedido?" },
    { icon: "rotate-ccw", title: "Devoluciones", desc: "¿Por qué decidiste devolverlo?" },
    { icon: "headphones", title: "Soporte", desc: "¿Resolvimos lo que necesitabas?" },
    { icon: "sparkles", title: "Validación de producto", desc: "¿Qué opinas de este lanzamiento?" },
  ],

  responses: [
    "Tardó 9 días en llegar, pensé que no llegaba.",
    "El producto está increíble, pero el envío fue lentísimo.",
    "Me encantó el empaque, se siente premium.",
    "Dudé por el costo de envío, casi no compro.",
    "Súper fácil el checkout, lo recomendaría.",
    "Llegó un día antes, excelente.",
    "Esperaba más tamaño por el precio.",
  ],

  report: [
    {
      category: "Tiempo de entrega",
      sentiment: "negative", urgency: "high",
      mentions: 142, percent: 31, responses: 1284,
      summary: "Valoran el producto, pero la demora en el envío es el motivo #1 de frustración post-compra. Varios temieron que el pedido no llegara.",
      quotes: ["Tardó 9 días en llegar", "Buen producto, pero el envío fue lentísimo"],
      recommendation: "Revisa el SLA de tu paquetería y muestra tiempos reales de entrega en el checkout.",
    },
    {
      category: "Empaque y unboxing",
      sentiment: "positive", urgency: "low",
      mentions: 88, percent: 19, responses: 1284,
      summary: "El empaque genera una percepción premium y aparece como un punto de deleite que los clientes mencionan de forma espontánea.",
      quotes: ["Me encantó el empaque", "Se siente premium al abrirlo"],
      recommendation: "Aprovecha el unboxing: incluye un inserto que invite a compartir en redes.",
    },
    {
      category: "Costo de envío",
      sentiment: "negative", urgency: "medium",
      mentions: 64, percent: 14, responses: 1284,
      summary: "El costo de envío es la principal fricción antes de comprar; algunos estuvieron a punto de abandonar el carrito.",
      quotes: ["Dudé por el costo de envío", "Casi no compro por el shipping"],
      recommendation: "Prueba envío gratis sobre cierto monto y mídelo contra la tasa de conversión.",
    },
  ],

  jobs: [
    { id: "job_8f2a", status: "completed", message: "Análisis completado — 6 temas detectados", date: "Hoy, 10:42" },
    { id: "job_8f29", status: "running", message: "Procesando 1,284 respuestas…", date: "Hoy, 10:41" },
    { id: "job_8e7c", status: "error", message: "Sin respuestas suficientes para analizar", date: "Ayer, 18:03" },
  ],
};
