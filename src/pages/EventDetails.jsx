import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import { jsPDF } from 'jspdf';
import api from '../services/api';
import Modal from '../components/Modal';
import { useLanguage } from '../context/LanguageContext';

const MultiLineTick = ({ x, y, payload }) => {
  const maxChars = 22;
  const words = payload.value.split(' ');
  const lines = [];
  let current = '';
  words.forEach(word => {
    const test = current ? `${current} ${word}` : word;
    if (test.length > maxChars && current) { lines.push(current); current = word; }
    else current = test;
  });
  if (current) lines.push(current);
  const lineH = 14;
  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line, i) => (
        <text
          key={i}
          x={-4}
          y={(i - (lines.length - 1) / 2) * lineH}
          textAnchor="end"
          dominantBaseline="central"
          fontSize={11}
          fill="#374151"
        >
          {line}
        </text>
      ))}
    </g>
  );
};

export default function EventDetails() {
  const { eventId } = useParams();
  const { t, locale } = useLanguage();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState('');
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  // Modal state
  const [showAnalyzeModal, setShowAnalyzeModal] = useState(false);

  // Tabs state
  const [activeTab, setActiveTab] = useState('responses');

  // Edit questions state
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestions, setEditedQuestions] = useState([]);
  const [newQuestions, setNewQuestions] = useState(['']);
  const [saveStatus, setSaveStatus] = useState(''); // 'success' | 'error' | ''
  const [saving, setSaving] = useState(false);

  // Reports state
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState('');
  const [selectedTimestamp, setSelectedTimestamp] = useState(null);

  const [isExporting, setIsExporting] = useState(false);

  // Jobs state
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState('');

  const getEventSource = (currentEvent) => {
    const rawSource = currentEvent?.source_type || currentEvent?.source || currentEvent?.origin;
    if (rawSource === 'imported' || rawSource === 'import') return 'imported';
    return 'online';
  };

  const shareUrl = event?.public_id
    ? `${window.location.origin}/encuesta/${event.public_id}`
    : '';

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await api.get(`/events/${eventId}/details`);
        setEvent(response.data.data);
      } catch (err) {
        console.error('Failed to fetch event details:', err);
        setError(t('eventDetails.errorLoad'));
        setEvent({
          id: eventId,
          public_id: 'demo-abc123',
          name: 'Movilidad Urbana 2026',
          description: '¿Qué opinas sobre las nuevas ciclovías en el centro de la ciudad?',
          end: '2026-12-31',
          questions: [
            {
              id: 101,
              text: '¿Cuál es tu principal medio de transporte?',
              responses: [
                { id: 1001, text: 'Uso el metro todos los días.' },
                { id: 1002, text: 'Principalmente bicicleta, pero me siento inseguro.' }
              ]
            },
            {
              id: 102,
              text: '¿Estás satisfecho con las ciclovías actuales?',
              responses: [
                { id: 2001, text: 'No, son demasiado angostas.' }
              ]
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchEventDetails();
  }, [eventId]);

  // Fetch reports
  const fetchReports = async () => {
    setReportsLoading(true);
    setReportsError('');
    try {
      const response = await api.get(`/events/${eventId}/reports`);
      if (response.data.status === 'success') {
        const data = response.data.reports || [];
        setReports(data);
        if (data.length > 0) {
          const tsList = [...new Set(data.map(r => r.timestamp))].sort((a, b) => new Date(b) - new Date(a));
          setSelectedTimestamp(tsList[0]);
        }
      } else {
        setReports([]);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      setReportsError(t('reports.error'));
      const demoTs = '2026-01-29T10:30:00';
      setReports([
        {
          id: 1, event_id: eventId, category: 'Transporte público',
          volume: 45, percentage: 35.5, urgency: 0.8, sentiment: -0.2,
          summary: 'Los ciudadanos expresan preocupación por la frecuencia del transporte público y la saturación en horas pico.',
          examples: ['Necesitamos más autobuses', 'El metro siempre está lleno'],
          timestamp: demoTs
        },
        {
          id: 2, event_id: eventId, category: 'Ciclovías',
          volume: 30, percentage: 23.6, urgency: 0.6, sentiment: 0.4,
          summary: 'Solicitudes de expansión de la red de ciclovías con enfoque en seguridad y conectividad.',
          examples: ['Más carriles para bicicletas', 'Conectar el centro con los barrios'],
          timestamp: demoTs
        },
        {
          id: 3, event_id: eventId, category: 'Estacionamiento',
          volume: 20, percentage: 15.7, urgency: 0.4, sentiment: -0.5,
          summary: 'Quejas sobre la falta de estacionamiento en zonas comerciales y costos elevados.',
          examples: ['No hay donde estacionarse', 'Los parquímetros son muy caros'],
          timestamp: demoTs
        }
      ]);
      setSelectedTimestamp(demoTs);
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    if ((activeTab === 'reports' || activeTab === 'charts') && reports.length === 0 && !reportsLoading) {
      fetchReports();
    }
  }, [activeTab]);

  // Fetch jobs
  const fetchJobs = async () => {
    setJobsLoading(true);
    setJobsError('');
    try {
      const response = await api.get(`/jobs/event/${eventId}`);
      if (response.data.status === 'success') {
        setJobs(response.data.jobs || []);
      } else {
        setJobs([]);
        setJobsError(t('jobs.error'));
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setJobsError(t('jobs.error'));
      setJobs([
        { status: 'COMPLETED', started_at: 'Thu, 29 Jan 2026 10:00:00 GMT', finished_at: 'Thu, 29 Jan 2026 10:05:32 GMT', error_message: null },
        { status: 'RUNNING',   started_at: 'Fri, 30 Jan 2026 09:15:00 GMT', finished_at: null, error_message: null },
        { status: 'ERROR',     started_at: 'Tue, 28 Jan 2026 14:30:00 GMT', finished_at: 'Tue, 28 Jan 2026 14:31:15 GMT', error_message: 'No hay suficientes respuestas para analizar' }
      ]);
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'status' && jobs.length === 0 && !jobsLoading) {
      fetchJobs();
    }
  }, [activeTab]);

  const getJobStatusInfo = (status) => {
    switch (status) {
      case 'COMPLETED': return { label: t('jobs.statusCompleted'), class: 'completed', icon: '✓' };
      case 'RUNNING':   return { label: t('jobs.statusRunning'),   class: 'running',   icon: '⟳' };
      case 'ERROR':     return { label: t('jobs.statusError'),     class: 'error',     icon: '✕' };
      default:          return { label: status,                    class: 'unknown',   icon: '?' };
    }
  };

  const handleAnalyzeClick = () => setShowAnalyzeModal(true);

  const handleAnalyzeConfirm = async () => {
    setShowAnalyzeModal(false);
    setAnalyzing(true);
    setAnalysisStatus('');
    try {
      await api.post(`/events/${eventId}/analyze`);
      setAnalysisStatus(t('analyzeModal.statusSuccess'));
    } catch (err) {
      setAnalysisStatus(t('analyzeModal.statusError'));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleEditClick = () => {
    setEditedQuestions((event.questions || []).map(q => ({ id: q.id, text: q.text })));
    setNewQuestions(['']);
    setSaveStatus('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSaveStatus('');
  };

  const handleQuestionChange = (index, value) => {
    setEditedQuestions(prev => prev.map((q, i) => i === index ? { ...q, text: value } : q));
  };

  const handleNewQuestionChange = (index, value) => {
    setNewQuestions(prev => prev.map((q, i) => i === index ? value : q));
  };

  const handleAddNewQuestion = () => {
    setNewQuestions(prev => [...prev, '']);
  };

  const handleSaveQuestions = async () => {
    setSaving(true);
    setSaveStatus('');
    try {
      const questions = [
        ...editedQuestions,
        ...newQuestions.filter(q => q.trim() !== '').map(text => ({ text })),
      ];
      await api.patch(`/events/${eventId}/questions`, { questions });
      setSaveStatus('success');
      setIsEditing(false);
      try {
        const response = await api.get(`/events/${eventId}/details`);
        setEvent(response.data.data);
      } catch (_) { /* keep current event data on refetch failure */ }
    } catch (err) {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const getSentimentLabel = (sentiment) => {
    if (sentiment >= 0.3)  return { text: t('sentiment.positive'), class: 'positive' };
    if (sentiment <= -0.3) return { text: t('sentiment.negative'), class: 'negative' };
    return { text: t('sentiment.neutral'), class: 'neutral' };
  };

  const getUrgencyLabel = (urgency) => {
    if (urgency >= 0.7) return { text: t('urgency.high'),    class: 'high' };
    if (urgency >= 0.4) return { text: t('urgency.medium'),  class: 'medium' };
    return             { text: t('urgency.low'),    class: 'low' };
  };

  const runTimestamps = [...new Set(reports.map(r => r.timestamp))].sort((a, b) => new Date(b) - new Date(a));
  const selectedReports = selectedTimestamp
    ? reports.filter(r => r.timestamp === selectedTimestamp)
    : (runTimestamps.length > 0 ? reports.filter(r => r.timestamp === runTimestamps[0]) : []);

  const exportToPDF = async () => {
    if (!selectedReports.length || isExporting) return;
    setIsExporting(true);

    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = 210;
      const mg = 20;
      const cW = pageW - mg * 2;
      let y = 0;

      const isES = locale === 'es-MX';
      const labels = {
        generatedOn: isES ? 'Descarga:' : 'Downloaded:',
        analyzedOn:  isES ? 'Análisis:' : 'Analysis:',
        aiSubtitle: isES
          ? 'Análisis de Insights generado con Inteligencia Artificial · Pooly'
          : 'AI-Generated Insights Report · Pooly',
        categories: isES ? 'CATEGORÍAS IDENTIFICADAS' : 'IDENTIFIED CATEGORIES',
        mentions: isES ? 'MENCIONES ANALIZADAS' : 'MENTIONS ANALYZED',
        barSection: isES ? 'TOP PROBLEMAS DETECTADOS' : 'TOP DETECTED ISSUES',
        pieSection: isES ? 'DISTRIBUCIÓN DEL SENTIMIENTO' : 'SENTIMENT DISTRIBUTION',
        detailSection: isES ? 'DETALLE DE CATEGORÍAS' : 'CATEGORY DETAILS',
        mentionsLabel: isES ? 'menciones' : 'mentions',
        ofTotal: isES ? '% del total' : '% of total',
        sentimentLabel: isES ? 'Sentimiento' : 'Sentiment',
        urgencyLabel: isES ? 'Urgencia' : 'Urgency',
        sentPositive: isES ? 'Positivo' : 'Positive',
        sentNegative: isES ? 'Negativo' : 'Negative',
        sentNeutral: 'Neutral',
        urgHigh: isES ? 'Alta' : 'High',
        urgMed: isES ? 'Media' : 'Medium',
        urgLow: isES ? 'Baja' : 'Low',
        footer: isES
          ? 'Generado por Pooly · Análisis de retroalimentación impulsado por IA'
          : 'Generated by Pooly · AI-powered feedback analysis',
        page: isES ? 'Pág.' : 'Page',
      };

      const C = {
        primary:   [99, 102, 241],
        light:     [238, 239, 253],
        textMain:  [17, 24, 39],
        textGrey:  [107, 114, 128],
        border:    [229, 231, 235],
        bgLight:   [249, 250, 251],
        green:     [16, 185, 129],
        red:       [239, 68, 68],
        barShades: [
          [99, 102, 241],
          [129, 140, 248],
          [165, 180, 252],
          [199, 210, 254],
          [224, 231, 255],
        ],
      };

      const fill  = (c) => doc.setFillColor(...c);
      const draw  = (c) => doc.setDrawColor(...c);
      const txt   = (c) => doc.setTextColor(...c);
      const checkPage = (needed = 20) => {
        if (y + needed > 280) { doc.addPage(); y = mg; }
      };

      // ── Header band ──────────────────────────────────────────────
      fill(C.primary);
      doc.rect(0, 0, pageW, 14, 'F');
      txt([255, 255, 255]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('POOLY', mg, 9.5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      const analysisDateStr = selectedTimestamp
        ? new Date(selectedTimestamp).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })
        : '—';
      const downloadDateStr = new Date().toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
      doc.text(`${labels.analyzedOn} ${analysisDateStr}`, pageW - mg, 7, { align: 'right' });
      doc.text(`${labels.generatedOn} ${downloadDateStr}`, pageW - mg, 12, { align: 'right' });

      y = 22;

      // ── Event title ───────────────────────────────────────────────
      txt(C.textMain);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.text(event.name, mg, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      txt(C.textGrey);
      doc.text(labels.aiSubtitle, mg, y);
      y += 8;

      draw(C.border);
      doc.setLineWidth(0.3);
      doc.line(mg, y, pageW - mg, y);
      y += 7;

      // ── Summary chips ─────────────────────────────────────────────
      const totalVol = selectedReports.reduce((s, r) => s + r.volume, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      txt(C.textGrey);
      doc.text(`${selectedReports.length}  ${labels.categories}   ·   ${totalVol}  ${labels.mentions}`, mg, y);
      y += 10;

      // ── Bar chart section ─────────────────────────────────────────
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      txt(C.primary);
      doc.text(labels.barSection, mg, y);
      y += 6;

      const labelColW = 62;
      const pctColW   = 22;
      const barAreaW  = cW - labelColW - pctColW;
      const barH      = 5;

      selectedReports.forEach((r, i) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        const catLines = doc.splitTextToSize(r.category, labelColW - 2);
        const lineH = 4.2;
        const rowH = Math.max(barH + 4, catLines.length * lineH + 2);
        checkPage(rowH + 4);

        const barW = (r.percentage / 100) * barAreaW;
        const barY = y + (rowH - barH) / 2;

        // category label (multi-line)
        txt(C.textMain);
        doc.text(catLines, mg, y + lineH);

        // bar background
        fill(C.border);
        doc.rect(mg + labelColW, barY, barAreaW, barH, 'F');

        // bar fill
        fill(C.barShades[i % C.barShades.length]);
        if (barW > 0) doc.rect(mg + labelColW, barY, barW, barH, 'F');

        // percentage + volume
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        txt(C.textMain);
        doc.text(`${r.percentage.toFixed(1)}%`, mg + labelColW + barAreaW + 2, barY + 3.5);
        doc.setFont('helvetica', 'normal');
        txt(C.textGrey);
        doc.setFontSize(7);
        doc.text(`(${r.volume} ${labels.mentionsLabel})`, mg + labelColW + barAreaW + 2, barY + 7.5);

        y += rowH + 4;
      });

      y += 4;

      // ── Sentiment section ─────────────────────────────────────────
      checkPage(30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      txt(C.primary);
      doc.text(labels.pieSection, mg, y);
      y += 6;

      let pos = 0, neg = 0, neu = 0;
      selectedReports.forEach(r => {
        if (r.sentiment >= 0.3)       pos += r.volume;
        else if (r.sentiment <= -0.3) neg += r.volume;
        else                          neu += r.volume;
      });
      const sentTotal = pos + neg + neu;
      const sentData = [
        { label: labels.sentPositive, value: pos, color: C.green },
        { label: sentTotal > 0 ? labels.sentNeutral : null, value: neu, color: C.primary },
        { label: labels.sentNegative, value: neg, color: C.red },
      ].filter(s => s.value > 0);

      // Stacked bar
      const stackH = 8;
      let sx = mg;
      sentData.forEach(s => {
        const w = sentTotal > 0 ? (s.value / sentTotal) * cW : 0;
        fill(s.color);
        if (w > 0) doc.rect(sx, y, w, stackH, 'F');
        sx += w;
      });
      y += stackH + 5;

      // Legend
      sentData.forEach((s, i) => {
        const lx = mg + i * 60;
        fill(s.color);
        doc.rect(lx, y - 3, 4, 4, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        txt(C.textMain);
        const pct = sentTotal > 0 ? ((s.value / sentTotal) * 100).toFixed(0) : 0;
        doc.text(`${s.label}  ${pct}%  (${s.value} ${labels.mentionsLabel})`, lx + 6, y);
      });
      y += 10;

      draw(C.border);
      doc.line(mg, y, pageW - mg, y);
      y += 8;

      // ── Category detail ───────────────────────────────────────────
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      txt(C.primary);
      doc.text(labels.detailSection, mg, y);
      y += 8;

      selectedReports.forEach((r, i) => {
        checkPage(25);

        // Category header
        fill(C.light);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        const hLines = doc.splitTextToSize(`${i + 1}. ${r.category}`, cW - 4);
        const hBoxH = hLines.length * 5 + 3;
        fill(C.light);
        doc.rect(mg, y - 2, cW, hBoxH, 'F');
        txt(C.primary);
        doc.text(hLines, mg + 2, y + 2);
        y += hBoxH + 2;

        // Metrics
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        txt(C.textGrey);
        const sentLbl = r.sentiment >= 0.3 ? labels.sentPositive : r.sentiment <= -0.3 ? labels.sentNegative : labels.sentNeutral;
        const urgLbl  = r.urgency >= 7 ? labels.urgHigh : r.urgency >= 4 ? labels.urgMed : labels.urgLow;
        doc.text(
          `${r.volume} ${labels.mentionsLabel}  ·  ${r.percentage.toFixed(1)}${labels.ofTotal}  ·  ${labels.sentimentLabel}: ${sentLbl}  ·  ${labels.urgencyLabel}: ${urgLbl}`,
          mg, y
        );
        y += 5;

        // Summary
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        txt(C.textMain);
        const summaryLines = doc.splitTextToSize(r.summary, cW);
        checkPage(summaryLines.length * 4 + 4);
        doc.text(summaryLines, mg, y);
        y += summaryLines.length * 4 + 2;

        // Examples (max 2)
        if (r.examples?.length > 0) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(8);
          txt(C.textGrey);
          r.examples.slice(0, 2).forEach(ex => {
            checkPage(10);
            const short = ex.length > 130 ? ex.slice(0, 128) + '…' : ex;
            const lines = doc.splitTextToSize(`"${short}"`, cW - 4);
            doc.text(lines, mg + 2, y);
            y += lines.length * 4 + 1;
          });
        }
        y += 7;
      });

      // ── Footer on every page ──────────────────────────────────────
      const total = doc.internal.getNumberOfPages();
      for (let p = 1; p <= total; p++) {
        doc.setPage(p);
        fill(C.bgLight);
        doc.rect(0, 288, pageW, 10, 'F');
        draw(C.border);
        doc.setLineWidth(0.2);
        doc.line(0, 288, pageW, 288);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        txt(C.textGrey);
        doc.text(labels.footer, mg, 294);
        doc.text(`${labels.page} ${p} / ${total}`, pageW - mg, 294, { align: 'right' });
      }

      const filename = `${event.name.replace(/[^a-z0-9]/gi, '_').slice(0, 40)}_insights.pdf`;
      doc.save(filename);
    } finally {
      setIsExporting(false);
    }
  };

  const totalResponses = event?.questions?.reduce(
    (sum, q) => sum + (q.responses?.length || 0), 0
  ) || event?.response_count || event?.import_summary?.response_count || 0;

  const eventSource = getEventSource(event);
  const isImported = eventSource === 'imported';
  const importedSourceName = event?.source_name || event?.import_summary?.source_name;
  const importedFileName = event?.import_file_name || event?.import_summary?.file_name;
  const importedAt = event?.imported_at || event?.import_summary?.imported_at;

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '6rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>{t('eventDetails.loading')}</p>
      </div>
    );
  }

  if (!event && error) {
    return (
      <div className="container" style={{ paddingTop: '6rem' }}>
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="container" style={{ paddingTop: '5rem', paddingBottom: '4rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <Link to="/admin" className="back-link">{t('eventDetails.back')}</Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className={`survey-card-source-badge survey-card-source-${eventSource}`} style={{ marginBottom: '0.75rem' }}>
              {isImported ? t('source.imported') : t('source.online')}
            </span>
            <h1 className="page-title">{event.name}</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{event.description}</p>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {event.end && (
                <span>{t('eventDetails.endDate', { date: new Date(event.end).toLocaleDateString(locale) })}</span>
              )}
              <span>{t('eventDetails.totalResponses', { count: totalResponses })}</span>
            </div>
          </div>
          <div />
        </div>

        {analysisStatus && (
          <div className={`alert ${analysisStatus.includes('exitosamente') || analysisStatus.includes('successfully') ? 'alert-success' : 'alert-error'}`} style={{ marginTop: '1rem' }}>
            {analysisStatus}
          </div>
        )}
      </header>

      {isImported ? (
        <div className="share-card">
          <div className="share-card-header">
            <div className="share-card-icon">↑</div>
            <div>
              <h3 className="share-card-title">{t('eventDetails.importTitle')}</h3>
              <p className="share-card-subtitle">{t('eventDetails.importSubtitle')}</p>
            </div>
          </div>
          <div className="import-summary-grid">
            <div className="import-summary-item">
              <span>{t('eventDetails.importSource')}</span>
              <strong>{importedSourceName || t('eventDetails.importSourceFallback')}</strong>
            </div>
            <div className="import-summary-item">
              <span>{t('eventDetails.importFile')}</span>
              <strong>{importedFileName || t('eventDetails.importFileFallback')}</strong>
            </div>
            <div className="import-summary-item">
              <span>{t('eventDetails.importRows')}</span>
              <strong>{totalResponses}</strong>
            </div>
            <div className="import-summary-item">
              <span>{t('eventDetails.importDate')}</span>
              <strong>{importedAt ? new Date(importedAt).toLocaleDateString(locale) : t('eventDetails.importDateFallback')}</strong>
            </div>
          </div>
        </div>
      ) : (
        <div className="share-card">
          <div className="share-card-header">
            <div className="share-card-icon">🔗</div>
            <div>
              <h3 className="share-card-title">{t('eventDetails.shareTitle')}</h3>
              <p className="share-card-subtitle">{t('eventDetails.shareSubtitle')}</p>
            </div>
          </div>
          <div className="share-card-url">
            <input
              type="text"
              readOnly
              value={shareUrl || t('eventDetails.shareGenerating')}
              className="share-card-input"
            />
            <button
              onClick={handleCopyLink}
              className={`share-card-btn ${copied ? 'copied' : ''}`}
              disabled={!shareUrl}
            >
              {copied ? t('eventDetails.shareCopied') : t('eventDetails.shareCopy')}
            </button>
            <button
              onClick={() => setShowQr(true)}
              disabled={!shareUrl}
              className="share-card-btn"
              title="Ver código QR"
              style={{ background: 'var(--text-primary)', flexShrink: 0 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                <rect x="5" y="5" width="3" height="3" fill="currentColor" stroke="none" /><rect x="16" y="5" width="3" height="3" fill="currentColor" stroke="none" /><rect x="5" y="16" width="3" height="3" fill="currentColor" stroke="none" />
                <path d="M14 14h3v3" /><path d="M17 21h3v-3" /><path d="M14 21h.01" /><path d="M21 14h.01" />
              </svg>
            </button>
          </div>
          <p className="share-card-hint">{t('eventDetails.shareHint')}</p>
        </div>
      )}

      {showQr && !isImported && (
        <Modal isOpen={true} onClose={() => setShowQr(false)} title="Código QR">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', padding: '0.5rem 0' }}>
            <QRCodeSVG value={shareUrl} size={220} bgColor="#ffffff" fgColor="#111827" />
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '240px' }}>
              Escanea este código para abrir la encuesta directamente.
            </p>
          </div>
        </Modal>
      )}

      {error && event.questions && (
        <div className="alert" style={{ background: 'var(--primary-light)', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          {error} ({t('admin.errorDemo')})
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="tabs-container">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          borderBottom: '2px solid var(--border)',
          marginBottom: '1.5rem',
        }}>
        <div className="tabs-nav" style={{ borderBottom: 'none', marginBottom: 0 }}>
          <button className={`tab-btn ${activeTab === 'responses' ? 'active' : ''}`} onClick={() => setActiveTab('responses')}>
            <span className="tab-icon">💬</span>
            {t('eventDetails.tabResponses')}
          </button>
          <button className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
            <span className="tab-icon">📊</span>
            {t('eventDetails.tabReports')}
            {reports.length > 0 && <span className="tab-badge">{reports.length}</span>}
          </button>
          <button className={`tab-btn ${activeTab === 'charts' ? 'active' : ''}`} onClick={() => setActiveTab('charts')}>
            <span className="tab-icon">📈</span>
            {t('eventDetails.tabCharts')}
          </button>
          <button className={`tab-btn ${activeTab === 'status' ? 'active' : ''}`} onClick={() => setActiveTab('status')}>
            <span className="tab-icon">⚙️</span>
            {t('eventDetails.tabStatus')}
            {jobs.filter(j => j.status === 'RUNNING').length > 0 && (
              <span className="tab-badge running">{jobs.filter(j => j.status === 'RUNNING').length}</span>
            )}
          </button>
        </div>

        {/* Export button — right side of tab bar */}
        <div style={{ paddingBottom: '0.6rem', paddingLeft: '1rem' }}>
          <button
            onClick={exportToPDF}
            disabled={isExporting || reports.length === 0}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.9rem',
              fontSize: '0.825rem',
              fontWeight: '600',
              color: reports.length === 0 ? 'var(--text-muted, #9CA3AF)' : 'var(--primary, #6366F1)',
              background: 'transparent',
              border: `1.5px solid ${reports.length === 0 ? 'var(--border, #E5E7EB)' : 'var(--primary, #6366F1)'}`,
              borderRadius: '0.375rem',
              cursor: reports.length === 0 || isExporting ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { if (reports.length > 0 && !isExporting) { e.currentTarget.style.background = 'var(--primary, #6366F1)'; e.currentTarget.style.color = '#fff'; } }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = reports.length === 0 ? 'var(--text-muted, #9CA3AF)' : 'var(--primary, #6366F1)'; }}
          >
            {isExporting ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                {t('charts.exportingBtn')}
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {t('charts.exportBtn')}
              </>
            )}
          </button>
        </div>

        </div>{/* end flex wrapper */}

        <div className="tab-content">
          {/* Responses Tab */}
          {activeTab === 'responses' && (
            <section>
              {/* Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <span />
                {!isEditing ? (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      onClick={handleAnalyzeClick}
                      disabled={analyzing}
                      title={t('eventDetails.analyzeTitle')}
                      style={{
                        width: '2.25rem', height: '2.25rem', borderRadius: '50%', padding: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: 'none', cursor: analyzing ? 'not-allowed' : 'pointer',
                        background: analyzing ? '#818cf8' : 'var(--primary)',
                        transition: 'background 0.2s',
                        flexShrink: 0,
                      }}
                    >
                      {analyzing ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                          <path d="M12 2L13.5 10.5L22 12L13.5 13.5L12 22L10.5 13.5L2 12L10.5 10.5Z"/>
                          <path d="M20 2L20.5 4.5L23 5L20.5 5.5L20 8L19.5 5.5L17 5L19.5 4.5Z"/>
                        </svg>
                      )}
                    </button>
                    {!isImported && (
                      <button className="btn btn-secondary" onClick={handleEditClick}>
                        ✏️ {t('editEvent.editBtn')}
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary" onClick={handleCancelEdit} disabled={saving}>
                      {t('editEvent.cancelBtn')}
                    </button>
                    <button className="btn btn-primary" onClick={handleSaveQuestions} disabled={saving}>
                      {saving ? t('editEvent.saving') : t('editEvent.saveBtn')}
                    </button>
                  </div>
                )}
              </div>

              {/* Save status feedback */}
              {saveStatus === 'success' && (
                <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
                  {t('editEvent.saveSuccess')}
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
                  {t('editEvent.saveError')}
                </div>
              )}

              {/* Questions list — view or edit mode */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {isEditing ? (
                  <>
                    {/* Editable existing questions */}
                    {editedQuestions.map((question, index) => (
                      <div key={question.id} className="card" style={{ overflow: 'hidden', padding: 0 }}>
                        <div style={{ padding: '1rem 1.25rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: 'var(--primary)', fontWeight: '600', flexShrink: 0 }}>{index + 1}.</span>
                          <input
                            type="text"
                            className="input-field"
                            value={question.text}
                            onChange={e => handleQuestionChange(index, e.target.value)}
                            style={{ margin: 0 }}
                          />
                        </div>
                      </div>
                    ))}

                    {/* New questions section */}
                    <div className="card" style={{ padding: '1.25rem' }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        {t('editEvent.newQuestionsLabel')}
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {newQuestions.map((q, index) => (
                          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: 'var(--text-muted)', fontWeight: '600', flexShrink: 0 }}>
                              {editedQuestions.length + index + 1}.
                            </span>
                            <input
                              type="text"
                              className="input-field"
                              placeholder={t('editEvent.questionPlaceholder', { num: editedQuestions.length + index + 1 })}
                              value={q}
                              onChange={e => handleNewQuestionChange(index, e.target.value)}
                              style={{ margin: 0 }}
                            />
                          </div>
                        ))}
                      </div>
                      <button
                        className="btn btn-outline"
                        onClick={handleAddNewQuestion}
                        disabled={newQuestions[newQuestions.length - 1].trim() === ''}
                        style={{ marginTop: '1rem' }}
                      >
                        {t('editEvent.addQuestion')}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {event.questions?.map((question, index) => (
                      <div key={question.id} className="card" style={{ overflow: 'hidden', padding: 0 }}>
                        <div style={{ padding: '1rem 1.25rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                            <span style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>{index + 1}.</span>
                            {question.text}
                          </h3>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {question.responses?.length || 0} {t('eventDetails.responses')}
                          </span>
                        </div>
                        <div style={{ padding: '1rem 1.25rem' }}>
                          {question.responses?.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              {t('eventDetails.noResponses')}
                            </p>
                          ) : (
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {question.responses?.map(response => (
                                <li key={response.id} className="response-item">
                                  {response.text}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!event.questions || event.questions.length === 0) && (
                      <div className="card">
                        <p style={{ color: 'var(--text-secondary)' }}>
                          {isImported ? t('eventDetails.importNoPreview') : t('eventDetails.noResponses')}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <section>
              <div className="reports-header">
                <div>
                  <h3 className="reports-title">{t('reports.title')}</h3>
                  <p className="reports-subtitle">
                    {selectedReports.length > 0
                      ? t('reports.subtitle', { count: selectedReports.length })
                      : t('reports.subtitleEmpty')}
                  </p>
                </div>
                <button onClick={fetchReports} className="btn btn-secondary" disabled={reportsLoading}>
                  {reportsLoading ? (
                    <><span className="btn-spinner"></span>{t('reports.loading')}</>
                  ) : (
                    t('reports.refresh')
                  )}
                </button>
              </div>

              {reportsError && (
                <div className="alert" style={{ background: 'var(--primary-light)', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  {reportsError} ({t('reports.errorDemo')})
                </div>
              )}

              {reportsLoading && reports.length === 0 && (
                <div className="reports-loading">
                  <div className="reports-spinner"></div>
                  <p>{t('reports.loadingState')}</p>
                </div>
              )}

              {!reportsLoading && reports.length === 0 && (
                <div className="reports-empty">
                  <div style={{
                    width: '4rem', height: '4rem', borderRadius: 0,
                    background: 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.25rem',
                  }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                      <path d="M12 2L13.5 10.5L22 12L13.5 13.5L12 22L10.5 13.5L2 12L10.5 10.5Z"/>
                      <path d="M20 2L20.5 4.5L23 5L20.5 5.5L20 8L19.5 5.5L17 5L19.5 4.5Z"/>
                    </svg>
                  </div>
                  <h4>{t('reports.emptyTitle')}</h4>
                  <p>{t('reports.emptyDesc')}</p>
                  <button
                    onClick={handleAnalyzeClick}
                    disabled={analyzing}
                    style={{
                      marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.6rem 1.25rem', borderRadius: 0, border: 'none',
                      cursor: 'pointer', background: 'var(--primary)',
                      color: 'white', fontWeight: '600', fontSize: '0.9rem',
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
                      <path d="M12 2L13.5 10.5L22 12L13.5 13.5L12 22L10.5 13.5L2 12L10.5 10.5Z"/>
                      <path d="M20 2L20.5 4.5L23 5L20.5 5.5L20 8L19.5 5.5L17 5L19.5 4.5Z"/>
                    </svg>
                    {t('reports.analyzeBtn')}
                  </button>
                </div>
              )}

              {reports.length > 0 && (
                <>
                  {runTimestamps.length > 0 && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
                      marginBottom: '1.5rem', padding: '0.75rem 1rem',
                      background: 'var(--bg-secondary, #F9FAFB)', border: '1px solid var(--border, #E5E7EB)',
                    }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {locale === 'es-MX' ? 'Análisis:' : 'Analysis:'}
                      </span>
                      {runTimestamps.length === 1 ? (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                          {new Date(runTimestamps[0]).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      ) : (
                        <select
                          value={selectedTimestamp || ''}
                          onChange={e => setSelectedTimestamp(e.target.value)}
                          className="input-field"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem', width: 'auto', margin: 0 }}
                        >
                          {runTimestamps.map(ts => (
                            <option key={ts} value={ts}>
                              {new Date(ts).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })}
                            </option>
                          ))}
                        </select>
                      )}
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                        {runTimestamps.length} {locale === 'es-MX'
                          ? (runTimestamps.length === 1 ? 'análisis disponible' : 'análisis disponibles')
                          : (runTimestamps.length === 1 ? 'analysis available' : 'analyses available')}
                      </span>
                    </div>
                  )}
                  <div className="reports-grid">
                  {selectedReports.map(report => {
                    const sentiment = getSentimentLabel(report.sentiment);
                    const urgency = getUrgencyLabel(report.urgency);
                    return (
                      <div key={report.id} className="report-card">
                        <div className="report-card-header">
                          <h4 className="report-category">{report.category}</h4>
                          <div className="report-badges">
                            <span className={`report-badge sentiment-${sentiment.class}`}>{sentiment.text}</span>
                            <span className={`report-badge urgency-${urgency.class}`}>
                              {t('urgency.label', { level: urgency.text })}
                            </span>
                          </div>
                        </div>
                        <div className="report-stats">
                          <div className="report-stat">
                            <span className="report-stat-value">{report.volume}</span>
                            <span className="report-stat-label">{t('reports.mentions')}</span>
                          </div>
                          <div className="report-stat">
                            <span className="report-stat-value">{report.percentage.toFixed(1)}%</span>
                            <span className="report-stat-label">{t('reports.ofTotal')}</span>
                          </div>
                        </div>
                        <p className="report-summary">{report.summary}</p>
                        {report.examples && report.examples.length > 0 && (
                          <div className="report-examples">
                            <span className="report-examples-label">{t('reports.examples')}</span>
                            <ul className="report-examples-list">
                              {report.examples.map((example, idx) => (
                                <li key={idx}>"{example}"</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="report-timestamp">
                          {t('reports.generated', { date: new Date(report.timestamp).toLocaleString(locale) })}
                        </div>
                      </div>
                    );
                  })}
                  </div>
                </>
              )}
            </section>
          )}

          {/* Charts Tab */}
          {activeTab === 'charts' && (
            <section>
              <div className="reports-header">
                <div>
                  <h3 className="reports-title">{t('charts.title')}</h3>
                  <p className="reports-subtitle">
                    {selectedReports.length > 0
                      ? t('reports.subtitle', { count: selectedReports.length })
                      : t('reports.subtitleEmpty')}
                  </p>
                </div>
                <button onClick={fetchReports} className="btn btn-secondary" disabled={reportsLoading}>
                  {reportsLoading
                    ? <><span className="btn-spinner"></span>{t('reports.loading')}</>
                    : t('reports.refresh')}
                </button>
              </div>

              {reportsLoading && reports.length === 0 && (
                <div className="reports-loading">
                  <div className="reports-spinner"></div>
                  <p>{t('reports.loadingState')}</p>
                </div>
              )}

              {!reportsLoading && reports.length === 0 && (
                <div className="reports-empty">
                  <div style={{
                    width: '4rem', height: '4rem',
                    background: 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.25rem',
                  }}>
                    <span style={{ fontSize: '1.75rem' }}>📈</span>
                  </div>
                  <h4>{t('reports.emptyTitle')}</h4>
                  <p>{t('charts.noData')}</p>
                  <button
                    onClick={handleAnalyzeClick}
                    disabled={analyzing}
                    style={{
                      marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.6rem 1.25rem', borderRadius: 0, border: 'none',
                      cursor: 'pointer', background: 'var(--primary)',
                      color: 'white', fontWeight: '600', fontSize: '0.9rem',
                    }}
                  >
                    {t('reports.analyzeBtn')}
                  </button>
                </div>
              )}

              {reports.length > 0 && (() => {
                // Bar chart data
                const barData = selectedReports.map(r => ({
                  name: r.category,
                  value: parseFloat(r.percentage.toFixed(1)),
                  volume: r.volume,
                }));

                // Pie chart data — volume weighted by sentiment bucket (±0.3 threshold)
                let pos = 0, neg = 0, neu = 0;
                selectedReports.forEach(r => {
                  if (r.sentiment >= 0.3)       pos += r.volume;
                  else if (r.sentiment <= -0.3) neg += r.volume;
                  else                          neu += r.volume;
                });
                const pieData = [
                  { name: t('sentiment.positive'), value: pos, fill: '#10B981' },
                  { name: t('sentiment.negative'), value: neg, fill: '#EF4444' },
                  { name: t('sentiment.neutral'),  value: neu, fill: '#6366F1' },
                ].filter(d => d.value > 0);

                const barColors = ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF'];

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Run selector for charts */}
                    {runTimestamps.length > 0 && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
                        padding: '0.75rem 1rem',
                        background: 'var(--bg-secondary, #F9FAFB)', border: '1px solid var(--border, #E5E7EB)',
                      }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                          {locale === 'es-MX' ? 'Análisis:' : 'Analysis:'}
                        </span>
                        {runTimestamps.length === 1 ? (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                            {new Date(runTimestamps[0]).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        ) : (
                          <select
                            value={selectedTimestamp || ''}
                            onChange={e => setSelectedTimestamp(e.target.value)}
                            className="input-field"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem', width: 'auto', margin: 0 }}
                          >
                            {runTimestamps.map(ts => (
                              <option key={ts} value={ts}>
                                {new Date(ts).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })}
                              </option>
                            ))}
                          </select>
                        )}
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                          {runTimestamps.length} {locale === 'es-MX'
                            ? (runTimestamps.length === 1 ? 'análisis disponible' : 'análisis disponibles')
                            : (runTimestamps.length === 1 ? 'analysis available' : 'analyses available')}
                        </span>
                      </div>
                    )}

                    {/* Bar chart */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                        {t('charts.barTitle')}
                      </h4>
                      <ResponsiveContainer width="100%" height={barData.length * 64 + 40}>
                        <BarChart
                          data={barData}
                          layout="vertical"
                          margin={{ top: 0, right: 40, left: 8, bottom: 0 }}
                        >
                          <XAxis
                            type="number"
                            domain={[0, 100]}
                            tickFormatter={v => `${v}%`}
                            tick={{ fontSize: 12, fill: 'var(--text-secondary, #6B7280)' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            type="category"
                            dataKey="name"
                            width={190}
                            tick={<MultiLineTick />}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            formatter={(value, _name, props) => [
                              `${value}% (${props.payload.volume} ${t('reports.mentions')})`,
                              t('charts.percentage'),
                            ]}
                            contentStyle={{ borderRadius: '0.5rem', fontSize: '0.85rem' }}
                          />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={28}>
                            {barData.map((_, i) => (
                              <Cell key={i} fill={barColors[i % barColors.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Pie chart */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                        {t('charts.pieTitle')}
                      </h4>
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="45%"
                            outerRadius={100}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={true}
                          >
                            {pieData.map((entry, i) => (
                              <Cell key={i} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Legend
                            formatter={(value) => (
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-primary, #111827)' }}>{value}</span>
                            )}
                          />
                          <Tooltip
                            formatter={(value, name) => [`${value} ${t('reports.mentions')}`, name]}
                            contentStyle={{ borderRadius: '0.5rem', fontSize: '0.85rem' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                  </div>
                );
              })()}
            </section>
          )}

          {/* Status Tab */}
          {activeTab === 'status' && (
            <section>
              <div className="reports-header">
                <div>
                  <h3 className="reports-title">{t('jobs.title')}</h3>
                  <p className="reports-subtitle">
                    {jobs.length > 0 ? t('jobs.subtitle', { count: jobs.length }) : t('jobs.subtitleEmpty')}
                  </p>
                </div>
                <button onClick={fetchJobs} className="btn btn-secondary" disabled={jobsLoading}>
                  {jobsLoading ? (
                    <><span className="btn-spinner"></span>{t('reports.loading')}</>
                  ) : (
                    t('reports.refresh')
                  )}
                </button>
              </div>

              {jobsError && !jobs.length && (
                <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{jobsError}</div>
              )}

              {jobsLoading && jobs.length === 0 && (
                <div className="reports-loading">
                  <div className="reports-spinner"></div>
                  <p>{t('jobs.loading')}</p>
                </div>
              )}

              {!jobsLoading && jobs.length === 0 && !jobsError && (
                <div className="reports-empty">
                  <div className="reports-empty-icon">⚙️</div>
                  <h4>{t('jobs.emptyTitle')}</h4>
                  <p>{t('jobs.emptyDesc')}</p>
                </div>
              )}

              {jobs.length > 0 && (
                <div className="jobs-table-container">
                  <table className="jobs-table">
                    <thead>
                      <tr>
                        <th>{t('jobs.colId')}</th>
                        <th>{t('jobs.colStatus')}</th>
                        <th>{t('jobs.colMessage')}</th>
                        <th>{t('jobs.colStarted')}</th>
                        <th>{t('jobs.colUpdated')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((job, idx) => {
                        const statusInfo = getJobStatusInfo(job.status);
                        return (
                          <tr key={idx}>
                            <td className="jobs-table-id">#{idx + 1}</td>
                            <td>
                              <span className={`job-status job-status-${statusInfo.class}`}>
                                <span className="job-status-icon">{statusInfo.icon}</span>
                                {statusInfo.label}
                              </span>
                            </td>
                            <td className="jobs-table-message">{job.error_message || '—'}</td>
                            <td className="jobs-table-date">
                              {job.started_at ? new Date(job.started_at).toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                            </td>
                            <td className="jobs-table-date">
                              {job.finished_at ? new Date(job.finished_at).toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {/* Analyze confirmation modal */}
      <Modal
        isOpen={showAnalyzeModal}
        onClose={() => setShowAnalyzeModal(false)}
        title={t('analyzeModal.title')}
        footer={
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setShowAnalyzeModal(false)}>
              {t('analyzeModal.cancel')}
            </button>
            <button className="btn btn-primary" onClick={handleAnalyzeConfirm}>
              {t('analyzeModal.confirm')}
            </button>
          </div>
        }
      >
        <div className="modal-confirm-content">
          <div className="modal-icon">🤖</div>
          <p className="modal-message">
            {locale === 'es-MX'
              ? 'Estás a punto de iniciar un análisis de las respuestas con inteligencia artificial.'
              : 'You are about to start an AI analysis of the responses.'}
          </p>
          <div className="modal-info-box">
            <div className="modal-info-item">
              <span className="modal-info-icon">⏱️</span>
              <span>
                {locale === 'es-MX'
                  ? <>El proceso puede tardar <strong>unos minutos</strong> dependiendo del volumen de respuestas.</>
                  : <>The process may take <strong>a few minutes</strong> depending on the volume of responses.</>}
              </span>
            </div>
            <div className="modal-info-item">
              <span className="modal-info-icon">📊</span>
              <span>
                {locale === 'es-MX'
                  ? <>Podrás monitorear el progreso en la sección <strong>Status</strong>.</>
                  : <>You can monitor progress in the <strong>Status</strong> section.</>}
              </span>
            </div>
            <div className="modal-info-item">
              <span className="modal-info-icon">🔔</span>
              <span>
                {locale === 'es-MX'
                  ? <>Recibirás los resultados en la pestaña <strong>Reportes IA</strong> cuando termine.</>
                  : <>Results will appear in the <strong>AI Reports</strong> tab when complete.</>}
              </span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
