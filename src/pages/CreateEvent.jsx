import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../services/api';
import Modal from '../components/Modal';
import MarkdownEditor from '../components/MarkdownEditor';
import { useLanguage } from '../context/LanguageContext';

let _qIdCounter = 0;
const emptyQuestion = () => ({ _kind: 'question', text: '', optional: false, type: 'open', options: ['', ''], multiSelect: false, _dndId: String(++_qIdCounter) });
const emptyTextBlock = () => ({ _kind: 'text_block', content: '', _dndId: `tb-${++_qIdCounter}` });

const DRAFT_KEY = 'pooly_create_survey_draft';

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
            <div style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', cursor: 'grab', color: 'var(--text-muted)', touchAction: 'none' }} {...attributes} {...listeners}>
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

const TYPE_ICONS = { open: '💬', multiple: '☑️', numeric: '🔢', date: '📅' };
const CAROUSEL_SLIDES = 3;

const CreateEvent = () => {
    const navigate = useNavigate();
    const { t, locale } = useLanguage();
    const isES = locale === 'es-MX';

    // ── Core form state (unchanged — drives payload) ──────────────────────────
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '', description: '', end_date: '',
        items: [],
    });
    const [welcomeMessage, setWelcomeMessage] = useState('');
    const [completionMessage, setCompletionMessage] = useState('');

    // ── Draft state ───────────────────────────────────────────────────────────
    const [draftBanner, setDraftBanner] = useState(false);
    const [draftSavedAt, setDraftSavedAt] = useState(null);
    const draftTimerRef = useRef(null);

    // ── UI-only state ─────────────────────────────────────────────────────────
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null); // null = new question
    const [modalData, setModalData] = useState(emptyQuestion());
    const [openMenuIdx, setOpenMenuIdx] = useState(null);
    const [carouselIdx, setCarouselIdx] = useState(0);
    const [showWelcomeEditor, setShowWelcomeEditor] = useState(false);
    const [showCompletionEditor, setShowCompletionEditor] = useState(false);
    const [hasEndDate, setHasEndDate] = useState(false);

    // DnD sensors
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    // Restore draft on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem(DRAFT_KEY);
            if (!raw) return;
            const draft = JSON.parse(raw);
            // Backward compat: old drafts used 'questions', new ones use 'items'
            const items = draft.formData?.items ||
                (draft.formData?.questions || []).map(q => ({ ...q, _kind: 'question' }));
            const hasContent = draft.formData?.name || items.length > 0;
            if (!hasContent) return;
            const maxId = Math.max(0, ...items.map(i => Number(i._dndId?.replace('tb-', '')) || 0));
            _qIdCounter = maxId;
            setFormData({ ...draft.formData, items });
            setWelcomeMessage(draft.welcomeMessage || '');
            setCompletionMessage(draft.completionMessage || '');
            setStep(draft.step || 1);
            setHasEndDate(draft.hasEndDate || false);
            setShowWelcomeEditor(!!draft.welcomeMessage);
            setShowCompletionEditor(!!draft.completionMessage);
            setDraftBanner(true);
        } catch (_) {
            localStorage.removeItem(DRAFT_KEY);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-save draft (debounced 1.5s after last change)
    useEffect(() => {
        const hasContent = formData.name || formData.description || formData.items.length > 0 || welcomeMessage || completionMessage;
        if (!hasContent) return;
        clearTimeout(draftTimerRef.current);
        draftTimerRef.current = setTimeout(() => {
            try {
                localStorage.setItem(DRAFT_KEY, JSON.stringify({ formData, welcomeMessage, completionMessage, step, hasEndDate }));
                setDraftSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            } catch (_) {}
        }, 1500);
        return () => clearTimeout(draftTimerRef.current);
    }, [formData, welcomeMessage, completionMessage, step, hasEndDate]);

    const discardDraft = () => {
        localStorage.removeItem(DRAFT_KEY);
        setDraftBanner(false);
        setDraftSavedAt(null);
        setFormData({ name: '', description: '', end_date: '', items: [] });
        setWelcomeMessage('');
        setCompletionMessage('');
        setStep(1);
        setHasEndDate(false);
        setShowWelcomeEditor(false);
        setShowCompletionEditor(false);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setFormData(prev => {
                const oldIndex = prev.items.findIndex(i => i._dndId === active.id);
                const newIndex = prev.items.findIndex(i => i._dndId === over.id);
                return { ...prev, items: arrayMove(prev.items, oldIndex, newIndex) };
            });
        }
    };

    // Carousel auto-advance (only while on step 2)
    useEffect(() => {
        if (step !== 2) return;
        const id = setInterval(() => setCarouselIdx(i => (i + 1) % CAROUSEL_SLIDES), 5000);
        return () => clearInterval(id);
    }, [step]);

    // Close three-dot menu on outside click
    useEffect(() => {
        if (openMenuIdx === null) return;
        const close = () => setOpenMenuIdx(null);
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, [openMenuIdx]);

    // ── Existing handlers (logic unchanged) ───────────────────────────────────
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const removeQuestion = (index) => {
        const isQuestion = formData.items[index]?._kind === 'question';
        const questionCount = formData.items.filter(i => i._kind === 'question').length;
        if (isQuestion && questionCount <= 1) return;
        setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    };

    const handleStep1Submit = (e) => {
        e.preventDefault();
        if (hasEndDate) {
            if (!formData.end_date) { setError(t('create.errorNoDate')); return; }
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (new Date(formData.end_date) < today) { setError(t('create.errorPastDate')); return; }
        }
        setError('');
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const cleanedQuestions = formData.items
                .filter(item => item._kind === 'question' && item.text.trim() !== '')
                .map((q, _relIdx, _arr) => {
                    const globalIdx = formData.items.indexOf(q);
                    return {
                        text: q.text.trim(),
                        optional: q.optional,
                        type: q.type,
                        options: q.type === 'multiple' ? q.options.map(o => o.trim()).filter(Boolean) : [],
                        multi_select: q.type === 'multiple' ? (q.multiSelect || false) : false,
                        position: globalIdx * 10,
                    };
                });
            if (cleanedQuestions.length === 0) throw new Error(t('create.errorNoQuestions'));
            const badMultiple = cleanedQuestions.find(q => q.type === 'multiple' && q.options.length < 2);
            if (badMultiple) throw new Error(t('create.errorMultipleOptions'));

            const cleanedTextBlocks = formData.items
                .filter(item => item._kind === 'text_block' && item.content.trim() !== '')
                .map(tb => ({ content: tb.content.trim(), position: formData.items.indexOf(tb) * 10 }));

            const farFuture = new Date();
            farFuture.setFullYear(farFuture.getFullYear() + 20);
            const payload = {
                name: formData.name,
                description: formData.description,
                end_date: hasEndDate ? formData.end_date : farFuture.toISOString().split('T')[0],
                welcome_message: welcomeMessage.trim() || null,
                completion_message: completionMessage.trim() || null,
                questions: cleanedQuestions,
                text_blocks: cleanedTextBlocks.length > 0 ? cleanedTextBlocks : undefined,
            };
            await api.post('/events/new', payload);
            localStorage.removeItem(DRAFT_KEY);
            toast.success(t('create.successToast'));
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.message || err.message || t('create.errorGeneric'));
        } finally {
            setIsLoading(false);
        }
    };

    // ── Modal handlers ────────────────────────────────────────────────────────
    const openAddModal = () => {
        setEditingIndex(null);
        setModalData(emptyQuestion());
        setShowQuestionModal(true);
    };

    const openAddTextBlock = () => {
        setEditingIndex(null);
        setModalData(emptyTextBlock());
        setShowQuestionModal(true);
    };

    const openEditModal = (index) => {
        setEditingIndex(index);
        const item = formData.items[index];
        if (item._kind === 'text_block') {
            setModalData({ ...item });
        } else {
            setModalData({ ...item, options: [...item.options] });
        }
        setOpenMenuIdx(null);
        setShowQuestionModal(true);
    };

    const handleModalSave = () => {
        if (modalData._kind === 'text_block') {
            if (!modalData.content.trim()) return;
            const tb = { ...modalData, content: modalData.content.trim() };
            if (editingIndex === null) {
                setFormData(prev => ({ ...prev, items: [...prev.items, tb] }));
            } else {
                setFormData(prev => ({ ...prev, items: prev.items.map((item, i) => i === editingIndex ? tb : item) }));
            }
            setShowQuestionModal(false);
            return;
        }
        if (!modalData.text.trim()) return;
        const q = {
            ...modalData,
            text: modalData.text.trim(),
            options: modalData.type === 'multiple' ? modalData.options.map(o => o.trim()).filter(Boolean) : [],
        };
        if (editingIndex === null) {
            setFormData(prev => ({ ...prev, items: [...prev.items, q] }));
        } else {
            setFormData(prev => ({
                ...prev,
                items: prev.items.map((item, i) => i === editingIndex ? q : item),
            }));
        }
        setShowQuestionModal(false);
    };

    const handleModalOptionChange = (oIdx, val) => {
        const clean = modalData.multiSelect ? val.replace(/,/g, '') : val;
        setModalData(prev => ({ ...prev, options: prev.options.map((o, i) => i === oIdx ? clean : o) }));
    };
    const addModalOption = () => setModalData(prev => ({ ...prev, options: [...prev.options, ''] }));
    const removeModalOption = (oIdx) => {
        if (modalData.options.length <= 2) return;
        setModalData(prev => ({ ...prev, options: prev.options.filter((_, i) => i !== oIdx) }));
    };

    // ── Derived / display helpers ─────────────────────────────────────────────
    const typeDescriptions = {
        open:     isES ? 'El respondente escribe su respuesta libremente. Ideal para opiniones y comentarios abiertos.' : 'The respondent writes freely. Great for opinions and open comments.',
        multiple: isES ? 'El respondente elige entre las opciones que tú defines. Ideal para categorías o escalas.' : 'The respondent picks from options you define. Great for categories or scales.',
        numeric:  isES ? 'El respondente escribe un número. Ideal para edades, puntajes o mediciones continuas.' : 'The respondent enters a number. Great for ages, scores, or continuous measurements.',
        date:     isES ? 'El respondente selecciona una fecha. Ideal para eventos, plazos o fechas.' : 'The respondent selects a date. Great for events, deadlines, or birthdates.',
    };

    // Step 1 static tips (unchanged)
    const step1Tips = {
        icon: '💡', title: t('tips.step1.title'),
        tips: [
            { icon: '✏️', title: t('tips.step1.tip1.title'), description: t('tips.step1.tip1.desc') },
            { icon: '📝', title: t('tips.step1.tip2.title'), description: t('tips.step1.tip2.desc') },
            { icon: '📅', title: t('tips.step1.tip3.title'), description: t('tips.step1.tip3.desc') },
        ],
        highlight: { icon: '🎯', text: t('tips.step1.highlight') },
    };

    // Step 2 carousel slides
    const slides = [
        {
            icon: '✏️',
            title: t('tips.step2.title'),
            body: 'tips',
        },
        {
            icon: '📋',
            title: isES ? 'Tipos de respuesta' : 'Response types',
            body: 'types',
        },
        {
            icon: '🤖',
            title: isES ? 'Análisis con IA' : 'AI-powered analysis',
            body: 'highlight',
        },
    ];

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

    return (
        <div className="container" style={{ paddingTop: '7rem', paddingBottom: '4rem' }}>
            <header style={{ marginBottom: '2rem' }}>
                <Link to="/admin" style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'inline-block', fontSize: '0.875rem' }}>
                    {t('create.back')}
                </Link>
                <h1 className="page-title">{t('create.title')}</h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    {t('create.step', { step })}: {step === 1 ? t('create.step1Label') : t('create.step2Label')}
                    {draftSavedAt && (
                        <span style={{ marginLeft: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            · 💾 {t('create.draftSaved')} {draftSavedAt}
                        </span>
                    )}
                </p>
            </header>

            {/* Progress bar */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', maxWidth: '900px' }}>
                <div style={{ flex: 1, height: '4px', background: 'var(--primary)' }} />
                <div style={{ flex: 1, height: '4px', background: step === 2 ? 'var(--primary)' : 'var(--border)' }} />
            </div>

            {draftBanner && (
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.75rem 1rem', marginBottom: '1.25rem', maxWidth: '900px',
                    background: 'var(--primary-light)', border: '1px solid var(--primary)', borderRadius: '6px',
                }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>
                        💾 {t('create.draftRestoredBanner')}
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, marginLeft: '1rem' }}>
                        <button
                            type="button"
                            onClick={discardDraft}
                            style={{
                                background: 'none', border: '1px solid var(--primary)', borderRadius: '4px',
                                color: 'var(--primary)', fontSize: '0.8rem', padding: '0.25rem 0.6rem', cursor: 'pointer',
                            }}
                        >
                            {t('create.draftDiscard')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setDraftBanner(false)}
                            style={{
                                background: 'none', border: 'none', color: 'var(--primary)',
                                fontSize: '1.1rem', cursor: 'pointer', padding: '0 0.2rem', lineHeight: 1,
                            }}
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {error && <div className="alert alert-error" style={{ maxWidth: '900px' }}>{error}</div>}

            <div className="create-event-layout">
                {/* ── Left: form ── */}
                <div className="create-event-form">
                    <div className="card" style={{ padding: '2rem' }}>

                        {/* Step 1 — survey details (unchanged) */}
                        {step === 1 && (
                            <form onSubmit={handleStep1Submit}>
                                <div className="input-group">
                                    <label className="input-label">{t('create.name')}</label>
                                    <input type="text" name="name" className="input-field"
                                        value={formData.name} onChange={handleInputChange}
                                        required placeholder={t('create.namePlaceholder')} />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">{t('create.description')}</label>
                                    <textarea name="description" className="input-field" rows="3"
                                        value={formData.description} onChange={handleInputChange}
                                        required placeholder={t('create.descPlaceholder')} />
                                </div>
                                <div className="input-group">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: hasEndDate ? '0.75rem' : 0 }}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setHasEndDate(v => !v);
                                                if (hasEndDate) setFormData(p => ({ ...p, end_date: '' }));
                                            }}
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
                                        <label className="input-label" style={{ margin: 0, cursor: 'pointer' }}
                                            onClick={() => {
                                                setHasEndDate(v => !v);
                                                if (hasEndDate) setFormData(p => ({ ...p, end_date: '' }));
                                            }}>
                                            {t('create.endDateToggle')}
                                        </label>
                                    </div>
                                    {hasEndDate && (
                                        <input type="date" name="end_date" className="input-field"
                                            value={formData.end_date} onChange={handleInputChange}
                                            style={{ margin: 0 }}
                                            min={new Date().toISOString().split('T')[0]} />
                                    )}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                    <button type="submit" className="btn btn-primary">{t('create.next')}</button>
                                </div>
                            </form>
                        )}

                        {/* Step 2 — questions list (new compact design) */}
                        {step === 2 && (
                            <form onSubmit={handleSubmit}>

                                {/* ── Welcome screen section ── */}
                                <div className="screen-section">
                                    <div className="screen-section-header">
                                        <div>
                                            <span className="screen-section-badge">
                                                {isES ? 'Opcional' : 'Optional'}
                                            </span>
                                            <span className="screen-section-title">
                                                {isES ? 'Pantalla de bienvenida' : 'Welcome screen'}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            className={`screen-section-toggle ${showWelcomeEditor ? 'is-active' : ''}`}
                                            onClick={() => {
                                                if (showWelcomeEditor) setWelcomeMessage('');
                                                setShowWelcomeEditor(v => !v);
                                            }}
                                        >
                                            {showWelcomeEditor
                                                ? (isES ? '✕ Quitar' : '✕ Remove')
                                                : (isES ? '+ Agregar' : '+ Add')}
                                        </button>
                                    </div>
                                    {showWelcomeEditor && (
                                        <div style={{ marginTop: '0.75rem' }}>
                                            <MarkdownEditor
                                                value={welcomeMessage}
                                                onChange={setWelcomeMessage}
                                                placeholder={isES
                                                    ? 'ej. ## ¡Bienvenido!\nGracias por participar en esta encuesta...'
                                                    : 'e.g. ## Welcome!\nThank you for participating...'}
                                                hint={isES ? 'Soporta formato Markdown' : 'Supports Markdown formatting'}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="screen-section-divider">
                                    <div className="screen-section-divider-line" />
                                    <span className="screen-section-divider-label">
                                        {isES ? 'Preguntas' : 'Questions'}
                                    </span>
                                    <div className="screen-section-divider-line" />
                                </div>

                                <label className="input-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                    {t('create.questionsLabel')}
                                </label>
                                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                                    {t('create.questionsHint')}
                                </p>

                                {/* Empty state */}
                                {formData.items.filter(i => i._kind === 'question').length === 0 && (
                                    <div style={{
                                        padding: '2rem 1rem', textAlign: 'center', marginBottom: '1rem',
                                        border: '1px dashed var(--border)', background: 'var(--bg-secondary)',
                                    }}>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
                                            {isES ? 'Comienza agregando preguntas.' : 'Start by adding questions.'}
                                        </p>
                                    </div>
                                )}

                                {/* Items list (questions + text blocks) */}
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={formData.items.map(i => i._dndId)} strategy={verticalListSortingStrategy}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                                    {formData.items.map((item, idx) => (
                                        <SortableQuestionRow key={item._dndId} id={item._dndId}>
                                        {item._kind === 'text_block' ? (
                                            <div style={{
                                                display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                                                padding: '0.75rem 1rem 0.75rem 2.25rem', border: '1px dashed var(--border)',
                                                background: 'var(--bg-secondary)',
                                            }}>
                                                <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: '0.1rem' }}>📝</span>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{
                                                        margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)',
                                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                    }}>
                                                        {item.content
                                                            ? item.content.substring(0, 80) + (item.content.length > 80 ? '…' : '')
                                                            : <em style={{ color: 'var(--text-muted)' }}>{isES ? 'Texto vacío' : 'Empty text'}</em>}
                                                    </p>
                                                    <p style={{ margin: '0.15rem 0 0', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                                        {isES ? 'Bloque de texto · Markdown' : 'Text block · Markdown'}
                                                    </p>
                                                </div>
                                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                                    <button type="button"
                                                        onClick={e => { e.stopPropagation(); setOpenMenuIdx(openMenuIdx === idx ? null : idx); }}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0.4rem', color: 'var(--text-secondary)', fontSize: '1.1rem', letterSpacing: '0.05em', lineHeight: 1, borderRadius: '4px' }}
                                                        title={isES ? 'Opciones' : 'Options'}
                                                    >···</button>
                                                    {openMenuIdx === idx && (
                                                        <div style={{ position: 'absolute', right: 0, top: '100%', zIndex: 20, background: '#fff', border: '1px solid var(--border)', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', minWidth: '130px' }}>
                                                            <button type="button" onClick={() => openEditModal(idx)}
                                                                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.6rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)', fontFamily: 'inherit' }}>
                                                                ✏️ {isES ? 'Editar' : 'Edit'}
                                                            </button>
                                                            <button type="button" onClick={() => { removeQuestion(idx); setOpenMenuIdx(null); }}
                                                                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.6rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--error)', fontFamily: 'inherit' }}>
                                                                🗑 {isES ? 'Eliminar' : 'Delete'}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                                            padding: '0.75rem 1rem 0.75rem 2.25rem', border: '1px solid var(--border)',
                                            background: 'var(--bg-white)',
                                        }}>
                                            {/* Number (only counts questions) */}
                                            <span style={{
                                                width: '24px', height: '24px', flexShrink: 0,
                                                background: 'var(--primary-light)', color: 'var(--primary)',
                                                borderRadius: '50%', display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700',
                                            }}>
                                                {formData.items.slice(0, idx + 1).filter(i => i._kind === 'question').length}
                                            </span>

                                            {/* Question info */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{
                                                    margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)',
                                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                }}>
                                                    {item.text || <em style={{ color: 'var(--text-muted)' }}>{isES ? 'Sin texto' : 'No text'}</em>}
                                                </p>
                                                <p style={{ margin: '0.15rem 0 0', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                                    {TYPE_ICONS[item.type]} {t(`create.questionType${item.type.charAt(0).toUpperCase() + item.type.slice(1)}`)}
                                                    {item.type === 'multiple' && item.options.filter(Boolean).length > 0 && (
                                                        <span> · {item.options.filter(Boolean).length} {isES ? 'opciones' : 'options'}</span>
                                                    )}
                                                    <span style={{ color: 'var(--border)', margin: '0 0.3rem' }}>·</span>
                                                    {item.optional ? t('create.questionOptional') : t('create.questionRequired')}
                                                </p>
                                            </div>

                                            {/* Three-dot menu */}
                                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                                <button
                                                    type="button"
                                                    onClick={e => { e.stopPropagation(); setOpenMenuIdx(openMenuIdx === idx ? null : idx); }}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0.4rem', color: 'var(--text-secondary)', fontSize: '1.1rem', letterSpacing: '0.05em', lineHeight: 1, borderRadius: '4px' }}
                                                    title={isES ? 'Opciones' : 'Options'}
                                                >···</button>
                                                {openMenuIdx === idx && (
                                                    <div style={{ position: 'absolute', right: 0, top: '100%', zIndex: 20, background: '#fff', border: '1px solid var(--border)', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', minWidth: '130px' }}>
                                                        <button type="button" onClick={() => openEditModal(idx)}
                                                            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.6rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)', fontFamily: 'inherit' }}>
                                                            ✏️ {isES ? 'Editar' : 'Edit'}
                                                        </button>
                                                        {formData.items.filter(i => i._kind === 'question').length > 1 && (
                                                            <button type="button"
                                                                onClick={() => { removeQuestion(idx); setOpenMenuIdx(null); }}
                                                                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.6rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--error)', fontFamily: 'inherit' }}>
                                                                🗑 {isES ? 'Eliminar' : 'Delete'}
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

                                {/* Add question / Add text block */}
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button type="button" onClick={openAddModal}
                                        className="btn btn-outline"
                                        style={{ flex: 1, borderStyle: 'dashed' }}>
                                        {t('create.addQuestion')}
                                    </button>
                                    <button type="button" onClick={openAddTextBlock}
                                        className="btn btn-outline"
                                        style={{ flex: 1, borderStyle: 'dashed' }}
                                        title={isES ? 'Agrega un bloque de texto o separador entre preguntas' : 'Add a text block or separator between questions'}>
                                        📝 {isES ? 'Agregar texto' : 'Add text'}
                                    </button>
                                </div>

                                <div className="screen-section-divider" style={{ marginTop: '1.5rem' }}>
                                    <div className="screen-section-divider-line" />
                                    <span className="screen-section-divider-label">
                                        {isES ? 'Pantalla final' : 'End screen'}
                                    </span>
                                    <div className="screen-section-divider-line" />
                                </div>

                                {/* ── Completion screen section ── */}
                                <div className="screen-section">
                                    <div className="screen-section-header">
                                        <div>
                                            <span className="screen-section-badge">
                                                {isES ? 'Opcional' : 'Optional'}
                                            </span>
                                            <span className="screen-section-title">
                                                {isES ? 'Pantalla de gracias' : 'Thank you screen'}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            className={`screen-section-toggle ${showCompletionEditor ? 'is-active' : ''}`}
                                            onClick={() => {
                                                if (showCompletionEditor) setCompletionMessage('');
                                                setShowCompletionEditor(v => !v);
                                            }}
                                        >
                                            {showCompletionEditor
                                                ? (isES ? '✕ Quitar' : '✕ Remove')
                                                : (isES ? '+ Agregar' : '+ Add')}
                                        </button>
                                    </div>
                                    {!showCompletionEditor && (
                                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.4rem 0 0' }}>
                                            {isES
                                                ? 'Si no agregas una pantalla personalizada, se mostrará el mensaje de gracias estándar de Pooly.'
                                                : "If you don't add a custom screen, Pooly's standard thank you message will be shown."}
                                        </p>
                                    )}
                                    {showCompletionEditor && (
                                        <div style={{ marginTop: '0.75rem' }}>
                                            <MarkdownEditor
                                                value={completionMessage}
                                                onChange={setCompletionMessage}
                                                placeholder={isES
                                                    ? 'ej. **¡Gracias por participar!**`'
                                                    : 'e.g. **Thanks for participating!** '}
                                                hint={isES ? 'Soporta formato Markdown' : 'Supports Markdown formatting'}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Nav */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                                    <button type="button" onClick={() => setStep(1)} className="btn btn-secondary">
                                        {t('create.prev')}
                                    </button>
                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                        <button
                                            type="button"
                                            className="btn btn-outline"
                                            onClick={() => {
                                                sessionStorage.setItem('survey_preview', JSON.stringify({
                                                    ...formData,
                                                    welcome_message: welcomeMessage,
                                                    completion_message: completionMessage,
                                                }));
                                                window.open('/admin/preview', '_blank');
                                            }}
                                            disabled={formData.items.filter(i => i._kind === 'question').length === 0}
                                        >
                                            {t('create.preview')}
                                        </button>
                                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                            {isLoading ? t('create.submitting') : t('create.submit')}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* ── Right: tips ── */}
                <div className="create-event-tips">
                    {step === 1 ? (
                        // Static tips for step 1
                        <div className="tips-panel">
                            <div className="tips-header">
                                <span className="tips-header-icon">{step1Tips.icon}</span>
                                <h3 className="tips-title">{step1Tips.title}</h3>
                            </div>
                            <div className="tips-list">
                                {step1Tips.tips.map((tip, i) => (
                                    <div key={i} className="tip-item">
                                        <span className="tip-icon">{tip.icon}</span>
                                        <div>
                                            <h4 className="tip-title">{tip.title}</h4>
                                            <p className="tip-description">{tip.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="tips-highlight">
                                <span className="tips-highlight-icon">{step1Tips.highlight.icon}</span>
                                <p>{step1Tips.highlight.text}</p>
                            </div>
                        </div>
                    ) : (
                        // Carousel for step 2
                        <div className="tips-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                            {/* Slide content */}
                            <div key={carouselIdx} className="carousel-slide" style={{ flex: 1 }}>
                                <div className="tips-header">
                                    <span className="tips-header-icon">{slides[carouselIdx].icon}</span>
                                    <h3 className="tips-title">{slides[carouselIdx].title}</h3>
                                </div>

                                {/* Slide 0 — writing tips */}
                                {carouselIdx === 0 && (
                                    <div className="tips-list">
                                        {[
                                            { icon: '🎯', title: t('tips.step2.tip1.title'), description: t('tips.step2.tip1.desc') },
                                            { icon: '🚫', title: t('tips.step2.tip2.title'), description: t('tips.step2.tip2.desc') },
                                            { icon: '📊', title: t('tips.step2.tip3.title'), description: t('tips.step2.tip3.desc') },
                                        ].map((tip, i) => (
                                            <div key={i} className="tip-item">
                                                <span className="tip-icon">{tip.icon}</span>
                                                <div>
                                                    <h4 className="tip-title">{tip.title}</h4>
                                                    <p className="tip-description">{tip.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Slide 1 — response types */}
                                {carouselIdx === 1 && (
                                    <div style={{ marginTop: '0.5rem' }}>
                                        {[
                                            { icon: '💬', label: t('create.questionTypeOpen'),    desc: isES ? 'Opiniones libres → análisis de temas y sentimiento'  : 'Free opinions → topic & sentiment analysis' },
                                            { icon: '☑️', label: t('create.questionTypeMultiple'), desc: isES ? 'Categorías o escalas → distribución de respuestas'       : 'Fixed categories or scales → distribution' },
                                            { icon: '🔢', label: t('create.questionTypeNumeric'),  desc: isES ? 'Edades, puntajes → estadísticas y promedios'             : 'Ages, scores → statistics & averages' },
                                            { icon: '📅', label: t('create.questionTypeDate'),     desc: isES ? 'Eventos y plazos → análisis de tendencias'              : 'Events & deadlines → trend analysis' },
                                        ].map(({ icon, label, desc }) => (
                                            <div key={label} style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.85rem', alignItems: 'flex-start' }}>
                                                <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: '0.05rem' }}>{icon}</span>
                                                <div>
                                                    <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>{label}</span>
                                                    <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'block', lineHeight: 1.4 }}>{desc}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Slide 2 — AI highlight */}
                                {carouselIdx === 2 && (
                                    <div className="tips-highlight" style={{ marginTop: '0.5rem' }}>
                                        <span className="tips-highlight-icon">🤖</span>
                                        <p>{t('tips.step2.highlight')}</p>
                                    </div>
                                )}
                            </div>

                            {/* Dot indicators */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '1.5rem' }}>
                                {slides.map((_, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setCarouselIdx(i)}
                                        style={{
                                            width: i === carouselIdx ? '20px' : '8px',
                                            height: '8px', borderRadius: '4px', padding: 0, border: 'none',
                                            background: i === carouselIdx ? 'var(--primary)' : 'var(--border)',
                                            cursor: 'pointer', transition: 'all 0.3s',
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Question / Text block modal ── */}
            <Modal
                isOpen={showQuestionModal}
                onClose={() => setShowQuestionModal(false)}
                title={modalData._kind === 'text_block'
                    ? (editingIndex === null ? (isES ? 'Nuevo bloque de texto' : 'New text block') : (isES ? 'Editar texto' : 'Edit text'))
                    : (editingIndex === null ? (isES ? 'Nueva pregunta' : 'New question') : (isES ? 'Editar pregunta' : 'Edit question'))
                }
                footer={
                    <div className="modal-actions">
                        <button className="btn btn-secondary" onClick={() => setShowQuestionModal(false)}>
                            {isES ? 'Cancelar' : 'Cancel'}
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleModalSave}
                            disabled={modalData._kind === 'text_block' ? !modalData.content?.trim() : (!!titleError || !!optionsError)}
                        >
                            {isES ? 'Guardar' : 'Save'}
                        </button>
                    </div>
                }
            >
                {/* Text block editor */}
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
                {/* Question text */}
                <div className="input-group">
                    <label className="input-label">{isES ? 'Pregunta' : 'Question'}</label>
                    <textarea
                        className="input-field"
                        rows="3"
                        value={modalData.text}
                        onChange={e => setModalData(prev => ({ ...prev, text: e.target.value }))}
                        placeholder={isES ? 'ej. ¿Qué opinas sobre...?' : 'e.g. What do you think about...?'}
                        style={{ margin: 0, borderColor: titleError ? 'var(--error)' : undefined }}
                        autoFocus
                    />
                    {titleError && (
                        <p style={{ margin: '0.4rem 0 0', fontSize: '0.8rem', color: 'var(--error)', fontWeight: 500 }}>
                            {titleError}
                        </p>
                    )}
                </div>

                {/* Type select */}
                <div className="input-group">
                    <label className="input-label">{isES ? 'Tipo de respuesta' : 'Response type'}</label>
                    <select
                        className="input-field"
                        value={modalData.type}
                        onChange={e => setModalData(prev => ({ ...prev, type: e.target.value }))}
                        style={{ margin: 0 }}
                    >
                        <option value="open">{TYPE_ICONS.open} {t('create.questionTypeOpen')}</option>
                        <option value="multiple">{TYPE_ICONS.multiple} {t('create.questionTypeMultiple')}</option>
                        <option value="numeric">{TYPE_ICONS.numeric} {t('create.questionTypeNumeric')}</option>
                        <option value="date">{TYPE_ICONS.date} {t('create.questionTypeDate')}</option>
                    </select>
                    {/* Inline description */}
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: 1.5 }}>
                        {typeDescriptions[modalData.type]}
                    </p>
                </div>

                {/* Multiple choice options */}
                {modalData.type === 'multiple' && (
                    <div className="input-group">
                        <label className="input-label">{isES ? 'Opciones' : 'Options'}</label>
                        <div style={{
                            display: 'flex', flexDirection: 'column', gap: '0.4rem',
                            padding: '0.75rem', background: 'var(--bg-secondary)',
                            border: '1px solid var(--border)',
                        }}>
                            {modalData.options.map((opt, oIdx) => (
                                <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <span style={{
                                        width: '16px', height: '16px', flexShrink: 0,
                                        border: '2px solid var(--border)',
                                        borderRadius: modalData.multiSelect ? '3px' : '50%',
                                    }} />
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={opt}
                                        onChange={e => handleModalOptionChange(oIdx, e.target.value)}
                                        placeholder={t('create.optionPlaceholder', { num: oIdx + 1 })}
                                        style={{ margin: 0, padding: '0.3rem 0.6rem', fontSize: '0.875rem' }}
                                    />
                                    <button type="button"
                                        onClick={() => removeModalOption(oIdx)}
                                        disabled={modalData.options.length <= 2}
                                        style={{
                                            background: 'none', border: 'none', flexShrink: 0,
                                            cursor: modalData.options.length <= 2 ? 'default' : 'pointer',
                                            color: modalData.options.length <= 2 ? 'var(--border)' : 'var(--text-secondary)',
                                            fontSize: '1rem', fontWeight: '600', padding: '0.2rem', lineHeight: 1,
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={addModalOption}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'var(--primary)', fontSize: '0.8rem',
                                    fontWeight: '600', textAlign: 'left', padding: '0.2rem 0', marginTop: '0.1rem',
                                }}>
                                {t('create.addOption')}
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
                            <p style={{ margin: '0.5rem 0 0', fontSize: '0.78rem', color: 'var(--warning, #b45309)', lineHeight: 1.5 }}>
                                {isES
                                    ? '⚠ Evita usar signos de puntuacion en las opciones tales como comas, guiones o barras'
                                    : '⚠ Avoid commas in option text — commas are used internally to separate selected answers.'}
                            </p>
                        )}
                        {optionsError && (
                            <p style={{ margin: '0.4rem 0 0', fontSize: '0.8rem', color: 'var(--error)', fontWeight: 500 }}>
                                {optionsError}
                            </p>
                        )}
                    </div>
                )}

                {/* Required toggle — ON = required, OFF = optional */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                        type="button"
                        onClick={() => setModalData(prev => ({ ...prev, optional: !prev.optional }))}
                        style={{
                            width: '40px', height: '22px', borderRadius: '11px', position: 'relative',
                            background: !modalData.optional ? 'var(--primary)' : 'var(--border)',
                            border: 'none', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
                        }}
                    >
                        <span style={{
                            position: 'absolute', top: '2px',
                            left: !modalData.optional ? '20px' : '2px',
                            width: '18px', height: '18px', borderRadius: '50%',
                            background: '#fff', transition: 'left 0.2s',
                        }} />
                    </button>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {t('create.questionRequired')}
                    </span>
                </div>
                </>
                )}
            </Modal>
        </div>
    );
};

export default CreateEvent;
