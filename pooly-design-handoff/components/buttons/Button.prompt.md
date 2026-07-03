Buttons. `Button` carries the label action; `IconButton` is icon-only (toolbar, close, copy, FAB).

```jsx
<Button variant="primary" leftIcon="plus">Crear encuesta</Button>
<Button variant="action" rightIcon="arrow-right">Empieza gratis</Button>
<Button variant="secondary">Cancelar</Button>
<Button variant="ghost" size="sm">Ver respuestas</Button>
<IconButton icon="x" label="Cerrar" />
<IconButton icon="plus" variant="action" round size="lg" />
```

`variant="action"` is the **deep-blue conversion button** — use only for signup/start/pricing, never for ordinary actions. `variant="primary"` (brand blue) is the everyday action. Supports `loading`, `fullWidth`, `leftIcon`/`rightIcon`, and `as="a"`/`href`.
