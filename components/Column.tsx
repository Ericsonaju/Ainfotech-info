
import React from 'react';
import { ColumnType, Task } from '../types';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';

// Mapeamento de classes Tailwind para cores CSS hex
const TAILWIND_COLOR_MAP: Record<string, string> = {
  'bg-slate-500': '#64748b',
  'bg-yellow-500': '#eab308',
  'bg-blue-500': '#3b82f6',
  'bg-emerald-500': '#10b981',
  'bg-green-500': '#22c55e',
  'bg-red-500': '#ef4444',
  'bg-orange-500': '#f97316',
  'bg-purple-500': '#a855f7',
  'bg-indigo-500': '#6366f1',
};

interface ColumnProps {
  id: ColumnType;
  title: string;
  tasks: Task[];
  color: string;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, columnId: ColumnType) => void;
  onTaskClick: (task: Task) => void;
  onAddTask: (columnId: ColumnType) => void;
}

const Column: React.FC<ColumnProps> = ({ 
  id, 
  title, 
  tasks, 
  color, 
  onDragStart, 
  onDragOver, 
  onDrop,
  onTaskClick,
  onAddTask
}) => {
  // Converte classe Tailwind para cor CSS hex
  const borderColor = TAILWIND_COLOR_MAP[color] || '#64748b';

  return (
    <div 
      className="flex flex-col flex-shrink-0 w-[85vw] md:w-80 h-full max-h-full glass-panel rounded-xl border-t-4 border-t-transparent overflow-hidden transition-colors snap-center"
      style={{ borderTopColor: borderColor }}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, id)}
    >
      <div className="p-4 flex items-center justify-between border-b border-slate-700/50 bg-slate-800/40">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${color}`} />
          <h2 className="font-semibold text-slate-100 tracking-tight text-sm truncate max-w-[150px]">{title}</h2>
          <span className="ml-1 px-2 py-0.5 bg-slate-700/50 rounded-full text-xs text-slate-400 font-mono">
            {tasks.length}
          </span>
        </div>
        <button 
          onClick={() => onAddTask(id)}
          className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar bg-slate-900/20">
        {tasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onDragStart={onDragStart}
            onClick={onTaskClick}
          />
        ))}
        {tasks.length === 0 && (
          <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-800 rounded-lg text-slate-600 text-sm">
            Vazio
          </div>
        )}
      </div>
    </div>
  );
};

export default Column;
