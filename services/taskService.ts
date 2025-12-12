
import { supabase } from './supabase';
import { Task, Priority, ColumnType } from '../types';

// Mapeamento: Banco (snake_case) -> App (camelCase)
const mapTaskFromDB = (dbTask: any): Task => {
  // Limpa tags se necessário, mas agora não precisamos mais extrair dados delas
  let cleanTags = Array.isArray(dbTask.tags) ? [...dbTask.tags] : [];
  
  // Helper de data
  const parseDate = (dateStr: string | number) => {
      if (!dateStr) return Date.now();
      if (typeof dateStr === 'number') return dateStr;
      return new Date(dateStr).getTime();
  };

  // Lógica de validade: Usa a coluna nova, ou calcula padrão de 10 dias
  const finalExpiryDate = dbTask.budget_expiry_date 
      ? Number(dbTask.budget_expiry_date) 
      : (parseDate(dbTask.created_at) + (10 * 24 * 60 * 60 * 1000));

  return {
    id: dbTask.id,
    osNumber: dbTask.os_number || 'S/N',
    title: dbTask.title || 'Sem Título',
    description: dbTask.description || '',
    clientName: dbTask.client_name || '',
    clientPhone: dbTask.client_phone || '',
    
    // Agora mapeia diretamente das colunas do banco
    clientCpf: dbTask.client_cpf || '', 
    clientAddress: dbTask.client_address || '',
    
    equipment: dbTask.equipment || '',
    serialNumber: dbTask.serial_number || '',
    priority: (dbTask.priority as Priority) || Priority.Medium,
    columnId: (dbTask.column_id as ColumnType) || ColumnType.Entry,
    subtasks: Array.isArray(dbTask.subtasks) ? dbTask.subtasks : [],
    checklist: Array.isArray(dbTask.checklist) ? dbTask.checklist : [],
    chatHistory: Array.isArray(dbTask.chat_history) ? dbTask.chat_history : [],
    signature: dbTask.signature || undefined,
    
    // Mapeia assinatura técnica da coluna dedicada
    techSignature: dbTask.tech_signature || undefined, 
    
    isApproved: dbTask.is_approved || false,
    createdAt: parseDate(dbTask.created_at),
    tags: cleanTags,
    
    serviceCost: Number(dbTask.service_cost) || 0,
    partsCost: Number(dbTask.parts_cost) || 0,
    technicalObservation: dbTask.technical_observation || '',
    photos: Array.isArray(dbTask.photos) ? dbTask.photos : [],
    
    budgetExpiryDate: finalExpiryDate
  };
};

// Mapeamento: App (camelCase) -> Banco (snake_case)
const mapTaskToDB = (task: Task) => {
  // Limpa tags legadas se existirem no objeto, para não sujar o banco
  const dbTags = (task.tags || []).filter(t => 
    typeof t === 'string' && 
    !t.startsWith('TECH_SIG:') && 
    !t.startsWith('EXPIRY:') &&
    !t.startsWith('CLIENT_CPF:') &&
    !t.startsWith('CLIENT_ADDR:')
  );

  return {
    os_number: task.osNumber,
    title: task.title,
    description: task.description,
    client_name: task.clientName,
    client_phone: task.clientPhone,
    
    // Agora salvamos nas colunas corretas
    client_cpf: task.clientCpf,
    client_address: task.clientAddress,
    
    equipment: task.equipment,
    serial_number: task.serialNumber,
    priority: task.priority,
    column_id: task.columnId,
    subtasks: task.subtasks || [],
    checklist: task.checklist || [],
    chat_history: task.chatHistory || [],
    signature: task.signature,
    
    // Assinatura técnica em coluna própria
    tech_signature: task.techSignature,
    
    is_approved: task.isApproved,
    created_at: task.createdAt, 
    tags: dbTags, 
    
    service_cost: task.serviceCost,
    parts_cost: task.partsCost,
    technical_observation: task.technicalObservation,
    photos: task.photos || [],
    
    // Validade do orçamento em coluna própria
    budget_expiry_date: task.budgetExpiryDate
  };
};

export const taskService = {
  async fetchTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: true }); 
    
    if (error) {
        console.error("Supabase error fetchTasks:", JSON.stringify(error));
        throw new Error(error.message);
    }
    return (data || []).map(mapTaskFromDB);
  },

  async fetchTaskByOS(osNumber: string) {
    const cleanOs = osNumber.trim();
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .ilike('os_number', cleanOs)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
        console.error("Supabase error fetchTaskByOS:", JSON.stringify(error));
        throw new Error(error.message);
    }
    return data ? mapTaskFromDB(data) : null;
  },

  async createTask(task: Task) {
    const dbTask = mapTaskToDB(task);
    if (!task.id || task.id.length < 10) {
        delete (dbTask as any).id;
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([dbTask])
      .select()
      .single();
      
    if (error) {
        console.error("Supabase error createTask:", JSON.stringify(error));
        throw new Error(error.message);
    }
    return mapTaskFromDB(data);
  },

  async updateTask(task: Task) {
    const dbTask = mapTaskToDB(task);
    const { data, error } = await supabase
      .from('tasks')
      .update(dbTask)
      .eq('id', task.id)
      .select()
      .single();

    if (error) {
        console.error("Supabase error updateTask:", JSON.stringify(error));
        throw new Error(error.message);
    }
    return mapTaskFromDB(data);
  },

  async deleteTask(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
      
    if (error) {
        throw new Error(`Erro ao excluir: ${error.message}`);
    }
  }
};
