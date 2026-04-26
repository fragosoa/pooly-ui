import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const ACCEPTED_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];

export default function ImportResults() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const selectedFileLabel = useMemo(() => {
    if (!file) return t('import.fileEmpty');
    const fileSizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return `${file.name} · ${fileSizeMb} MB`;
  }, [file, t]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateAndSetFile = (nextFile) => {
    setError('');

    if (!nextFile) {
      setFile(null);
      return false;
    }

    const extension = nextFile.name.toLowerCase();
    const isExcelFile =
      ACCEPTED_TYPES.includes(nextFile.type) ||
      extension.endsWith('.xlsx') ||
      extension.endsWith('.xls');

    if (!isExcelFile) {
      setError(t('import.errorInvalidFile'));
      return false;
    }

    setFile(nextFile);
    return true;
  };

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] || null;
    const isValid = validateAndSetFile(nextFile);
    if (!isValid && event.target) {
      event.target.value = '';
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragActive(false);

    const nextFile = event.dataTransfer.files?.[0] || null;
    const isValid = validateAndSetFile(nextFile);
    if (!isValid && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError(t('import.errorNoFile'));
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append('file', file);
      payload.append('name', formData.name);
      payload.append('description', formData.description);

      const response = await api.post('/imports', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const createdId =
        response.data?.data?.id ||
        response.data?.project?.id ||
        response.data?.event?.id;

      if (!createdId) {
        throw new Error(t('import.errorMissingProject'));
      }

      navigate(`/admin/events/${createdId}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        t('import.errorSubmit')
      );
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
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragActive(true);
                  }}
                  onDragLeave={(event) => {
                    event.preventDefault();
                    setIsDragActive(false);
                  }}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    id="import-file"
                    type="file"
                    accept=".xlsx,.xls"
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
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleBrowseClick}
                    >
                      {t('import.fileBrowse')}
                    </button>
                  </div>
                  <div className="import-dropzone-file">{selectedFileLabel}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                <Link to="/admin" className="btn btn-secondary">
                  {t('import.cancel')}
                </Link>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? t('import.submitting') : t('import.submit')}
                </button>
              </div>
            </form>
          </div>
        </div>

        <aside className="import-sidebar">
          <div className="tips-panel">
            <div className="tips-header">
              <span className="tips-header-icon">↑</span>
              <h3 className="tips-title">{t('import.sidebarTitle')}</h3>
            </div>

            <div className="tips-list">
              <div className="tip-item">
                <span className="tip-icon">1</span>
                <div>
                  <h4 className="tip-title">{t('import.tip1Title')}</h4>
                  <p className="tip-description">{t('import.tip1Desc')}</p>
                </div>
              </div>
              <div className="tip-item">
                <span className="tip-icon">2</span>
                <div>
                  <h4 className="tip-title">{t('import.tip2Title')}</h4>
                  <p className="tip-description">{t('import.tip2Desc')}</p>
                </div>
              </div>
              <div className="tip-item">
                <span className="tip-icon">3</span>
                <div>
                  <h4 className="tip-title">{t('import.tip3Title')}</h4>
                  <p className="tip-description">{t('import.tip3Desc')}</p>
                </div>
              </div>
            </div>

            <div className="tips-examples">
              <h4 className="tips-examples-title">{t('import.expectedTitle')}</h4>
              <ul className="tips-examples-list">
                <li>{t('import.expected1')}</li>
                <li>{t('import.expected2')}</li>
                <li>{t('import.expected3')}</li>
              </ul>
            </div>

            <div className="tips-highlight">
              <span className="tips-highlight-icon">AI</span>
              <p>{t('import.highlight')}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
