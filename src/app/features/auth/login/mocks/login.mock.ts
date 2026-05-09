import { LoginViewModel } from '@features/auth/interfaces/auth.interface';

export const LOGIN_VIEW_MODEL_MOCK: LoginViewModel = {
  productName: 'Itera',
  visualTag: 'Itera AI',
  visualTitle: 'Desbloquea tu siguiente nivel profesional.',
  visualSubtitle:
    'Mentoria inteligente basada en datos. Compara carreras, define objetivos y avanza con claridad.',
  visualBullets: [
    {
      title: 'Mapa Cognitivo Adaptativo',
      description:
        'La plataforma ajusta recomendaciones segun tus fortalezas y brechas de habilidades.',
      icon: 'bi bi-lightbulb-fill',
    },
    {
      title: 'Rutas Predictivas de Aprendizaje',
      description:
        'Recibe un plan por etapas para alcanzar tu rol objetivo con eficiencia probada.',
      icon: 'bi bi-graph-up-arrow',
    },
  ],
  mentorQuote:
    'Tu mentor IA te acompana para comparar carreras por salario, demanda y crecimiento antes de elegir.',
  mentorName: 'Mentor Itera',
  formTitle: 'Bienvenido de Vuelta',
  formSubtitle: 'Continua tu evolucion profesional con Itera AI.',
  emailLabel: 'Correo Electronico',
  passwordLabel: 'Contraseña',
  forgotPasswordText: '¿Olvidaste tu contraseña?',
  primaryAction: 'Iniciar Sesion',
  socialProviders: [
    { label: 'Google', icon: 'bi bi-google' },
    { label: 'LinkedIn', icon: 'bi bi-linkedin' },
  ],
  registerPrompt: '¿Eres nuevo?',
  registerCta: 'Crea una cuenta',
  footerLinks: [
    { label: 'Política de Privacidad', href: '#' },
    { label: 'Términos de Servicio', href: '#' },
    { label: 'Configuración de Cookies', href: '#' },
  ],
};
