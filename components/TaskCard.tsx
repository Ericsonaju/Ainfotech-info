
import React from 'react';
import { Task, Priority, ColumnType } from '../types';
import { Monitor, User, Clock, AlertCircle } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onClick: (task: Task) => void;
}

const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const colors = {
    [Priority.Low]: 'bg-slate-700 text-slate-300 border-slate-600',
    [Priority.Medium]: 'bg-blue-900/40 text-blue-300 border-blue-700/50',
    [Priority.High]: 'bg-orange-900/40 text-orange-300 border-orange-700/50',
    [Priority.Urgent]: 'bg-red-900/40 text-red-300 border-red-700/50',
  };

  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-semibold ${colors[priority]}`}>
      {priority}
    </span>
  );
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onDragStart, onClick }) => {
  const isExpired = !task.isApproved && task.budgetExpiryDate && Date.now() > task.budgetExpiryDate;
  
  return (
    <div
      draggable
      onDragStart={(e) => {
        onDragStart(e, task.id);
      }}
      onClick={() => onClick(task)}
      className={`group relative bg-slate-800/50 hover:bg-slate-800 border ${isExpired ? 'border-red-500/50 shadow-sm shadow-red-900/20' : 'border-slate-700/50 hover:border-blue-500/30'} rounded-lg p-4 cursor-grab active:cursor-grabbing transition-all shadow-sm hover:shadow-md select-none flex flex-col gap-2`}
    >
      {/* HEADER DO CARD */}
      <div className="flex justify-between items-start pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
            <span className="font-mono text-[10px] text-blue-400 bg-blue-900/20 px-1.5 py-0.5 rounded border border-blue-500/20">
                {task.osNumber}
            </span>
            <PriorityBadge priority={task.priority} />
        </div>
        {isExpired && (
            <div title="Orçamento Vencido" className="text-red-400 animate-pulse">
                <AlertCircle size={16} />
            </div>
        )}
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="pointer-events-none">
        <h3 className="text-slate-100 font-medium text-sm mb-1 leading-snug">
            {task.title}
        </h3>
        
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Monitor size={12} />
            <span className="truncate max-w-[180px]">{task.equipment}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <User size={12} />
            <span>{task.clientName}</span>
        </div>
      </div>

      {/* RODAPÉ DO CARD */}
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-700/50 pointer-events-none">
         <div className="flex flex-col gap-1">
             <span className="text-[10px] text-slate-500">{new Date(task.createdAt).toLocaleDateString()}</span>
             {task.isApproved && <span className="text-[9px] text-green-400 font-bold bg-green-900/20 px-1 rounded w-fit">APROVADO</span>}
             {isExpired && <span className="text-[9px] text-red-400 font-bold bg-red-900/20 px-1 rounded w-fit">VENCIDO</span>}
         </div>
      </div>
    </div>
  );
};

export default TaskCard;
