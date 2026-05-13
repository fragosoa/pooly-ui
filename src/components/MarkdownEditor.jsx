import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

const TOOLS = [
  { label: 'B', title: 'Negrita', syntax: '**', wrap: true, style: { fontWeight: '700' } },
  { label: 'I', title: 'Cursiva', syntax: '_', wrap: true, style: { fontStyle: 'italic' } },
  { label: 'H1', title: 'Encabezado 1', syntax: '# ', wrap: false },
  { label: 'H2', title: 'Encabezado 2', syntax: '## ', wrap: false },
  { label: '—', title: 'Separador', syntax: null },
  { label: '• Lista', title: 'Lista con viñetas', syntax: '- ', wrap: false },
  { label: '1. Lista', title: 'Lista numerada', syntax: '1. ', wrap: false },
];

function applyFormat(textarea, syntax, wrap) {
  const { selectionStart: start, selectionEnd: end, value } = textarea;
  const selected = value.slice(start, end);
  let newValue, newStart, newEnd;

  if (wrap) {
    newValue = value.slice(0, start) + syntax + selected + syntax + value.slice(end);
    newStart = selected ? start : start + syntax.length;
    newEnd = selected ? end + syntax.length * 2 : start + syntax.length;
  } else {
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineText = value.slice(lineStart, end);
    const alreadyHas = lineText.startsWith(syntax);
    if (alreadyHas) {
      newValue = value.slice(0, lineStart) + lineText.slice(syntax.length) + value.slice(end);
      newStart = start - (start > lineStart ? syntax.length : 0);
      newEnd = end - syntax.length;
    } else {
      newValue = value.slice(0, lineStart) + syntax + lineText + value.slice(end);
      newStart = start + syntax.length;
      newEnd = end + syntax.length;
    }
  }
  return { newValue, newStart, newEnd };
}

export default function MarkdownEditor({ value, onChange, placeholder, label, hint }) {
  const [tab, setTab] = useState('edit');
  const textareaRef = useRef(null);

  const handleTool = (syntax, wrap) => {
    if (!syntax) return;
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { newValue, newStart, newEnd } = applyFormat(textarea, syntax, wrap);
    onChange(newValue);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(newStart, newEnd);
    });
  };

  return (
    <div className="md-editor">
      {label && (
        <div className="md-editor-label-row">
          <label className="input-label" style={{ margin: 0 }}>{label}</label>
          {hint && <span className="md-editor-hint">{hint}</span>}
        </div>
      )}

      <div className="md-editor-tabs">
        <button
          type="button"
          className={`md-editor-tab ${tab === 'edit' ? 'is-active' : ''}`}
          onClick={() => setTab('edit')}
        >
          Editar
        </button>
        <button
          type="button"
          className={`md-editor-tab ${tab === 'preview' ? 'is-active' : ''}`}
          onClick={() => setTab('preview')}
        >
          Vista previa
        </button>
      </div>

      {tab === 'edit' && (
        <>
          <div className="md-editor-toolbar">
            {TOOLS.map((tool, i) =>
              tool.syntax === null ? (
                <div key={i} className="md-editor-toolbar-sep" />
              ) : (
                <button
                  key={i}
                  type="button"
                  title={tool.title}
                  className="md-editor-toolbar-btn"
                  style={tool.style}
                  onClick={() => handleTool(tool.syntax, tool.wrap)}
                >
                  {tool.label}
                </button>
              )
            )}
          </div>
          <textarea
            ref={textareaRef}
            className="md-editor-textarea input-field"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder || 'Escribe aquí...'}
            rows={8}
            style={{ margin: 0, fontFamily: 'monospace', borderTop: 'none', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
          />
        </>
      )}

      {tab === 'preview' && (
        <div className="md-editor-preview">
          {value.trim() ? (
            <ReactMarkdown>{value}</ReactMarkdown>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin contenido aún.</p>
          )}
        </div>
      )}
    </div>
  );
}
