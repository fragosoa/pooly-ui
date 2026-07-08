Surfaces.

```jsx
<Card interactive padding={20}>…</Card>

<Tabs
  value={tab}
  onChange={setTab}
  tabs={[
    { id: "responses", label: "Respuestas", icon: "message-square", count: 1284 },
    { id: "report", label: "Reporte IA", icon: "sparkles" },
    { id: "status", label: "Estado", icon: "activity" },
  ]}
/>
```

`Card` is the base white surface (12px radius, hairline border, subtle shadow); `interactive` adds the brand-border lift used on event/feature/report cards. `Tabs` is the underline tab bar with active brand underline and optional count badge.
