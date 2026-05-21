import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../services/api';
import Modal from '../components/Modal';
import MarkdownEditor from '../components/MarkdownEditor';
import { useLanguage } from '../context/LanguageContext';

const TYPE_ICONS = { open: '💬', multiple: '☑️', numeric: '🔢', date: '📅' };
const QUESTION_TYPES = ['open', 'multiple', 'numeric', 'date'];

const emptyQuestion = () => ({
    text: '', optional: false, type: 'open', options: ['', ''],
    _isNew: true,
    _dndId: `new-${Date.now()}-${Math.random()}`,
});

function SortableQuestionRow({ id, children }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : undefined,
        position: 'relative',
    };
    return (
        <div ref={setNodeRef} style={style}>
            <div
                style={{
                    position: 'absolute', left: '0.5rem', top: '50%',
                    transform: 'translateY(-50%)', cursor: 'grab',
                    color: 'var(--text-muted)', touchAction: 'none',
                }}
                {...attributes}
                {...listeners}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/>
                    <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                    <circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/>
                </svg>
            </div>
            {children}
        </div>
    );
}

export default function EditEvent() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { t, locale } = useLanguage();
    const isES = locale === 'es-MX';

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Metadata
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [endDate, setEndDate] = useState('');
    const [hasEndDate, setHasEndDate] = useState(false);
    const [welcomeMessage, setWelcomeMessage] = useState('');
    const [completionMessage, setCompletionMessage] = useState('');
    const [showWelcomeEditor, setShowWelcomeEditor] = useState(false);
    const [showCompletionEditor, setShowCompletionEditor] = useState(false);

    // Questions
    const [questions, setQuestions] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingIdx, setEditingIdx] = useState(null);
    const [modalData, setModalData] = useState(emptyQuestion());
    const [openMenuIdx, setOpenMenuIdx] = useState(null);

    // Confirmation modal for editing questions with existing responses
    const [showResponseWarning, setShowResponseWarning] = useState(false);
    const [pendingEdit, setPendingEdit] = useState(null);

    // Confirmation modal for deleting questions with existing responses
    const [showDeleteWarning, setShowDeleteWarning] = useState(false);
    const [pendingDeleteIdx, setPendingDeleteIdx] = useState(null);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await api.get(`/events/${eventId}/details`);
                const ev = res.data.data;

                const farFuture = new Date();
                farFuture.setFullYear(farFuture.getFullYear() + 15);
                const evEnd = new Date(ev.end || ev.end_date);
                const isPermanent = evEnd >= farFuture;

                setName(ev.name || '');
                setDescription(ev.description || '');
                setHasEndDate(!isPermanent);
                setEndDate(isPermanent ? '' : (ev.end || ev.end_date || '').split('T')[0]);
                setWelcomeMessage(ev.welcome_message || '');
                setCompletionMessage(ev.completion_message || '');
                if (ev.welcome_message) setShowWelcomeEditor(true);
                if (ev.completion_message) setShowCompletionEditor(true);

                setQuestions((ev.questions || []).map((q, i) => ({
                    ...q,
                    options: q.options || [],
                    optional: q.optional || false,
                    type: q.type || 'open',
                    _dndId: String(q.id ?? `q-${i}`),
                    _isNew: false,
                })));
            } catch {
                toast.error(t('eventDetails.errorLoad'));
                navigate(`/admin/events/${eventId}`);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [eventId, navigate, t]);

    useEffect(() => {
        if (openMenuIdx === null) return;
        const close = () => setOpenMenuIdx(null);
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, [openMenuIdx]);

    const handleDragEnd = ({ active, over }) => {
        if (over && active.id !== over.id) {
            setQuestions(prev => {
                const oldIdx = prev.findIndex(q => q._dndId === active.id);
                const newIdx = prev.findIndex(q => q._dndId === over.id);
                return arrayMove(prev, oldIdx, newIdx);
            });
        }
    };

    const openAddModal = () => {
        setEditingIdx(null);
        setModalData(emptyQuestion());
        setShowModal(true);
    };

    const openEditModal = (idx) => {
        setEditingIdx(idx);
        setModalData({ ...questions[idx] });
        setOpenMenuIdx(null);
        setShowModal(true);
    };

    const handleModalSave = () => {
        const cleaned = {
            ...modalData,
            text: modalData.text.trim(),
            options: modalData.type === 'multiple'
                ? modalData.options.map(o => o.trim()).filter(Boolean)
                : [],
        };
        if (!cleaned.text) return;
        if (cleaned.type === 'multiple' && cleaned.options.length < 2) return;

        if (editingIdx === null) {
            // New question — no responses to worry about
            setQuestions(prev => [...prev, cleaned]);
            setShowModal(false);
            return;
        }

        const existing = questions[editingIdx];
        const responseCount = existing?.responses?.length ?? 0;

        if (!existing._isNew && responseCount > 0) {
            // Existing question with responses — ask for confirmation first
            setPendingEdit({ cleaned, idx: editingIdx, responseCount });
            setShowModal(false);
            setShowResponseWarning(true);
            return;
        }

        setQuestions(prev => prev.map((q, i) => i === editingIdx ? cleaned : q));
        setShowModal(false);
    };

    const handleWarningConfirm = () => {
        if (!pendingEdit) return;
        setQuestions(prev => prev.map((q, i) => i === pendingEdit.idx ? pendingEdit.cleaned : q));
        setPendingEdit(null);
        setShowResponseWarning(false);
    };

    const handleWarningCancel = () => {
        // Re-open edit modal with the same data so the user can keep editing
        setShowResponseWarning(false);
        setShowModal(true);
    };

    const removeQuestion = (idx) => {
        if (questions.length <= 1) return;
        setOpenMenuIdx(null);

        const q = questions[idx];
        const responseCount = q?.responses?.length ?? 0;

        if (!q._isNew && responseCount > 0) {
            setPendingDeleteIdx(idx);
            setShowDeleteWarning(true);
            return;
        }

        setQuestions(prev => prev.filter((_, i) => i !== idx));
    };

    const handleDeleteConfirm = () => {
        if (pendingDeleteIdx === null) return;
        setQuestions(prev => prev.filter((_, i) => i !== pendingDeleteIdx));
        setPendingDeleteIdx(null);
        setShowDeleteWarning(false);
    };

    const handleDeleteCancel = () => {
        setPendingDeleteIdx(null);
        setShowDeleteWarning(false);
    };

    const handleModalOptionChange = (oIdx, val) => {
        setModalData(prev => {
            const opts = [...prev.options];
            opts[oIdx] = val;
            return { ...prev, options: opts };
        });
    };

    const addModalOption = () => setModalData(prev => ({ ...prev, options: [...prev.options, ''] }));
    const removeModalOption = (oIdx) => {
        if (modalData.options.length <= 2) return;
        setModalData(prev => ({ ...prev, options: prev.options.filter((_, i) => i !== oIdx) }));
    };

    const handleSave = async () => {
        setError('');
        if (!name.trim()) {
            setError(isES ? 'El nombre es requerido.' : 'Name is required.');
            return;
        }
        if (questions.length === 0) {
            setError(t('create.errorNoQuestions'));
            return;
        }
        const badMultiple = questions.find(q => q.type === 'multiple' && q.options.filter(Boolean).length < 2);
        if (badMultiple) {
            setError(t('create.errorMultipleOptions'));
            return;
        }

        setSaving(true);
        const toastId = toast.loading(t('editEvent.saving'));

        try {
            const farFuture = new Date();
            farFuture.setFullYear(farFuture.getFullYear() + 20);

            await api.patch(`/events/${eventId}`, {
                name: name.trim(),
                description: description.trim(),
                end_date: hasEndDate ? endDate : farFuture.toISOString().split('T')[0],
                welcome_message: welcomeMessage.trim() || null,
                completion_message: completionMessage.trim() || null,
            });

            const cleanedQuestions = questions.map((q, idx) => ({
                ...(q._isNew ? {} : { id: q.id }),
                position: idx,
                text: q.text.trim(),
                type: q.type,
                optional: q.optional,
                options: q.type === 'multiple' ? q.options.filter(Boolean) : [],
            }));
            await api.patch(`/events/${eventId}/questions`, { questions: cleanedQuestions });

            toast.success(t('editEvent.saveSuccess'), { id: toastId });
            navigate(`/admin/events/${eventId}`);
        } catch (err) {
            toast.error(err.response?.data?.message || t('editEvent.saveError'), { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ paddingTop: '7rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>{isES ? 'Cargando...' : 'Loading...'}</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '7rem', paddingBottom: '4rem' }}>

            {/* Page header */}
            <header className="page-header" style={{ marginBottom: '2rem', maxWidth: '640px' }}>
                <Link to={`/admin/events/${eventId}`} className="back-link" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>
                    {t('editEvent.back')}
                </Link>
                <h1 className="page-title">{t('editEvent.pageTitle')}</h1>
                <p className="page-subtitle" style={{ marginBottom: 0 }}>
                    {isES ? 'Modifica los detalles y preguntas de tu encuesta.' : 'Modify the details and questions of your survey.'}
                </p>
            </header>

            {error && (
                <div className="alert alert-error" style={{ maxWidth: '640px', marginBottom: '1.5rem' }}>
                    {error}
                </div>
            )}

            <div style={{ maxWidth: '640px' }}>

                {/* ── Card: General info ── */}
                <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                    <h2 className="section-title" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                        {t('editEvent.sectionInfo')}
                    </h2>

                    <div className="input-group">
                        <label className="input-label">{t('editEvent.name')} *</label>
                        <input
                            type="text"
                            className="input-field"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder={isES ? 'Nombre de la encuesta' : 'Survey name'}
                            maxLength={120}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">{t('editEvent.description')}</label>
                        <textarea
                            className="input-field"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            placeholder={isES ? 'Descripción breve (opcional)' : 'Brief description (optional)'}
                            maxLength={500}
                        />
                    </div>

                    <div className="input-group">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: hasEndDate ? '0.75rem' : 0 }}>
                            <button
                                type="button"
                                onClick={() => { setHasEndDate(v => !v); if (hasEndDate) setEndDate(''); }}
                                style={{
                                    width: '40px', height: '22px', borderRadius: '11px', position: 'relative',
                                    background: hasEndDate ? 'var(--primary)' : 'var(--border)',
                                    border: 'none', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
                                }}
                            >
                                <span style={{
                                    position: 'absolute', top: '2px',
                                    left: hasEndDate ? '20px' : '2px',
                                    width: '18px', height: '18px', borderRadius: '50%',
                                    background: '#fff', transition: 'left 0.2s',
                                }} />
                            </button>
                            <label
                                className="input-label"
                                style={{ margin: 0, cursor: 'pointer' }}
                                onClick={() => { setHasEndDate(v => !v); if (hasEndDate) setEndDate(''); }}
                            >
                                {t('editEvent.endDate')}
                            </label>
                        </div>
                        {hasEndDate && (
                            <input
                                type="date"
                                className="input-field"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                style={{ margin: 0 }}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        )}
                    </div>

                    {/* Welcome screen */}
                    <div className="screen-section">
                        <div className="screen-section-header">
                            <div>
                                <span className="screen-section-badge">{isES ? 'Opcional' : 'Optional'}</span>
                                <span className="screen-section-title">{t('editEvent.welcomeLabel')}</span>
                            </div>
                            <button
                                type="button"
                                className={`screen-section-toggle ${showWelcomeEditor ? 'is-active' : ''}`}
                                onClick={() => {
                                    if (showWelcomeEditor) setWelcomeMessage('');
                                    setShowWelcomeEditor(v => !v);
                                }}
                            >
                                {showWelcomeEditor ? (isES ? 'Quitar' : 'Remove') : (isES ? 'Agregar' : 'Add')}
                            </button>
                        </div>
                        {showWelcomeEditor && (
                            <div style={{ marginTop: '0.75rem' }}>
                                <MarkdownEditor
                                    value={welcomeMessage}
                                    onChange={setWelcomeMessage}
                                    placeholder={t('editEvent.welcomePlaceholder')}
                                />
                            </div>
                        )}
                    </div>

                    {/* Completion screen */}
                    <div className="screen-section">
                        <div className="screen-section-header">
                            <div>
                                <span className="screen-section-badge">{isES ? 'Opcional' : 'Optional'}</span>
                                <span className="screen-section-title">{t('editEvent.completionLabel')}</span>
                            </div>
                            <button
                                type="button"
                                className={`screen-section-toggle ${showCompletionEditor ? 'is-active' : ''}`}
                                onClick={() => {
                                    if (showCompletionEditor) setCompletionMessage('');
                                    setShowCompletionEditor(v => !v);
                                }}
                            >
                                {showCompletionEditor ? (isES ? 'Quitar' : 'Remove') : (isES ? 'Agregar' : 'Add')}
                            </button>
                        </div>
                        {showCompletionEditor && (
                            <div style={{ marginTop: '0.75rem' }}>
                                <MarkdownEditor
                                    value={completionMessage}
                                    onChange={setCompletionMessage}
                                    placeholder={t('editEvent.completionPlaceholder')}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Card: Questions ── */}
                <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                    <h2 className="section-title" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                        {t('editEvent.sectionQuestions')}
                    </h2>

                    {questions.length === 0 && (
                        <div style={{
                            padding: '2rem 1rem', textAlign: 'center', marginBottom: '1rem',
                            border: '1px dashed var(--border)', background: 'var(--bg-secondary)',
                        }}>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
                                {isES ? 'Comienza agregando preguntas.' : 'Start by adding questions.'}
                            </p>
                        </div>
                    )}

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={questions.map(q => q._dndId)} strategy={verticalListSortingStrategy}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                        {questions.map((q, idx) => (
                            <SortableQuestionRow key={q._dndId} id={q._dndId}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                padding: '0.75rem 1rem 0.75rem 2.25rem',
                                border: '1px solid var(--border)',
                                background: q._isNew ? 'var(--bg-secondary)' : 'var(--bg-white)',
                            }}>
                                <span style={{
                                    width: '24px', height: '24px', flexShrink: 0,
                                    background: 'var(--primary-light)', color: 'var(--primary)',
                                    borderRadius: '50%', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700',
                                }}>
                                    {idx + 1}
                                </span>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{
                                        margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)',
                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                    }}>
                                        {q.text || <em style={{ color: 'var(--text-muted)' }}>{isES ? 'Sin texto' : 'No text'}</em>}
                                    </p>
                                    <p style={{ margin: '0.15rem 0 0', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                        {TYPE_ICONS[q.type]}{' '}
                                        {t(`create.questionType${q.type.charAt(0).toUpperCase() + q.type.slice(1)}`)}
                                        {q.type === 'multiple' && q.options?.filter(Boolean).length > 0 && (
                                            <span> · {q.options.filter(Boolean).length} {isES ? 'opciones' : 'options'}</span>
                                        )}
                                        <span style={{ color: 'var(--border)', margin: '0 0.3rem' }}>·</span>
                                        {q.optional ? t('create.questionOptional') : t('create.questionRequired')}
                                        {q._isNew && (
                                            <span style={{ color: 'var(--primary)', fontWeight: 600, marginLeft: '0.4rem' }}>
                                                {isES ? '• Nueva' : '• New'}
                                            </span>
                                        )}
                                    </p>
                                </div>

                                {/* Three-dot menu */}
                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                    <button
                                        type="button"
                                        onClick={e => { e.stopPropagation(); setOpenMenuIdx(openMenuIdx === idx ? null : idx); }}
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            padding: '0.25rem 0.4rem', color: 'var(--text-secondary)',
                                            fontSize: '1.1rem', letterSpacing: '0.05em', lineHeight: 1,
                                            borderRadius: '4px',
                                        }}
                                        title={isES ? 'Opciones' : 'Options'}
                                    >
                                        ···
                                    </button>
                                    {openMenuIdx === idx && (
                                        <div style={{
                                            position: 'absolute', right: 0, top: '100%', zIndex: 20,
                                            background: 'var(--bg-white)', border: '1px solid var(--border)',
                                            boxShadow: '0 4px 16px rgba(0,0,0,0.1)', minWidth: '130px',
                                        }}>
                                            <button type="button" onClick={() => openEditModal(idx)}
                                                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.6rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)', fontFamily: 'inherit' }}>
                                                ✏️ {isES ? 'Editar' : 'Edit'}
                                            </button>
                                            {questions.length > 1 && (
                                                <button type="button" onClick={() => removeQuestion(idx)}
                                                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.6rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--error)', fontFamily: 'inherit' }}>
                                                    🗑 {isES ? 'Eliminar' : 'Delete'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            </SortableQuestionRow>
                        ))}
                    </div>
                    </SortableContext>
                    </DndContext>

                    <button type="button" onClick={openAddModal} className="btn btn-outline" style={{ width: '100%', borderStyle: 'dashed' }}>
                        + {t('editEvent.addQuestion')}
                    </button>
                </div>

                {/* ── Footer actions ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to={`/admin/events/${eventId}`} className="btn btn-secondary">
                        {t('editEvent.cancelBtn')}
                    </Link>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? t('editEvent.saving') : t('editEvent.saveBtn')}
                    </button>
                </div>
            </div>

            {/* ── Question edit/add modal ── */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingIdx === null ? (isES ? 'Nueva pregunta' : 'New question') : (isES ? 'Editar pregunta' : 'Edit question')}
                footer={
                    <div className="modal-actions">
                        <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                            {t('editEvent.cancelBtn')}
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleModalSave}
                            disabled={
                                !modalData.text.trim() ||
                                (modalData.type === 'multiple' && modalData.options.filter(o => o.trim()).length < 2)
                            }
                        >
                            {editingIdx === null ? (isES ? 'Agregar' : 'Add') : (isES ? 'Guardar' : 'Save')}
                        </button>
                    </div>
                }
            >
                <div className="input-group">
                    <label className="input-label">{isES ? 'Pregunta' : 'Question'}</label>
                    <input
                        type="text"
                        className="input-field"
                        value={modalData.text}
                        onChange={e => setModalData(p => ({ ...p, text: e.target.value }))}
                        placeholder={isES ? 'Escribe la pregunta aquí' : 'Write question here'}
                        autoFocus
                    />
                </div>

                <div className="input-group">
                    <label className="input-label">{isES ? 'Tipo de respuesta' : 'Response type'}</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {QUESTION_TYPES.map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setModalData(p => ({
                                    ...p, type,
                                    options: type === 'multiple' ? (p.options.length >= 2 ? p.options : ['', '']) : p.options,
                                }))}
                                className={`btn ${modalData.type === type ? 'btn-primary' : 'btn-outline'}`}
                                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                            >
                                {TYPE_ICONS[type]}{' '}
                                {isES
                                    ? { open: 'Texto', multiple: 'Múltiple', numeric: 'Número', date: 'Fecha' }[type]
                                    : { open: 'Text', multiple: 'Multiple', numeric: 'Number', date: 'Date' }[type]
                                }
                            </button>
                        ))}
                    </div>
                </div>

                {modalData.type === 'multiple' && (
                    <div className="input-group">
                        <label className="input-label">{isES ? 'Opciones' : 'Options'}</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {modalData.options.map((opt, oIdx) => (
                                <div key={oIdx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={opt}
                                        onChange={e => handleModalOptionChange(oIdx, e.target.value)}
                                        placeholder={`${isES ? 'Opción' : 'Option'} ${oIdx + 1}`}
                                        style={{ margin: 0 }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeModalOption(oIdx)}
                                        disabled={modalData.options.length <= 2}
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            color: 'var(--error)', fontSize: '1.2rem', padding: '0 0.25rem',
                                            opacity: modalData.options.length <= 2 ? 0.3 : 1,
                                            lineHeight: 1, flexShrink: 0,
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={addModalOption} className="btn btn-outline" style={{ fontSize: '0.8rem', alignSelf: 'flex-start', marginTop: '0.25rem' }}>
                                + {isES ? 'Añadir opción' : 'Add option'}
                            </button>
                        </div>
                    </div>
                )}

                <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={modalData.optional}
                            onChange={e => setModalData(p => ({ ...p, optional: e.target.checked }))}
                        />
                        <span className="input-label" style={{ margin: 0 }}>
                            {isES ? 'Respuesta opcional' : 'Optional response'}
                        </span>
                    </label>
                </div>
            </Modal>

            {/* ── Delete question confirmation modal ── */}
            <Modal
                isOpen={showDeleteWarning}
                onClose={handleDeleteCancel}
                title={isES ? 'Eliminar pregunta' : 'Delete question'}
                footer={
                    <div className="modal-actions">
                        <button className="btn btn-secondary" onClick={handleDeleteCancel}>
                            {isES ? 'Cancelar' : 'Cancel'}
                        </button>
                        <button className="btn btn-danger" onClick={handleDeleteConfirm}>
                            {isES ? 'Sí, eliminar' : 'Yes, delete'}
                        </button>
                    </div>
                }
            >
                <div className="modal-confirm-content">
                    <div className="modal-icon modal-icon-danger">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </div>
                    <p className="modal-message">
                        {isES
                            ? `"${questions[pendingDeleteIdx]?.text || (isES ? 'Esta pregunta' : 'This question')}"`
                            : `"${questions[pendingDeleteIdx]?.text || 'This question'}"`
                        }
                    </p>
                    <div className="modal-warning-box">
                        <p>{isES ? 'Esta acción no se puede deshacer. Se eliminarán:' : 'This action cannot be undone. The following will be deleted:'}</p>
                        <ul>
                            <li>{isES ? 'La pregunta' : 'The question'}</li>
                            <li>
                                {isES
                                    ? `${questions[pendingDeleteIdx]?.responses?.length ?? 0} respuestas guardadas`
                                    : `${questions[pendingDeleteIdx]?.responses?.length ?? 0} saved responses`
                                }
                            </li>
                        </ul>
                    </div>
                </div>
            </Modal>

            {/* ── Response warning confirmation modal ── */}
            <Modal
                isOpen={showResponseWarning}
                onClose={handleWarningCancel}
                title={isES ? 'Editar pregunta con respuestas' : 'Edit question with responses'}
                footer={
                    <div className="modal-actions">
                        <button className="btn btn-secondary" onClick={handleWarningCancel}>
                            {isES ? 'Cancelar' : 'Cancel'}
                        </button>
                        <button className="btn btn-danger" onClick={handleWarningConfirm}>
                            {isES ? 'Sí, editar de todas formas' : 'Yes, edit anyway'}
                        </button>
                    </div>
                }
            >
                <div className="modal-confirm-content">
                    <div className="modal-icon modal-icon-danger">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                    </div>
                    <p className="modal-message">
                        {isES
                            ? `Esta pregunta tiene ${pendingEdit?.responseCount} ${pendingEdit?.responseCount === 1 ? 'respuesta guardada' : 'respuestas guardadas'}.`
                            : `This question has ${pendingEdit?.responseCount} saved ${pendingEdit?.responseCount === 1 ? 'response' : 'responses'}.`
                        }
                    </p>
                    <div className="modal-warning-box">
                        <p>
                            {isES
                                ? 'Si modificas esta pregunta, las respuestas existentes podrían quedar inconsistentes o ser eliminadas al guardar.'
                                : 'Modifying this question may cause existing responses to become inconsistent or be deleted when saving.'
                            }
                        </p>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
