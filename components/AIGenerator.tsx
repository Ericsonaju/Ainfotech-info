import React, { useState } from 'react';
import { Sparkles, ArrowRight, Loader2, Bot, AlertCircle } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { Task, ColumnType, Priority } from '../types';
import { INITIAL_CHECKLIST } from '../constants';

interface AIGeneratorProps {
  onTasksGenerated: (tasks: Task[]) => void;
}

const AIGenerator: React.FC<AIGeneratorProps> = ({ onTasksGenerated }) => {
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAIConfigured = geminiService.isConfigured();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setError(null);
    setLoading(true);

    try {
      const generatedTasks = await geminiService.generateTasksFromGoal(goal);

      const newTasks: Task[] = generatedTasks.map((t, index) => ({
        id: `gen-${Date.now()}-${index}`,
        osNumber: `AI-${Math.floor(Math.random() * 10000)}`,
        title: t.title,
        description: t.description,
        clientName: 'Sistema IA',
        clientPhone: '',
        equipment: 'Geral',
        priority: t.priority as Priority || Priority.Medium,
        columnId: ColumnType.Entry,
        subtasks: [],
        checklist: INITIAL_CHECKLIST.map(item => ({ ...item })),
        chatHistory: [],
        isApproved: false,
        createdAt: Date.now(),
        tags: t.tags || ['Gerado por IA'],
        serviceCost: 0,
        partsCost: 0,
        technicalObservation: '',
        photos: []
      }));

      onTasksGenerated(newTasks);
      setGoal('');
      setIsOpen(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocorreu um erro ao gerar as tarefas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-4">
      {isOpen && (
        <div className="w-80 md:w-96 glass-panel p-4 rounded-xl shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-200 border border-white/10">
          <div className="flex items-center gap-2 mb-3 text-blue-400">
            <Bot size={20} />
            <h3 className="font-medium text-white">Planejador de Projetos de IA</h3>
          </div>

          {!isAIConfigured ? (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
              <AlertCircle className="mx-auto mb-2 text-yellow-400" size={32} />
              <p className="text-sm text-yellow-300 font-medium mb-1">IA não configurada</p>
              <p className="text-xs text-slate-400">
                O serviço de IA requer uma chave de API válida. Entre em contato com o administrador para configurar.
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-400 mb-4">
                Descreva o objetivo do seu projeto e eu criarei um quadro Kanban para você.
              </p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-3">
                  <p className="text-xs text-red-300">{error}</p>
                </div>
              )}

              <form onSubmit={handleGenerate}>
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Por exemplo, lançar uma campanha de marketing para uma nova marca de café..."
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 min-h-[100px] resize-none mb-3"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => { setIsOpen(false); setError(null); }}
                    className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !goal.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    Gerar tarefas
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}

      <button
        onClick={() => { setIsOpen(!isOpen); setError(null); }}
        className={`p-4 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2 ${isOpen ? 'bg-slate-700 text-white' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
        title="Planejador de Projetos com IA"
        aria-label="Abrir Planejador de Projetos com IA"
      >
        <Sparkles size={24} />
        {!isOpen && <span className="font-semibold pr-2 hidden md:inline">IA</span>}
      </button>
    </div>
  );
};

export default AIGenerator;