import { useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import Icon from './Icon';
import DemoModal from './DemoModal';
import '../styles/chatPanel.css';

const HISTORY_LIMIT = 8;

export default function ChatPanel() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, open]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    setError(false);

    try {
      const history = nextMessages.slice(-HISTORY_LIMIT - 1, -1);
      const { data } = await api.post('/chat', { message: text, history });
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="chat-fab"
        onClick={() => setOpen(true)}
        aria-label={t('chatbot.toggleLabel')}
        style={{ display: open ? 'none' : 'flex' }}
      >
        <Icon name="message-square" size={22} />
      </button>

      <div className={`chat-panel ${open ? 'chat-panel-open' : ''}`}>
        <div className="chat-panel-header">
          <div>
            <div className="chat-panel-title">{t('chatbot.title')}</div>
            <div className="chat-panel-subtitle">{t('chatbot.subtitle')}</div>
          </div>
          <button
            type="button"
            className="chat-panel-close"
            onClick={() => setOpen(false)}
            aria-label={t('chatbot.close')}
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="chat-panel-body" ref={scrollRef}>
          <div className="chat-msg chat-msg-assistant">{t('chatbot.welcome')}</div>
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg chat-msg-${m.role}`}>
              {m.content}
            </div>
          ))}
          {loading && (
            <div className="chat-msg chat-msg-assistant chat-msg-loading">
              {t('chatbot.thinking')}
            </div>
          )}
          {error && <div className="chat-msg chat-msg-error">{t('chatbot.error')}</div>}
        </div>

        <div className="chat-panel-cta">
          <button type="button" className="chat-panel-cta-btn" onClick={() => setDemoOpen(true)}>
            <Icon name="calendar" size={15} />
            {t('chatbot.ctaDemo')}
          </button>
        </div>

        <form className="chat-panel-input-row" onSubmit={handleSend}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('chatbot.placeholder')}
            disabled={loading}
            aria-label={t('chatbot.placeholder')}
          />
          <button type="submit" disabled={loading || !input.trim()} aria-label={t('chatbot.send')}>
            <Icon name="send" size={16} />
          </button>
        </form>
      </div>

      <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </>
  );
}
