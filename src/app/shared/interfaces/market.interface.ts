export interface JobOffer {
  _id?: string;
  puesto: string;
  empresa: string;
  fuente: string;
  url_origen: string;
  nivel_experiencia?: string;
  modalidad?: string;
  ubicacion_geografica?: Record<string, any>;
  salario_original?: Record<string, any>;
  salario_normalizado_usd?: number;
  habilidades_requeridas: string[];
  fecha_expiracion?: string;
}

export interface CareerMetrics {
  _id?: string;
  titulo_carrera: string;
  nivel_referencia: string;
  region_mercado: string;
  salario_anual_usd: {
    min: number;
    max: number;
    mediana: number;
    moneda: string;
  };
  demanda_mercado: {
    nivel: 'bajo' | 'medio' | 'alto' | 'crítico';
    tendencia: 'creciente' | 'estable' | 'decreciente';
    vacantes_estimadas: number;
  };
  analisis_competitivo: {
    dificultad_entrada: number; // 1-10
    competencia_por_vacante: number;
  };
  aprendizaje: {
    habilidades_top: string[];
    certificaciones_valoradas: string[];
    tiempo_estimado_upgrading_meses: number;
  };
  ultima_actualizacion: string;
}

export interface MarketSkill {
  _id?: string;
  habilidad: string;
  sinonimos: string[];
  tipo_habilidad: string;
  demanda_actual: number;
  tendencia_mensual: string;
}

export interface MatchRequest {
  estudiante_id: string;
  vector_perfil: number[];
  objetivo: string;
}

export interface MatchResult {
  score: number;
  habilidades_faltantes: string[];
  recomendaciones: string[];
}
