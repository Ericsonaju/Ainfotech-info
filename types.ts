
export enum Priority {
  Low = 'Baixa',
  Medium = 'Média',
  High = 'Alta',
  Urgent = 'Urgente'
}

export enum ColumnType {
  Entry = 'entry',
  Approval = 'approval',
  Execution = 'execution',
  Done = 'done'
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'tech' | 'client' | 'system';
  message: string;
  timestamp: number;
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface Task {
  id: string; // The internal UUID
  osNumber: string; // Human readable OS number (e.g., OS-1024)
  title: string; // Equipment Name / Issue Title
  description: string; // Problem description
  clientName: string;
  clientPhone: string;
  clientCpf?: string; // NOVO: CPF ou CNPJ para validade jurídica
  clientAddress?: string; // NOVO: Endereço completo
  equipment: string;
  serialNumber?: string;
  priority: Priority;
  columnId: ColumnType;
  subtasks: Subtask[]; // Steps for the tech
  checklist: ChecklistItem[]; // Entry inspection (scratch, power cable, etc)
  chatHistory: ChatMessage[];
  signature?: string; // Client Signature (Base64)
  techSignature?: string; // Technician Signature (Base64) -- NOVO
  isApproved: boolean;
  createdAt: number;
  tags: string[];
  
  // Novos campos
  serviceCost: number;
  partsCost: number;
  technicalObservation: string;
  photos: string[]; // Array de strings Base64
  
  // Controle de Validade CDC
  budgetExpiryDate?: number; // Timestamp da validade do orçamento
}

export interface DragItem {
  id: string;
  columnId: ColumnType;
}

export type UserRole = 'admin' | 'client' | null;
