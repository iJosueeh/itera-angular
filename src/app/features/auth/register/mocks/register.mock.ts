import { RegisterViewModel } from '@features/auth/interfaces/auth.interface';

export const REGISTER_VIEW_MODEL_MOCK: RegisterViewModel = {
  productName: 'Itera',
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
  formEyebrow: 'Impulsado por IA',
  formTitle: 'Crea tu cuenta',
  formSubtitle: 'Explora carreras tech con datos reales del mercado.',
  fullNameLabel: 'Nombre completo',
  emailLabel: 'Correo electrónico',
  passwordLabel: 'Contraseña',
  passwordHint: 'Mínimo 8 caracteres.',
  primaryAction: 'Crear cuenta',
  socialProviders: [],
  loginPrompt: '¿Ya tienes cuenta?',
  loginCta: 'Inicia sesión',
  footerLinks: [],
};
