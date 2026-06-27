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
  // Phase 4 enriched fields
  categoria_carrera?: string;
  categoria_carrera_nombre?: string;
  company_tier?: number;
  skill_extraction_method?: string;
  // Full description (scraped from individual job page)
  descripcion_completa?: string;
  requisitos?: string[];
  beneficios?: string[];
  modalidad_detalle?: string;
}

export interface TopCompany {
  name: string;
  offer_count: number;
  tier: number;
  tier_name: string;
  avg_salary_usd: number;
}

export interface CareerCategory {
  id: string;
  name: string;
  description: string;
}

export interface CareerMetrics {
  _id?: string;
  titulo_carrera: string;
  nivel_referencia: string;
  region_mercado: string;
  salario_anual_usd: {
    min: number;
    max: number;
    promedio: number;
  };
  demanda_mercado: {
    volumen_total: number;
    tendencia: 'creciente' | 'estable' | 'decreciente';
  };
  analisis_competitivo: {
    top_empresas: string[];
  };
  aprendizaje: {
    habilidades_clave: string[];
    tiempo_estimado_upgrading_meses?: number;
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
  student_id: string;
  skills: string[];
  career_category?: string;
}

export interface MatchResult {
  score: number;
  habilidades_faltantes: string[];
  recomendaciones: string[];
}
