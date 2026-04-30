import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const ACCEPTED_EXTENSIONS = ['.xlsx', '.xls', '.csv'];

async function parseFileHeaders(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.csv')) {
    const text = await file.text();
    const firstLine = text.split('\n')[0] || '';
    return firstLine
      .split(',')
      .map(h => h.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);
  }
  // Excel
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { sheetRows: 1 });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });
  return ((rows[0]) || []).map(h => String(h).trim()).filter(Boolean);
}

export default function ImportResults() {
  const navigate = useNavigate();
  const { t, locale } = useLanguage();
  const fileInputRef = useRef(null);
  const isES = locale === 'es-MX';

  const [formData, setFormData] = useState({ name: '', description: '' });
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [columnInput, setColumnInput] = useState('');
  const [isParsingHeaders, setIsParsingHeaders] = useState(false);
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
    const valid = ACCEPTED_EXTENSIONS.some(e => ext.endsWith(e));
    if (!valid) {
      setError(t('import.errorInvalidFile'));
      return false;
    }

    setFile(nextFile);
    setIsParsingHeaders(true);
    try {
      const headers = await parseFileHeaders(nextFile);
      if (headers.length > 0) setColumns(headers);
    } catch (_) {
      // silently skip — user can add manually
    } finally {
      setIsParsingHeaders(false);
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

  const handleAddColumn = () => {
    const val = columnInput.trim();
    if (!val || columns.includes(val)) return;
    setColumns(prev => [...prev, val]);
    setColumnInput('');
  };

  const handleRemoveColumn = (col) => setColumns(prev => prev.filter(c => c !== col));

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
      payload.append('columns', JSON.stringify(columns));

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
        <div className="alert alert-error" style={{ maxWidth: '920px' }}>
          {error}
        </div>
      )}

      <div className="import-layout">
        {/* ── Left: form ── */}
        <div>
          <div className="card" style={{ padding: '2rem' }}>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">{t('import.name')}</label>
                <input
                  type="text"
                  name="name"
                  className="input-field"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder={t('import.namePlaceholder')}
                />
              </div>

              <div className="input-group">
                <label className="input-label">{t('import.description')}</label>
                <textarea
                  name="description"
                  className="input-field"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  placeholder={t('import.descriptionPlaceholder')}
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
                    ref={fileInputRef}
                    id="import-file"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
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

            <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', margin: '0.75rem 0 1rem' }}>
              {isES
                ? 'Sube tu archivo para detectarlas automáticamente, o agrégalas una a una.'
                : 'Upload your file to detect them automatically, or add them one by one.'}
            </p>

            {/* Column chips */}
            {isParsingHeaders ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                <span className="btn-spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }}></span>
                {isES ? 'Detectando columnas…' : 'Detecting columns…'}
              </div>
            ) : columns.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1rem' }}>
                {columns.map(col => (
                  <span key={col} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    padding: '0.25rem 0.5rem 0.25rem 0.65rem',
                    background: 'var(--primary-light, #EEF0FF)',
                    border: '1px solid var(--primary, #6366F1)',
                    fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: '600',
                    color: 'var(--primary)',
                  }}>
                    {col}
                    <button
                      type="button"
                      onClick={() => handleRemoveColumn(col)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '0 0.1rem', lineHeight: 1,
                        color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '700',
                      }}
                      title={isES ? 'Quitar columna' : 'Remove column'}
                    >
                      ×
                    </button>
                  </span>
                ))}
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
                onKeyDown={e => {
                  if (e.key === 'Enter') { e.preventDefault(); handleAddColumn(); }
                }}
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

            {/* Footer note */}
            {columns.length > 0 && (
              <p style={{ fontSize: '0.77rem', color: 'var(--text-secondary)', marginTop: '1.25rem', lineHeight: 1.5 }}>
                {isES
                  ? 'Cada columna se convierte en una dimensión de análisis. El contenido de cada fila se procesa como una respuesta individual.'
                  : 'Each column becomes an analysis dimension. Each row is processed as an individual response.'}
              </p>
            )}

            {/* Hint: include only text columns */}
            <div style={{
              marginTop: '1.25rem', padding: '0.75rem',
              background: 'var(--bg-secondary, #F9FAFB)',
              border: '1px solid var(--border, #E5E7EB)',
              fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5,
            }}>
              <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>
                {isES ? '¿Qué columnas incluir?' : 'Which columns to include?'}
              </strong>
              {isES
                ? 'Incluye solo columnas con texto libre (comentarios, reseñas, respuestas abiertas). Omite fechas, IDs o puntuaciones numéricas — no aportan al análisis de temas.'
                : 'Include only free-text columns (comments, reviews, open answers). Skip dates, IDs, or numeric scores — they don\'t contribute to topic analysis.'}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
