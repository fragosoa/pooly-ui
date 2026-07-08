import Modal from './Modal';
import Icon from './Icon';
import { useLanguage } from '../context/LanguageContext';

export const CALENDLY_URL = 'https://calendly.com/fragosoadolfo1/pooly-mx-demo';

export default function DemoModal({ isOpen, onClose }) {
  const { t } = useLanguage();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('demoModal.title')}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
        {t('demoModal.body')}
      </p>
      <a
        href={CALENDLY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-action"
        style={{ width: '100%', justifyContent: 'center' }}
        onClick={onClose}
      >
        <Icon name="calendar" size={16} />
        {t('demoModal.cta')}
      </a>
    </Modal>
  );
}
