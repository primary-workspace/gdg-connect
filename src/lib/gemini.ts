import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import { Profile, LearningPath, QuizSubmission } from '@/lib/supabase'

const apiKey = import.meta.env.VITE_GEMINI_API_KEY

if (!apiKey || apiKey === 'YOUR_API_KEY') {
  console.warn('Gemini API key not configured. AI features will be disabled.')
}

const genAI = apiKey && apiKey !== 'YOUR_API_KEY' ? new GoogleGenerativeAI(apiKey) : null

const generationConfig = {
  temperature: 0.7,
  topK: 1,
  topP: 1,
  maxOutputTokens: 8192,
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const parseJsonFromText = (text: string) => {
  const match = text.match(/```json\n([\s\S]*?)\n```/);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch (e) {
      console.error("Failed to parse JSON from markdown", e);
    }
  }
  try {
    return JSON.parse(text);
  } catch (e) {
     console.error("Failed to parse raw text as JSON", e);
  }
  return null;
}

export const generateEventIdeas = async (eventType: string, topic?: string): Promise<any[]> => {
  if (!genAI) throw new Error('Gemini API not configured');
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `Generate 5 creative event ideas for a ${eventType} focused on ${topic || 'technology and community'}. For each event, provide: title, description (2-3 sentences), suggested_duration (in hours), target_audience, key_topics (array), and required_resources (array). Return as a valid JSON array.`;
  const result = await model.generateContent(prompt);
  return parseJsonFromText(result.response.text()) || [];
}

export const generateQuiz = async (topic: string, difficulty: string, numQuestions: number): Promise<any[]> => {
  if (!genAI) throw new Error('Gemini API not configured');
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `Generate ${numQuestions} ${difficulty} level quiz questions about ${topic}. For each question, provide: question, type ("multiple-choice" or "true-false"), options (array), correct_answer, and explanation. Return as a valid JSON array.`;
  const result = await model.generateContent(prompt);
  return parseJsonFromText(result.response.text()) || [];
}

export const generateLearningPath = async (topic: string, level: string, duration: number): Promise<any> => {
  if (!genAI) throw new Error('Gemini API not configured');
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig, safetySettings });
  
  const prompt = `
    Create a comprehensive ${duration}-hour learning path for a student interested in **${topic}** at a **${level} level**.
    The output must be a single, valid JSON object. Do not wrap it in markdown.
    
    The JSON object should have the following structure:
    {
      "title": "string",
      "description": "string",
      "learning_objectives": ["string"],
      "modules": [
        {
          "name": "string",
          "duration": "number (in hours)",
          "topics": ["string"],
          "resources": [
            {
              "title": "string",
              "type": "Video" | "Article" | "Documentation" | "Interactive Tutorial",
              "url": "string (a real, valid URL)"
            }
          ]
        }
      ]
    }

    **Instructions:**
    1.  **Title:** Create a catchy and descriptive title for the learning path.
    2.  **Description:** Write a brief, motivating overview of the path.
    3.  **Learning Objectives:** List 5-7 clear, actionable learning outcomes.
    4.  **Modules:** Create 4-6 modules. Each module should build upon the last.
    5.  **Resources:** For each module, provide at least 2-3 **real, valid, and high-quality** resources from the web (e.g., YouTube, official docs, popular blogs like Smashing Magazine, freeCodeCamp, etc.). Ensure URLs are correct.
  `;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  return parseJsonFromText(responseText);
};

export const generateTutorResponse = async (prompt: string, context?: string): Promise<string> => {
  if (!genAI) throw new Error('Gemini API not configured');
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  let fullPrompt = `You are a friendly and encouraging AI Tutor for a tech community. A student has a question. Provide a clear, concise, and helpful explanation.
  
  Student's question: "${prompt}"`;
  
  if (context) {
    fullPrompt += `\n\nHere is some context from a document they uploaded. Use this to inform your answer:\n---CONTEXT---\n${context.substring(0, 30000)}\n---END CONTEXT---`;
  }

  const result = await model.generateContent(fullPrompt);
  return result.response.text();
}

export const analyzePlagiarism = async (content: string): Promise<any> => {
  if (!genAI) throw new Error('Gemini API not configured');
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `Analyze the following content for potential plagiarism indicators. Provide: similarity_percentage (number), suspicious_phrases (array of strings), recommendations (array of strings), and confidence_score (0-100). Content: "${content.substring(0, 20000)}". Return as a valid JSON object.`;
  const result = await model.generateContent(prompt);
  return parseJsonFromText(result.response.text());
}

export const generateResume = async (
  profile: Profile,
  learningPaths: Partial<LearningPath>[],
  quizSubmissions: Partial<QuizSubmission>[],
  additionalInfo: string
): Promise<string> => {
  if (!genAI) throw new Error('Gemini API not configured');
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const skills = [...new Set(learningPaths.flatMap(p => p.topics || []))];
  const completedPaths = learningPaths.filter(p => p.progress === 100).map(p => p.title);
  const topQuizzes = quizSubmissions.filter(q => q.percentage && q.percentage >= 80).map(q => `${q.quiz_topic} (${q.percentage?.toFixed(0)}%)`);

  const prompt = `
    Generate a professional one-page resume in Markdown format for a student.

    **Candidate Information:**
    - Name: ${profile.first_name} ${profile.last_name}
    - Email: ${profile.email}
    - College: ${profile.college_name}

    **Key Skills (deduced from learning paths):**
    ${skills.length > 0 ? skills.join(', ') : 'No specific skills tracked yet.'}

    **Accomplishments:**
    - Completed Learning Paths: ${completedPaths.length > 0 ? completedPaths.join('; ') : 'None'}
    - Top Quiz Performances: ${topQuizzes.length > 0 ? topQuizzes.join('; ') : 'None'}

    **Additional Information Provided by Candidate:**
    "${additionalInfo || 'None'}"

    **Instructions:**
    1.  Create a clean, professional resume using Markdown.
    2.  Start with a header containing the candidate's name, college, and contact info.
    3.  Write a compelling "Summary" or "Objective" section based on their skills and interests.
    4.  Create a "Skills" section. List the skills provided above, and you can infer related technical skills.
    5.  Create a "Projects" or "Accomplishments" section. Highlight the completed learning paths and top quiz scores. If the user provided project details in the additional info, format them nicely here.
    6.  Create an "Education" section mentioning their college.
    7.  Keep it concise and professional. The output must be only Markdown. Do not include any other text or explanations.
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
};
