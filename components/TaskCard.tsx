
import React, { useState } from 'react';
import { Task, Priority, ColumnType } from '../types';
import { Monitor, User, Clock, AlertCircle, ChevronDown, ChevronUp, AlignLeft, Phone, MapPin, ExternalLink } from 'lucide-react';

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
  const [isExpanded, setIsExpanded] = useState(false);
  const isExpired = !task.isApproved && task.budgetExpiryDate && Date.now() > task.budgetExpiryDate;
  
  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(task);
  };

  return (
    <div
      draggable
      onDragStart={(e) => {
        onDragStart(e, task.id);
      }}
      onClick={() => setIsExpanded(!isExpanded)}
      className={`group relative border rounded-lg p-4 cursor-grab active:cursor-grabbing transition-all duration-300 shadow-sm hover:shadow-md select-none flex flex-col gap-2
        ${isExpanded 
          ? 'bg-slate-800 border-blue-500/30 ring-1 ring-blue-500/20' 
          : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/50 hover:border-blue-500/30'
        }
        ${isExpired ? 'border-red-500/50 shadow-red-900/20' : ''}
      `}
    >
      {/* HEADER DO CARD */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-blue-400 bg-blue-900/20 px-1.5 py-0.5 rounded border border-blue-500/20">
                {task.osNumber}
            </span>
            <PriorityBadge priority={task.priority} />
        </div>
        <div className="flex items-center gap-2">
            {isExpired && (
                <div title="Orçamento Vencido" className="text-red-400 animate-pulse">
                    <AlertCircle size={16} />
                </div>
            )}
            <button 
                onClick={handleOpenModal}
                className="text-slate-500 hover:text-blue-400 transition-colors md:hidden"
            >
                <ExternalLink size={14} />
            </button>
            {isExpanded ? <ChevronUp size={16} className="text-slate-500"/> : <ChevronDown size={16} className="text-slate-500"/>}
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL (RESUMO) */}
      <div>
        <h3 className="text-slate-100 font-medium text-sm mb-1 leading-snug break-words">
            {task.title}
        </h3>
        
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Monitor size={12} className="shrink-0"/>
            <span className="truncate">{task.equipment}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <User size={12} className="shrink-0"/>
            <span className="truncate">{task.clientName}</span>
        </div>
      </div>

      {/* RODAPÉ DO CARD (Quando fechado) */}
      {!isExpanded && (
        <div className="flex justify-between items-center mt-1 pt-2 border-t border-slate-700/50">
           <div className="flex flex-col gap-1">
               <span className="text-[10px] text-slate-500">{new Date(task.createdAt).toLocaleDateString()}</span>
               <div className="flex gap-1">
                   {task.isApproved && <span className="text-[9px] text-green-400 font-bold bg-green-900/20 px-1 rounded w-fit">APROVADO</span>}
                   {isExpired && <span className="text-[9px] text-red-400 font-bold bg-red-900/20 px-1 rounded w-fit">VENCIDO</span>}
               </div>
           </div>
        </div>
      )}

      {/* CONTEÚDO EXPANDIDO (DETALHES) */}
      {isExpanded && (
        <div className="mt-2 pt-3 border-t border-slate-700/50 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
            {/* Descrição */}
            <div className="bg-slate-900/50 p-2 rounded border border-slate-700/50">
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase mb-1">
                    <AlignLeft size={10} /> Descrição do Problema
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                    {task.description ? `"${task.description}"` : 'Sem descrição detalhada.'}
                </p>
            </div>

            {/* Dados de Contato Extra */}
            <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/30 p-1.5 rounded">
                    <Phone size={12} className="text-blue-500" />
                    <span>{task.clientPhone}</span>
                </div>
                {task.clientAddress && (
                     <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/30 p-1.5 rounded overflow-hidden">
                        <MapPin size={12} className="text-blue-500 shrink-0" />
                        <span className="truncate">{task.clientAddress.split(',')[0]}</span>
                    </div>
                )}
            </div>

            {/* Botão de Ação Principal */}
            <button 
                onClick={handleOpenModal}
                className="w-full mt-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
            >
                <ExternalLink size={14} />
                Abrir Detalhes Completos
            </button>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
