const { GoogleGenerativeAI } = require('@google/generative-ai');

// ─── Gemini AI Extractor ──────────────────────────────
async function extractSkillsAI(resumeText) {
  try {
    const genAI  = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model  = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a professional resume skill extractor.

Extract ONLY the technical skills explicitly mentioned in this resume.

Rules:
- Only extract skills CLEARLY mentioned in the resume
- Do NOT infer or guess skills not written
- Do NOT add skills from certificate names unless they are actual skills
- Include: programming languages, frameworks, libraries, tools, databases, platforms, concepts
- Exclude: soft skills, university names, company names, job titles, city names
- Return ONLY a valid JSON array of strings, nothing else
- Example output: ["React", "Node.js", "MongoDB", "Docker", "JWT"]

Resume text:
${resumeText}`;

    const result   = await model.generateContent(prompt);
    const response = await result.response;
    const text     = response.text().trim();

    console.log('🤖 Gemini raw response:', text.substring(0, 200));

    // Extract JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const skills = JSON.parse(jsonMatch[0]);
      console.log('✅ AI Skills extracted:', skills);
      return skills;
    }

    console.log('⚠️ Could not parse AI response, using regex fallback');
    return extractSkillsRegex(resumeText);

  } catch (err) {
    console.error('❌ Gemini AI failed:', err.message);
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
  const foundSkills    = new Set();

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
async function extractSkills(text) {
  if (process.env.GEMINI_API_KEY) {
    return await extractSkillsAI(text);
  }
  console.log('⚠️ No AI key found, using regex');
  return extractSkillsRegex(text);
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