
import React, { useState, useEffect, useRef } from 'react';
import { Task, Priority, ChecklistItem, ChatMessage, ColumnType } from '../types';
import { COLUMNS, CONFIG, PREDEFINED_SERVICES } from '../constants';
import { X, Send, User, Smartphone, Monitor, AlertTriangle, CheckSquare, Sparkles, DollarSign, Camera, Image as ImageIcon, ClipboardList, PenTool, Printer, ChevronDown, ChevronUp, Plus, Trash2, ArrowRight, CheckCircle2, Calendar, LayoutList, Signal, FileText, Download, MapPin, CreditCard, ShoppingBag, Clock, Menu, MessageCircle } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import ClientPortal, { PdfInvoiceTemplate } from './ClientPortal'; 
import SignaturePad from './SignaturePad';
import { ToastType } from './Toast';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSave: (task: Task) => void;
  onDelete: (id: string) => void;
  showToast: (title: string, message: string, type: ToastType) => void;
  diagnosticFee: number;
}

const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, task, onSave, onDelete, showToast, diagnosticFee }) => {
  const [formData, setFormData] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'technical' | 'financial' | 'chat'>('info');
  const [chatInput, setChatInput] = useState('');
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [pdfMode, setPdfMode] = useState<'entry' | 'full'>('full'); 
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isPdfReady, setIsPdfReady] = useState(false); 
  const [isSigningTech, setIsSigningTech] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Mobile specific state
  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (task) {
      setFormData({ ...task });
    }
    setShowDeleteConfirm(false); 
    setPdfMode('full');
    setIsPdfReady(false);
    setIsMobileDetailsOpen(false); // Sempre fechar detalhes ao abrir nova task
  }, [task, isOpen]);

  useEffect(() => {
      if (isGeneratingPdf && isPdfReady) {
          const timer = setTimeout(() => {
              executePdfGeneration();
          }, 500);
          return () => clearTimeout(timer);
      }
  }, [isGeneratingPdf, isPdfReady]);

  if (!isOpen || !formData) return null;

  const executePdfGeneration = async () => {
      const element = document.getElementById('pdf-document-root');
      if (!element) { 
          showToast('Erro Interno', 'Elemento do PDF não encontrado.', 'error');
          setIsGeneratingPdf(false);
          return; 
      }
      
      const html2pdfLib = (window as any).html2pdf;
      if (typeof html2pdfLib === 'undefined') {
          showToast('Erro de PDF', 'Biblioteca não carregada.', 'error');
          setIsGeneratingPdf(false);
          return;
      }

      window.scrollTo(0,0);
      const filename = pdfMode === 'entry' ? `Recibo-Entrada-${formData.osNumber}.pdf` : `OS-${formData.osNumber}.pdf`;
      
      const opt = { 
          margin: [10, 10, 10, 10], 
          filename: filename, 
          image: { type: 'jpeg', quality: 0.98 }, 
          html2canvas: { scale: 1.5, useCORS: true, logging: false, scrollY: 0, backgroundColor: '#ffffff' }, 
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } 
      };

      try { 
          await html2pdfLib().set(opt).from(element).save(); 
          showToast('Download Iniciado', 'Documento baixado.', 'success');
      } catch (e: any) { 
          showToast('Erro ao Gerar PDF', 'Verifique o console.', 'error');
      } finally { 
          setIsGeneratingPdf(false); 
      }
  };

  if (isPrinting) {
      return (
          <div className="fixed inset-0 bg-white z-[60] overflow-y-auto flex justify-center">
             <div className="absolute top-4 right-4 z-[70] flex gap-3">
                  <button onClick={() => setIsPrinting(false)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow font-bold transition-colors">Fechar</button>
                  <button 
                    onClick={() => setIsGeneratingPdf(true)} 
                    disabled={isGeneratingPdf}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isGeneratingPdf ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> : <Download size={16} />} 
                    {isGeneratingPdf ? 'Gerando...' : 'Baixar PDF'}
                  </button>
             </div>
             
             <div className="absolute top-4 left-4 z-[70] flex gap-2 bg-slate-100 p-1 rounded-lg border border-slate-300 shadow-sm flex-wrap max-w-[70%]">
                 <button onClick={() => { setPdfMode('entry'); setIsPdfReady(false); }} className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${pdfMode === 'entry' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-200'}`}>Recibo Entrada</button>
                 <button onClick={() => { setPdfMode('full'); setIsPdfReady(false); }} className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${pdfMode === 'full' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-200'}`}>Orçamento/OS Completa</button>
             </div>

             {isGeneratingPdf && (
                 <div className="fixed inset-0 z-[80] bg-white/95 flex flex-col items-center justify-center">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
                     <p className="text-slate-900 font-bold mb-4">Gerando PDF...</p>
                 </div>
             )}
             <div className="w-full max-w-[800px] shadow-2xl my-16 md:my-10 relative">
                 <PdfInvoiceTemplate task={formData} mode={pdfMode} onReady={() => setIsPdfReady(true)} diagnosticFee={diagnosticFee} />
             </div>
          </div>
      );
  }

  // --- HANDLERS ---
  const handleInputChange = (field: keyof Task, value: any) => setFormData(prev => prev ? ({ ...prev, [field]: value }) : null);
  
  const handleCurrencyChange = (field: 'partsCost' | 'serviceCost', rawValue: string) => {
    const digits = rawValue.replace(/\D/g, '');
    const numberValue = parseInt(digits || '0', 10) / 100;
    handleInputChange(field, numberValue);
  };

  const applyStandardService = (serviceId: string) => {
    const service = PREDEFINED_SERVICES.find(s => s.id === serviceId);
    if (!service || !formData) return;
    
    setFormData(prev => {
        if (!prev) return null;
        
        // Agora SOMA os valores em vez de substituir
        const newPartsCost = (prev.partsCost || 0) + service.partsCost;
        const newServiceCost = (prev.serviceCost || 0) + service.serviceCost;
        
        // E adiciona à descrição em vez de substituir
        const descriptionToAdd = `\n+ ${service.label}: ${service.description}`;
        const newObservation = (prev.technicalObservation || '') + descriptionToAdd;

        return {
            ...prev,
            partsCost: newPartsCost,
            serviceCost: newServiceCost,
            technicalObservation: newObservation
        };
    });

    showToast('Adicionado', `${service.label} somado ao orçamento.`, 'success');
  };

  const formatCurrencyValue = (val?: number) => {
      if (val === undefined || val === null) return '0,00';
      return Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const toggleChecklist = (id: string) => setFormData(prev => prev ? ({ ...prev, checklist: prev.checklist.map(item => item.id === id ? { ...item, checked: !item.checked } : item) }) : null);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setFormData(prev => prev ? ({ ...prev, chatHistory: [...prev.chatHistory, { id: `msg-${Date.now()}`, sender: 'tech', message: chatInput, timestamp: Date.now() }] }) : null);
    setChatInput('');
  };

  const handleDiagnosis = async () => {
    setIsDiagnosing(true);
    try {
        const result = await geminiService.breakDownTask(formData.title, formData.description);
        const newSubtasks = result.subtasks.map((st, i) => ({ id: `st-${Date.now()}-${i}`, title: st, completed: false }));
        setFormData(prev => prev ? ({...prev, subtasks: [...prev.subtasks, ...newSubtasks]}) : null);
        showToast('IA Sucesso', 'Plano de ação gerado automaticamente.', 'success');
    } catch(e) { 
        showToast('Erro IA', 'Falha ao gerar diagnóstico com IA.', 'error');
    } finally { setIsDiagnosing(false); }
  };

  const compressImage = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader(); reader.readAsDataURL(file);
          reader.onload = (event) => {
              const img = new Image(); img.src = event.target?.result as string;
              img.onload = () => {
                  const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
                  if (!ctx) { reject(); return; }
                  const MAX_WIDTH = 1024; const MAX_HEIGHT = 1024; let width = img.width; let height = img.height;
                  if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } } else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
                  canvas.width = width; canvas.height = height; ctx.drawImage(img, 0, 0, width, height);
                  resolve(canvas.toDataURL('image/jpeg', 0.6));
              };
          };
      });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (formData?.photos?.length || 0) < 4) {
      const compressedBase64 = await compressImage(file);
      setFormData(prev => prev ? ({ ...prev, photos: [...(prev.photos || []), compressedBase64] }) : null);
      showToast('Foto Adicionada', 'Imagem anexada com sucesso.', 'success');
    } else if ((formData?.photos?.length || 0) >= 4) {
        showToast('Limite Atingido', 'Máximo de 4 fotos permitido.', 'warning');
    }
  };

  const removePhoto = (index: number) => setFormData(prev => prev ? ({ ...prev, photos: [...(prev.photos || [])].filter((_, i) => i !== index) }) : null);
  const handleTechSignatureChange = (base64: string) => setFormData(prev => prev ? ({ ...prev, techSignature: base64 }) : null);

  // --- VALIDATION HELPER ---
  const validatePhone = () => {
    if (!formData?.clientPhone) {
         showToast('Telefone Inválido', 'O telefone do cliente é obrigatório.', 'warning');
         setActiveTab('info');
         return false;
    }
    const cleanPhone = formData.clientPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
        showToast('Telefone Inválido', 'O telefone deve conter DDD + Número (mín. 10 dígitos).', 'warning');
        setActiveTab('info');
        return false;
    }
    return true;
  };

  const handleSave = () => { 
    if (formData) { 
        if (!validatePhone()) return;
        onSave(formData); 
        onClose(); 
    } 
  };
  
  const confirmDelete = () => { if (formData?.id) { onDelete(formData.id); setShowDeleteConfirm(false); } };
  
  const handleFinishService = () => {
      if (!formData) return;
      if (!validatePhone()) return;
      
      if (!formData.technicalObservation || formData.technicalObservation.length < 10) { 
          showToast('Laudo Obrigatório', 'Preencha o laudo técnico antes de concluir.', 'error');
          setActiveTab('technical'); return; 
      }
      if (!formData.techSignature) { 
          showToast('Assinatura Obrigatória', 'O técnico responsável deve assinar para concluir.', 'error');
          setActiveTab('technical'); setIsSigningTech(true); return; 
      }
      onSave({ ...formData, columnId: ColumnType.Done, chatHistory: [...formData.chatHistory, { id: `sys-${Date.now()}`, sender: 'system', message: '🛠️ Serviço concluído.', timestamp: Date.now() }] });
      onClose();
  };

  const handleSendToApproval = () => { 
      if (formData) { 
          if (!validatePhone()) return;
          onSave({ ...formData, columnId: ColumnType.Approval }); 
          onClose(); 
      } 
  }

  // --- RENDER HELPERS ---
  const Tabs = [
      { id: 'info', label: 'Info', icon: User },
      { id: 'technical', label: 'Téc', icon: PenTool },
      { id: 'financial', label: 'Fin', icon: DollarSign },
      { id: 'chat', label: 'Chat', icon: Send }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      
      {/* DELETE MODAL */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
            <div className="glass-panel bg-slate-900 border border-red-500/30 rounded-xl w-full max-w-sm p-6 text-center animate-in zoom-in-95">
                 <Trash2 size={32} className="text-red-500 mx-auto mb-4" />
                 <h3 className="text-xl font-bold text-white mb-2">Excluir O.S.?</h3>
                 <p className="text-slate-400 text-sm mb-6">Esta ação é irreversível.</p>
                 <div className="flex gap-3"><button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl font-medium">Cancelar</button><button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold">Excluir</button></div>
            </div>
        </div>
      )}

      {/* SIGNATURE MODAL */}
      {isSigningTech && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
             <div className="glass-panel bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md p-6 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-4"><h3 className="text-white font-bold">Assinatura do Técnico</h3><button onClick={() => setIsSigningTech(false)}><X className="text-slate-400"/></button></div>
                <div className="bg-white rounded-xl overflow-hidden mb-4 border-2 border-slate-600"><SignaturePad onChange={handleTechSignatureChange} /></div>
                <button onClick={() => setIsSigningTech(false)} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-500 transition-colors">Confirmar Assinatura</button>
             </div>
        </div>
      )}

      {/* MAIN MODAL CONTAINER (WORKBENCH LAYOUT) - h-[100dvh] fixes mobile url bar issue */}
      <div className="w-full h-[100dvh] md:h-[90vh] md:max-w-6xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row bg-[#0f172a] border border-white/10">
        
        {/* === LEFT SIDEBAR (CONTEXT & NAV) === */}
        <aside className="w-full md:w-72 bg-slate-900/95 border-b md:border-b-0 md:border-r border-white/5 flex flex-col flex-shrink-0 z-20">
            {/* Header / OS Number */}
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-900">
                <div className="flex items-center gap-2">
                   <div className="bg-blue-600/20 p-1.5 rounded">
                       <span className="font-mono font-bold text-blue-400 tracking-tight text-lg">{formData.osNumber}</span>
                   </div>
                   <div className="md:hidden">
                       <button onClick={() => setIsMobileDetailsOpen(!isMobileDetailsOpen)} className="text-xs flex items-center gap-1 text-slate-400 bg-slate-800 px-2 py-1 rounded-full border border-slate-700">
                           {isMobileDetailsOpen ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                           {isMobileDetailsOpen ? 'Ocultar Detalhes' : 'Ver Detalhes'}
                       </button>
                   </div>
                </div>
                <button onClick={onClose} className="md:hidden p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg"><X size={20}/></button>
            </div>

            {/* Client Context - HIDDEN ON MOBILE UNLESS EXPANDED */}
            <div className={`p-4 space-y-4 overflow-y-auto custom-scrollbar md:flex-1 ${isMobileDetailsOpen ? 'block flex-1' : 'hidden md:block'}`}>
                
                {/* Status Badge */}
                <div className="flex items-center gap-2 mb-2 bg-slate-800 p-2 rounded-lg border border-slate-700">
                    <span className={`w-3 h-3 rounded-full shadow-lg flex-shrink-0 ${formData.columnId === ColumnType.Done ? 'bg-green-500 shadow-green-500/50' : formData.columnId === ColumnType.Execution ? 'bg-blue-500 shadow-blue-500/50' : 'bg-yellow-500 shadow-yellow-500/50'}`}></span>
                    <select 
                        className="bg-transparent text-sm font-bold text-slate-200 focus:outline-none cursor-pointer uppercase tracking-tight w-full truncate"
                        value={formData.columnId}
                        onChange={(e) => handleInputChange('columnId', e.target.value)}
                    >
                        {COLUMNS.map(col => <option key={col.id} value={col.id} className="bg-slate-900">{col.title}</option>)}
                    </select>
                </div>

                {/* Info Card */}
                <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5 space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="bg-slate-700 p-2 rounded-lg"><User size={16} className="text-slate-300"/></div>
                        <div className="overflow-hidden w-full">
                             <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Cliente</div>
                             <input className="bg-slate-900/50 text-sm font-semibold text-white w-full p-2 rounded border border-slate-700 focus:border-blue-500 outline-none" value={formData.clientName} onChange={(e) => handleInputChange('clientName', e.target.value)} placeholder="Nome do Cliente" />
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="bg-slate-700 p-2 rounded-lg"><Monitor size={16} className="text-slate-300"/></div>
                        <div className="overflow-hidden w-full">
                             <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Equipamento</div>
                             <input className="bg-slate-900/50 text-sm text-slate-200 w-full p-2 rounded border border-slate-700 focus:border-blue-500 outline-none" value={formData.equipment} onChange={(e) => handleInputChange('equipment', e.target.value)} placeholder="Modelo do Equipamento" />
                        </div>
                    </div>
                    {/* Mini Finance Summary */}
                    <div className="pt-2 border-t border-white/5 flex justify-between items-center bg-slate-900/50 p-2 rounded">
                        <span className="text-[10px] text-slate-500 font-bold">Total Estimado</span>
                        <span className="text-sm font-mono font-bold text-green-400">R$ {formatCurrencyValue((formData.serviceCost || 0) + (formData.partsCost || 0))}</span>
                    </div>
                </div>

                {/* Sidebar Footer Actions (Only visible in sidebar when expanded on mobile or always on desktop) */}
                <div className="pt-4 border-t border-white/5 flex gap-2">
                    <button onClick={(e) => { e.preventDefault(); setShowDeleteConfirm(true); }} className="p-3 rounded-xl bg-slate-800 hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors flex-1 flex justify-center"><Trash2 size={18} /></button>
                    <button onClick={() => setIsPrinting(true)} className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 transition-colors flex-1 flex justify-center"><Printer size={18} /></button>
                </div>
            </div>

            {/* Mobile Tab Navigation (Horizontal Scroll) */}
            <div className="md:hidden border-t border-slate-800 bg-slate-900 px-2 py-2">
                 <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {Tabs.map(tab => (
                        <button 
                            key={tab.id} 
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 min-w-[80px] flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                                activeTab === tab.id 
                                ? 'bg-blue-600 text-white' 
                                : 'text-slate-400 bg-slate-800'
                            }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                 </div>
            </div>

            {/* Desktop Navigation Menu (Vertical) */}
            <nav className="hidden md:block p-4 space-y-1 mt-auto border-t border-white/5">
                    <p className="text-[10px] uppercase font-bold text-slate-600 px-2 mb-2">Áreas de Trabalho</p>
                    {Tabs.map(tab => (
                        <button 
                            key={tab.id} 
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                                activeTab === tab.id 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                            }`}
                        >
                            <tab.icon size={18} />
                            {tab.label === 'Info' ? 'Informações' : tab.label === 'Téc' ? 'Técnico' : tab.label === 'Fin' ? 'Financeiro' : 'Chat'}
                            {activeTab === tab.id && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>}
                        </button>
                    ))}
            </nav>
        </aside>

        {/* === RIGHT CANVAS (CONTENT) === */}
        <main className="flex-1 flex flex-col bg-[#0f172a] relative overflow-hidden">
            
            {/* Desktop Close Button (Floating) */}
            <div className="absolute top-4 right-4 z-30 hidden md:block">
                <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full shadow-lg transition-colors"><X size={20}/></button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar pb-24">
                <div className="flex items-center gap-2 mb-4 md:mb-6">
                    {Tabs.find(t => t.id === activeTab)?.icon && React.createElement(Tabs.find(t => t.id === activeTab)!.icon, { className: "text-blue-500", size: 24 })}
                    <h2 className="text-xl md:text-2xl font-bold text-white">
                        {Tabs.find(t => t.id === activeTab)?.label === 'Info' ? 'Informações' : Tabs.find(t => t.id === activeTab)?.label === 'Téc' ? 'Técnico' : Tabs.find(t => t.id === activeTab)?.label === 'Fin' ? 'Financeiro' : 'Chat'}
                    </h2>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    
                    {/* INFO TAB */}
                    {activeTab === 'info' && (
                        <div className="grid grid-cols-1 gap-4 md:gap-6">
                            <div className="glass-panel p-4 md:p-6 rounded-2xl border border-slate-700/50">
                                <label className="text-xs text-slate-500 font-bold block mb-2 md:mb-4 uppercase tracking-wider">Título da O.S.</label>
                                <input className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 md:p-4 text-base md:text-lg text-white font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} placeholder="Ex: Formatação Notebook Dell" />
                                
                                <div className="mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div className="space-y-1.5 md:space-y-2">
                                        <label className="text-xs text-slate-500 font-bold uppercase">Telefone</label>
                                        <input className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-200" value={formData.clientPhone} onChange={(e) => handleInputChange('clientPhone', e.target.value)} type="tel" />
                                    </div>
                                    <div className="space-y-1.5 md:space-y-2">
                                        <label className="text-xs text-slate-500 font-bold uppercase">CPF/CNPJ</label>
                                        <input className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-200" value={formData.clientCpf || ''} onChange={(e) => handleInputChange('clientCpf', e.target.value)} placeholder="000.000.000-00" type="tel" />
                                    </div>
                                    <div className="space-y-1.5 md:space-y-2 md:col-span-2">
                                        <label className="text-xs text-slate-500 font-bold uppercase">Endereço Completo</label>
                                        <input className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-200" value={formData.clientAddress || ''} onChange={(e) => handleInputChange('clientAddress', e.target.value)} placeholder="Rua, Nº, Bairro" />
                                    </div>
                                </div>
                            </div>

                            <div className="glass-panel p-4 md:p-6 rounded-2xl border border-slate-700/50">
                                <label className="text-xs text-slate-500 font-bold block mb-2 md:mb-4 uppercase tracking-wider">Problema Relatado & Checklist</label>
                                <textarea className="w-full h-24 bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 resize-none mb-4 md:mb-6 focus:border-blue-500 outline-none" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Descreva o problema relatado pelo cliente..." />
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                                    {formData.checklist.map(item => (
                                        <button key={item.id} onClick={() => toggleChecklist(item.id)} className={`text-xs p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${item.checked ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'}`}>
                                            <div className={`w-4 h-4 flex-shrink-0 rounded border flex items-center justify-center ${item.checked ? 'bg-green-500 border-green-500' : 'border-slate-600'}`}>
                                                {item.checked && <CheckCircle2 size={10} className="text-slate-900" />}
                                            </div>
                                            <span className="truncate font-medium">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TECHNICAL TAB */}
                    {activeTab === 'technical' && (
                        <div className="grid grid-cols-1 gap-4 md:gap-6">
                             <div className="glass-panel p-0 rounded-2xl border border-slate-700/50 overflow-hidden flex flex-col h-[400px] md:h-[500px]">
                                 <div className="bg-slate-900/50 p-3 border-b border-white/5 flex justify-between items-center">
                                     <span className="text-xs font-bold text-blue-400 uppercase tracking-wider ml-2">Diagnóstico & Laudo</span>
                                     <button onClick={handleDiagnosis} disabled={isDiagnosing} className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-colors">
                                         <Sparkles size={14} /> {isDiagnosing ? '...' : 'IA'}
                                     </button>
                                 </div>
                                 <textarea className="flex-1 w-full bg-slate-900/30 p-4 text-sm text-slate-200 resize-none focus:outline-none leading-relaxed" value={formData.technicalObservation || ''} onChange={(e) => handleInputChange('technicalObservation', e.target.value)} placeholder="Digite o laudo técnico detalhado aqui..." />
                                 <div className="p-3 border-t border-white/5 bg-slate-900/50">
                                      <button onClick={() => setIsSigningTech(true)} className={`w-full flex justify-center items-center gap-2 px-4 py-3 rounded-lg text-xs font-bold border transition-colors ${formData.techSignature ? 'bg-green-900/20 border-green-500 text-green-400' : 'bg-slate-800 border-slate-600 text-slate-400 hover:text-white'}`}>
                                          <PenTool size={14} /> {formData.techSignature ? 'Laudo Assinado' : 'Assinar Laudo Técnico'}
                                      </button>
                                 </div>
                             </div>

                             <div className="glass-panel p-4 md:p-6 rounded-2xl border border-slate-700/50">
                                 <div className="flex justify-between items-center mb-4">
                                     <h3 className="text-sm font-bold text-white uppercase tracking-wider">Evidências (Fotos)</h3>
                                     <button onClick={() => fileInputRef.current?.click()} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-bold transition-colors">+ Adicionar</button>
                                     <input type="file" ref={fileInputRef} className="hidden" onChange={handlePhotoUpload} accept="image/*" />
                                 </div>
                                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                     {(formData.photos || []).map((photo, idx) => (
                                         <div key={idx} className="relative aspect-video bg-black rounded-xl border border-slate-700 overflow-hidden group">
                                             <img src={photo} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                             <button onClick={() => removePhoto(idx)} className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 text-white p-1 rounded-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all md:transform md:hover:scale-110"><Trash2 size={12} /></button>
                                         </div>
                                     ))}
                                     {(formData.photos || []).length === 0 && (
                                         <div className="col-span-full py-8 text-center text-slate-500 text-sm border-2 border-dashed border-slate-800 rounded-xl">
                                             Nenhuma foto anexada.
                                         </div>
                                     )}
                                 </div>
                             </div>
                        </div>
                    )}

                    {/* FINANCIAL TAB */}
                    {activeTab === 'financial' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            <div className="md:col-span-2 space-y-4 md:space-y-6">
                                <div className="glass-panel p-4 md:p-6 rounded-2xl border border-slate-700/50">
                                    <label className="text-xs text-blue-300 font-bold flex items-center gap-2 mb-2 md:mb-4 uppercase tracking-wider"><Plus size={14}/> Adicionar Serviço (Soma ao Total)</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 md:p-4 text-sm text-slate-300 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer hover:bg-slate-800 transition-colors"
                                            onChange={(e) => { 
                                                if(e.target.value) { 
                                                    applyStandardService(e.target.value); 
                                                    // Resetar valor para permitir adicionar o mesmo item novamente se necessário (embora value={''} resolva no render)
                                                    e.target.value = ''; 
                                                } 
                                            }}
                                            value=""
                                        >
                                            <option value="" disabled>Selecione para adicionar...</option>
                                            {PREDEFINED_SERVICES.map(svc => (
                                                <option key={svc.id} value={svc.id}>
                                                    {svc.label} (+ R$ {(svc.serviceCost + svc.partsCost).toFixed(2)})
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-2 ml-1">
                                        * Ao selecionar, o valor é somado aos custos atuais e o item é adicionado ao laudo.
                                    </p>
                                </div>

                                <div className="glass-panel p-4 md:p-6 rounded-2xl border border-slate-700/50">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Composição de Custos</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-slate-500 font-bold mb-1 block">Peças / Hardware</label>
                                            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl p-3 focus-within:border-blue-500 transition-colors">
                                                <span className="text-slate-500 font-semibold">R$</span>
                                                <input 
                                                    type="text" inputMode="numeric" className="bg-transparent w-full focus:outline-none text-white font-mono font-bold"
                                                    value={formatCurrencyValue(formData.partsCost)} 
                                                    onChange={(e) => handleCurrencyChange('partsCost', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 font-bold mb-1 block">Mão de Obra</label>
                                            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl p-3 focus-within:border-blue-500 transition-colors">
                                                <span className="text-slate-500 font-semibold">R$</span>
                                                <input 
                                                    type="text" inputMode="numeric" className="bg-transparent w-full focus:outline-none text-white font-mono font-bold"
                                                    value={formatCurrencyValue(formData.serviceCost)} 
                                                    onChange={(e) => handleCurrencyChange('serviceCost', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-panel p-4 md:p-6 rounded-2xl border border-slate-700/50 bg-gradient-to-b from-slate-800 to-slate-900 flex flex-col justify-between">
                                 <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Resumo do Orçamento</h3>
                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between text-sm text-slate-400"><span>Peças</span><span>R$ {formatCurrencyValue(formData.partsCost)}</span></div>
                                        <div className="flex justify-between text-sm text-slate-400"><span>Serviço</span><span>R$ {formatCurrencyValue(formData.serviceCost)}</span></div>
                                        <div className="h-px bg-slate-700 my-2"></div>
                                        <div className="flex justify-between text-xl font-black text-white"><span>Total</span><span className="text-green-400">R$ {formatCurrencyValue((formData.serviceCost || 0) + (formData.partsCost || 0))}</span></div>
                                    </div>
                                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 mb-4">
                                        <label className="text-xs text-yellow-500 font-bold flex items-center gap-2 mb-1"><Calendar size={12}/> Validade</label>
                                        <input 
                                            type="date" 
                                            className="bg-transparent text-white text-sm focus:outline-none w-full font-mono"
                                            value={new Date(formData.budgetExpiryDate || Date.now()).toISOString().split('T')[0]}
                                            onChange={(e) => { if(e.target.value) handleInputChange('budgetExpiryDate', new Date(e.target.value).getTime()) }}
                                        />
                                    </div>
                                 </div>
                                 <div className="text-[10px] text-slate-500 text-center leading-relaxed">
                                     Em caso de recusa, será cobrada a taxa de diagnóstico de <span className="text-slate-300 font-bold">R$ {formatCurrencyValue(diagnosticFee)}</span>.
                                 </div>
                            </div>
                        </div>
                    )}

                    {/* CHAT TAB */}
                    {activeTab === 'chat' && (
                        <div className="flex flex-col h-[400px] md:h-[500px] glass-panel rounded-2xl border border-slate-700/50 overflow-hidden">
                             <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50 custom-scrollbar">
                                {formData.chatHistory.length === 0 && (
                                    <div className="text-center text-slate-500 mt-20">
                                        <MessageCircle size={40} className="mx-auto mb-2 opacity-50"/>
                                        <p className="text-sm">Nenhuma mensagem registrada.</p>
                                    </div>
                                )}
                                {formData.chatHistory.map(msg => (
                                    <div key={msg.id} className={`flex flex-col ${msg.sender === 'tech' ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'tech' ? 'bg-blue-600 text-white rounded-br-none' : msg.sender === 'system' ? 'bg-slate-700/50 text-slate-400 text-xs italic border border-slate-700' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                                            {msg.message}
                                        </div>
                                        <span className="text-[10px] text-slate-600 mt-1 px-1">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                ))}
                             </div>
                             <form onSubmit={handleSendChat} className="p-3 bg-slate-800 border-t border-white/5 flex gap-2">
                                <input className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Digite uma mensagem..." />
                                <button type="submit" className="bg-blue-600 hover:bg-blue-500 w-12 flex items-center justify-center rounded-xl text-white transition-colors"><Send size={20} /></button>
                             </form>
                        </div>
                    )}
                </div>
            </div>

            {/* Sticky Action Footer (Inside Content Area) */}
            <div className="flex-none p-4 bg-slate-900/90 backdrop-blur-md border-t border-white/10 flex flex-col md:flex-row justify-end gap-3 z-20">
                 {formData.columnId === ColumnType.Entry && (
                     <button onClick={handleSendToApproval} className="w-full md:w-auto px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-yellow-900/20 transition-all">
                        <AlertTriangle size={18} /> <span className="md:inline">Enviar Aprovação</span>
                     </button>
                 )}
                 {formData.columnId === ColumnType.Execution && (
                     <button onClick={handleFinishService} className="w-full md:w-auto px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 transition-all">
                        <CheckCircle2 size={18} /> <span className="md:inline">Concluir</span>
                     </button>
                 )}
                 <button onClick={handleSave} className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all">
                    Salvar
                 </button>
            </div>
        </main>
      </div>
    </div>
  );
};

export default ServiceModal;
