import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, ReferenceLine,
} from 'recharts';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import api from '../services/api';
import Modal from '../components/Modal';
import OverviewTab from '../components/OverviewTab';
import TrendsTab from '../components/TrendsTab';
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
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  // Modal state
  const [showAnalyzeModal, setShowAnalyzeModal] = useState(false);
  const [distModal, setDistModal] = useState(null);

  // Tabs state
  const [activeTab, setActiveTab] = useState('overview');


  // Reports state
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState('');
  const [selectedTimestamp, setSelectedTimestamp] = useState(null);

  // Recommendations state
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  // Global summary state
  const [summaryMode, setSummaryMode] = useState('run');   // 'run' | 'global'
  const [globalSummary, setGlobalSummary] = useState([]);
  const [globalSummaryLoading, setGlobalSummaryLoading] = useState(false);

  const [isExporting, setIsExporting] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const RESPONSE_PREVIEW = 5;

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
      const data = response.data?.reports || [];
      setReports(data);
      if (data.length > 0) {
        const tsList = [...new Set(data.map(r => r.timestamp))].sort((a, b) => new Date(b) - new Date(a));
        setSelectedTimestamp(tsList[0]);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      setReportsError(t('reports.error'));
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    if ((activeTab === 'insights' || activeTab === 'overview') && reports.length === 0 && !reportsLoading) {
      fetchReports();
    }
  }, [activeTab]);

  const fetchRecommendations = async (ts = null) => {
    setRecommendationsLoading(true);
    try {
      const url = ts
        ? `/events/${eventId}/recommendations?timestamp=${encodeURIComponent(ts)}`
        : `/events/${eventId}/recommendations`;
      const response = await api.get(url);
      setRecommendations(response.data?.recommendations || response.data || []);
    } catch {
      setRecommendations([]);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const fetchGlobalSummary = async () => {
    setGlobalSummaryLoading(true);
    try {
      const response = await api.get(`/events/${eventId}/global-summary`);
      setGlobalSummary(response.data?.recommendations || []);
    } catch {
      setGlobalSummary([]);
    } finally {
      setGlobalSummaryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'overview' && !recommendationsLoading) {
      // Always re-fetch on tab activation so post-analysis data is current.
      // selectedTimestamp may still be null on first load; fetchRecommendations
      // handles that by falling back to the latest-timestamp endpoint.
      fetchRecommendations(selectedTimestamp || null);
    }
  }, [activeTab]);

  // Re-fetch run-specific recommendations when the selected timestamp changes
  // (e.g. user picks a different run from the date selector in OverviewTab).
  useEffect(() => {
    if (activeTab === 'overview' && selectedTimestamp && summaryMode === 'run' && !recommendationsLoading) {
      fetchRecommendations(selectedTimestamp);
    }
  }, [selectedTimestamp]);

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

  const handleRefreshResponses = async () => {
    setRefreshing(true);
    try {
      const response = await api.get(`/events/${eventId}/details`);
      setEvent(response.data.data);
    } catch {
      // silently fail — existing data stays visible
    } finally {
      setRefreshing(false);
    }
  };

  const toggleQuestion = (id) => {
    setExpandedQuestions(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleCategory = (key) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

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


  const handleRecommendationFeedback = async (recId, helpful) => {
    setRecommendations(prev =>
      prev.map(r => r.id === recId
        ? {
            ...r,
            user_vote: helpful ? 'helpful' : 'not_helpful',
            helpful_votes: helpful ? r.helpful_votes + 1 : r.helpful_votes,
            not_helpful_votes: !helpful ? r.not_helpful_votes + 1 : r.not_helpful_votes,
          }
        : r
      )
    );
    try {
      await api.post(`/events/${eventId}/recommendations/${recId}/feedback`, { helpful });
    } catch {
      setRecommendations(prev =>
        prev.map(r => r.id === recId
          ? {
              ...r,
              user_vote: null,
              helpful_votes: helpful ? r.helpful_votes - 1 : r.helpful_votes,
              not_helpful_votes: !helpful ? r.not_helpful_votes - 1 : r.not_helpful_votes,
            }
          : r
        )
      );
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

  const inferReportType = (r) => {
    if (r.question_type) return r.question_type;
    if (r.distribution?.[0]?.period !== undefined) return 'date';
    if (r.stats?.mean !== undefined) return 'numeric';
    if (r.distribution?.[0]?.option !== undefined) return 'multiple';
    return 'open';
  };

  const reportsByType = {
    open:     selectedReports.filter(r => inferReportType(r) === 'open'),
    multiple: selectedReports.filter(r => inferReportType(r) === 'multiple'),
    numeric:  selectedReports.filter(r => inferReportType(r) === 'numeric'),
    date:     selectedReports.filter(r => inferReportType(r) === 'date'),
  };

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
      const openReports = reportsByType.open;
      const totalVol = openReports.reduce((s, r) => s + (r.volume || 0), 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      txt(C.textGrey);
      doc.text(`${openReports.length}  ${labels.categories}   ·   ${totalVol}  ${labels.mentions}`, mg, y);
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

      openReports.forEach((r, i) => {
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
      openReports.forEach(r => {
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

      openReports.forEach((r, i) => {
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

      // ── Multiple choice distribution ─────────────────────────────
      if (reportsByType.multiple.length > 0) {
        checkPage(20);
        draw(C.border); doc.setLineWidth(0.3); doc.line(mg, y, pageW - mg, y); y += 6;
        doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5);
        txt(C.primary);
        doc.text(isES ? 'DISTRIBUCIÓN DE OPCIONES' : 'OPTION DISTRIBUTION', mg, y); y += 7;

        reportsByType.multiple.forEach(r => {
          checkPage(20 + (r.distribution?.length || 0) * 8);
          doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
          txt(C.textMain);
          const qLines = doc.splitTextToSize(r.question_text, cW);
          doc.text(qLines, mg, y); y += qLines.length * 4.5 + 2;

          const maxPct = Math.max(...(r.distribution || []).map(d => d.percentage));
          (r.distribution || []).forEach(d => {
            doc.setFont('helvetica', 'normal'); doc.setFontSize(8); txt(C.textMain);
            doc.text(d.option.slice(0, 25), mg, y);
            const barW = (d.percentage / Math.max(maxPct, 1)) * (cW * 0.45);
            fill(C.border); doc.rect(mg + 55, y - 3, cW * 0.45, 4, 'F');
            fill(C.primary); if (barW > 0) doc.rect(mg + 55, y - 3, barW, 4, 'F');
            txt(C.textGrey); doc.setFontSize(7.5);
            doc.text(`${d.count} (${d.percentage.toFixed(1)}%)`, mg + 55 + cW * 0.45 + 2, y);
            y += 6;
          });
          txt(C.textGrey); doc.setFont('helvetica', 'italic'); doc.setFontSize(7.5);
          doc.text(`${r.total_responses} ${isES ? 'respuestas · Más elegida:' : 'responses · Most chosen:'} ${r.most_common}`, mg, y);
          y += 9;
        });
      }

      // ── Numeric statistics ────────────────────────────────────────
      if (reportsByType.numeric.length > 0) {
        checkPage(20);
        draw(C.border); doc.setLineWidth(0.3); doc.line(mg, y, pageW - mg, y); y += 6;
        doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5);
        txt(C.primary);
        doc.text(isES ? 'ESTADÍSTICAS NUMÉRICAS' : 'NUMERIC STATISTICS', mg, y); y += 7;

        reportsByType.numeric.forEach(r => {
          const histRows = r.histogram?.length || 0;
          checkPage(30 + (histRows > 0 ? 32 : 0));
          doc.setFont('helvetica', 'bold'); doc.setFontSize(9); txt(C.textMain);
          const qLines = doc.splitTextToSize(r.question_text, cW);
          doc.text(qLines, mg, y); y += qLines.length * 4.5 + 3;

          const s = r.stats || {};
          const metrics = [
            [isES ? 'Media' : 'Mean', s.mean?.toFixed(1)],
            [isES ? 'Mediana' : 'Median', s.median?.toFixed(1)],
            [isES ? 'Desv. est.' : 'Std dev.', s.std?.toFixed(1)],
            [isES ? 'Mín' : 'Min', s.min],
            [isES ? 'Máx' : 'Max', s.max],
            ['P25', s.p25 ?? '—'], ['P75', s.p75 ?? '—'],
            ['N', s.count],
          ];
          doc.setFont('helvetica', 'normal'); doc.setFontSize(8); txt(C.textGrey);
          doc.text(metrics.map(([l, v]) => `${l}: ${v ?? '—'}`).join('  ·  '), mg, y);
          y += 6;

          // ── Histogram bars ─────────────────────────────────
          if (r.histogram?.length > 0) {
            const maxCount = Math.max(...r.histogram.map(b => b.count));
            const barsW = cW - 4;
            const bW = barsW / r.histogram.length;
            const chartH = 18;
            const baseY = y + chartH;
            r.histogram.forEach((b, i) => {
              const bH = maxCount > 0 ? (b.count / maxCount) * chartH : 0;
              fill(C.primary); if (bH > 0) doc.rect(mg + 2 + i * bW, baseY - bH, bW - 1, bH, 'F');
              doc.setFontSize(5.5); txt(C.textGrey);
              doc.text(b.range, mg + 2 + i * bW + (bW - 1) / 2, baseY + 3.5, { align: 'center' });
              if (bH > 3) { doc.setFontSize(6); txt(C.textMain); doc.text(String(b.count), mg + 2 + i * bW + (bW - 1) / 2, baseY - bH - 1, { align: 'center' }); }
            });
            if (s.mean != null) {
              txt([239, 68, 68]); doc.setFontSize(6.5);
              doc.text(`μ = ${s.mean.toFixed(1)}`, mg + barsW + 6, y + chartH / 2);
            }
            y += chartH + 8;
          } else {
            y += 5;
          }
        });
      }

      // ── Date temporal distribution ────────────────────────────────
      if (reportsByType.date.length > 0) {
        checkPage(20);
        draw(C.border); doc.setLineWidth(0.3); doc.line(mg, y, pageW - mg, y); y += 6;
        doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5);
        txt(C.primary);
        doc.text(isES ? 'ANÁLISIS TEMPORAL' : 'TEMPORAL ANALYSIS', mg, y); y += 7;

        reportsByType.date.forEach(r => {
          const distRows = r.distribution?.length || 0;
          checkPage(30 + (distRows > 0 ? 32 : 0));
          doc.setFont('helvetica', 'bold'); doc.setFontSize(9); txt(C.textMain);
          const qLines = doc.splitTextToSize(r.question_text, cW);
          doc.text(qLines, mg, y); y += qLines.length * 4.5 + 3;

          const s = r.stats || {};
          doc.setFont('helvetica', 'normal'); doc.setFontSize(8); txt(C.textGrey);
          doc.text(
            `${isES ? 'Rango:' : 'Range:'} ${s.earliest || '—'} → ${s.latest || '—'}  ·  ` +
            `N: ${s.count || 0}  ·  ` +
            `${isES ? 'Período pico:' : 'Peak:'} ${s.peak_period || '—'}`,
            mg, y
          );
          y += 6;

          // ── Period distribution bars ────────────────────────
          if (r.distribution?.length > 0) {
            const maxCount = Math.max(...r.distribution.map(d => d.count));
            const barsW = cW - 4;
            const bW = barsW / r.distribution.length;
            const chartH = 18;
            const baseY = y + chartH;
            r.distribution.forEach((d, i) => {
              const bH = maxCount > 0 ? (d.count / maxCount) * chartH : 0;
              const isPeak = d.period === s.peak_period;
              fill(isPeak ? C.primary : [199, 210, 254]);
              if (bH > 0) doc.rect(mg + 2 + i * bW, baseY - bH, bW - 1, bH, 'F');
              doc.setFontSize(5.5); txt(C.textGrey);
              const label = d.period.slice(0, 8);
              doc.text(label, mg + 2 + i * bW + (bW - 1) / 2, baseY + 3.5, { align: 'center' });
              if (bH > 3) { doc.setFontSize(6); txt(C.textMain); doc.text(String(d.count), mg + 2 + i * bW + (bW - 1) / 2, baseY - bH - 1, { align: 'center' }); }
            });
            y += chartH + 8;
          } else {
            y += 5;
          }
        });
      }

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

  const exportToExcel = () => {
    if (!event?.questions?.length) return;
    const questions = event.questions;
    const headers = questions.map((q, i) => `${i + 1}. ${q.text}`);
    const maxRows = Math.max(...questions.map(q => q.responses?.length || 0));
    const rows = Array.from({ length: maxRows }, (_, i) => {
      const row = {};
      questions.forEach((q, qIdx) => {
        row[headers[qIdx]] = q.responses?.[i]?.text ?? '';
      });
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, locale === 'es-MX' ? 'Respuestas' : 'Responses');
    const safeName = (event.name || 'survey').replace(/[^a-z0-9\-_]/gi, '_').slice(0, 40);
    XLSX.writeFile(wb, `${safeName}_responses.xlsx`);
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
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <span className={`survey-card-source-badge survey-card-source-${eventSource}`}>
                {isImported ? t('source.imported') : t('source.online')}
              </span>
              {!isImported && (
                <span className={`survey-card-status survey-card-status-${event.is_paused ? 'paused' : 'active'}`}>
                  {event.is_paused ? t('admin.paused') : t('status.active')}
                </span>
              )}
            </div>
            <h1 className="page-title">{event.name}</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{event.description}</p>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {event.end && (
                <span>{t('eventDetails.endDate', { date: new Date(event.end).toLocaleDateString(locale) })}</span>
              )}
              <span>{t('eventDetails.totalResponses', { count: totalResponses })}</span>
            </div>
          </div>
          <Link to={`/admin/events/${eventId}/edit`} className="btn btn-outline" style={{ flexShrink: 0 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ marginRight: '0.4rem', verticalAlign: 'middle' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            </svg>
            {t('editEvent.pageTitle')}
          </Link>
        </div>

        {analysisStatus && (
          <div
            className={`alert ${analysisStatus.includes('exitosamente') || analysisStatus.includes('successfully') ? 'alert-success' : 'alert-error'}`}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
              borderRadius: 0, margin: 0,
              justifyContent: 'space-between',
            }}
          >
            <span>{analysisStatus}</span>
            <button
              onClick={() => setAnalysisStatus('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1, color: 'inherit', padding: '0 0.25rem' }}
              aria-label="Cerrar"
            >
              ×
            </button>
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
          <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <span className="tab-icon">⚡</span>
            {t('eventDetails.tabOverview')}
            {recommendations.filter(r => r.impact_level === 'high').length > 0 && (
              <span className="tab-badge running">{recommendations.filter(r => r.impact_level === 'high').length}</span>
            )}
          </button>
          <button className={`tab-btn ${activeTab === 'insights' ? 'active' : ''}`} onClick={() => setActiveTab('insights')}>
            <span className="tab-icon">📊</span>
            {t('eventDetails.tabInsights')}
            {reports.length > 0 && <span className="tab-badge">{reports.length}</span>}
          </button>
          <button className={`tab-btn ${activeTab === 'trends' ? 'active' : ''}`} onClick={() => setActiveTab('trends')}>
            <span className="tab-icon">📈</span>
            {t('eventDetails.tabTrends')}
          </button>
          <button className={`tab-btn ${activeTab === 'responses' ? 'active' : ''}`} onClick={() => setActiveTab('responses')}>
            <span className="tab-icon">💬</span>
            {t('eventDetails.tabResponses')}
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
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <OverviewTab
              recommendations={recommendations}
              recommendationsLoading={recommendationsLoading}
              reports={selectedReports}
              locale={locale}
              onFeedback={handleRecommendationFeedback}
              onAnalyzeClick={handleAnalyzeClick}
              analyzing={analyzing}
              summaryMode={summaryMode}
              onSummaryModeChange={setSummaryMode}
              selectedTimestamp={selectedTimestamp}
              runTimestamps={runTimestamps}
              onTimestampChange={setSelectedTimestamp}
              globalSummary={globalSummary}
              globalSummaryLoading={globalSummaryLoading}
              onFetchGlobalSummary={fetchGlobalSummary}
            />
          )}

          {/* Trends Tab */}
          {activeTab === 'trends' && (
            <TrendsTab reports={reports} locale={locale} />
          )}

          {/* Responses Tab */}
          {activeTab === 'responses' && (
            <section>
              {/* Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <span />
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    onClick={exportToExcel}
                    disabled={!event?.questions?.some(q => q.responses?.length > 0)}
                    className="btn btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    title={locale === 'es-MX' ? 'Exportar a Excel' : 'Export to Excel'}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="8" y1="13" x2="16" y2="13"/>
                      <line x1="8" y1="17" x2="16" y2="17"/>
                      <line x1="10" y1="9" x2="8" y2="9"/>
                    </svg>
                    {locale === 'es-MX' ? 'Exportar Excel' : 'Export Excel'}
                  </button>
                  <button
                    onClick={handleRefreshResponses}
                    disabled={refreshing}
                    className="btn btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    title={t('eventDetails.refresh')}
                  >
                    <svg
                      width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                      style={{ transition: 'transform 0.5s', transform: refreshing ? 'rotate(360deg)' : 'none' }}
                    >
                      <path d="M23 4v6h-6" />
                      <path d="M1 20v-6h6" />
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                    </svg>
                  </button>
                  <button
                    onClick={handleAnalyzeClick}
                    disabled={analyzing}
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    {analyzing ? (
                      <><span className="btn-spinner"></span>{t('eventDetails.analyzing')}</>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2L13.5 10.5L22 12L13.5 13.5L12 22L10.5 13.5L2 12L10.5 10.5Z"/>
                          <path d="M20 2L20.5 4.5L23 5L20.5 5.5L20 8L19.5 5.5L17 5L19.5 4.5Z"/>
                        </svg>
                        {t('eventDetails.analyzeTitle')}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Questions list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <>
                    {event.questions?.map((question, index) => (
                      <div key={question.id} className="card" style={{ overflow: 'hidden', padding: 0 }}>
                        <div style={{ padding: '1rem 1.25rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ color: 'var(--primary)', marginRight: '0.25rem' }}>{index + 1}.</span>
                            {question.text}
                            {question.type && (
                              <span style={{
                                fontSize: '0.7rem', fontWeight: '500',
                                color: 'var(--text-muted)',
                                background: 'var(--bg-tertiary, var(--border))',
                                border: '1px solid var(--border)',
                                borderRadius: '999px',
                                padding: '0.15rem 0.55rem',
                                whiteSpace: 'nowrap',
                              }}>
                                {{ open: '💬', multiple: '☑️', numeric: '🔢', date: '📅' }[question.type]}
                                {' '}
                                {t(`create.questionType${question.type.charAt(0).toUpperCase() + question.type.slice(1)}`)}
                              </span>
                            )}
                          </h3>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {question.responses?.length || 0} {t('eventDetails.responses')}
                          </span>
                        </div>
                        <div style={{ padding: '1rem 1.25rem' }}>
                          {question.responses?.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              {isImported ? t('eventDetails.importNoPreview') : t('eventDetails.noResponses')}
                            </p>
                          ) : (() => {
                            const all = question.responses;
                            const isExpanded = expandedQuestions.has(question.id);
                            const visible = isExpanded ? all : all.slice(0, RESPONSE_PREVIEW);
                            const hasMore = all.length > RESPONSE_PREVIEW;
                            return (
                              <>
                                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: 0 }}>
                                  {visible.map(response => (
                                    <li key={response.id} className="response-item">
                                      {response.text}
                                    </li>
                                  ))}
                                </ul>
                                {hasMore && (
                                  <button
                                    type="button"
                                    onClick={() => toggleQuestion(question.id)}
                                    style={{
                                      marginTop: '0.75rem', background: 'none', border: 'none',
                                      cursor: 'pointer', color: 'var(--primary)',
                                      fontSize: '0.8rem', fontWeight: '600', padding: 0,
                                    }}
                                  >
                                    {isExpanded
                                      ? (locale === 'es-MX' ? '▲ Ver menos' : '▲ Show less')
                                      : `▼ ${locale === 'es-MX' ? `Ver todas (${all.length})` : `Show all (${all.length})`}`}
                                  </button>
                                )}
                              </>
                            );
                          })()}
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
              </div>
            </section>
          )}

          {/* Insights Tab (Reports + Charts merged) */}
          {activeTab === 'insights' && (
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
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <button
                    onClick={handleAnalyzeClick}
                    disabled={analyzing}
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    {analyzing ? (
                      <><span className="btn-spinner"></span>{t('eventDetails.analyzing')}</>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2L13.5 10.5L22 12L13.5 13.5L12 22L10.5 13.5L2 12L10.5 10.5Z"/>
                          <path d="M20 2L20.5 4.5L23 5L20.5 5.5L20 8L19.5 5.5L17 5L19.5 4.5Z"/>
                        </svg>
                        {t('eventDetails.analyzeTitle')}
                      </>
                    )}
                  </button>
                  <button onClick={fetchReports} className="btn btn-secondary" disabled={reportsLoading}>
                    {reportsLoading ? (
                      <><span className="btn-spinner"></span>{t('reports.loading')}</>
                    ) : (
                      t('reports.refresh')
                    )}
                  </button>
                </div>
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
                  {/* Run selector */}
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
                        <select value={selectedTimestamp || ''} onChange={e => setSelectedTimestamp(e.target.value)}
                          className="input-field" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem', width: 'auto', margin: 0 }}>
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

                  {/* ── open: NLP clusters ── */}
                  {reportsByType.open.length > 0 && (() => {
                    const openByQuestion = Object.entries(
                      reportsByType.open.reduce((acc, r) => {
                        const key = r.question_id ?? 'default';
                        if (!acc[key]) acc[key] = { label: r.question_text || (locale === 'es-MX' ? 'Texto libre' : 'Free text'), reports: [] };
                        acc[key].reports.push(r);
                        return acc;
                      }, {})
                    ).map(([qKey, val]) => ({ ...val, qKey }));
                    const multipleQuestions = openByQuestion.length > 1;
                    const sentColor = (s) => s >= 0.3 ? '#10B981' : s <= -0.3 ? '#EF4444' : '#6366F1';
                    const isES = locale === 'es-MX';
                    return (
                      <div className="report-type-section">
                        <div className="report-type-section-title">
                          <span>💬</span>
                          <span>{isES ? 'Análisis de texto libre' : 'Free text analysis'}</span>
                          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                          <span style={{ fontWeight: 400 }}>({reportsByType.open.length})</span>
                        </div>
                        {openByQuestion.map(({ label, reports: qReports, qKey }) => {
                          const byCategory = qReports.reduce((acc, r) => {
                            if (!acc[r.category]) acc[r.category] = [];
                            acc[r.category].push(r);
                            return acc;
                          }, {});
                          return (
                            <div key={qKey}>
                              {multipleQuestions && (
                                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', margin: '0.75rem 0 0.5rem', padding: '0 0.25rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                  {label}
                                </div>
                              )}
                              <div className="reports-grid">
                                {Object.entries(byCategory).map(([category, catReports]) => {
                                  const isMulti = catReports.length > 1;
                                  const totalVol = catReports.reduce((s, r) => s + (r.volume || 0), 0);
                                  const avgUrgency = totalVol > 0
                                    ? catReports.reduce((s, r) => s + (r.urgency || 0) * (r.volume || 0), 0) / totalVol
                                    : 0;
                                  return (
                                    <div
                                      key={category}
                                      className="report-card"
                                      style={isMulti ? { gridColumn: '1 / -1' } : {}}
                                    >
                                      {/* Header */}
                                      <div className="report-card-header">
                                        <h4 className="report-category">{category}</h4>
                                        {isMulti && (
                                          <span style={{
                                            fontSize: '0.72rem', padding: '0.15rem 0.55rem',
                                            background: 'var(--primary-light)', color: 'var(--primary)',
                                            borderRadius: '999px', fontWeight: '600', whiteSpace: 'nowrap',
                                          }}>
                                            {catReports.length} {isES ? 'perspectivas' : 'perspectives'}
                                          </span>
                                        )}
                                      </div>

                                      {/* Sentiment distribution bar + legend */}
                                      <div style={{ padding: '0 1.25rem 0.75rem' }}>
                                        <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', gap: '2px', marginBottom: '0.5rem' }}>
                                          {catReports.map((r, i) => (
                                            <div key={i} style={{ flex: r.volume || 1, background: sentColor(r.sentiment), minWidth: '6px' }} />
                                          ))}
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                          {catReports.map((r, i) => {
                                            const s = getSentimentLabel(r.sentiment);
                                            return (
                                              <span key={i} style={{ fontSize: '0.75rem', color: sentColor(r.sentiment), fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: sentColor(r.sentiment), display: 'inline-block', flexShrink: 0 }} />
                                                {s.text} · {r.volume} {isES ? 'mencs.' : 'ment.'}
                                              </span>
                                            );
                                          })}
                                        </div>
                                      </div>

                                      {/* Aggregated stats */}
                                      <div className="report-stats">
                                        <div className="report-stat">
                                          <span className="report-stat-value">{totalVol}</span>
                                          <span className="report-stat-label">{isES ? 'menciones totales' : 'total mentions'}</span>
                                        </div>
                                        <div className="report-stat">
                                          <span className="report-stat-value">{avgUrgency.toFixed(1)}/10</span>
                                          <span className="report-stat-label">{isES ? 'urgencia promedio' : 'avg urgency'}</span>
                                        </div>
                                      </div>

                                      {/* Perspectives — always visible */}
                                      <div style={{ borderTop: '1px solid var(--border)', padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                        {catReports.map((r, i) => {
                                          const s = getSentimentLabel(r.sentiment);
                                          const col = sentColor(r.sentiment);
                                          return (
                                            <div key={i}>
                                              {/* Perspective header: badge + mentions + prominent % */}
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                                <span className={`report-badge sentiment-${s.class}`}>{s.text}</span>
                                                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                                  {r.volume} {isES ? 'menciones' : 'mentions'}
                                                </span>
                                                {r.percentage != null && (
                                                  <span style={{ fontSize: '1rem', fontWeight: '700', color: col, marginLeft: 'auto' }}>
                                                    {r.percentage.toFixed(1)}%
                                                  </span>
                                                )}
                                              </div>
                                              {/* Description */}
                                              {r.summary && (
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: '0 0 0.5rem', lineHeight: 1.5 }}>
                                                  {r.summary}
                                                </p>
                                              )}
                                              {/* Example quotes */}
                                              {r.examples?.slice(0, 2).map((ex, j) => (
                                                <div key={j} style={{
                                                  fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic',
                                                  paddingLeft: '0.75rem', borderLeft: `2px solid ${col}`,
                                                  marginBottom: '0.25rem',
                                                }}>
                                                  "{ex}"
                                                </div>
                                              ))}
                                            </div>
                                          );
                                        })}
                                      </div>

                                      <div className="report-timestamp" style={{ padding: '0.5rem 1.25rem' }}>
                                        {t('reports.generated', { date: new Date(catReports[0].timestamp).toLocaleString(locale) })}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {/* ── multiple: distribution ── */}
                  {reportsByType.multiple.length > 0 && (
                    <div className="report-type-section">
                      <div className="report-type-section-title">
                        <span>☑️</span>
                        <span>{locale === 'es-MX' ? 'Distribución de opciones' : 'Option distribution'}</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                        <span style={{ fontWeight: 400 }}>({reportsByType.multiple.length})</span>
                      </div>
                      <div className="reports-grid">
                        {reportsByType.multiple.map(report => {
                          const DIST_PREVIEW = 5;
                          const dist = report.distribution || [];
                          const hasMore = dist.length > DIST_PREVIEW;
                          return (
                            <div key={report.id} className="report-card">
                              <div className="report-card-header">
                                <h4 className="report-category">{report.question_text}</h4>
                                <span className="report-badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                                  ☑️ {locale === 'es-MX' ? 'Opción múltiple' : 'Multiple choice'}
                                </span>
                              </div>
                              <div style={{ padding: '0.75rem 1.25rem' }}>
                                {dist.slice(0, DIST_PREVIEW).map((d, i) => {
                                  const pct = Math.max(0, d.percentage ?? 0);
                                  return (
                                    <div key={i} className="report-dist-row">
                                      <span className="report-dist-label">{d.option}</span>
                                      <div className="report-dist-bar-track">
                                        <div className="report-dist-bar-fill" style={{ width: `${pct}%` }} />
                                      </div>
                                      <span className="report-dist-value">
                                        {d.count} <small style={{ color: 'var(--text-secondary)' }}>({pct.toFixed(1)}%)</small>
                                      </span>
                                    </div>
                                  );
                                })}
                                {hasMore && (
                                  <button
                                    type="button"
                                    onClick={() => setDistModal(report)}
                                    style={{
                                      marginTop: '0.5rem', background: 'none', border: 'none',
                                      cursor: 'pointer', color: 'var(--primary)',
                                      fontSize: '0.8rem', fontWeight: '600', padding: 0,
                                    }}
                                  >
                                    {locale === 'es-MX' ? `Ver todas (${dist.length})` : `Show all (${dist.length})`} ▼
                                  </button>
                                )}
                              </div>
                              <div style={{ padding: '0.6rem 1.25rem', borderTop: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                {report.total_responses} {locale === 'es-MX' ? 'respuestas' : 'responses'}
                                {report.most_common && (
                                  <> · {locale === 'es-MX' ? 'Más elegida:' : 'Most chosen:'} <strong style={{ color: 'var(--text-primary)' }}>{report.most_common}</strong></>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── numeric: stats ── */}
                  {reportsByType.numeric.length > 0 && (
                    <div className="report-type-section">
                      <div className="report-type-section-title">
                        <span>🔢</span>
                        <span>{locale === 'es-MX' ? 'Estadísticas numéricas' : 'Numeric statistics'}</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                        <span style={{ fontWeight: 400 }}>({reportsByType.numeric.length})</span>
                      </div>
                      <div className="reports-grid">
                        {reportsByType.numeric.map(report => {
                          const s = report.stats || {};
                          return (
                            <div key={report.id} className="report-card">
                              <div className="report-card-header">
                                <h4 className="report-category">{report.question_text}</h4>
                                <span className="report-badge" style={{ background: '#F0FDF4', color: '#15803D' }}>
                                  🔢 {locale === 'es-MX' ? 'Numérico' : 'Numeric'}
                                </span>
                              </div>
                              <div className="report-stats-grid">
                                {[
                                  [locale === 'es-MX' ? 'Media' : 'Mean',           s.mean?.toFixed(1) ?? '—'],
                                  [locale === 'es-MX' ? 'Mediana' : 'Median',       s.median?.toFixed(1) ?? '—'],
                                  [locale === 'es-MX' ? 'Desv. est.' : 'Std dev.',  s.std?.toFixed(1) ?? '—'],
                                  ['P25',                                             s.p25 ?? '—'],
                                  ['P75',                                             s.p75 ?? '—'],
                                  ['IQR',                                             (s.p25 != null && s.p75 != null) ? (s.p75 - s.p25).toFixed(1) : '—'],
                                  [locale === 'es-MX' ? 'Mínimo' : 'Min',           s.min ?? '—'],
                                  [locale === 'es-MX' ? 'Máximo' : 'Max',           s.max ?? '—'],
                                  [locale === 'es-MX' ? 'Respuestas' : 'Responses', s.count ?? '—'],
                                ].map(([label, value]) => (
                                  <div key={label} className="report-stat-box">
                                    <span className="report-stat-value">{value}</span>
                                    <span className="report-stat-label">{label}</span>
                                  </div>
                                ))}
                              </div>
                              {report.histogram?.length > 0 && (
                                <div style={{ padding: '0.75rem 1rem 0.5rem' }}>
                                  <p style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                    {locale === 'es-MX' ? 'Distribución' : 'Distribution'}
                                    {s.mean != null && <span style={{ fontWeight: 400, marginLeft: '0.5rem' }}>— {locale === 'es-MX' ? 'media:' : 'mean:'} {s.mean.toFixed(1)}</span>}
                                  </p>
                                  <ResponsiveContainer width="100%" height={100}>
                                    <BarChart data={report.histogram} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                                      <XAxis dataKey="range" tick={{ fontSize: 9, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                                      <YAxis tick={{ fontSize: 9, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                                      <Tooltip formatter={v => [v, locale === 'es-MX' ? 'Respuestas' : 'Responses']} contentStyle={{ fontSize: '0.8rem' }} />
                                      <Bar dataKey="count" fill="#6366F1" radius={[2, 2, 0, 0]} />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── date: temporal ── */}
                  {reportsByType.date.length > 0 && (
                    <div className="report-type-section">
                      <div className="report-type-section-title">
                        <span>📅</span>
                        <span>{locale === 'es-MX' ? 'Análisis temporal' : 'Temporal analysis'}</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                        <span style={{ fontWeight: 400 }}>({reportsByType.date.length})</span>
                      </div>
                      <div className="reports-grid">
                        {reportsByType.date.map(report => {
                          const s = report.stats || {};
                          return (
                            <div key={report.id} className="report-card">
                              <div className="report-card-header">
                                <h4 className="report-category">{report.question_text}</h4>
                                <span className="report-badge" style={{ background: '#FFF7ED', color: '#C2410C' }}>
                                  📅 {locale === 'es-MX' ? 'Fecha' : 'Date'}
                                </span>
                              </div>
                              <div className="report-stats">
                                <div className="report-stat">
                                  <span className="report-stat-value">{s.count ?? '—'}</span>
                                  <span className="report-stat-label">{locale === 'es-MX' ? 'Respuestas' : 'Responses'}</span>
                                </div>
                                <div className="report-stat">
                                  <span className="report-stat-value" style={{ fontSize: '1rem' }}>{s.peak_period ?? '—'}</span>
                                  <span className="report-stat-label">{locale === 'es-MX' ? 'Período pico' : 'Peak period'}</span>
                                </div>
                              </div>
                              {s.earliest && s.latest && (
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '0 1.25rem 0.25rem' }}>
                                  {s.earliest} → {s.latest}
                                </p>
                              )}
                              {report.distribution?.length > 0 && (
                                <div style={{ padding: '0.5rem 1rem 0.75rem' }}>
                                  <p style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                    {locale === 'es-MX' ? 'Distribución mensual' : 'Monthly distribution'}
                                  </p>
                                  <ResponsiveContainer width="100%" height={100}>
                                    <BarChart data={report.distribution} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                                      <XAxis dataKey="period" tick={{ fontSize: 9, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                                      <YAxis tick={{ fontSize: 9, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                                      <Tooltip formatter={v => [v, locale === 'es-MX' ? 'Respuestas' : 'Responses']} contentStyle={{ fontSize: '0.8rem' }} />
                                      <Bar dataKey="count" radius={[2, 2, 0, 0]} maxBarSize={32}>
                                        {report.distribution.map((d, i) => (
                                          <Cell key={i} fill={d.period === s.peak_period ? '#6366F1' : '#C7D2FE'} />
                                        ))}
                                      </Bar>
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ── Charts section ── */}
              <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '2px solid var(--border)' }}>
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

              {reports.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {/* Run selector */}
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
                        <select value={selectedTimestamp || ''} onChange={e => setSelectedTimestamp(e.target.value)}
                          className="input-field" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem', width: 'auto', margin: 0 }}>
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

                  {/* ── open: category bar + sentiment pie, grouped by question ── */}
                  {reportsByType.open.length > 0 && (() => {
                    const barColors = ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF'];
                    const openByQuestion = Object.values(
                      reportsByType.open.reduce((acc, r) => {
                        const key = r.question_id ?? 'default';
                        if (!acc[key]) acc[key] = { label: r.question_text || (locale === 'es-MX' ? 'Texto libre' : 'Free text'), reports: [] };
                        acc[key].reports.push(r);
                        return acc;
                      }, {})
                    );
                    const multipleQuestions = openByQuestion.length > 1;
                    return (
                      <>
                        <div className="report-type-section-title">
                          <span>💬</span><span>{locale === 'es-MX' ? 'Texto libre' : 'Free text'}</span>
                          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                        </div>
                        {openByQuestion.map(({ label, reports: qReports }) => {
                          const barData = qReports.map(r => ({ name: r.category, value: parseFloat(r.percentage.toFixed(1)), volume: r.volume }));
                          let pos = 0, neg = 0, neu = 0;
                          qReports.forEach(r => {
                            if (r.sentiment >= 0.3) pos += r.volume;
                            else if (r.sentiment <= -0.3) neg += r.volume;
                            else neu += r.volume;
                          });
                          const pieData = [
                            { name: t('sentiment.positive'), value: pos, fill: '#10B981' },
                            { name: t('sentiment.negative'), value: neg, fill: '#EF4444' },
                            { name: t('sentiment.neutral'),  value: neu, fill: '#6366F1' },
                          ].filter(d => d.value > 0);
                          return (
                            <div key={label}>
                              {multipleQuestions && (
                                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', margin: '1rem 0 0.5rem', padding: '0 0.25rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                  {label}
                                </div>
                              )}
                              <div className="card" style={{ padding: '1.5rem' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{t('charts.barTitle')}</h4>
                                <ResponsiveContainer width="100%" height={barData.length * 64 + 40}>
                                  <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 40, left: 8, bottom: 0 }}>
                                    <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="name" width={190} tick={<MultiLineTick />} axisLine={false} tickLine={false} />
                                    <Tooltip formatter={(v, _, p) => [`${v}% (${p.payload.volume} ${t('reports.mentions')})`, t('charts.percentage')]} contentStyle={{ borderRadius: '0.5rem', fontSize: '0.85rem' }} />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={28}>
                                      {barData.map((_, i) => <Cell key={i} fill={barColors[i % barColors.length]} />)}
                                    </Bar>
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                              {pieData.length > 0 && (
                                <div className="card" style={{ padding: '1.5rem' }}>
                                  <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{t('charts.pieTitle')}</h4>
                                  <ResponsiveContainer width="100%" height={320}>
                                    <PieChart>
                                      <Pie data={pieData} cx="50%" cy="46%" outerRadius={85} dataKey="value" label={({ percent }) => `${(percent * 100).toFixed(0)}%`} labelLine>
                                        {pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                                      </Pie>
                                      <Legend formatter={v => <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{v}</span>} />
                                      <Tooltip formatter={(v, n) => [`${v} ${t('reports.mentions')}`, n]} contentStyle={{ borderRadius: '0.5rem', fontSize: '0.85rem' }} />
                                    </PieChart>
                                  </ResponsiveContainer>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </>
                    );
                  })()}

                  {/* ── multiple: bar per question ── */}
                  {reportsByType.multiple.length > 0 && (
                    <>
                      <div className="report-type-section-title">
                        <span>☑️</span><span>{locale === 'es-MX' ? 'Distribución de opciones' : 'Option distribution'}</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                      </div>
                      {reportsByType.multiple.map(r => {
                        const distColors = ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF'];
                        return (
                          <div key={r.id} className="card" style={{ padding: '1.5rem' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{r.question_text}</h4>
                            <ResponsiveContainer width="100%" height={(r.distribution?.length || 1) * 52 + 40}>
                              <BarChart data={r.distribution} layout="vertical" margin={{ top: 0, right: 60, left: 8, bottom: 0 }}>
                                <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="option" width={120} tick={{ fontSize: 11, fill: 'var(--text-primary)' }} axisLine={false} tickLine={false} />
                                <Tooltip formatter={(v, _, p) => [`${p.payload.count} (${v.toFixed(1)}%)`, r.question_text]} contentStyle={{ fontSize: '0.82rem' }} />
                                <Bar dataKey="percentage" radius={[0, 4, 4, 0]} maxBarSize={24}>
                                  {(r.distribution || []).map((_, i) => <Cell key={i} fill={distColors[i % distColors.length]} />)}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        );
                      })}
                    </>
                  )}

                  {/* ── numeric: histogram per question ── */}
                  {reportsByType.numeric.length > 0 && (
                    <>
                      <div className="report-type-section-title">
                        <span>🔢</span><span>{locale === 'es-MX' ? 'Estadísticas numéricas' : 'Numeric statistics'}</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                      </div>
                      {reportsByType.numeric.map(r => {
                        const s = r.stats || {};
                        return (
                          <div key={r.id} className="card" style={{ padding: '1.5rem' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>{r.question_text}</h4>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                              {[
                                [locale === 'es-MX' ? 'Media' : 'Mean',   s.mean?.toFixed(1)],
                                [locale === 'es-MX' ? 'Mediana' : 'Median', s.median?.toFixed(1)],
                                [locale === 'es-MX' ? 'Desv.' : 'Std',    s.std?.toFixed(1)],
                                ['Min', s.min], ['Max', s.max],
                                ['N', s.count],
                              ].map(([l, v]) => (
                                <span key={l} style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '600' }}>
                                  {l}: {v ?? '—'}
                                </span>
                              ))}
                            </div>
                            {r.histogram?.length > 0 && (
                              <ResponsiveContainer width="100%" height={180}>
                                <BarChart data={r.histogram} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                                  <XAxis dataKey="range" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                                  <Tooltip formatter={v => [v, locale === 'es-MX' ? 'Respuestas' : 'Responses']} contentStyle={{ fontSize: '0.82rem' }} />
                                  <Bar dataKey="count" fill="#6366F1" radius={[3, 3, 0, 0]} />
                                  {s.mean != null && <ReferenceLine x={r.histogram.reduce((closest, b) => Math.abs(parseFloat(b.range) - s.mean) < Math.abs(parseFloat(closest.range) - s.mean) ? b : closest, r.histogram[0])?.range} stroke="#EF4444" strokeDasharray="4 2" label={{ value: `μ=${s.mean.toFixed(1)}`, position: 'top', fontSize: 10, fill: '#EF4444' }} />}
                                </BarChart>
                              </ResponsiveContainer>
                            )}
                          </div>
                        );
                      })}
                    </>
                  )}

                  {/* ── date: temporal bar per question ── */}
                  {reportsByType.date.length > 0 && (
                    <>
                      <div className="report-type-section-title">
                        <span>📅</span><span>{locale === 'es-MX' ? 'Análisis temporal' : 'Temporal analysis'}</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                      </div>
                      {reportsByType.date.map(r => {
                        const s = r.stats || {};
                        return (
                          <div key={r.id} className="card" style={{ padding: '1.5rem' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{r.question_text}</h4>
                            {s.earliest && s.latest && (
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                                {s.earliest} → {s.latest} · {s.count} {locale === 'es-MX' ? 'respuestas' : 'responses'}
                                {s.peak_period && <> · <strong style={{ color: 'var(--primary)' }}>{locale === 'es-MX' ? 'Pico:' : 'Peak:'} {s.peak_period}</strong></>}
                              </p>
                            )}
                            {r.distribution?.length > 0 && (
                              <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={r.distribution} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                                  <XAxis dataKey="period" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                                  <Tooltip formatter={v => [v, locale === 'es-MX' ? 'Respuestas' : 'Responses']} contentStyle={{ fontSize: '0.82rem' }} />
                                  <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={40}>
                                    {r.distribution.map((d, i) => (
                                      <Cell key={i} fill={d.period === s.peak_period ? '#6366F1' : '#C7D2FE'} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            )}
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              )}
              </div>{/* end Charts section */}
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

      {/* Distribution modal */}
      <Modal
        isOpen={!!distModal}
        onClose={() => setDistModal(null)}
        title={distModal?.question_text}
      >
        <div style={{ overflowY: 'auto', maxHeight: '60vh' }}>
          {(distModal?.distribution || []).map((d, i) => {
            const pct = Math.max(0, d.percentage ?? 0);
            return (
              <div key={i} className="report-dist-row" style={{ marginBottom: '0.5rem' }}>
                <span className="report-dist-label">{d.option}</span>
                <div className="report-dist-bar-track">
                  <div className="report-dist-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="report-dist-value">
                  {d.count} <small style={{ color: 'var(--text-secondary)' }}>({pct.toFixed(1)}%)</small>
                </span>
              </div>
            );
          })}
        </div>
        {distModal?.most_common && (
          <p style={{ marginTop: '1rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            {locale === 'es-MX' ? 'Más elegida:' : 'Most chosen:'}{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{distModal.most_common}</strong>
            {' · '}{distModal.total_responses} {locale === 'es-MX' ? 'respuestas' : 'responses'}
          </p>
        )}
      </Modal>
    </div>
  );
}
