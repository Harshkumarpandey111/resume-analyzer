// ─── Master Skills List ───────────────────────────────
const SKILLS_DATABASE = [
  // Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C', 'C++', 'C#',
  'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'Dart', 'Scala',
  'R', 'MATLAB', 'Bash', 'Shell',

  // Frontend
  'React', 'Angular', 'Vue', 'Next.js', 'Nuxt.js', 'Svelte',
  'HTML', 'CSS', 'SCSS', 'Sass', 'Tailwind', 'Bootstrap',
  'Redux', 'jQuery', 'Ionic', 'Webpack', 'Vite',

  // Backend
  'Node.js', 'Express', 'Django', 'Flask', 'FastAPI',
  'Spring Boot', 'Laravel', 'Rails', 'ASP.NET',

  // Databases
  'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Oracle',
  'Redis', 'Firebase', 'Supabase', 'DynamoDB', 'DBMS', 'SQL', 'NoSQL',

  // Cloud & DevOps
  'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes',
  'CI/CD', 'Jenkins', 'GitHub Actions', 'Linux', 'Nginx',
  'Cloud Computing', 'Terraform', 'Ansible',

  // AI / ML
  'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Pandas',
  'NumPy', 'OpenCV', 'NLP', 'MLOps', 'Machine Learning',
  'Deep Learning', 'Computer Vision',

  // Mobile
  'React Native', 'Flutter', 'Android', 'iOS',

  // Tools
  'Git', 'GitHub', 'Figma', 'Jira', 'GraphQL', 'REST API',
  'Postman', 'Local Storage', 'DBMS',
];

// ─── Aliases ──────────────────────────────────────────
// Catches every variation someone might write on a CV
const ALIASES = {
  // Node
  'nodejs':               'Node.js',
  'node js':              'Node.js',
  'node.js':              'Node.js',
  // React
  'reactjs':              'React',
  'react.js':             'React',
  'react js':             'React',
  // Angular
  'angularjs':            'Angular',
  'angular.js':           'Angular',
  // Vue
  'vuejs':                'Vue',
  'vue.js':               'Vue',
  // Next
  'nextjs':               'Next.js',
  'next js':              'Next.js',
  // Databases
  'postgres':             'PostgreSQL',
  'postgresql':           'PostgreSQL',
  'mongo':                'MongoDB',
  'mongodb':              'MongoDB',
  'mysql':                'MySQL',
  'my sql':               'MySQL',
  // Languages
  'javascript':           'JavaScript',
  'js':                   'JavaScript',
  'typescript':           'TypeScript',
  'ts':                   'TypeScript',
  'python':               'Python',
  'python3':              'Python',
  'py':                   'Python',
  'c++':                  'C++',
  'cpp':                  'C++',
  'c plus plus':          'C++',
  'c#':                   'C#',
  'csharp':               'C#',
  'c sharp':              'C#',
  // Cloud
  'amazon web services':  'AWS',
  'google cloud':         'GCP',
  'google cloud platform':'GCP',
  'microsoft azure':      'Azure',
  // .NET
  'dotnet':               'ASP.NET',
  '.net':                 'ASP.NET',
  'asp.net':              'ASP.NET',
  // REST
  'rest':                 'REST API',
  'restful':              'REST API',
  'rest api':             'REST API',
  'restful api':          'REST API',
  // ML
  'ml':                   'Machine Learning',
  'machine learning':     'Machine Learning',
  'dl':                   'Deep Learning',
  'deep learning':        'Deep Learning',
  'nlp':                  'NLP',
  'scikit':               'Scikit-learn',
  'sklearn':              'Scikit-learn',
  // CSS
  'tailwindcss':          'Tailwind',
  'tailwind css':         'Tailwind',
  'scss':                 'SCSS',
  // CI/CD
  'ci/cd':                'CI/CD',
  'cicd':                 'CI/CD',
  // Other
  'ionic':                'Ionic',
  'flutter':              'Flutter',
  'react native':         'React Native',
  'dbms':                 'DBMS',
  'cloud computing':      'Cloud Computing',
  'local storage':        'Local Storage',
  'github actions':       'GitHub Actions',
  'spring boot':          'Spring Boot',
  'fast api':             'FastAPI',
  'fastapi':              'FastAPI',
};

// ─── Main Extract Function ────────────────────────────
function extractSkills(text) {
  if (!text) return [];

  // Normalize to lowercase for all comparisons
  const normalizedText = text.toLowerCase();
  const foundSkills    = new Set();

  // 1. Check all aliases first (widest net)
  Object.entries(ALIASES).forEach(([alias, canonical]) => {
    if (normalizedText.includes(alias.toLowerCase())) {
      foundSkills.add(canonical);
    }
  });

  // 2. Check main skill database with flexible boundary matching
  SKILLS_DATABASE.forEach(skill => {
    // Escape special regex chars like . + * ( )
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match skill even if surrounded by punctuation, spaces, newlines
    const pattern = new RegExp(
      `(^|[\\s,;:\\-\\/\\(\\)\\[\\]])${escaped}([\\s,;:\\-\\/\\(\\)\\[\\]]|$)`,
      'i'
    );
    if (pattern.test(normalizedText)) {
      foundSkills.add(skill);
    }
  });

  return [...foundSkills].sort();
}

// ─── Score Calculator ─────────────────────────────────
function calculateMatchScore(resumeSkills, jobSkills) {
  if (!jobSkills || jobSkills.length === 0) {
    return { score: 0, matched: [], missingSkills: [] };
  }

  const resumeLower   = resumeSkills.map(s => s.toLowerCase());
  const matched       = jobSkills.filter(s => resumeLower.includes(s.toLowerCase()));
  const missingSkills = jobSkills.filter(s => !resumeLower.includes(s.toLowerCase()));
  const score         = Math.round((matched.length / jobSkills.length) * 100);

  return { score, matched, missingSkills };
}

module.exports = { extractSkills, calculateMatchScore };