import { RegisterViewModel } from '../../interfaces/auth.interface';

export const REGISTER_VIEW_MODEL_MOCK: RegisterViewModel = {
  productName: 'Itera',
  visualSubtitle: 'Acelera tu progreso con mentoria impulsada por IA y decisiones de carrera basadas en datos.',
  visualBullets: [
    {
      title: 'Mentoria IA 24/7',
      description: 'Acompanamiento continuo para resolver dudas y definir tu siguiente paso profesional.',
      icon: 'bi bi-stars'
    },
    {
      title: 'Rutas Personalizadas',
      description: 'Planes dinamicos alineados a demanda laboral, tendencias y objetivos salariales.',
      icon: 'bi bi-signpost-split-fill'
    },
    {
      title: 'Analisis de Brechas',
      description: 'Detecta deficit de habilidades y prioriza aprendizaje sin esfuerzo desperdiciado.',
      icon: 'bi bi-activity'
    }
  ],
  mentorQuote:
    '¿Listo para comenzar? Te prepararemos un diagnostico inicial y un comparativo entre carreras afines a tu perfil.',
  mentorName: 'Mentor Itera',
  formEyebrow: 'El viaje comienza aqui',
  formTitle: 'Crea tu cuenta',
  formSubtitle: 'Unete a una comunidad que aprende por objetivos, datos y resultados reales.',
  fullNameLabel: 'Nombre Completo',
  emailLabel: 'Correo Electronico',
  passwordLabel: 'Contraseña',
  passwordHint: 'Minimo 8 caracteres con letras y numeros.',
  primaryAction: 'Crear Cuenta',
  socialProviders: [
    { label: 'Google', icon: 'bi bi-google' },
    { label: 'LinkedIn', icon: 'bi bi-linkedin' }
  ],
  loginPrompt: '¿Ya tienes cuenta?',
  loginCta: 'Inicia sesion aqui',
  footerLinks: [
    { label: 'Centro de Ayuda', href: '#' },
    { label: 'Contacto', href: '#' },
    { label: 'Política de Privacidad', href: '#' }
  ]
};
