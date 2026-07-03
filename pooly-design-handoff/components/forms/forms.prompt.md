Form controls. `Input`/`Textarea` share the brand focus ring; wrap them in `FormField` for label/hint/error. `ChatOption` is the shopper-facing answer choice on the public response screen.

```jsx
<FormField label="Nombre de la encuesta" required hint="Visible para tus clientes">
  <Input leftIcon="tag" placeholder="Feedback post-compra — Marzo" />
</FormField>

<Textarea chat placeholder="Escribe tu respuesta…" />

<ChatOption selected onSelect={fn}>Llegó antes de lo esperado</ChatOption>
<ChatOption multi onSelect={fn}>Empaque dañado</ChatOption>
```

`chat` on Textarea is the larger, 2px-border style for the public screen. `ChatOption` uses a radio dot by default, checkbox when `multi`.
