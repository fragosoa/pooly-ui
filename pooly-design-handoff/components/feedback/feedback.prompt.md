Feedback primitives.

```jsx
<Alert variant="success" title="Análisis listo">Encontramos 6 temas en 1,284 respuestas.</Alert>
<Alert variant="error" onClose={fn}>No pudimos procesar el archivo.</Alert>
<Spinner size={32} />
<Modal title="Eliminar encuesta" tone="danger" icon="trash-2" onClose={fn}
  footer={<><Button variant="secondary" onClick={fn}>Cancelar</Button><Button variant="danger">Eliminar</Button></>}>
  Esta acción no se puede deshacer.
</Modal>
```

`Alert` is inline; `Modal` is the centered dialog (rounded 12px, overlay, slide-up). `Spinner` is the brand ring loader.
