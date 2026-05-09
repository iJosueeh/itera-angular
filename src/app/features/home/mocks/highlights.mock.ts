import { FeatureCard, ProgressCard } from '@shared/interfaces/dashboard.interface';

export const FEATURE_CARDS_MOCK: ReadonlyArray<FeatureCard> = [
  {
    title: 'Comparativo de Carreras',
    description:
      'Compara roles por salario anual estimado, demanda laboral y crecimiento proyectado para decidir con evidencia.',
    icon: '✦',
    cta: 'Ver comparativo',
    tone: 'muted',
  },
  {
    title: 'Demanda y Tendencias',
    description:
      'Monitorea la demanda actual y las tendencias por carrera para priorizar habilidades con mayor impacto.',
    icon: '↗',
    tone: 'accent',
  },
  {
    title: 'Rutas de Aprendizaje',
    description:
      'Recibe rutas por etapas con objetivos, proyectos sugeridos y tiempo estimado para cada nivel.',
    icon: '✹',
    tone: 'neutral',
  },
  {
    title: 'Perfil Profesional',
    description:
      'Construye tu perfil con fortalezas, brechas de habilidades y recomendaciones accionables.',
    icon: '⋒',
    tone: 'neutral',
  },
  {
    title: 'Mentor IA 24/7',
    description:
      'Haz preguntas en cualquier momento y obtén recomendaciones personalizadas para tu meta profesional.',
    icon: '◍',
    tone: 'neutral',
  },
];

export const PROGRESS_CARD_MOCK: ProgressCard = {
  title: 'Indice de preparacion',
  description:
    'Mide cuanto avanzaste hacia la carrera objetivo segun habilidades clave del mercado.',
  progressLabel: 'Preparacion para rol objetivo',
  progressValue: 64,
};
