Product-specific composites — the two views unique to Pooly.

```jsx
<ShareLink url="https://pooly.mx/r/lumo-post-compra" />

<ReportCard
  category="Tiempo de entrega"
  sentiment="negative"
  urgency="high"
  mentions={142}
  percent={31}
  responses={1284}
  summary="Los clientes valoran el producto pero la demora en el envío es el motivo #1 de frustración."
  quotes={["Tardó 9 días en llegar", "Buen producto, pero el envío fue lentísimo"]}
  recommendation="Revisa el SLA de tu paquetería y comunica tiempos reales en el checkout."
/>
```

`ShareLink` is the shareable survey URL block (copy → green "Copiado"). `ReportCard` is the AI theme card: sentiment + urgency badges, key stats, summary, verbatim quotes, and an action-blue recommended-action strip.
