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
  private apiKey: string = '';

  constructor() {
    // Em Vite, as variáveis de ambiente devem usar o prefixo VITE_
    // @ts-ignore - import.meta.env exists in Vite
    this.apiKey = import.meta?.env?.VITE_GEMINI_API_KEY || '';
  }

  private getAI(): GoogleGenAI {
    if (!this.apiKey) {
      throw new Error("Chave da API Gemini não configurada. Configure VITE_GEMINI_API_KEY nas variáveis de ambiente.");
    }
    if (!this.ai) {
      this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    }
    return this.ai;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async generateTasksFromGoal(goal: string): Promise<GeneratedTask[]> {
    if (!goal) return [];

    if (!this.isConfigured()) {
      throw new Error("Serviço de IA não configurado. Entre em contato com o administrador.");
    }

    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: this.modelId,
        contents: `Tenho um objetivo de projeto: "${goal}". Gere uma lista de 3-5 tarefas Kanban concretas e acionáveis para alcançar isso. Responda em português.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Título curto e objetivo da tarefa" },
                description: { type: Type.STRING, description: "Breve descrição do que precisa ser feito" },
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
      console.error("Erro na API Gemini (Gerar Tarefas):", error);
      throw new Error("Falha ao gerar tarefas com IA. Verifique a configuração da API.");
    }
  }

  async breakDownTask(taskTitle: string, taskDescription: string): Promise<{ subtasks: string[] }> {
    if (!this.isConfigured()) {
      throw new Error("Serviço de IA não configurado. Entre em contato com o administrador.");
    }

    try {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: this.modelId,
        contents: `Divida esta tarefa de assistência técnica em 3-6 etapas menores de diagnóstico/reparo: Título: "${taskTitle}", Descrição: "${taskDescription}". Responda em português.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subtasks: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Lista de sub-etapas acionáveis"
              }
            }
          }
        }
      });
      const text = response.text;
      if (!text) return { subtasks: [] };
      return JSON.parse(text) as { subtasks: string[] };
    } catch (error) {
      console.error("Erro na API Gemini (Breakdown):", error);
      throw new Error("Falha ao gerar diagnóstico com IA.");
    }
  }
}

export const geminiService = new GeminiService();