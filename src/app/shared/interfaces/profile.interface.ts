export interface Skill {
  name: string;
  level: string; // e.g., 'beginner', 'intermediate', 'advanced'
}

export interface StudentProfile {
  id: string;
  userId: string;
  names: string;
  surnames: string;
  cycle: number;
  academicGoal: string;
  institutionId?: string;
  photo?: string;
  experience: number;
  skills: Skill[];
  badges?: any;
  roadmap?: any;
  projection?: any;
  recommendations?: any;
  matchScore?: {
    score: number;
    habilidades_faltantes: string[];
    recomendaciones: string[];
  };
}

export interface InitializeProfilePayload {
  userId: string;
  names: string;
  surnames: string;
  institutionId?: string;
}

export interface UpdateProfilePayload {
  userId: string;
  names?: string;
  surnames?: string;
  institutionId?: string;
  cycle?: number;
  skills?: Skill[];
  photo?: string;
  academicGoal?: string;
}
