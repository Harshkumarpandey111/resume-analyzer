const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// ─── AI Skill Extractor ───────────────────────────────
async function extractSkillsAI(resumeText) {
  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a professional resume skill extractor.

Extract ONLY the technical skills explicitly mentioned in this resume.
Rules:
- Only extract skills that are CLEARLY mentioned
- Do NOT infer or guess skills
- Do NOT add skills from certificates unless they are actual skills
- Include: programming languages, frameworks, libraries, tools, databases, cloud platforms, concepts
- Exclude: soft skills, university names, company names, job titles
- Return ONLY a JSON array of skill strings, nothing else
- Example: ["React", "Node.js", "MongoDB", "Docker"]

Resume text:
${resumeText}`
        }
      ]
    });

    const responseText = message.content[0].text.trim();

    // Parse JSON response
    const jsonMatch = responseText.match(/\[.*\]/s);
    if (jsonMatch) {
      const skills = JSON.parse(jsonMatch[0]);
      console.log('🤖 AI extracted skills:', skills);
      return skills;
    }

    return [];
  } catch (err) {
    console.error('❌ AI extraction failed:', err.message);
    // Fallback to regex if AI fails
    return extractSkillsRegex(resumeText);
  }
}

// ─── Fallback Regex Extractor ─────────────────────────
const SKILLS_DATABASE = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C', 'C++', 'C#',
  'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'Dart', 'Scala',
  'React', 'Angular', 'Vue', 'Next.js', 'Nuxt.js', 'Svelte',
  'HTML', 'CSS', 'SCSS', 'Sass', 'Tailwind', 'Bootstrap',
  'Redux', 'jQuery', 'Ionic', 'Webpack', 'Vite',
  'Node.js', 'Express', 'Django', 'Flask', 'FastAPI',
  'Spring Boot', 'Laravel', 'Rails', 'ASP.NET',
  'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Oracle',
  'Redis', 'Firebase', 'Supabase', 'DynamoDB', 'DBMS', 'SQL',
  'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes',
  'CI/CD', 'Jenkins', 'GitHub Actions', 'Linux', 'Nginx',
  'Cloud Computing', 'Terraform', 'Ansible',
  'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Pandas',
  'NumPy', 'OpenCV', 'NLP', 'MLOps',
  'React Native', 'Flutter', 'Android', 'iOS',
  'Git', 'GitHub', 'Figma', 'Jira', 'GraphQL', 'REST API',
  'Postman', 'Local Storage', 'JWT',
];

const ALIASES = {
  'nodejs': 'Node.js', 'node js': 'Node.js', 'node.js': 'Node.js',
  'reactjs': 'React', 'react.js': 'React', 'react js': 'React',
  'angularjs': 'Angular', 'vuejs': 'Vue', 'nextjs': 'Next.js',
  'postgres': 'PostgreSQL', 'mongo': 'MongoDB',
  'javascript': 'JavaScript', 'typescript': 'TypeScript',
  'python3': 'Python', 'cpp': 'C++', 'csharp': 'C#',
  'aws': 'AWS', 'gcp': 'GCP', 'rest': 'REST API',
  'restful': 'REST API', 'tailwindcss': 'Tailwind',
  'scss': 'SCSS', 'ci/cd': 'CI/CD',
  'cloud computing': 'Cloud Computing',
  'local storage': 'Local Storage',
  'spring boot': 'Spring Boot',
  'react native': 'React Native',
};

function extractSkillsRegex(text) {
  if (!text) return [];
  const normalizedText = text.toLowerCase();
  const foundSkills = new Set();

  Object.entries(ALIASES).forEach(([alias, canonical]) => {
    if (normalizedText.includes(alias.toLowerCase())) {
      foundSkills.add(canonical);
    }
  });

  SKILLS_DATABASE.forEach(skill => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

// ─── Main Export ──────────────────────────────────────
// Use AI if API key exists, else use regex
async function extractSkills(text) {
  if (process.env.ANTHROPIC_API_KEY) {
    return await extractSkillsAI(text);
  }
  return extractSkillsRegex(text);
}

// ─── Score Calculator (unchanged) ────────────────────
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