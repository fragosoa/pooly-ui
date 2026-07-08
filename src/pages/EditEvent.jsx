import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../services/api';
import Modal from '../components/Modal';
import Icon from '../components/Icon';
import MarkdownEditor from '../components/MarkdownEditor';
import { useLanguage } from '../context/LanguageContext';

const TYPE_ICONS = { open: 'message', multiple: 'list-checks', numeric: 'hash', date: 'calendar' };
const QUESTION_TYPES = ['open', 'multiple', 'numeric', 'date'];

const emptyQuestion = () => ({
    _kind: 'question', text: '', optional: false, type: 'open', options: ['', ''], multiSelect: false,
    _isNew: true,
    _dndId: `new-${Date.now()}-${Math.random()}`,
});
const emptyTextBlock = () => ({
    _kind: 'text_block', content: '',
    _isNew: true,
    _dndId: `tb-new-${Date.now()}-${Math.random()}`,
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

    // Items (questions + text blocks merged)
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

                const questionItems = (ev.questions || []).map((q, i) => ({
                    ...q,
                    _kind: 'question',
                    options: q.options || [],
                    optional: q.optional || false,
                    type: q.type || 'open',
                    multiSelect: q.multi_select || false,
                    _dndId: String(q.id ?? `q-${i}`),
                    _isNew: false,
                }));
                const textBlockItems = (ev.text_blocks || []).map((tb, i) => ({
                    ...tb,
                    _kind: 'text_block',
                    _dndId: `tb-${tb.id ?? i}`,
                    _isNew: false,
                }));
                const allItems = [...questionItems, ...textBlockItems]
                    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
                setQuestions(allItems);
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

    const openAddTextBlock = () => {
        setEditingIdx(null);
        setModalData(emptyTextBlock());
        setShowModal(true);
    };

    const openEditModal = (idx) => {
        setEditingIdx(idx);
        const item = questions[idx];
        if (item._kind === 'text_block') {
            setModalData({ ...item });
        } else {
            setModalData({ ...item, options: [...(item.options || [])] });
        }
        setOpenMenuIdx(null);
        setShowModal(true);
    };

    const handleModalSave = () => {
        if (modalData._kind === 'text_block') {
            if (!modalData.content?.trim()) return;
            const tb = { ...modalData, content: modalData.content.trim() };
            if (editingIdx === null) {
                setQuestions(prev => [...prev, tb]);
            } else {
                setQuestions(prev => prev.map((item, i) => i === editingIdx ? tb : item));
            }
            setShowModal(false);
            return;
        }

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
            setShowModal(false);
            return;
        }

        const existing = questions[editingIdx];
        const responseCount = existing?.responses?.length ?? 0;

        if (!existing._isNew && responseCount > 0) {
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
        const item = questions[idx];
        const isQuestion = item?._kind === 'question';
        const questionCount = questions.filter(i => i._kind === 'question').length;
        if (isQuestion && questionCount <= 1) return;
        setOpenMenuIdx(null);

        if (isQuestion) {
            const responseCount = item?.responses?.length ?? 0;
            if (!item._isNew && responseCount > 0) {
                setPendingDeleteIdx(idx);
                setShowDeleteWarning(true);
                return;
            }
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
            opts[oIdx] = prev.multiSelect ? val.replace(/,/g, '') : val;
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
        const questionCount = questions.filter(i => i._kind === 'question').length;
        if (questionCount === 0) {
            setError(t('create.errorNoQuestions'));
            return;
        }
        const badMultiple = questions.find(q => q._kind === 'question' && q.type === 'multiple' && q.options.filter(Boolean).length < 2);
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

            const cleanedQuestions = questions
                .filter(item => item._kind === 'question')
                .map((q) => ({
                    ...(q._isNew ? {} : { id: q.id }),
                    position: questions.indexOf(q) * 10,
                    text: q.text.trim(),
                    type: q.type,
                    optional: q.optional,
                    options: q.type === 'multiple' ? q.options.filter(Boolean) : [],
                    multi_select: q.type === 'multiple' ? (q.multiSelect || false) : false,
                }));

            const cleanedTextBlocks = questions
                .filter(item => item._kind === 'text_block' && item.content?.trim())
                .map(tb => ({
                    ...(tb._isNew ? {} : { id: tb.id }),
                    content: tb.content.trim(),
                    position: questions.indexOf(tb) * 10,
                }));

            await api.patch(`/events/${eventId}/questions`, {
                questions: cleanedQuestions,
                text_blocks: cleanedTextBlocks,
            });

            toast.success(t('editEvent.saveSuccess'), { id: toastId });
            navigate(`/admin/events/${eventId}`);
        } catch (err) {
            toast.error(err.response?.data?.message || t('editEvent.saveError'), { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    const titleError = modalData._kind !== 'text_block' && !modalData.text?.trim()
        ? (isES ? 'La pregunta debe tener un título.' : 'Question must have a title.')
        : null;
    const filledOptions = modalData._kind !== 'text_block' && modalData.type === 'multiple'
        ? (modalData.options || []).map(o => o.trim()).filter(Boolean)
        : [];
    const optionsError = modalData._kind === 'text_block' || modalData.type !== 'multiple' ? null
        : filledOptions.length < 2
            ? (isES ? 'Agrega al menos 2 opciones.' : 'Add at least 2 options.')
            : new Set(filledOptions).size !== filledOptions.length
                ? (isES ? 'Las opciones deben ser diferentes entre sí.' : 'Options must be unique.')
                : null;

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

                    {questions.filter(i => i._kind === 'question').length === 0 && (
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
                        {questions.map((item, idx) => (
                            <SortableQuestionRow key={item._dndId} id={item._dndId}>
                            {item._kind === 'text_block' ? (
                                <div style={{
                                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                                    padding: '0.75rem 1rem 0.75rem 2.25rem',
                                    border: '1px dashed var(--border)',
                                    background: 'var(--bg-secondary)',
                                }}>
                                    <span style={{ flexShrink: 0, marginTop: '0.1rem', color: 'var(--text-secondary)', display: 'flex' }}><Icon name="note" size={16} /></span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {item.content
                                                ? item.content.substring(0, 80) + (item.content.length > 80 ? '…' : '')
                                                : <em style={{ color: 'var(--text-muted)' }}>{isES ? 'Texto vacío' : 'Empty text'}</em>}
                                        </p>
                                        <p style={{ margin: '0.15rem 0 0', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                            {isES ? 'Bloque de texto · Markdown' : 'Text block · Markdown'}
                                            {item._isNew && <span style={{ color: 'var(--primary)', fontWeight: 600, marginLeft: '0.4rem' }}>{isES ? '• Nuevo' : '• New'}</span>}
                                        </p>
                                    </div>
                                    <div style={{ position: 'relative', flexShrink: 0 }}>
                                        <button type="button" onClick={e => { e.stopPropagation(); setOpenMenuIdx(openMenuIdx === idx ? null : idx); }}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0.4rem', color: 'var(--text-secondary)', fontSize: '1.1rem', letterSpacing: '0.05em', lineHeight: 1, borderRadius: '4px' }}
                                            title={isES ? 'Opciones' : 'Options'}>···</button>
                                        {openMenuIdx === idx && (
                                            <div style={{ position: 'absolute', right: 0, top: '100%', zIndex: 20, background: 'var(--bg-white)', border: '1px solid var(--border)', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', minWidth: '130px' }}>
                                                <button type="button" onClick={() => openEditModal(idx)}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', width: '100%', textAlign: 'left', padding: '0.6rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)', fontFamily: 'inherit' }}>
                                                    <Icon name="pencil" size={14} /> {isES ? 'Editar' : 'Edit'}
                                                </button>
                                                <button type="button" onClick={() => removeQuestion(idx)}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', width: '100%', textAlign: 'left', padding: '0.6rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--error)', fontFamily: 'inherit' }}>
                                                    <Icon name="trash" size={14} /> {isES ? 'Eliminar' : 'Delete'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                padding: '0.75rem 1rem 0.75rem 2.25rem',
                                border: '1px solid var(--border)',
                                background: item._isNew ? 'var(--bg-secondary)' : 'var(--bg-white)',
                            }}>
                                <span style={{
                                    width: '24px', height: '24px', flexShrink: 0,
                                    background: 'var(--primary-light)', color: 'var(--primary)',
                                    borderRadius: '50%', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700',
                                }}>
                                    {questions.slice(0, idx + 1).filter(i => i._kind === 'question').length}
                                </span>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {item.text || <em style={{ color: 'var(--text-muted)' }}>{isES ? 'Sin texto' : 'No text'}</em>}
                                    </p>
                                    <p style={{ margin: '0.15rem 0 0', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                        <Icon name={TYPE_ICONS[item.type]} size={12} style={{ verticalAlign: '-2px', marginRight: '0.15rem' }} />{' '}
                                        {t(`create.questionType${item.type.charAt(0).toUpperCase() + item.type.slice(1)}`)}
                                        {item.type === 'multiple' && item.options?.filter(Boolean).length > 0 && (
                                            <span> · {item.options.filter(Boolean).length} {isES ? 'opciones' : 'options'}</span>
                                        )}
                                        <span style={{ color: 'var(--border)', margin: '0 0.3rem' }}>·</span>
                                        {item.optional ? t('create.questionOptional') : t('create.questionRequired')}
                                        {item._isNew && <span style={{ color: 'var(--primary)', fontWeight: 600, marginLeft: '0.4rem' }}>{isES ? '• Nueva' : '• New'}</span>}
                                    </p>
                                </div>

                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                    <button type="button"
                                        onClick={e => { e.stopPropagation(); setOpenMenuIdx(openMenuIdx === idx ? null : idx); }}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0.4rem', color: 'var(--text-secondary)', fontSize: '1.1rem', letterSpacing: '0.05em', lineHeight: 1, borderRadius: '4px' }}
                                        title={isES ? 'Opciones' : 'Options'}>···</button>
                                    {openMenuIdx === idx && (
                                        <div style={{ position: 'absolute', right: 0, top: '100%', zIndex: 20, background: 'var(--bg-white)', border: '1px solid var(--border)', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', minWidth: '130px' }}>
                                            <button type="button" onClick={() => openEditModal(idx)}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', width: '100%', textAlign: 'left', padding: '0.6rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)', fontFamily: 'inherit' }}>
                                                <Icon name="pencil" size={14} /> {isES ? 'Editar' : 'Edit'}
                                            </button>
                                            {questions.filter(i => i._kind === 'question').length > 1 && (
                                                <button type="button" onClick={() => removeQuestion(idx)}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', width: '100%', textAlign: 'left', padding: '0.6rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--error)', fontFamily: 'inherit' }}>
                                                    <Icon name="trash" size={14} /> {isES ? 'Eliminar' : 'Delete'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            )}
                            </SortableQuestionRow>
                        ))}
                    </div>
                    </SortableContext>
                    </DndContext>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="button" onClick={openAddModal} className="btn btn-outline" style={{ flex: 1, borderStyle: 'dashed' }}>
                            + {t('editEvent.addQuestion')}
                        </button>
                        <button type="button" onClick={openAddTextBlock} className="btn btn-outline"
                            style={{ flex: 1, borderStyle: 'dashed' }}
                            title={isES ? 'Agrega un bloque de texto o separador entre preguntas' : 'Add a text block or separator between questions'}>
                            <Icon name="note" size={14} /> {isES ? 'Agregar texto' : 'Add text'}
                        </button>
                    </div>
                </div>

                {/* ── Footer actions ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to={`/admin/events/${eventId}`} className="btn btn-secondary">
                        {t('editEvent.cancelBtn')}
                    </Link>
                    <button className="btn btn-action" onClick={handleSave} disabled={saving}>
                        {saving ? t('editEvent.saving') : t('editEvent.saveBtn')}
                    </button>
                </div>
            </div>

            {/* ── Question edit/add modal ── */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={modalData._kind === 'text_block'
                    ? (editingIdx === null ? (isES ? 'Nuevo bloque de texto' : 'New text block') : (isES ? 'Editar texto' : 'Edit text'))
                    : (editingIdx === null ? (isES ? 'Nueva pregunta' : 'New question') : (isES ? 'Editar pregunta' : 'Edit question'))
                }
                footer={
                    <div className="modal-actions">
                        <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                            {t('editEvent.cancelBtn')}
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleModalSave}
                            disabled={modalData._kind === 'text_block' ? !modalData.content?.trim() : (!!titleError || !!optionsError)}
                        >
                            {editingIdx === null ? (isES ? 'Agregar' : 'Add') : (isES ? 'Guardar' : 'Save')}
                        </button>
                    </div>
                }
            >
                {modalData._kind === 'text_block' ? (
                    <MarkdownEditor
                        value={modalData.content || ''}
                        onChange={val => setModalData(prev => ({ ...prev, content: val }))}
                        placeholder={isES
                            ? 'ej. ## Sección 2\nResponde las siguientes preguntas sobre...'
                            : 'e.g. ## Section 2\nPlease answer the following questions about...'}
                    />
                ) : (
                <>
                <div className="input-group">
                    <label className="input-label">{isES ? 'Pregunta' : 'Question'}</label>
                    <input
                        type="text"
                        className="input-field"
                        value={modalData.text || ''}
                        onChange={e => setModalData(p => ({ ...p, text: e.target.value }))}
                        placeholder={isES ? 'Escribe la pregunta aquí' : 'Write question here'}
                        style={{ borderColor: titleError ? 'var(--error)' : undefined }}
                        autoFocus
                    />
                    {titleError && (
                        <p style={{ margin: '0.4rem 0 0', fontSize: '0.8rem', color: 'var(--error)', fontWeight: 500 }}>
                            {titleError}
                        </p>
                    )}
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
                                <Icon name={TYPE_ICONS[type]} size={13} style={{ verticalAlign: '-2px', marginRight: '0.15rem' }} />{' '}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.75rem' }}>
                            <button
                                type="button"
                                onClick={() => setModalData(prev => ({ ...prev, multiSelect: !prev.multiSelect }))}
                                style={{
                                    width: '36px', height: '20px', borderRadius: '10px', position: 'relative',
                                    background: modalData.multiSelect ? 'var(--primary)' : 'var(--border)',
                                    border: 'none', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
                                }}
                            >
                                <span style={{
                                    position: 'absolute', top: '2px',
                                    left: modalData.multiSelect ? '18px' : '2px',
                                    width: '16px', height: '16px', borderRadius: '50%',
                                    background: '#fff', transition: 'left 0.2s',
                                }} />
                            </button>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                {isES ? 'Permitir selección múltiple' : 'Allow multiple selections'}
                            </span>
                        </div>
                        {modalData.multiSelect && (
                            <p style={{ margin: '0.5rem 0 0', display: 'flex', alignItems: 'flex-start', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--warning-strong)', lineHeight: 1.5 }}>
                                <Icon name="alert-triangle" size={13} style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                                {isES
                                    ? 'Evita usar signos de puntuacion en las opciones tales como comas, guiones o barras'
                                    : 'Avoid commas in option text — commas are used internally to separate selected answers.'}
                            </p>
                        )}
                        {optionsError && (
                            <p style={{ margin: '0.4rem 0 0', fontSize: '0.8rem', color: 'var(--error)', fontWeight: 500 }}>
                                {optionsError}
                            </p>
                        )}
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
                </>
                )}
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
