import { GoogleGenAI, Type } from "@google/genai";
import { Priority } from "../types";

// Helper interface for the API response structure
interface GeneratedTask {
  title: string;
  description: string;
  priority: string;
  tags: string[];
}

export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private modelId = 'gemini-2.5-flash';

  private getAI(): GoogleGenAI {
    if (!this.ai) {
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
      if (!apiKey) {
        console.warn("Gemini API Key not configured. AI features will be disabled.");
      }
      this.ai = new GoogleGenAI({ apiKey });
    }
    return this.ai;
  }

  async generateTasksFromGoal(goal: string): Promise<GeneratedTask[]> {
    if (!goal) return [];

    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: this.modelId,
        contents: `I have a project goal: "${goal}". Generate a list of 3-5 concrete, actionable Kanban tasks to achieve this.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Short, punchy task title" },
                description: { type: Type.STRING, description: "Brief description of what needs to be done" },
                priority: { type: Type.STRING, enum: [Priority.Low, Priority.Medium, Priority.High, Priority.Urgent] },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["title", "description", "priority", "tags"]
            }
          }
        }
      });

      const text = response.text;
      if (!text) return [];
      return JSON.parse(text) as GeneratedTask[];
    } catch (error) {
      console.error("Gemini API Error (Generate Tasks):", error);
      throw error;
    }
  }

  async breakDownTask(taskTitle: string, taskDescription: string): Promise<{ subtasks: string[] }> {
    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: this.modelId,
        contents: `Break down this task into 3-6 smaller sub-steps: Title: "${taskTitle}", Description: "${taskDescription}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subtasks: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of actionable sub-steps"
              }
            }
          }
        }
      });
      const text = response.text;
      if (!text) return { subtasks: [] };
      return JSON.parse(text) as { subtasks: string[] };
    } catch (error) {
      console.error("Gemini API Error (Breakdown):", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();