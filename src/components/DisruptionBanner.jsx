const STATUS_URL = 'https://status.railway.com/incident/I23M92U0';

const DisruptionBanner = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    backgroundColor: '#1a1a0e',
    borderBottom: '1px solid #3a3a1a',
    padding: '0.55rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    color: '#e8d88a',
  }}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
    <span>Estamos teniendo problemas de interrupción de nuestro proveedor de infraestructura Railway. Estamos investigando el incidente.</span>
    <a
      href={STATUS_URL}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: '#e8d88a',
        textDecoration: 'underline',
        whiteSpace: 'nowrap',
        fontWeight: 600,
      }}
    >
      Ver detalles
    </a>
  </div>
);

export default DisruptionBanner;
