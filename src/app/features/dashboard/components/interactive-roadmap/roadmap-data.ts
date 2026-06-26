export type RoadmapStatus = 'completed' | 'in-progress' | 'planned' | 'attention';

export interface RoadmapNode {
  id: string;
  name: string;
  description: string;
  duration: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  status: RoadmapStatus;
  icon: string;
  resources?: string[];
}

export interface RoadmapPath {
  goal: string;
  title: string;
  subtitle: string;
  color: string;
  nodes: RoadmapNode[];
}

export const ROADMAP_PATHS: Record<string, RoadmapPath> = {
  Backend: {
    goal: 'Backend',
    title: 'Ruta Desarrollo Backend',
    subtitle: 'Domina el desarrollo del lado del servidor',
    color: '#6366f1',
    nodes: [
      {
        id: 'fundamentos-programacion',
        name: 'Fundamentos de Programación',
        description: 'Variables, tipos de datos, control de flujo, funciones',
        duration: '3 semanas',
        difficulty: 'basic',
        status: 'completed',
        icon: 'bi-code',
      },
      {
        id: 'estructuras-datos',
        name: 'Estructuras de Datos',
        description: 'Arrays, listas, árboles, grafos, hashing',
        duration: '4 semanas',
        difficulty: 'intermediate',
        status: 'in-progress',
        icon: 'bi-diagram-3',
      },
      {
        id: 'algoritmos',
        name: 'Algoritmos Avanzados',
        description: 'Ordenamiento, búsqueda, recursión, programación dinámica',
        duration: '4 semanas',
        difficulty: 'advanced',
        status: 'planned',
        icon: 'bi-brain',
      },
      {
        id: 'bases-datos',
        name: 'Bases de Datos',
        description: 'SQL, PostgreSQL, MongoDB, ORM',
        duration: '3 semanas',
        difficulty: 'intermediate',
        status: 'planned',
        icon: 'bi-database',
      },
      {
        id: 'apis-rest',
        name: 'APIs RESTful',
        description: 'Diseño, autenticación, documentación',
        duration: '2 semanas',
        difficulty: 'intermediate',
        status: 'planned',
        icon: 'bi-cloud-arrow-up',
      },
      {
        id: 'frameworks-backend',
        name: 'Frameworks Backend',
        description: 'Node.js, Express, FastAPI, Django',
        duration: '4 semanas',
        difficulty: 'advanced',
        status: 'planned',
        icon: 'bi-box-seam',
      },
      {
        id: 'devops-basico',
        name: 'DevOps Básico',
        description: 'Docker, Git, CI/CD, Linux',
        duration: '3 semanas',
        difficulty: 'intermediate',
        status: 'planned',
        icon: 'bi-git',
      },
    ],
  },
  AI: {
    goal: 'AI',
    title: 'Ruta Ciencia de Datos e IA',
    subtitle: 'Domina la inteligencia artificial y machine learning',
    color: '#8b5cf6',
    nodes: [
      {
        id: 'python-basico',
        name: 'Python para Datos',
        description: 'Sintaxis, librerías, Jupyter notebooks',
        duration: '2 semanas',
        difficulty: 'basic',
        status: 'completed',
        icon: 'bi-filetype-py',
      },
      {
        id: 'matematicas-ia',
        name: 'Matemáticas para IA',
        description: 'Álgebra lineal, probabilidad, estadística',
        duration: '4 semanas',
        difficulty: 'advanced',
        status: 'in-progress',
        icon: 'bi-calculator',
      },
      {
        id: 'machine-learning',
        name: 'Machine Learning',
        description: 'Regresión, clasificación, clustering, sklearn',
        duration: '5 semanas',
        difficulty: 'advanced',
        status: 'planned',
        icon: 'bi-robot',
      },
      {
        id: 'deep-learning',
        name: 'Deep Learning',
        description: 'Redes neuronales, TensorFlow, PyTorch',
        duration: '5 semanas',
        difficulty: 'advanced',
        status: 'planned',
        icon: 'bi-cpu',
      },
      {
        id: 'nlp',
        name: 'Procesamiento de Lenguaje',
        description: 'NLP, transformers, BERT, GPT',
        duration: '4 semanas',
        difficulty: 'advanced',
        status: 'planned',
        icon: 'bi-chat-dots',
      },
      {
        id: 'proyectos-ia',
        name: 'Proyectos de IA',
        description: 'Aplicar IA a problemas reales',
        duration: '4 semanas',
        difficulty: 'advanced',
        status: 'planned',
        icon: 'bi-rocket-takeoff',
      },
    ],
  },
  Cloud: {
    goal: 'Cloud',
    title: 'Ruta DevOps y Cloud',
    subtitle: 'Infraestructura moderna y despliegue continuo',
    color: '#0ea5e9',
    nodes: [
      {
        id: 'linux-basico',
        name: 'Linux Fundamentals',
        description: 'Comandos, shell scripting, permisos',
        duration: '2 semanas',
        difficulty: 'basic',
        status: 'completed',
        icon: 'bi-terminal',
      },
      {
        id: 'git-github',
        name: 'Git & GitHub',
        description: 'Control de versiones, branching, workflows',
        duration: '1 semana',
        difficulty: 'basic',
        status: 'completed',
        icon: 'bi-git',
      },
      {
        id: 'docker',
        name: 'Docker & Containers',
        description: 'Imágenes,Compose, Docker Hub',
        duration: '3 semanas',
        difficulty: 'intermediate',
        status: 'in-progress',
        icon: 'bi-box',
      },
      {
        id: 'kubernetes',
        name: 'Kubernetes',
        description: 'Pods, services, deployments, Helm',
        duration: '4 semanas',
        difficulty: 'advanced',
        status: 'planned',
        icon: 'bi-cloud',
      },
      {
        id: 'ci-cd',
        name: 'CI/CD Pipelines',
        description: 'Jenkins, GitHub Actions, GitLab CI',
        duration: '3 semanas',
        difficulty: 'intermediate',
        status: 'planned',
        icon: 'bi-arrow-repeat',
      },
      {
        id: 'terraform',
        name: 'Infrastructure as Code',
        description: 'Terraform, Ansible, CloudFormation',
        duration: '4 semanas',
        difficulty: 'advanced',
        status: 'planned',
        icon: 'bi-gear',
      },
      {
        id: 'monitoring',
        name: 'Monitoring & Logging',
        description: 'Prometheus, Grafana, ELK Stack',
        duration: '2 semanas',
        difficulty: 'intermediate',
        status: 'planned',
        icon: 'bi-graph-up',
      },
    ],
  },
  Frontend: {
    goal: 'Frontend',
    title: 'Ruta Desarrollo Frontend',
    subtitle: 'Construye interfaces modernas y responsivas',
    color: '#06b6d4',
    nodes: [
      {
        id: 'html-css',
        name: 'HTML & CSS',
        description: 'Semántica, flexbox, grid, responsive',
        duration: '3 semanas',
        difficulty: 'basic',
        status: 'completed',
        icon: 'bi-palette',
      },
      {
        id: 'javascript-avanzado',
        name: 'JavaScript Avanzado',
        description: 'ES6+, async/await, closures, prototypes',
        duration: '4 semanas',
        difficulty: 'intermediate',
        status: 'in-progress',
        icon: 'bi-filetype-js',
      },
      {
        id: 'typescript',
        name: 'TypeScript',
        description: 'Tipos, interfaces, genéricos',
        duration: '2 semanas',
        difficulty: 'intermediate',
        status: 'planned',
        icon: 'bi-file-code',
      },
      {
        id: 'react-vue',
        name: 'Frameworks Modernos',
        description: 'React o Vue.js, componentes, hooks',
        duration: '5 semanas',
        difficulty: 'intermediate',
        status: 'planned',
        icon: 'bi Layout-three-columns',
      },
      {
        id: 'state-management',
        name: 'State Management',
        description: 'Redux, Pinia, Context API',
        duration: '3 semanas',
        difficulty: 'intermediate',
        status: 'planned',
        icon: 'bi-stack',
      },
      {
        id: 'testing',
        name: 'Testing & Debugging',
        description: 'Unit tests, e2e, debugging tools',
        duration: '2 semanas',
        difficulty: 'intermediate',
        status: 'planned',
        icon: 'bi-bug',
      },
      {
        id: 'optimizacion',
        name: 'Performance & SEO',
        description: 'Bundle optimization, lazy loading',
        duration: '2 semanas',
        difficulty: 'advanced',
        status: 'planned',
        icon: 'bi-lightning',
      },
    ],
  },
  General: {
    goal: 'General',
    title: 'Ruta General Tech',
    subtitle: 'Fundamentos para cualquier área tech',
    color: '#64748b',
    nodes: [
      {
        id: 'logica-programacion',
        name: 'Lógica de Programación',
        description: 'Pensamiento algorítmico, pseudocódigo',
        duration: '2 semanas',
        difficulty: 'basic',
        status: 'completed',
        icon: 'bi-diagram-2',
      },
      {
        id: 'fundamentos-web',
        name: 'Fundamentos Web',
        description: 'Cómo funciona internet, HTTP, browsers',
        duration: '1 semana',
        difficulty: 'basic',
        status: 'completed',
        icon: 'bi-globe',
      },
      {
        id: 'git-basico',
        name: 'Git Básico',
        description: 'Commits, branches, merge',
        duration: '1 semana',
        difficulty: 'basic',
        status: 'in-progress',
        icon: 'bi-git',
      },
      {
        id: 'bases-datos-conceptos',
        name: 'Conceptos de BD',
        description: 'SQL básico, normalización',
        duration: '2 semanas',
        difficulty: 'intermediate',
        status: 'planned',
        icon: 'bi-database',
      },
      {
        id: 'apis-conceptos',
        name: 'APIs y Servicios',
        description: 'REST, JSON, autenticación básica',
        duration: '2 semanas',
        difficulty: 'intermediate',
        status: 'planned',
        icon: 'bi-cloud-arrow-up',
      },
      {
        id: 'seguridad-basica',
        name: 'Seguridad Básica',
        description: 'OWASP top 10, HTTPS, passwords',
        duration: '2 semanas',
        difficulty: 'intermediate',
        status: 'planned',
        icon: 'bi-shield-check',
      },
    ],
  },
};

// Default fallback path
export const DEFAULT_ROADMAP: RoadmapPath = ROADMAP_PATHS['General'];

export function getRoadmapForGoal(goal: string | undefined): RoadmapPath {
  if (!goal) return DEFAULT_ROADMAP;
  return ROADMAP_PATHS[goal] || DEFAULT_ROADMAP;
}
