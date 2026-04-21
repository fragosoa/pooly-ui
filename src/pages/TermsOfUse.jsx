import { useLanguage } from '../context/LanguageContext';

const TermsOfUse = () => {
  const { language } = useLanguage();
  const es = language === 'es';

  return (
    <div className="legal-page">
      <h1>{es ? 'Términos de Uso' : 'Terms of Use'}</h1>
      <p className="legal-meta">{es ? 'Última actualización: abril 2026' : 'Last updated: April 2026'}</p>

      <h2>{es ? '1. Aceptación de los términos' : '1. Acceptance of Terms'}</h2>
      <p>
        {es
          ? 'Al acceder o utilizar Pooly ("el Servicio"), aceptas estar vinculado por estos Términos de Uso. Si no estás de acuerdo con alguna parte de estos términos, no podrás acceder al Servicio.'
          : 'By accessing or using Pooly ("the Service"), you agree to be bound by these Terms of Use. If you disagree with any part of these terms, you may not access the Service.'}
      </p>

      <h2>{es ? '2. Descripción del Servicio' : '2. Description of Service'}</h2>
      <p>
        {es
          ? 'Pooly es una plataforma de encuestas asistida por inteligencia artificial que permite a las organizaciones recopilar respuestas abiertas de sus participantes y obtener insights automatizados mediante análisis de procesamiento de lenguaje natural (NLP).'
          : 'Pooly is an AI-assisted survey platform that enables organizations to collect open-ended responses from participants and obtain automated insights through natural language processing (NLP) analysis.'}
      </p>

      <h2>{es ? '3. Cuentas de usuario' : '3. User Accounts'}</h2>
      <p>
        {es
          ? 'Al crear una cuenta, debes proporcionar información precisa y completa. Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran bajo tu cuenta.'
          : 'When creating an account, you must provide accurate and complete information. You are responsible for maintaining the confidentiality of your password and for all activities that occur under your account.'}
      </p>

      <h2>{es ? '4. Uso aceptable' : '4. Acceptable Use'}</h2>
      <p>{es ? 'Aceptas no utilizar el Servicio para:' : 'You agree not to use the Service to:'}</p>
      <ul>
        <li>{es ? 'Recopilar datos de forma fraudulenta o engañosa.' : 'Collect data in a fraudulent or deceptive manner.'}</li>
        <li>{es ? 'Enviar contenido ilegal, ofensivo o que viole derechos de terceros.' : 'Submit illegal, offensive content or content that violates third-party rights.'}</li>
        <li>{es ? 'Intentar acceder sin autorización a sistemas o cuentas de otros usuarios.' : 'Attempt unauthorized access to systems or other users\' accounts.'}</li>
        <li>{es ? 'Interferir con el funcionamiento del Servicio.' : 'Interfere with the operation of the Service.'}</li>
      </ul>

      <h2>{es ? '5. Propiedad intelectual' : '5. Intellectual Property'}</h2>
      <p>
        {es
          ? 'El Servicio y su contenido original, características y funcionalidades son y seguirán siendo propiedad exclusiva de Pooly y sus licenciantes. Los datos de encuestas creados por los usuarios permanecen como propiedad del usuario.'
          : 'The Service and its original content, features, and functionality are and will remain the exclusive property of Pooly and its licensors. Survey data created by users remains the property of the user.'}
      </p>

      <h2>{es ? '6. Limitación de responsabilidad' : '6. Limitation of Liability'}</h2>
      <p>
        {es
          ? 'En ningún caso Pooly será responsable de daños indirectos, incidentales, especiales, consecuentes o punitivos, incluyendo la pérdida de beneficios, datos u otras pérdidas intangibles, resultantes del uso o la imposibilidad de uso del Servicio.'
          : 'In no event shall Pooly be liable for any indirect, incidental, special, consequential or punitive damages, including loss of profits, data or other intangible losses, resulting from your use or inability to use the Service.'}
      </p>

      <h2>{es ? '7. Modificaciones' : '7. Changes to Terms'}</h2>
      <p>
        {es
          ? 'Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación. El uso continuado del Servicio después de los cambios constituye la aceptación de los nuevos términos.'
          : 'We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Continued use of the Service after changes constitutes acceptance of the new terms.'}
      </p>

      <h2>{es ? '8. Contacto' : '8. Contact'}</h2>
      <p>
        {es
          ? 'Si tienes alguna pregunta sobre estos Términos de Uso, contáctanos en: '
          : 'If you have any questions about these Terms of Use, contact us at: '}
        <a href="mailto:hello@pooly.app">hello@pooly.app</a>
      </p>
    </div>
  );
};

export default TermsOfUse;
