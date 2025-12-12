import React, { useState } from 'react';
import { Sparkles, ArrowRight, Loader2, Bot } from 'lucide-react';
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

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setLoading(true);
    try {
      const generatedTasks = await geminiService.generateTasksFromGoal(goal);
      
      const newTasks: Task[] = generatedTasks.map((t, index) => ({
        id: `gen-${Date.now()}-${index}`,
        osNumber: `AI-${Math.floor(Math.random() * 10000)}`,
        title: t.title,
        description: t.description,
        clientName: 'AI System',
        clientPhone: '',
        equipment: 'General',
        priority: t.priority as Priority || Priority.Medium,
        columnId: ColumnType.Entry,
        subtasks: [],
        checklist: INITIAL_CHECKLIST.map(item => ({ ...item })),
        chatHistory: [],
        isApproved: false,
        createdAt: Date.now(),
        tags: t.tags || ['AI Generated'],
        serviceCost: 0,
        partsCost: 0,
        technicalObservation: '',
        photos: []
      }));

      onTasksGenerated(newTasks);
      setGoal('');
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      alert("Something went wrong generating tasks.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-4">
      {isOpen && (
        <div className="w-80 md:w-96 glass-panel p-4 rounded-xl shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="flex items-center gap-2 mb-3 text-blue-400">
            <Bot size={20} />
            <h3 className="font-medium text-white">AI Project Planner</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Describe your project goal, and I'll create a Kanban board setup for you.
          </p>
          <form onSubmit={handleGenerate}>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., Launch a marketing campaign for a new coffee brand..."
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 min-h-[100px] resize-none mb-3"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !goal.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                Generate Tasks
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2 ${isOpen ? 'bg-slate-700 text-white' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
      >
        <Sparkles size={24} />
        {!isOpen && <span className="font-semibold pr-2 hidden md:inline">Ask AI</span>}
      </button>
    </div>
  );
};

export default AIGenerator;