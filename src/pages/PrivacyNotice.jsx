import { useLanguage } from '../context/LanguageContext';

const PrivacyNotice = () => {
  const { language } = useLanguage();
  const es = language === 'es';

  return (
    <div className="legal-page">
      <h1>{es ? 'Aviso de Privacidad' : 'Privacy Notice'}</h1>
      <p className="legal-meta">{es ? 'Última actualización: abril 2026' : 'Last updated: April 2026'}</p>

      <h2>{es ? '1. Información que recopilamos' : '1. Information We Collect'}</h2>
      <p>{es ? 'Recopilamos los siguientes tipos de información:' : 'We collect the following types of information:'}</p>
      <ul>
        <li>
          {es
            ? 'Información de cuenta: nombre de usuario, dirección de correo electrónico y contraseña (almacenada de forma cifrada).'
            : 'Account information: username, email address, and password (stored encrypted).'}
        </li>
        <li>
          {es
            ? 'Datos de uso: encuestas creadas, respuestas recopiladas y resultados de análisis.'
            : 'Usage data: surveys created, responses collected, and analysis results.'}
        </li>
        <li>
          {es
            ? 'Datos técnicos: dirección IP, tipo de navegador y datos de sesión para seguridad y rendimiento.'
            : 'Technical data: IP address, browser type, and session data for security and performance.'}
        </li>
      </ul>

      <h2>{es ? '2. Cómo usamos tu información' : '2. How We Use Your Information'}</h2>
      <p>{es ? 'Utilizamos la información recopilada para:' : 'We use the collected information to:'}</p>
      <ul>
        <li>{es ? 'Proveer, operar y mantener el Servicio.' : 'Provide, operate, and maintain the Service.'}</li>
        <li>{es ? 'Procesar y analizar las respuestas de encuestas mediante NLP.' : 'Process and analyze survey responses using NLP.'}</li>
        <li>{es ? 'Enviarte actualizaciones del producto y comunicaciones de marketing (puedes cancelar en cualquier momento).' : 'Send you product updates and marketing communications (you may opt out at any time).'}</li>
        <li>{es ? 'Mejorar el Servicio y desarrollar nuevas funcionalidades.' : 'Improve the Service and develop new features.'}</li>
        <li>{es ? 'Cumplir con obligaciones legales.' : 'Comply with legal obligations.'}</li>
      </ul>

      <h2>{es ? '3. Compartir información' : '3. Information Sharing'}</h2>
      <p>
        {es
          ? 'No vendemos, comercializamos ni transferimos tu información personal a terceros, salvo en los siguientes casos: proveedores de servicios que nos asisten en la operación del Servicio (bajo acuerdos de confidencialidad), cuando sea requerido por ley, o para proteger los derechos y la seguridad de Pooly y sus usuarios.'
          : 'We do not sell, trade, or transfer your personal information to third parties, except: service providers who assist in operating the Service (under confidentiality agreements), when required by law, or to protect the rights and safety of Pooly and its users.'}
      </p>

      <h2>{es ? '4. Seguridad de los datos' : '4. Data Security'}</h2>
      <p>
        {es
          ? 'Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger tu información personal contra acceso no autorizado, alteración, divulgación o destrucción. Las contraseñas se almacenan con hash criptográfico y las comunicaciones se cifran mediante TLS.'
          : 'We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Passwords are stored with cryptographic hashing and communications are encrypted via TLS.'}
      </p>

      <h2>{es ? '5. Retención de datos' : '5. Data Retention'}</h2>
      <p>
        {es
          ? 'Conservamos tu información mientras tu cuenta esté activa o sea necesaria para prestarte el Servicio. Puedes solicitar la eliminación de tu cuenta y datos en cualquier momento contactándonos.'
          : 'We retain your information for as long as your account is active or as needed to provide the Service. You may request deletion of your account and data at any time by contacting us.'}
      </p>

      <h2>{es ? '6. Tus derechos' : '6. Your Rights'}</h2>
      <p>{es ? 'Tienes derecho a:' : 'You have the right to:'}</p>
      <ul>
        <li>{es ? 'Acceder a los datos personales que tenemos sobre ti.' : 'Access the personal data we hold about you.'}</li>
        <li>{es ? 'Solicitar la corrección de datos inexactos.' : 'Request correction of inaccurate data.'}</li>
        <li>{es ? 'Solicitar la eliminación de tus datos.' : 'Request deletion of your data.'}</li>
        <li>{es ? 'Oponerte al procesamiento de tus datos.' : 'Object to the processing of your data.'}</li>
        <li>{es ? 'Cancelar la suscripción a comunicaciones de marketing.' : 'Opt out of marketing communications.'}</li>
      </ul>

      <h2>{es ? '7. Cookies' : '7. Cookies'}</h2>
      <p>
        {es
          ? 'Utilizamos cookies de sesión esenciales para autenticación y preferencias del usuario (como el idioma seleccionado). No utilizamos cookies de seguimiento de terceros para publicidad.'
          : 'We use essential session cookies for authentication and user preferences (such as selected language). We do not use third-party tracking cookies for advertising.'}
      </p>

      <h2>{es ? '8. Cambios a este aviso' : '8. Changes to This Notice'}</h2>
      <p>
        {es
          ? 'Podemos actualizar este Aviso de Privacidad periódicamente. Te notificaremos sobre cambios significativos publicando el nuevo aviso en esta página y actualizando la fecha de vigencia.'
          : 'We may update this Privacy Notice periodically. We will notify you of significant changes by posting the new notice on this page and updating the effective date.'}
      </p>

      <h2>{es ? '9. Contacto' : '9. Contact'}</h2>
      <p>
        {es
          ? 'Para ejercer tus derechos o realizar consultas sobre privacidad, contáctanos en: '
          : 'To exercise your rights or make privacy inquiries, contact us at: '}
        <a href="mailto:hello@pooly.app">hello@pooly.app</a>
      </p>
    </div>
  );
};

export default PrivacyNotice;
