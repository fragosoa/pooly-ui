import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const ACCEPTED_EXTENSIONS = ['.xlsx', '.xls', '.csv'];
const MAX_ROWS_TO_SCAN = 1000;
const MAX_UNIQUE_FOR_MULTIPLE = 20;
const MAX_UNIQUE_FOR_STRING_MULTIPLE = 30;

function looksLikeDate(val) {
  if (val.length < 5 || val.length > 35) return false;
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(val)) return true;   // 2024-01-15
  if (/^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/.test(val)) return true; // 01/15/2024
  const d = new Date(val);
  return !isNaN(d.getTime());
}

// Reads headers + scans data rows to classify each column as open/multiple/numeric/date
async function parseFileWithColumns(file) {
  const name = file.name.toLowerCase();
  let headers = [];
  let dataRows = [];

  if (name.endsWith('.csv')) {
    const text = await file.text();
    const result = Papa.parse(text, { header: false, skipEmptyLines: true });
    if (!result.data.length) return [];
    headers = result.data[0].map(h => String(h).trim()).filter(Boolean);
    dataRows = result.data.slice(1, MAX_ROWS_TO_SCAN + 1).map(row =>
      row.map(c => (c === null || c === undefined ? '' : String(c)).trim())
    );
  } else {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { sheetRows: MAX_ROWS_TO_SCAN + 1 });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const allRows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });
    if (!allRows.length) return [];
    headers = (allRows[0] || []).map(h => String(h).trim()).filter(Boolean);
    dataRows = allRows.slice(1).map(row =>
      row.map(c => (c === null || c === undefined ? '' : String(c)).trim())
    );
  }

  return headers.map((colName, colIdx) => {
    const seen = new Set();
    let allNumeric = true;
    let allDate = true;

    for (const row of dataRows) {
      const val = (row[colIdx] ?? '').toString().trim();
      if (!val) continue;
      seen.add(val);
      if (allNumeric && (isNaN(parseFloat(val)) || !isFinite(Number(val)))) allNumeric = false;
      if (allDate && !looksLikeDate(val)) allDate = false;
    }

    const uniqueVals = [...seen].sort((a, b) => {
      const na = parseFloat(a), nb = parseFloat(b);
      return !isNaN(na) && !isNaN(nb) ? na - nb : a.localeCompare(b);
    });

    let type;
    if (seen.size === 0) {
      type = 'open';
    } else if (allDate && !allNumeric) {
      type = 'date';
    } else if (allNumeric) {
      // Few unique numeric values → categorical (e.g. ratings 1-5); many → continuous numeric
      type = seen.size <= MAX_UNIQUE_FOR_MULTIPLE ? 'multiple' : 'numeric';
    } else if (seen.size >= 2 && seen.size <= MAX_UNIQUE_FOR_STRING_MULTIPLE) {
      type = 'multiple';
    } else {
      type = 'open';
    }

    return {
      name: colName,
      type,
      options: type === 'multiple' ? uniqueVals : [],
    };
  });
}

const TYPE_META = {
  open:     { icon: '💬', labelES: 'Texto libre',       labelEN: 'Free text',        descES: 'NLP: temas y sentimiento',          descEN: 'NLP: topics & sentiment' },
  multiple: { icon: '☑️', labelES: 'Opción múltiple',   labelEN: 'Multiple choice',  descES: 'Distribución entre categorías',     descEN: 'Distribution across options' },
  numeric:  { icon: '🔢', labelES: 'Numérico',          labelEN: 'Numeric',          descES: 'Estadísticas y promedios',          descEN: 'Statistics & averages' },
  date:     { icon: '📅', labelES: 'Fecha',             labelEN: 'Date',             descES: 'Tendencias temporales',             descEN: 'Time trends' },
};

// ── Column card shown in the sidebar ─────────────────────────────────────────
function ColumnCard({ col, idx, isES, onTypeChange, onRemove }) {
  const meta = TYPE_META[col.type] || TYPE_META.open;

  return (
    <div style={{
      border: '1px solid var(--border)', background: '#fff',
      padding: '0.6rem 0.7rem', marginBottom: '0.5rem',
    }}>
      {/* Name + remove */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
        <span style={{
          fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: '700',
          color: 'var(--primary)', wordBreak: 'break-all',
        }}>
          {col.name}
        </span>
        <button
          type="button"
          onClick={() => onRemove(idx)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1,
            padding: '0 0.1rem', marginLeft: '0.4rem', flexShrink: 0,
          }}
          title={isES ? 'Quitar columna' : 'Remove column'}
        >
          ×
        </button>
      </div>

      {/* Type dropdown */}
      <select
        className="input-field"
        value={col.type}
        onChange={e => onTypeChange(idx, e.target.value)}
        style={{ margin: 0, fontSize: '0.78rem', padding: '0.3rem 0.5rem' }}
      >
        {Object.entries(TYPE_META).map(([val, m]) => (
          <option key={val} value={val}>
            {m.icon} {isES ? m.labelES : m.labelEN}
          </option>
        ))}
      </select>

      {/* Type description */}
      <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: '0.3rem 0 0', lineHeight: 1.4 }}>
        {isES ? meta.descES : meta.descEN}
      </p>

      {/* Options preview for multiple */}
      {col.type === 'multiple' && col.options.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem', marginTop: '0.4rem' }}>
          {col.options.map((opt, i) => (
            <span key={i} style={{
              fontSize: '0.7rem', padding: '0.1rem 0.35rem',
              background: 'var(--bg-secondary, #F9FAFB)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}>
              {opt}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ImportResults() {
  const navigate = useNavigate();
  const { t, locale } = useLanguage();
  const fileInputRef = useRef(null);
  const isES = locale === 'es-MX';

  const [formData, setFormData] = useState({ name: '', description: '' });
  const [file, setFile] = useState(null);
  // columns: Array<{ name: string, type: 'open'|'multiple', options: string[] }>
  const [columns, setColumns] = useState([]);
  const [columnInput, setColumnInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [activeColIdx, setActiveColIdx] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const fileLabel = file
    ? `${file.name} · ${(file.size / (1024 * 1024)).toFixed(1)} MB`
    : t('import.fileEmpty');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateAndSetFile = async (nextFile) => {
    setError('');
    if (!nextFile) { setFile(null); return false; }

    const ext = nextFile.name.toLowerCase();
    if (!ACCEPTED_EXTENSIONS.some(e => ext.endsWith(e))) {
      setError(t('import.errorInvalidFile'));
      return false;
    }

    setFile(nextFile);
    setIsParsing(true);
    try {
      const detected = await parseFileWithColumns(nextFile);
      if (detected.length > 0) setColumns(detected);
    } catch (_) {
      // silently skip — user can configure manually
    } finally {
      setIsParsing(false);
    }
    return true;
  };

  const handleFileChange = async (e) => {
    const nextFile = e.target.files?.[0] || null;
    const valid = await validateAndSetFile(nextFile);
    if (!valid && e.target) e.target.value = '';
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragActive(false);
    const nextFile = e.dataTransfer.files?.[0] || null;
    const valid = await validateAndSetFile(nextFile);
    if (!valid && fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleColumnTypeChange = (idx, type) => {
    setColumns(prev => prev.map((col, i) => i === idx ? { ...col, type } : col));
  };

  const handleRemoveColumn = (idx) => {
    setColumns(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddColumn = () => {
    const val = columnInput.trim();
    if (!val) return;
    setColumns(prev => [...prev, { name: val, type: 'open', options: [] }]);
    setColumnInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!file) { setError(t('import.errorNoFile')); return; }
    if (columns.length === 0) { setError(t('import.errorNoColumns')); return; }

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('file', file);
      payload.append('name', formData.name);
      payload.append('description', formData.description);
      // Backend expects { text, type, options } — map from internal { name, type, options }
      payload.append('columns', JSON.stringify(
        columns.map(col => ({ text: col.name, type: col.type, options: col.options }))
      ));

      const response = await api.post('/imports', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const createdId =
        response.data?.data?.id ||
        response.data?.project?.id ||
        response.data?.event?.id;

      if (!createdId) throw new Error(t('import.errorMissingProject'));
      navigate(`/admin/events/${createdId}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || t('import.errorSubmit'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeCounts = Object.keys(TYPE_META).reduce((acc, type) => {
    acc[type] = columns.filter(c => c.type === type).length;
    return acc;
  }, {});

  return (
    <div className="container" style={{ paddingTop: '7rem', paddingBottom: '4rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <Link to="/admin" className="back-link">{t('import.back')}</Link>
        <h1 className="page-title" style={{ marginTop: '1rem' }}>{t('import.title')}</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '760px' }}>
          {t('import.subtitle')}
        </p>
      </header>

      {error && (
        <div className="alert alert-error" style={{ maxWidth: '920px' }}>{error}</div>
      )}

      <div className="import-layout">
        {/* ── Left: form ── */}
        <div>
          <div className="card" style={{ padding: '2rem' }}>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">{t('import.name')}</label>
                <input
                  type="text" name="name" className="input-field"
                  value={formData.name} onChange={handleInputChange}
                  required placeholder={t('import.namePlaceholder')}
                />
              </div>

              <div className="input-group">
                <label className="input-label">{t('import.description')}</label>
                <textarea
                  name="description" className="input-field" rows="3"
                  value={formData.description} onChange={handleInputChange}
                  required placeholder={t('import.descriptionPlaceholder')}
                />
              </div>

              <div className="input-group" style={{ marginTop: '1.5rem' }}>
                <label className="input-label">{t('import.fileLabel')}</label>
                <div
                  className={`import-dropzone ${isDragActive ? 'is-drag-active' : ''}`}
                  onDragOver={e => { e.preventDefault(); setIsDragActive(true); }}
                  onDragLeave={e => { e.preventDefault(); setIsDragActive(false); }}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef} id="import-file" type="file"
                    accept=".xlsx,.xls,.csv" onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <div className="import-dropzone-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V4.5m0 0L7.5 9m4.5-4.5L16.5 9M4.5 16.5v1.125A2.625 2.625 0 007.125 20.25h9.75A2.625 2.625 0 0019.5 17.625V16.5" />
                    </svg>
                  </div>
                  <div>
                    <div className="import-dropzone-title">{t('import.fileTitle')}</div>
                    <div className="import-dropzone-subtitle">{t('import.fileHelp')}</div>
                  </div>
                  <div>
                    <button type="button" className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
                      {t('import.fileBrowse')}
                    </button>
                  </div>
                  <div className="import-dropzone-file">{fileLabel}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                <Link to="/admin" className="btn btn-secondary">{t('import.cancel')}</Link>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting || columns.length === 0}>
                  {isSubmitting ? t('import.submitting') : t('import.submit')}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ── Right: column builder ── */}
        <aside className="import-sidebar">
          <div className="tips-panel">
            {/* Header */}
            <div className="tips-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 className="tips-title" style={{ margin: 0 }}>
                {isES ? 'Columnas a analizar' : 'Columns to analyze'}
              </h3>
              {columns.length > 0 && (
                <span style={{
                  background: 'var(--primary)', color: '#fff',
                  fontSize: '0.75rem', fontWeight: '700',
                  padding: '0.15rem 0.55rem', borderRadius: '999px',
                }}>
                  {columns.length}
                </span>
              )}
            </div>

            <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', margin: '0.75rem 0 0' }}>
              {isES
                ? 'Sube tu archivo para detectarlas automáticamente, o agrégalas una a una.'
                : 'Upload your file to detect them automatically, or add them one by one.'}
            </p>

            {/* Type guide — shown right below intro */}
            <div style={{
              margin: '0.85rem 0 1rem', padding: '0.65rem 0.75rem',
              background: 'var(--bg-secondary, #F9FAFB)',
              border: '1px solid var(--border, #E5E7EB)',
              fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.5,
            }}>
              <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem' }}>
                {isES ? '¿Qué tipo elegir?' : 'Which type to pick?'}
              </strong>
              {Object.entries(TYPE_META).map(([val, m]) => (
                <p key={val} style={{ margin: '0 0 0.25rem', display: 'flex', gap: '0.35rem' }}>
                  <span style={{ flexShrink: 0 }}>{m.icon}</span>
                  <span>
                    <strong style={{ color: 'var(--text-primary)' }}>{isES ? m.labelES : m.labelEN}</strong>
                    {' — '}{isES ? m.descES : m.descEN}
                  </span>
                </p>
              ))}
              <p style={{ margin: '0.5rem 0 0', fontStyle: 'italic', display: 'flex', gap: '0.3rem', alignItems: 'flex-start', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                <span style={{ flexShrink: 0 }}>ⓘ</span>
                <span>
                  {isES
                    ? 'Ratings numéricos (1–5) se detectan como Opción múltiple. Si son mediciones continuas (ej. edades), cámbialos a Numérico.'
                    : 'Numeric ratings (1–5) are detected as Multiple choice. For continuous values (e.g. ages), switch to Numeric.'}
                </span>
              </p>
            </div>

            {/* Column chips */}
            {isParsing ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                <span className="btn-spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }}></span>
                {isES ? 'Analizando columnas…' : 'Analyzing columns…'}
              </div>
            ) : columns.length > 0 ? (
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.5rem' }}>
                  {columns.map((col, idx) => {
                    const meta = TYPE_META[col.type] || TYPE_META.open;
                    const isActive = activeColIdx === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveColIdx(isActive ? null : idx)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                          padding: '0.25rem 0.4rem 0.25rem 0.55rem',
                          border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                          background: isActive ? 'var(--primary-light, #EEF0FF)' : '#fff',
                          cursor: 'pointer', userSelect: 'none',
                          transition: 'border-color 0.15s, background 0.15s',
                        }}
                      >
                        <span style={{ fontSize: '0.78rem' }}>{meta.icon}</span>
                        <span style={{
                          fontFamily: 'monospace', fontSize: '0.74rem', fontWeight: '700',
                          color: 'var(--primary)', maxWidth: '120px',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {col.name}
                        </span>
                        {isActive && (
                          <select
                            value={col.type}
                            onChange={e => handleColumnTypeChange(idx, e.target.value)}
                            onClick={e => e.stopPropagation()}
                            style={{
                              fontSize: '0.72rem', padding: '0.1rem 0.25rem',
                              border: '1px solid var(--primary)', background: '#fff',
                              cursor: 'pointer', marginLeft: '0.15rem',
                            }}
                          >
                            {Object.entries(TYPE_META).map(([val, m]) => (
                              <option key={val} value={val}>
                                {m.icon} {isES ? m.labelES : m.labelEN}
                              </option>
                            ))}
                          </select>
                        )}
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); handleRemoveColumn(idx); if (activeColIdx === idx) setActiveColIdx(null); }}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--text-secondary)', fontSize: '0.9rem',
                            lineHeight: 1, padding: '0 0.1rem', marginLeft: '0.1rem',
                          }}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
                {/* Type summary */}
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>
                  {Object.entries(typeCounts)
                    .filter(([, n]) => n > 0)
                    .map(([type, n]) => `${TYPE_META[type].icon} ×${n}`)
                    .join('  ')}
                  {' · '}
                  {isES ? 'clic para editar tipo' : 'click to edit type'}
                </p>
              </div>
            ) : (
              <div style={{
                padding: '1rem', marginBottom: '1rem',
                background: 'var(--bg-secondary, #F9FAFB)',
                border: '1px dashed var(--border, #E5E7EB)',
                textAlign: 'center',
                fontSize: '0.82rem', color: 'var(--text-secondary)',
              }}>
                {isES
                  ? 'Aún no hay columnas. Sube un archivo o agrégalas manualmente.'
                  : 'No columns yet. Upload a file or add them manually.'}
              </div>
            )}

            {/* Manual input */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="input-field"
                placeholder={isES ? 'ej. review_content' : 'e.g. review_content'}
                value={columnInput}
                onChange={e => setColumnInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddColumn(); } }}
                style={{ flex: 1, margin: 0, padding: '0.4rem 0.65rem', fontSize: '0.83rem' }}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleAddColumn}
                disabled={!columnInput.trim()}
                style={{ padding: '0.4rem 0.8rem', flexShrink: 0, fontSize: '0.83rem' }}
              >
                {isES ? '+ Agregar' : '+ Add'}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
