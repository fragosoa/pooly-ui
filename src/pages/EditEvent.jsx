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

    // Metadata fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [endDate, setEndDate] = useState('');
    const [hasEndDate, setHasEndDate] = useState(false);
    const [welcomeMessage, setWelcomeMessage] = useState('');
    const [completionMessage, setCompletionMessage] = useState('');
    const [showWelcomeEditor, setShowWelcomeEditor] = useState(false);
    const [showCompletionEditor, setShowCompletionEditor] = useState(false);

    // Questions list (all questions, existing + new)
    const [questions, setQuestions] = useState([]);

    // Question modal
    const [showModal, setShowModal] = useState(false);
    const [editingIdx, setEditingIdx] = useState(null);
    const [modalData, setModalData] = useState(emptyQuestion());
    const [openMenuIdx, setOpenMenuIdx] = useState(null);

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
            } catch (err) {
                toast.error(t('eventDetails.errorLoad'));
                navigate(`/admin/events/${eventId}`);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [eventId, navigate, t]);

    // Close menu on outside click
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
            setQuestions(prev => [...prev, cleaned]);
        } else {
            setQuestions(prev => prev.map((q, i) => i === editingIdx ? cleaned : q));
        }
        setShowModal(false);
    };

    const removeQuestion = (idx) => {
        if (questions.length <= 1) return;
        setQuestions(prev => prev.filter((_, i) => i !== idx));
        setOpenMenuIdx(null);
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
        if (!name.trim()) { toast.error(isES ? 'El nombre es requerido.' : 'Name is required.'); return; }
        if (questions.length === 0) { toast.error(t('create.errorNoQuestions')); return; }
        const badMultiple = questions.find(q => q.type === 'multiple' && q.options.filter(Boolean).length < 2);
        if (badMultiple) { toast.error(t('create.errorMultipleOptions')); return; }

        setSaving(true);
        const toastId = toast.loading(t('editEvent.saving'));

        try {
            const farFuture = new Date();
            farFuture.setFullYear(farFuture.getFullYear() + 20);

            // Save metadata
            await api.patch(`/events/${eventId}`, {
                name: name.trim(),
                description: description.trim(),
                end_date: hasEndDate ? endDate : farFuture.toISOString().split('T')[0],
                welcome_message: welcomeMessage.trim() || null,
                completion_message: completionMessage.trim() || null,
            });

            // Save questions (order is implicit by array index)
            const cleanedQuestions = questions.map(q => ({
                ...(q._isNew ? {} : { id: q.id }),
                text: q.text.trim(),
                type: q.type,
                optional: q.optional,
                options: q.type === 'multiple' ? q.options.filter(Boolean) : [],
            }));
            await api.patch(`/events/${eventId}/questions`, { questions: cleanedQuestions });

            toast.success(t('editEvent.saveSuccess'), { id: toastId });
            navigate(`/admin/events/${eventId}`);
        } catch (err) {
            toast.error(
                err.response?.data?.message || t('editEvent.saveError'),
                { id: toastId }
            );
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
        <div className="container" style={{ paddingTop: '7rem', paddingBottom: '4rem', maxWidth: '760px' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <Link to={`/admin/events/${eventId}`} style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textDecoration: 'none' }}>
                    {t('editEvent.back')}
                </Link>
                <h1 className="page-title" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                    {t('editEvent.pageTitle')}
                </h1>
            </div>

            {/* Section: Info */}
            <section className="edit-event-section">
                <h2 className="edit-event-section-title">{t('editEvent.sectionInfo')}</h2>

                <div className="form-group">
                    <label className="input-label">{t('editEvent.name')} *</label>
                    <input
                        className="input"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder={isES ? 'Nombre de la encuesta' : 'Survey name'}
                        maxLength={120}
                    />
                </div>

                <div className="form-group">
                    <label className="input-label">{t('editEvent.description')}</label>
                    <textarea
                        className="input"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={3}
                        placeholder={isES ? 'Descripción breve' : 'Brief description'}
                        maxLength={500}
                    />
                </div>

                <div className="form-group">
                    <label className="input-label">{t('editEvent.endDate')}</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={hasEndDate}
                                onChange={e => setHasEndDate(e.target.checked)}
                            />
                            {isES ? 'Establecer fecha de cierre' : 'Set closing date'}
                        </label>
                        {hasEndDate && (
                            <input
                                type="date"
                                className="input"
                                style={{ width: 'auto', flex: 1, minWidth: '160px' }}
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                            />
                        )}
                    </div>
                </div>

                {/* Welcome screen */}
                <div className="screen-section">
                    <div className="screen-section-header">
                        <div>
                            <span className="screen-section-badge">{isES ? 'Opcional' : 'Optional'}</span>
                            <h3 className="screen-section-title">{t('editEvent.welcomeLabel')}</h3>
                        </div>
                        <button
                            type="button"
                            className={`screen-section-toggle ${showWelcomeEditor ? 'is-active' : ''}`}
                            onClick={() => setShowWelcomeEditor(v => !v)}
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
                            <h3 className="screen-section-title">{t('editEvent.completionLabel')}</h3>
                        </div>
                        <button
                            type="button"
                            className={`screen-section-toggle ${showCompletionEditor ? 'is-active' : ''}`}
                            onClick={() => setShowCompletionEditor(v => !v)}
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
            </section>

            {/* Section: Questions */}
            <section className="edit-event-section">
                <h2 className="edit-event-section-title">{t('editEvent.sectionQuestions')}</h2>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={questions.map(q => q._dndId)} strategy={verticalListSortingStrategy}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                    {questions.map((q, idx) => (
                        <SortableQuestionRow key={q._dndId} id={q._dndId}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '0.75rem 1rem 0.75rem 2.25rem',
                            border: '1px solid var(--border)',
                            background: q._isNew ? 'var(--primary-50, #eff6ff)' : 'var(--bg-white)',
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
                                    {TYPE_ICONS[q.type]} {isES
                                        ? { open: 'Texto libre', multiple: 'Opción múltiple', numeric: 'Numérico', date: 'Fecha' }[q.type]
                                        : { open: 'Free text', multiple: 'Multiple choice', numeric: 'Numeric', date: 'Date' }[q.type]
                                    }
                                    {q.type === 'multiple' && q.options?.filter(Boolean).length > 0 && (
                                        <span> · {q.options.filter(Boolean).length} {isES ? 'opciones' : 'options'}</span>
                                    )}
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
                                    }}
                                >
                                    ···
                                </button>
                                {openMenuIdx === idx && (
                                    <div style={{
                                        position: 'absolute', right: 0, top: '100%', zIndex: 20,
                                        background: '#fff', border: '1px solid var(--border)',
                                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)', minWidth: '130px',
                                    }}>
                                        <button type="button" onClick={() => openEditModal(idx)}
                                            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.6rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                                            ✏️ {isES ? 'Editar' : 'Edit'}
                                        </button>
                                        {questions.length > 1 && (
                                            <button type="button" onClick={() => removeQuestion(idx)}
                                                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.6rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--error)' }}>
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
            </section>

            {/* Footer actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', marginTop: '2rem' }}>
                <Link to={`/admin/events/${eventId}`} className="btn btn-secondary">
                    {t('editEvent.cancelBtn')}
                </Link>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? t('editEvent.saving') : t('editEvent.saveBtn')}
                </button>
            </div>

            {/* Question edit modal */}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label className="input-label">{isES ? 'Pregunta' : 'Question'}</label>
                        <input
                            className="input"
                            value={modalData.text}
                            onChange={e => setModalData(p => ({ ...p, text: e.target.value }))}
                            placeholder={isES ? 'Escribe la pregunta aquí' : 'Write question here'}
                            autoFocus
                        />
                    </div>

                    <div>
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
                                    {TYPE_ICONS[type]} {isES
                                        ? { open: 'Texto', multiple: 'Múltiple', numeric: 'Número', date: 'Fecha' }[type]
                                        : { open: 'Text', multiple: 'Multiple', numeric: 'Number', date: 'Date' }[type]
                                    }
                                </button>
                            ))}
                        </div>
                    </div>

                    {modalData.type === 'multiple' && (
                        <div>
                            <label className="input-label">{isES ? 'Opciones' : 'Options'}</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {modalData.options.map((opt, oIdx) => (
                                    <div key={oIdx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <input
                                            className="input"
                                            value={opt}
                                            onChange={e => handleModalOptionChange(oIdx, e.target.value)}
                                            placeholder={`${isES ? 'Opción' : 'Option'} ${oIdx + 1}`}
                                            style={{ flex: 1 }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeModalOption(oIdx)}
                                            disabled={modalData.options.length <= 2}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', fontSize: '1rem', padding: '0.25rem', opacity: modalData.options.length <= 2 ? 0.3 : 1 }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={addModalOption} className="btn btn-outline" style={{ fontSize: '0.8rem', alignSelf: 'flex-start' }}>
                                    + {isES ? 'Añadir opción' : 'Add option'}
                                </button>
                            </div>
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={modalData.optional}
                                onChange={e => setModalData(p => ({ ...p, optional: e.target.checked }))}
                            />
                            {isES ? 'Respuesta opcional' : 'Optional response'}
                        </label>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
