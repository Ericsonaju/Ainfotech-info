
import React, { useState, useEffect } from 'react';
import { ColumnType, Task, Priority, UserRole } from './types';
import { COLUMNS, INITIAL_CHECKLIST, CONFIG } from './constants';
import Column from './components/Column';
import LoginScreen from './components/LoginScreen';
import ClientPortal from './components/ClientPortal';
import ServiceModal from './components/ServiceModal';
import AdminDashboard from './components/AdminDashboard';
import AIGenerator from './components/AIGenerator';
import LandingPage from './components/LandingPage';
import Toast, { ToastMessage, ToastType } from './components/Toast';
import { Layout, Plus, LogOut, BarChart3, Kanban, Loader2, Search, Terminal, AlertOctagon, Home } from 'lucide-react';
import { taskService } from './services/taskService';
import { supabase } from './services/supabase';

// --- DEBUG LOGGER - DESATIVADO EM PRODUÇÃO ---
const IS_PRODUCTION = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');
const DEBUG_ENABLED = !IS_PRODUCTION || localStorage.getItem('DEBUG_MODE') === 'true';

// Guarda referências originais
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

// Em produção, substitui por funções vazias (silencia logs)
if (IS_PRODUCTION && !DEBUG_ENABLED) {
  console.log = () => { };
  console.warn = () => { };
  // Mantém console.error para erros críticos
}

// Buffer de logs para debug interno (útil em desenvolvimento)
const LOG_BUFFER: string[] = [];
function addToLogBuffer(type: string, args: any[]) {
  if (!DEBUG_ENABLED) return;
  try {
    const msg = args.map(a =>
      typeof a === 'object' ? JSON.stringify(a, (key, value) => {
        if (key === 'auth') return '[Auth Object]';
        return value;
      }) : String(a)
    ).join(' ');
    const line = `[${new Date().toLocaleTimeString()}] [${type}] ${msg}`;
    LOG_BUFFER.push(line);
    if (LOG_BUFFER.length > 50) LOG_BUFFER.shift();
  } catch (e) { }
}

// Wrapper para adicionar ao buffer (só em dev)
if (DEBUG_ENABLED) {
  console.log = (...args) => { addToLogBuffer('LOG', args); if (originalLog) originalLog(...args); };
  console.error = (...args) => { addToLogBuffer('ERR', args); if (originalError) originalError(...args); };
}
// --------------------------

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // App Configuration State
  const [diagnosticFee, setDiagnosticFee] = useState<number>(CONFIG.diagnosticFee);

  // View State
  const [currentUser, setCurrentUser] = useState<UserRole>(null);
  const [currentClientTask, setCurrentClientTask] = useState<Task | null>(null);
  const [adminView, setAdminView] = useState<'kanban' | 'dashboard'>('kanban');
  const [isInitializing, setIsInitializing] = useState(true);

  // Navigation State (Landing vs Login)
  const [showLoginScreen, setShowLoginScreen] = useState(false);

  // Debug State
  const [showDebug, setShowDebug] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  // Admin Modal State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Drag and Drop State
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (title: string, message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, title, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Load Settings from LocalStorage
  useEffect(() => {
    const savedFee = localStorage.getItem('app_diagnostic_fee');
    if (savedFee) {
      const parsed = parseFloat(savedFee);
      if (!isNaN(parsed)) setDiagnosticFee(parsed);
    }
  }, []);

  // Handler to update fee
  const handleUpdateFee = (newFee: number) => {
    setDiagnosticFee(newFee);
    localStorage.setItem('app_diagnostic_fee', newFee.toString());
    showToast('Configuração Salva', `Taxa de diagnóstico atualizada para R$ ${newFee.toFixed(2)}`, 'success');
  };

  // Load Tasks from Supabase
  const loadTasks = async () => {
    try {
      console.log("Iniciando carregamento de tarefas...");
      setLoading(true);
      const fetchedTasks = await taskService.fetchTasks();
      console.log(`Tarefas carregadas: ${fetchedTasks.length}`);
      setTasks(fetchedTasks);
    } catch (error: any) {
      console.error("Failed to load tasks", error);
      showToast('Erro de Carregamento', 'Não foi possível carregar as tarefas.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser === 'admin') {
      loadTasks();
    }
  }, [currentUser]);

  // --- DEBUG LOG SYNC ---
  useEffect(() => {
    const interval = setInterval(() => {
      if (showDebug || isInitializing) {
        setDebugLogs([...LOG_BUFFER]);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [showDebug, isInitializing]);

  // --- INITIALIZATION LOGIC & AUTH LISTENER ---
  useEffect(() => {
    console.log("App montado. Iniciando verificação de sessão...");
    let mounted = true;

    const initApp = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (mounted && data?.session) {
          console.log("Sessão encontrada.");
          setCurrentUser('admin');
          setShowLoginScreen(true); // Se já está logado, mostra o app (que depende dessa flag indiretamente ou entra no if currentUser)
        } else {
          console.log("Nenhuma sessão ativa.");
        }
      } catch (err: any) {
        console.warn("Falha na inicialização:", err.message);
      } finally {
        if (mounted) setIsInitializing(false);
      }
    };

    // Listen for auth changes (token expiry, logout from other tabs)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setTasks([]);
        setShowLoginScreen(false); // Voltar para Landing Page ao deslogar
      } else if (event === 'SIGNED_IN' && session) {
        setCurrentUser('admin');
        setShowLoginScreen(true);
      }
    });

    initApp();
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // --- Auth Handlers ---
  const handleAdminLogin = () => {
    setCurrentUser('admin');
    showToast('Bem-vindo', 'Login de administrador realizado.', 'success');
  };

  const handleClientLogin = async (osNumber: string) => {
    setLoading(true);
    try {
      const cleanOsNumber = osNumber.trim();
      const task = await taskService.fetchTaskByOS(cleanOsNumber);
      if (task) {
        setCurrentClientTask(task);
        setCurrentUser('client');
      } else {
        showToast('Não Encontrada', 'Número de O.S. inválido.', 'error');
      }
    } catch (e: any) {
      showToast('Erro', e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (currentUser === 'admin') {
      try { await supabase.auth.signOut(); } catch (e) { console.error(e); }
    }
    setCurrentUser(null);
    setCurrentClientTask(null);
    setTasks([]);
    setAdminView('kanban');
    setSearchQuery('');
    setShowLoginScreen(false); // Volta para Landing Page
  };

  // --- Board Handlers ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetColumnId: ColumnType) => {
    e.preventDefault();
    if (!draggedTaskId) return;

    const originalTasks = [...tasks];
    setTasks(prev => prev.map(t =>
      t.id === draggedTaskId ? { ...t, columnId: targetColumnId } : t
    ));

    try {
      const taskToUpdate = tasks.find(t => t.id === draggedTaskId);
      if (taskToUpdate) {
        if (taskToUpdate.columnId !== targetColumnId) {
          const colName = COLUMNS.find(c => c.id === targetColumnId)?.title;
          showToast('Tarefa Movida', `Para: ${colName}`, 'info');
        }

        // If moving an AI generated task that isn't saved yet, create it now
        if (taskToUpdate.id.startsWith('gen-')) {
          const createdTask = await taskService.createTask({ ...taskToUpdate, columnId: targetColumnId });
          setTasks(prev => prev.map(t => t.id === draggedTaskId ? createdTask : t));
        } else {
          await taskService.updateTask({ ...taskToUpdate, columnId: targetColumnId });
        }
      }
    } catch (e: any) {
      setTasks(originalTasks);
      showToast('Erro ao Mover', e.message, 'error');
    }
    setDraggedTaskId(null);
  };

  const deleteTask = async (id: string) => {
    if (!id) return;
    setIsServiceModalOpen(false);
    setSelectedTask(null);
    const originalTasks = [...tasks];
    setTasks(currentTasks => currentTasks.filter(t => t.id !== id));

    // If it's a generated task that wasn't saved to DB yet, just remove from state
    if (id.startsWith('gen-')) {
      showToast('Removido', 'Tarefa rascunho removida.', 'info');
      return;
    }

    try {
      await taskService.deleteTask(id);
      showToast('Excluído', 'O.S. removida.', 'success');
    } catch (e: any) {
      setTasks(originalTasks);
      showToast('Erro', e.message, 'error');
    }
  };

  const updateTask = async (updatedTask: Task) => {
    const oldTask = tasks.find(t => t.id === updatedTask.id);
    const statusChanged = oldTask && oldTask.columnId !== updatedTask.columnId;

    if (currentUser === 'client' && currentClientTask?.id === updatedTask.id) {
      setCurrentClientTask(updatedTask);
    }

    // Optimistic Update
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));

    try {
      let savedTask;
      // If task ID is virtual (AI Generated), create it instead of updating
      if (updatedTask.id.startsWith('gen-')) {
        savedTask = await taskService.createTask(updatedTask);
        showToast('O.S. Gerada', `O.S. ${savedTask.osNumber} criada com sucesso.`, 'success');
      } else {
        savedTask = await taskService.updateTask(updatedTask);
        if (statusChanged) {
          const colName = COLUMNS.find(c => c.id === updatedTask.columnId)?.title;
          showToast('Status Atualizado', `Movido para: ${colName}`, 'info');
        }
      }
      // Replace the virtual ID with real ID in state
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? savedTask : t));
    } catch (e: any) {
      showToast('Erro ao Salvar', e.message, 'error');
    }
  };

  const handleCreateNewOS = async (columnId: ColumnType) => {
    const now = Date.now();
    const timestampSuffix = now.toString().slice(-4);
    const randomSuffix = Math.floor(Math.random() * 999).toString().padStart(3, '0');
    const newOsNumber = `OS-${timestampSuffix}${randomSuffix}`;

    const newTaskStub: Task = {
      id: '',
      osNumber: newOsNumber,
      title: 'Nova Ordem de Serviço',
      description: '',
      clientName: 'Novo Cliente',
      clientPhone: '',
      equipment: '',
      serialNumber: '',
      priority: Priority.Medium,
      columnId: columnId,
      subtasks: [],
      checklist: [...INITIAL_CHECKLIST],
      chatHistory: [],
      isApproved: false,
      createdAt: now,
      tags: [],
      serviceCost: 0,
      partsCost: 0,
      technicalObservation: '',
      photos: [],
      budgetExpiryDate: now + (CONFIG.budgetValidityDays * 24 * 60 * 60 * 1000)
    };

    setLoading(true);
    try {
      const createdTask = await taskService.createTask(newTaskStub);
      setTasks(prev => [...prev, createdTask]);
      setSelectedTask(createdTask);
      setIsServiceModalOpen(true);
      showToast('O.S. Criada', `Ordem de serviço ${createdTask.osNumber} iniciada.`, 'success');
    } catch (e: any) {
      showToast('Erro', e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAiTasksGenerated = (newTasks: Task[]) => {
    setTasks(prev => [...prev, ...newTasks]);
    showToast('IA', `${newTasks.length} sugestões geradas. Arraste ou edite para salvar.`, 'success');
  };

  const openServiceModal = (task: Task) => {
    setSelectedTask(task);
    setIsServiceModalOpen(true);
  };

  const filteredTasks = tasks.filter(task => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(q) ||
      task.osNumber.toLowerCase().includes(q) ||
      task.clientName.toLowerCase().includes(q) ||
      task.equipment.toLowerCase().includes(q)
    );
  });

  if (isInitializing) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4 relative">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <p className="text-slate-400 font-medium animate-pulse">Iniciando Sistema...</p>
        {showDebug && (
          <div className="absolute bottom-10 left-4 right-4 bg-black/90 p-4 rounded-lg border border-red-900 max-h-[200px] overflow-y-auto font-mono text-[10px] text-green-400">
            {debugLogs.map((log, i) => <div key={i}>{log}</div>)}
          </div>
        )}
      </div>
    );
  }

  // --- ROUTING LOGIC ---

  // 1. Landing Page (Default if not logged in and not showing login screen)
  if (!currentUser && !showLoginScreen) {
    return <LandingPage onEnterSystem={() => setShowLoginScreen(true)} />;
  }

  // 2. Client Portal (Logged in as Client)
  if (currentUser === 'client' && currentClientTask) {
    return (
      <>
        <Toast toasts={toasts} removeToast={removeToast} />
        <ClientPortal
          task={currentClientTask}
          onUpdate={updateTask}
          onLogout={handleLogout}
          showToast={showToast}
          diagnosticFee={diagnosticFee}
        />
      </>
    );
  }

  // 3. Login Screen (User requested to login)
  if (!currentUser && showLoginScreen) {
    return (
      <>
        <Toast toasts={toasts} removeToast={removeToast} />

        {/* Botão para voltar à Home (Landing Page) */}
        <button
          onClick={() => setShowLoginScreen(false)}
          className="fixed top-4 left-4 z-50 p-2 bg-slate-800/50 text-slate-300 hover:text-white rounded-lg flex items-center gap-2 transition-colors hover:bg-slate-700"
        >
          <Home size={20} /> <span className="text-sm font-medium">Voltar ao Início</span>
        </button>

        <LoginScreen onAdminLogin={handleAdminLogin} onClientLogin={handleClientLogin} />

        <button onClick={() => setShowDebug(!showDebug)} className="fixed bottom-2 left-2 p-2 text-slate-800 hover:text-white z-50 opacity-20 hover:opacity-100 transition-opacity">
          <Terminal size={16} />
        </button>
        {showDebug && (
          <div className="fixed bottom-0 left-0 w-full bg-black/95 text-green-500 font-mono text-xs p-4 h-64 overflow-y-auto z-40 border-t border-green-900">
            <div className="flex justify-between sticky top-0 bg-black border-b border-green-900 pb-2 mb-2">
              <strong>CONSOLE DE DEPURAÇÃO</strong>
              <button onClick={() => setShowDebug(false)} className="text-red-500 font-bold">FECHAR</button>
            </div>
            {debugLogs.map((log, i) => <div key={i} className="border-b border-gray-900 py-0.5">{log}</div>)}
          </div>
        )}
      </>
    );
  }

  // 4. Loading State (Usually during login transitions)
  if (loading && !currentUser) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  // 5. Admin Dashboard (Logged in as Admin)
  return (
    <div className="h-screen w-screen flex flex-col bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black text-slate-200 font-sans selection:bg-blue-500/30 overflow-hidden">
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* HEADER RESPONSIVO */}
      <header className="h-14 md:h-16 border-b border-white/5 flex items-center justify-between px-4 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 flex-none">

        {/* 1. LEFT: LOGO & TITLE */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/20">
            <Layout className="text-white" size={20} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base md:text-lg font-bold text-white tracking-tight leading-tight">Service Desk</h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest hidden md:block">Painel Admin</p>
          </div>
        </div>

        {/* 2. CENTER: SEARCH (Hidden on mobile) */}
        {adminView === 'kanban' && (
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={16} />
              <input
                type="text"
                placeholder="Buscar O.S., Cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg py-1.5 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:bg-slate-800 transition-all placeholder-slate-500"
              />
            </div>
          </div>
        )}

        {/* 3. RIGHT: ACTIONS */}
        <div className="flex items-center gap-2 md:gap-3">

          {/* View Toggles */}
          <div className="flex bg-slate-800/50 p-1 rounded-lg border border-white/5">
            <button
              onClick={() => setAdminView('kanban')}
              className={`p-1.5 md:px-3 md:py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${adminView === 'kanban' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              title="Visualização Kanban"
            >
              <Kanban size={18} /> <span className="hidden lg:inline">Quadro</span>
            </button>
            <button
              onClick={() => setAdminView('dashboard')}
              className={`p-1.5 md:px-3 md:py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${adminView === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              title="Relatórios"
            >
              <BarChart3 size={18} /> <span className="hidden lg:inline">Relatórios</span>
            </button>
          </div>

          <div className="h-6 w-px bg-slate-700/50 mx-1 hidden md:block"></div>

          {/* New OS Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleCreateNewOS(ColumnType.Entry);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white p-2 md:px-3 md:py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-900/20 active:scale-95"
            title="Nova Ordem de Serviço"
          >
            <Plus size={20} />
            <span className="hidden md:inline">Nova O.S.</span>
          </button>

          {/* Logout */}
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-800" title="Sair">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 w-full overflow-x-auto overflow-y-hidden bg-slate-950/30 custom-scrollbar pb-2 relative scroll-smooth overscroll-x-contain">
        {adminView === 'kanban' ? (
          <div className="inline-flex h-full items-start gap-4 md:gap-6 p-4 md:p-6 min-w-full snap-x snap-mandatory">
            {COLUMNS.map(col => (
              <Column
                key={col.id}
                id={col.id}
                title={col.title}
                color={col.color}
                tasks={filteredTasks.filter(t => t.columnId === col.id)}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onTaskClick={openServiceModal}
                onAddTask={handleCreateNewOS}
              />
            ))}
            {/* Espaçador final para garantir que a última coluna não fique colada na borda */}
            <div className="w-4 shrink-0 h-full" />
          </div>
        ) : (
          <div className="container mx-auto max-w-7xl h-full overflow-y-auto custom-scrollbar">
            <AdminDashboard
              tasks={tasks}
              currentFee={diagnosticFee}
              onUpdateFee={handleUpdateFee}
            />
          </div>
        )}
      </main>

      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        task={selectedTask}
        onSave={(t) => {
          updateTask(t);
          showToast('Salvo', 'Alterações salvas com sucesso.', 'success');
        }}
        onDelete={deleteTask}
        showToast={showToast}
        diagnosticFee={diagnosticFee}
      />

      {/* AI GENERATOR FLOATING BUTTON */}
      {adminView === 'kanban' && <AIGenerator onTasksGenerated={handleAiTasksGenerated} />}
    </div>
  );
}
