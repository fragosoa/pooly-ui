Status & data-display primitives.

```jsx
<Badge tone="brand" icon="message-circle">128 respuestas</Badge>
<StatusBadge kind="sentiment" value="positive" />
<StatusBadge kind="urgency" value="high" />
<StatusBadge kind="order" value="active" />
<StatusBadge kind="job" value="running" />
<Avatar name="María López" />
<Avatar name="Tienda Lumo" shape="rounded" />
<StatCard icon="message-square" value="1,284" label="Respuestas" trend="+12%" />
<ProgressBar value={62} showLabel />
```

`Badge` is the generic colored label; `StatusBadge` encodes the product's semantic vocabulary (sentiment / urgency / order state / job / data source) so colors stay consistent. `Avatar` auto-colors from the name. `StatCard` is the dashboard KPI tile. `ProgressBar` powers survey progress and theme-distribution bars.
