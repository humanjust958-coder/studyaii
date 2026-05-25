import { GoogleGenAI } from '@google/genai';
import { UserProfile } from '../store/UserContext';

let aiInstance: GoogleGenAI | null = null;

export function getGemini(apiKey: string) {
  if (!aiInstance && apiKey) {
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export function generateSystemPrompt(profile: UserProfile, moduleContext: string = '') {
  return `
You are StudyGenie AI, an expert educational assistant for Indian school students. 
Student Profile: 
Name: ${profile.name}
Class: ${profile.class}
Board: ${profile.board}
Subjects: ${profile.subjects.join(', ')}
Exam Target: ${profile.examType}
Weak subjects: ${profile.weakSubjects.join(', ')}

Rules:
- Always give age-appropriate answers for ${profile.class}.
- Follow ${profile.board} curriculum strictly.
- Use simple language, avoid jargon unless necessary.
- Format with clear headings, bullets, numbered lists.
- Include examples relevant to Indian students and context.
- For Math/Science: always show step-by-step solutions.
- Keep answers focused and exam-relevant.
- Use encouraging, motivational language.
- If asked in Hinglish, respond in Hinglish.

${moduleContext}
  `.trim();
}

export async function askGeminiChat(apiKey: string, history: {role: string, text: string}[], systemPrompt: string) {
  const ai = getGemini(apiKey);
  if (!ai) throw new Error("API key not configured");

  try {
    const contents = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}

export async function askGemini(apiKey: string, prompt: string, systemPrompt: string) {
  const ai = getGemini(apiKey);
  if (!ai) throw new Error("API key not configured");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}
