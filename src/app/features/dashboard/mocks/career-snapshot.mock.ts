import { CareerSnapshot } from '../interfaces/dashboard.interface';

export const CAREER_SNAPSHOTS_MOCK: ReadonlyArray<CareerSnapshot> = [
  {
    career: 'Data Scientist',
    annualSalaryUsd: '$42k - $78k',
    demandLevel: 'Alta',
    marketGrowth: '+28% a 3 años',
    learningRoute: 'Fundamentos de datos -> Python -> SQL -> ML aplicado',
    profileFit: 'Analitico, orientado a experimentacion y negocio'
  },
  {
    career: 'Cloud Architect',
    annualSalaryUsd: '$55k - $98k',
    demandLevel: 'Muy alta',
    marketGrowth: '+31% a 3 años',
    learningRoute: 'Redes -> Cloud fundamentals -> DevOps -> Arquitectura empresarial',
    profileFit: 'Vision de sistemas, liderazgo tecnico y toma de decisiones'
  },
  {
    career: 'UX/UI Designer',
    annualSalaryUsd: '$30k - $60k',
    demandLevel: 'Alta',
    marketGrowth: '+22% a 3 años',
    learningRoute: 'Research -> UX writing -> UI systems -> Prototipado avanzado',
    profileFit: 'Empatia por el usuario y criterio visual'
  },
  {
    career: 'Backend Engineer',
    annualSalaryUsd: '$38k - $74k',
    demandLevel: 'Alta',
    marketGrowth: '+24% a 3 años',
    learningRoute: 'APIs -> Bases de datos -> Seguridad -> Escalabilidad',
    profileFit: 'Pensamiento logico y arquitectura de software'
  }
];

export const DEFAULT_CAREER_SNAPSHOT_MOCK: CareerSnapshot = {
  career: 'Ruta personalizada',
  annualSalaryUsd: '$35k - $70k',
  demandLevel: 'Media-Alta',
  marketGrowth: '+20% a 3 años',
  learningRoute: 'Diagnostico -> Fundamentos -> Especializacion -> Portafolio',
  profileFit: 'Basado en tus intereses y fortalezas actuales'
};
