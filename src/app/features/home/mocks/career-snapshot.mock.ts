import { CareerSnapshot } from '@shared/interfaces/dashboard.interface';

export const CAREER_SNAPSHOTS_MOCK: ReadonlyArray<CareerSnapshot> = [
  {
    career: 'Data Scientist',
    annualSalaryUsd: '$42k - $78k',
    growthYoY: '+28% de crecimiento anual',
    demandLevel: 'Alta',
    demandMomentum: 'Alto impulso',
    profileFit: '85%',
    alignmentDescription: 'Analítico, orientado a experimentación y negocio',
  },
  {
    career: 'Cloud Architect',
    annualSalaryUsd: '$55k - $98k',
    growthYoY: '+31% de crecimiento anual',
    demandLevel: 'Muy alta',
    demandMomentum: 'Mercado crítico',
    profileFit: '72%',
    alignmentDescription: 'Visión de sistemas, liderazgo técnico y toma de decisiones',
  },
  {
    career: 'UX/UI Designer',
    annualSalaryUsd: '$30k - $60k',
    growthYoY: '+22% de crecimiento anual',
    demandLevel: 'Alta',
    demandMomentum: 'Tendencia creciente',
    profileFit: '90%',
    alignmentDescription: 'Empatía por el usuario y criterio visual',
  },
  {
    career: 'Backend Engineer',
    annualSalaryUsd: '$38k - $74k',
    growthYoY: '+24% de crecimiento anual',
    demandLevel: 'Alta',
    demandMomentum: 'Alto impulso',
    profileFit: '78%',
    alignmentDescription: 'Pensamiento lógico y arquitectura de software',
  },
];

export const DEFAULT_CAREER_SNAPSHOT_MOCK: CareerSnapshot = {
  career: 'Ruta personalizada',
  annualSalaryUsd: '$35k - $70k',
  growthYoY: '+20% de crecimiento anual',
  demandLevel: 'Media-Alta',
  demandMomentum: 'Mercado estable',
  profileFit: '64%',
  alignmentDescription: 'Basado en tus intereses y fortalezas actuales',
};
