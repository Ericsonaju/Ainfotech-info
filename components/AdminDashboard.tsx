
import React, { useState, useMemo } from 'react';
import { Task, ColumnType } from '../types';
import { COMPANY_INFO, COLUMNS } from '../constants';
import { TrendingUp, DollarSign, Wrench, Clock, Building2, Wallet, Calendar, Printer, FileDown, Activity, X, PieChart as PieIcon, Settings } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart, PieChart, Pie, Cell } from 'recharts';

interface AdminDashboardProps {
  tasks: Task[];
  currentFee: number;
  onUpdateFee: (newFee: number) => void;
}

// --- TEMPLATE DO RELATÓRIO MENSAL (PDF) ---
const MonthlyReportTemplate: React.FC<{ 
  tasks: Task[]; 
  month: string; 
  stats: any; 
  onReady: () => void 
}> = ({ tasks, month, stats, onReady }) => {
    const [year, monthNum] = month.split('-');
    const dateObj = new Date(parseInt(year), parseInt(monthNum) - 1);
    const monthName = dateObj.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    // Aciona o callback quando o componente montar (para o html2pdf capturar)
    // Usamos useRef para manter referência estável da função
    const onReadyRef = React.useRef(onReady);
    React.useEffect(() => {
        onReadyRef.current = onReady;
    }, [onReady]);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            console.log("[REPORT DEBUG] Template de relatório pronto.");
            onReadyRef.current();
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div id="monthly-report-root" className="bg-white text-black p-10 max-w-[800px] mx-auto min-h-screen font-sans relative">
            {/* ESTILOS ESPECÍFICOS PARA O PDF/IMPRESSÃO */}
            <style>{`
                .report-table { width: 100%; border-collapse: collapse; font-size: 12px; }
                .report-table thead { display: table-header-group; }
                .report-table tr { page-break-inside: avoid; break-inside: avoid; }
                .report-table th { 
                    background-color: #0f172a; 
                    color: white; 
                    padding: 12px 10px; 
                    text-transform: uppercase; 
                    font-size: 10px; 
                    font-weight: 800; 
                    border: 1px solid #0f172a;
                    position: sticky;
                    top: 0;
                    z-index: 50;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                .report-table td { padding: 8px; border: 1px solid #e2e8f0; }
                .report-header { border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; }
                
                @media print {
                   .report-table th { position: static; box-shadow: none; }
                   .report-table thead { display: table-header-group; }
                }
            `}</style>

            {/* CABEÇALHO */}
            <div className="report-header flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">Relatório Mensal</h1>
                    <p className="text-sm text-slate-500 uppercase font-bold mt-2 flex items-center gap-2">
                        <Calendar size={14}/> Período: {monthName}
                    </p>
                </div>
                <div className="text-right text-xs text-slate-600 leading-relaxed">
                    <h2 className="font-bold text-base text-slate-900">{COMPANY_INFO.fantasyName}</h2>
                    <p>CNPJ: {COMPANY_INFO.cnpj}</p>
                    <p>{COMPANY_INFO.address}</p>
                    <p>{COMPANY_INFO.email} | {COMPANY_INFO.phone}</p>
                </div>
            </div>

            {/* RESUMO FINANCEIRO (CARDS) */}
            <div className="mb-10">
                <h3 className="text-xs font-bold uppercase text-slate-500 mb-3 border-b border-slate-200 pb-1">Resumo Financeiro</h3>
                <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                        <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wide mb-1">Faturamento Bruto</p>
                        <p className="text-xl font-black text-slate-900">R$ {stats.totalRevenue.toFixed(2)}</p>
                    </div>
                    <div className="p-4 border border-red-100 rounded-lg bg-red-50">
                        <p className="text-[10px] uppercase text-red-400 font-bold tracking-wide mb-1">Custo Peças</p>
                        <p className="text-xl font-black text-red-700">R$ {stats.totalPartsCost.toFixed(2)}</p>
                    </div>
                    <div className="p-4 border border-green-100 rounded-lg bg-green-50">
                        <p className="text-[10px] uppercase text-green-500 font-bold tracking-wide mb-1">Lucro Serviços</p>
                        <p className="text-xl font-black text-green-700">R$ {stats.totalServiceRevenue.toFixed(2)}</p>
                    </div>
                    <div className="p-4 border border-blue-100 rounded-lg bg-blue-50">
                        <p className="text-[10px] uppercase text-blue-400 font-bold tracking-wide mb-1">Total Serviços</p>
                        <p className="text-xl font-black text-blue-700">{stats.completedServices} <span className="text-xs text-blue-400 font-normal">/ {stats.totalServices}</span></p>
                    </div>
                </div>
            </div>

            {/* LISTA DETALHADA */}
            <div>
                <h3 className="text-xs font-bold uppercase text-slate-500 mb-3 border-b border-slate-200 pb-1">Detalhamento de Serviços</h3>
                <table className="report-table">
                    <thead>
                        <tr>
                            <th className="text-left w-[15%]">Data</th>
                            <th className="text-left w-[15%]">O.S.</th>
                            <th className="text-left w-[30%]">Cliente / Equipamento</th>
                            <th className="text-right w-[13%]">Mão de Obra</th>
                            <th className="text-right w-[13%]">Peças</th>
                            <th className="text-right w-[14%]">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-400 italic bg-slate-50">
                                    Nenhum serviço registrado neste período.
                                </td>
                            </tr>
                        )}
                        {tasks.map((task, idx) => (
                            <tr key={task.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                <td>{new Date(task.createdAt).toLocaleDateString()}</td>
                                <td className="font-mono font-bold text-slate-700">{task.osNumber}</td>
                                <td>
                                    <div className="font-bold text-slate-900">{task.clientName}</div>
                                    <div className="text-slate-500 text-[10px] truncate max-w-[200px]">{task.equipment}</div>
                                </td>
                                <td className="text-right text-slate-600">R$ {task.serviceCost?.toFixed(2)}</td>
                                <td className="text-right text-slate-600">R$ {task.partsCost?.toFixed(2)}</td>
                                <td className="text-right font-bold text-slate-900 bg-slate-100/50">R$ {((task.serviceCost || 0) + (task.partsCost || 0)).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-slate-900 text-white font-bold">
                            <td colSpan={3} className="text-right uppercase text-[10px] tracking-wider border-none">TOTAIS DO PERÍODO:</td>
                            <td className="text-right border-none border-t border-slate-700">R$ {stats.totalServiceRevenue.toFixed(2)}</td>
                            <td className="text-right border-none border-t border-slate-700">R$ {stats.totalPartsCost.toFixed(2)}</td>
                            <td className="text-right border-none border-t border-slate-700 text-green-400">R$ {stats.totalRevenue.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="mt-12 pt-4 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-400 uppercase tracking-widest">
                <span>Sistema AINFOTECH v2.0</span>
                <span>Gerado em {new Date().toLocaleString()}</span>
            </div>
        </div>
    );
};

// --- CUSTOM TOOLTIP FOR CHART ---
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs">
          <p className="font-bold text-slate-200 mb-2">{label}</p>
          {payload.map((p: any) => (
            <div key={p.name} className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-slate-400 capitalize">{p.name === 'concluidos' ? 'Concluídos' : 'Ativos'}:</span>
                <span className="font-bold text-white ml-auto">{p.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

const AdminDashboard: React.FC<AdminDashboardProps> = ({ tasks, currentFee, onUpdateFee }) => {
  // Estado do Filtro de Mês (Padrão: Mês atual YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [localFee, setLocalFee] = useState(currentFee.toString());

  // --- FILTRAGEM ---
  const filteredTasks = tasks.filter(t => {
      if (!t.createdAt) return false;
      const taskDate = new Date(t.createdAt);
      const [year, month] = selectedMonth.split('-').map(Number);
      return taskDate.getFullYear() === year && (taskDate.getMonth() + 1) === month;
  });

  // --- CÁLCULOS (BASEADOS NO FILTRO) ---
  const totalRevenue = filteredTasks
    .filter(t => t.columnId === ColumnType.Done || t.columnId === ColumnType.Execution)
    .reduce((acc, t) => acc + (t.serviceCost || 0) + (t.partsCost || 0), 0);

  const pendingRevenue = filteredTasks
    .filter(t => t.columnId === ColumnType.Approval)
    .reduce((acc, t) => acc + (t.serviceCost || 0) + (t.partsCost || 0), 0);

  const totalPartsCost = filteredTasks.reduce((acc, t) => acc + (t.partsCost || 0), 0);
  const totalServiceRevenue = filteredTasks.reduce((acc, t) => acc + (t.serviceCost || 0), 0);

  const totalServices = filteredTasks.length;
  const completedServices = filteredTasks.filter(t => t.columnId === ColumnType.Done).length;
  const activeServices = filteredTasks.filter(t => t.columnId === ColumnType.Execution || t.columnId === ColumnType.Entry || t.columnId === ColumnType.Approval).length;
  
  const averageTicket = totalServices > 0 ? totalRevenue / (completedServices + activeServices) : 0;

  // Objeto de estatísticas para passar ao PDF
  const reportStats = {
      totalRevenue,
      totalPartsCost,
      totalServiceRevenue,
      totalServices,
      completedServices
  };

  // --- PIE CHART DATA ---
  const pieData = useMemo(() => {
    const counts = {
      [ColumnType.Entry]: 0,
      [ColumnType.Approval]: 0,
      [ColumnType.Execution]: 0,
      [ColumnType.Done]: 0,
    };
    filteredTasks.forEach(t => {
      if (counts[t.columnId] !== undefined) counts[t.columnId]++;
    });

    return Object.keys(counts).map(key => ({
      name: COLUMNS.find(c => c.id === key)?.title || key,
      value: counts[key as ColumnType],
      color: key === ColumnType.Done ? '#10b981' : 
             key === ColumnType.Execution ? '#3b82f6' : 
             key === ColumnType.Approval ? '#eab308' : '#64748b'
    })).filter(d => d.value > 0);
  }, [filteredTasks]);

  // --- AREA CHART DATA ---
  const chartData = useMemo(() => {
    const groups: Record<string, { name: string; concluidos: number; ativos: number; sortKey: number }> = {};
    
    // Processar TODAS as tarefas, não apenas as filtradas, para mostrar o histórico
    tasks.forEach(task => {
        if (!task.createdAt) return;
        const date = new Date(task.createdAt);
        // Chave YYYY-MM
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        // Nome para exibir (Mês/Ano curto)
        const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });

        if (!groups[key]) {
            groups[key] = {
                name: monthName,
                concluidos: 0,
                ativos: 0,
                sortKey: date.getTime()
            };
        }

        if (task.columnId === ColumnType.Done) {
            groups[key].concluidos++;
        } else {
            groups[key].ativos++;
        }
    });

    const sortedData = Object.values(groups).sort((a, b) => a.sortKey - b.sortKey);
    if (sortedData.length === 0) return [];
    return sortedData.slice(-6);
  }, [tasks]);

  // --- GERAÇÃO DE PDF ---
  const handlePrintReport = () => {
      setIsGeneratingPdf(true);
  };

  const executePdfGeneration = async () => {
      console.log("[REPORT DEBUG] Iniciando geração...");
      const element = document.getElementById('monthly-report-root');
      if (!element) {
          console.error("Elemento de relatório não encontrado.");
          setIsGeneratingPdf(false);
          return;
      }

      const html2pdfLib = (window as any).html2pdf;
      if (typeof html2pdfLib === 'undefined') {
          alert("Biblioteca de PDF não carregada. Recarregue a página.");
          setIsGeneratingPdf(false);
          return;
      }

      const opt = {
          margin: 10,
          filename: `Relatorio-${selectedMonth}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 1.5, useCORS: true, backgroundColor: '#ffffff', logging: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      try {
          await html2pdfLib().set(opt).from(element).save();
          console.log("[REPORT DEBUG] PDF salvo.");
      } catch (e: any) {
          console.error(e);
          alert(`Erro ao gerar relatório: ${e.message}`);
      } finally {
          setIsGeneratingPdf(false);
      }
  };

  const saveFee = () => {
      const parsed = parseFloat(localFee);
      if (!isNaN(parsed) && parsed >= 0) {
          onUpdateFee(parsed);
      }
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 relative">
      
      {/* CAMADA OCULTA DE GERAÇÃO DE PDF */}
      {isGeneratingPdf && (
         <div className="fixed inset-0 z-[99999] bg-white overflow-y-auto">
             <div className="fixed top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-white/95 z-[100000]">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
                 <p className="font-bold text-slate-900 mb-4">Gerando Relatório Mensal...</p>
                 <button 
                    onClick={() => setIsGeneratingPdf(false)}
                    className="flex items-center gap-2 px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-full font-bold transition-colors"
                 >
                    <X size={18} /> Cancelar
                 </button>
             </div>
            <MonthlyReportTemplate 
                tasks={filteredTasks} 
                month={selectedMonth} 
                stats={reportStats}
                onReady={executePdfGeneration} 
            />
         </div>
      )}

      {/* Cabeçalho da Empresa & Filtros */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl relative overflow-hidden flex flex-col gap-6">
        <div className="absolute top-0 right-0 p-32 bg-blue-600/10 blur-3xl rounded-full pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="text-blue-400" size={28} />
              <h1 className="text-3xl font-bold text-white">{COMPANY_INFO.fantasyName}</h1>
            </div>
            <p className="text-slate-400 text-sm max-w-xl">{COMPANY_INFO.activity}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
             <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-700 flex items-center gap-2">
                <Calendar className="text-slate-400 ml-2" size={18} />
                <input 
                    type="month" 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-transparent text-white text-sm font-bold focus:outline-none p-2 rounded cursor-pointer [&::-webkit-calendar-picker-indicator]:invert"
                />
             </div>
             
             <button 
                onClick={handlePrintReport}
                disabled={isGeneratingPdf}
                className="bg-white text-slate-900 hover:bg-slate-200 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-white/5 active:scale-95 disabled:opacity-70 disabled:cursor-wait"
             >
                {isGeneratingPdf ? <FileDown className="animate-bounce" size={20}/> : <Printer size={20} />}
                <span>Imprimir Relatório</span>
             </button>
          </div>
        </div>

        <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-700/30 text-xs flex flex-wrap gap-4 text-slate-400">
            <span><strong className="text-slate-200">CNPJ:</strong> {COMPANY_INFO.cnpj}</span>
            <span className="hidden md:inline">|</span>
            <span><strong className="text-slate-200">Resp:</strong> {COMPANY_INFO.owner}</span>
            <span className="hidden md:inline">|</span>
            <span><strong className="text-slate-200">Tel:</strong> {COMPANY_INFO.phone}</span>
        </div>
      </div>

      {/* Grid de KPIs + Configuração */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-panel p-5 rounded-xl border-l-4 border-l-green-500 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Faturamento (Mês)</p>
              <h3 className="text-2xl font-bold text-white mt-1">R$ {totalRevenue.toFixed(2)}</h3>
            </div>
            <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
              <DollarSign size={20} />
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border-l-4 border-l-yellow-500 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Em Aprovação</p>
              <h3 className="text-2xl font-bold text-white mt-1">R$ {pendingRevenue.toFixed(2)}</h3>
            </div>
            <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400">
              <Clock size={20} />
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border-l-4 border-l-blue-500 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Ticket Médio</p>
              <h3 className="text-2xl font-bold text-white mt-1">R$ {averageTicket.toFixed(2)}</h3>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border-l-4 border-l-purple-500 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Total Serviços</p>
              <h3 className="text-2xl font-bold text-white mt-1">{totalServices}</h3>
            </div>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <Wrench size={20} />
            </div>
          </div>
        </div>

         {/* CARD DE CONFIGURAÇÃO */}
         <div className="glass-panel p-5 rounded-xl border-l-4 border-l-slate-500 flex flex-col justify-between bg-slate-800/50">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-2 text-slate-300">
                <Settings size={16} />
                <p className="text-xs uppercase font-bold tracking-wider">Taxa Diagnóstico</p>
            </div>
            <div className="flex items-center gap-2 mt-auto">
                <span className="text-slate-500 font-bold">R$</span>
                <input 
                    type="number" 
                    value={localFee}
                    onChange={(e) => setLocalFee(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-white font-bold"
                    step="5"
                />
                <button 
                    onClick={saveFee}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold transition-colors"
                >
                    OK
                </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GRÁFICO DE EVOLUÇÃO (Area) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                   <Activity size={18} className="text-blue-400" /> Evolução de Serviços
                </h3>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                          <linearGradient id="colorConcluidos" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorAtivos" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1 }} />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                      <Area type="monotone" dataKey="concluidos" name="Concluídos" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorConcluidos)" />
                      <Area type="monotone" dataKey="ativos" name="Novos / Ativos" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAtivos)" />
                  </AreaChart>
              </ResponsiveContainer>
            </div>
        </div>

        {/* PIE CHART - DISTRIBUIÇÃO */}
        <div className="glass-panel p-6 rounded-xl relative overflow-hidden flex flex-col">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
               <PieIcon size={18} className="text-purple-400" /> Distribuição Atual
            </h3>
            <div className="flex-1 min-h-[250px] relative">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={pieData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                     >
                        {pieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.1)" />
                        ))}
                     </Pie>
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                        itemStyle={{ color: '#f8fafc' }}
                     />
                     <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                  </PieChart>
               </ResponsiveContainer>
               
               {/* Centro do Donut */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
                  <span className="text-3xl font-bold text-white">{filteredTasks.length}</span>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Total</p>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
