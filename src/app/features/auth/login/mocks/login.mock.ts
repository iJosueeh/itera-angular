import { LoginViewModel } from '@features/auth/interfaces/auth.interface';

export const LOGIN_VIEW_MODEL_MOCK: LoginViewModel = {
  productName: 'Itera',
  visualTag: 'Impulsado por IA',
  visualTitle: 'Encuentra tu carrera ideal en tech',
  visualSubtitle:
    'Analizamos miles de ofertas laborales para mostrarte las habilidades que realmente demandan las empresas.',
  visualBullets: [
    {
      title: '129 ofertas analizadas',
      description: 'Datos reales del mercado tech peruano actualizados diariamente.',
      icon: 'bi bi-briefcase-fill',
    },
    {
      title: '17 carreras tech',
      description: 'Desde Desarrollo Backend hasta Ciencia de Datos e IA.',
      icon: 'bi bi-grid-3x3-gap-fill',
    },
    {
      title: '62 empresas TOP',
      description: 'Google, Amazon, BBVA, Globant, Mercado Libre y más.',
      icon: 'bi bi-building-check',
    },
  ],
  mentorQuote:
    'Comparar carreras por salario, demanda y crecimiento antes de elegir te ahorra meses de incertidumbre.',
  mentorName: 'Itera AI',
  formTitle: 'Bienvenido',
  formSubtitle: 'Continúa tu exploración profesional.',
  emailLabel: 'Correo electrónico',
  passwordLabel: 'Contraseña',
  forgotPasswordText: '¿Olvidaste tu contraseña?',
  primaryAction: 'Iniciar sesión',
  socialProviders: [],
  registerPrompt: '¿No tienes cuenta?',
  registerCta: 'Crea una gratis',
  footerLinks: [],
};
