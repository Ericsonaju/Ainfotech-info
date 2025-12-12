
import React, { useState, useEffect, useRef } from 'react';
import { Task, Priority, ChecklistItem, ChatMessage, ColumnType } from '../types';
import { COLUMNS, CONFIG } from '../constants';
import { X, Send, User, Smartphone, Monitor, AlertTriangle, CheckSquare, Sparkles, DollarSign, Camera, Image as ImageIcon, ClipboardList, PenTool, Printer, ChevronDown, Plus, Trash2, ArrowRight, CheckCircle2, Calendar, LayoutList, Signal, FileText, Download, MapPin, CreditCard } from 'lucide-react';
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
}

const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, task, onSave, onDelete, showToast }) => {
  const [formData, setFormData] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'technical' | 'financial' | 'chat'>('info');
  const [chatInput, setChatInput] = useState('');
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  const [pdfMode, setPdfMode] = useState<'entry' | 'full'>('full'); 
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isPdfReady, setIsPdfReady] = useState(false); 
  const [isSigningTech, setIsSigningTech] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (task) {
      setFormData({ ...task });
    }
    setNewChecklistItem('');
    setShowDeleteConfirm(false); 
    setPdfMode('full');
    setIsPdfReady(false);
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
      console.log("[PDF DEBUG - ADMIN] Iniciando execução da geração...");
      const element = document.getElementById('pdf-document-root');
      
      if (!element) { 
          console.error("[PDF DEBUG - ADMIN] Elemento raiz não encontrado!");
          showToast('Erro Interno', 'Elemento do PDF não encontrado na tela.', 'error');
          setIsGeneratingPdf(false);
          return; 
      }
      
      const html2pdfLib = (window as any).html2pdf;
      if (typeof html2pdfLib === 'undefined') {
          console.error("[PDF DEBUG - ADMIN] Biblioteca html2pdf não carregada.");
          showToast('Erro de PDF', 'Biblioteca não carregada. Recarregue a página.', 'error');
          setIsGeneratingPdf(false);
          return;
      }

      window.scrollTo(0,0);
      const filename = pdfMode === 'entry' ? `Recibo-Entrada-${formData.osNumber}.pdf` : `OS-${formData.osNumber}.pdf`;
      
      const opt = { 
          margin: [10, 10, 10, 10], 
          filename: filename, 
          image: { type: 'jpeg', quality: 0.98 }, 
          html2canvas: { 
              scale: 1.5, 
              useCORS: true, 
              logging: true,
              scrollY: 0, 
              backgroundColor: '#ffffff' 
          }, 
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } 
      };

      try { 
          console.log("[PDF DEBUG - ADMIN] Chamando save()...");
          await html2pdfLib().set(opt).from(element).save(); 
          console.log("[PDF DEBUG - ADMIN] Sucesso.");
          showToast('Download Iniciado', 'Documento baixado.', 'success');
      } catch (e: any) { 
          console.error("[PDF DEBUG - ADMIN] Erro:", e);
          showToast('Erro ao Gerar PDF', 'Verifique o console de debug.', 'error');
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
                 <button 
                    onClick={() => { setPdfMode('entry'); setIsPdfReady(false); }}
                    className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${pdfMode === 'entry' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
                 >
                    Recibo Entrada
                 </button>
                 <button 
                    onClick={() => { setPdfMode('full'); setIsPdfReady(false); }}
                    className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${pdfMode === 'full' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
                 >
                    Orçamento/OS Completa
                 </button>
             </div>

             {isGeneratingPdf && (
                 <div className="fixed inset-0 z-[80] bg-white/95 flex flex-col items-center justify-center">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
                     <p className="text-slate-900 font-bold mb-4">Gerando PDF...</p>
                     <p className="text-slate-500 text-sm mb-4">
                        {isPdfReady ? 'Processando arquivo...' : 'Aguardando carregamento das imagens...'}
                     </p>
                     <button onClick={() => setIsGeneratingPdf(false)} className="bg-slate-200 px-4 py-2 rounded text-slate-700 font-bold flex items-center gap-2"><X size={16}/> Cancelar</button>
                 </div>
             )}
             <div className="w-full max-w-[800px] shadow-2xl my-16 md:my-10 relative">
                 <PdfInvoiceTemplate 
                    task={formData} 
                    mode={pdfMode} 
                    onReady={() => {
                        console.log("[PDF DEBUG] Documento reportou PRONTO.");
                        setIsPdfReady(true);
                    }} 
                />
             </div>
          </div>
      );
  }

  const handleInputChange = (field: keyof Task, value: any) => {
    setFormData(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  const handleCurrencyChange = (field: 'partsCost' | 'serviceCost', rawValue: string) => {
    const digits = rawValue.replace(/\D/g, '');
    const numberValue = parseInt(digits || '0', 10) / 100;
    handleInputChange(field, numberValue);
  };

  const formatCurrencyValue = (val?: number) => {
      if (val === undefined || val === null) return '0,00';
      return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const toggleChecklist = (id: string) => {
    setFormData(prev => prev ? ({ ...prev, checklist: prev.checklist.map(item => item.id === id ? { ...item, checked: !item.checked } : item) }) : null);
  };
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
  const removePhoto = (index: number) => {
     setFormData(prev => prev ? ({ ...prev, photos: [...(prev.photos || [])].filter((_, i) => i !== index) }) : null);
  };
  const handleTechSignatureChange = (base64: string) => setFormData(prev => prev ? ({ ...prev, techSignature: base64 }) : null);

  const handleSave = () => { if (formData) { onSave(formData); onClose(); } };
  const confirmDelete = () => { if (formData?.id) { onDelete(formData.id); setShowDeleteConfirm(false); } };
  const handleFinishService = () => {
      if (!formData) return;
      if (!formData.technicalObservation || formData.technicalObservation.length < 10) { 
          showToast('Laudo Obrigatório', 'Preencha o laudo técnico antes de concluir.', 'error');
          setActiveTab('technical'); 
          return; 
      }
      if (!formData.techSignature) { 
          showToast('Assinatura Obrigatória', 'O técnico responsável deve assinar para concluir.', 'error');
          setActiveTab('technical');
          setIsSigningTech(true); 
          return; 
      }
      onSave({ ...formData, columnId: ColumnType.Done, chatHistory: [...formData.chatHistory, { id: `sys-${Date.now()}`, sender: 'system', message: '🛠️ Serviço concluído.', timestamp: Date.now() }] });
      onClose();
  };
  const handleSendToApproval = () => { if (formData) { onSave({ ...formData, columnId: ColumnType.Approval }); onClose(); } }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/70 backdrop-blur-sm">
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
            <div className="glass-panel bg-slate-900 border border-red-500/30 rounded-xl w-full max-w-sm p-6 text-center">
                 <Trash2 size={32} className="text-red-500 mx-auto mb-4" />
                 <h3 className="text-xl font-bold text-white mb-2">Excluir O.S.?</h3>
                 <p className="text-slate-400 text-sm mb-6">Ação irreversível.</p>
                 <div className="flex gap-3"><button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl">Cancelar</button><button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold">Excluir</button></div>
            </div>
        </div>
      )}

      {isSigningTech && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
             <div className="glass-panel bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-4"><h3 className="text-white font-bold">Assinatura Técnico</h3><button onClick={() => setIsSigningTech(false)}><X /></button></div>
                <div className="bg-white rounded-xl overflow-hidden mb-4 border-2 border-slate-600"><SignaturePad onChange={handleTechSignatureChange} /></div>
                <button onClick={() => setIsSigningTech(false)} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl">Confirmar</button>
             </div>
        </div>
      )}

      <div className="glass-panel w-full md:max-w-5xl h-full md:h-[90vh] md:rounded-xl flex flex-col shadow-2xl overflow-hidden bg-[#0f172a] md:bg-opacity-60">
        <div className="flex-none flex justify-between p-4 border-b border-white/10 bg-slate-900/40">
          <div className="flex items-center gap-3 w-full overflow-hidden">
             <span className="bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded text-sm font-mono border border-blue-500/30 whitespace-nowrap">{formData.osNumber}</span>
             <input className="bg-transparent font-bold text-white focus:outline-none w-full truncate" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} />
          </div>
          <button onClick={onClose} className="ml-2 flex-shrink-0"><X size={24} className="text-slate-400 hover:text-white" /></button>
        </div>

        {/* Scrollable Tabs */}
        <div className="flex-none flex border-b border-white/10 px-4 md:px-6 bg-slate-900/20 overflow-x-auto no-scrollbar">
            {[{ id: 'info', label: 'Info', icon: User }, { id: 'technical', label: 'Técnico', icon: PenTool }, { id: 'financial', label: 'Financeiro', icon: DollarSign }, { id: 'chat', label: 'Chat', icon: Send }].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-shrink-0 flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400'}`}><tab.icon size={16} />{tab.label}</button>
            ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-900/30 pb-24 relative">
            
            {activeTab === 'info' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-panel p-4 md:p-5 rounded-lg border border-slate-700/50">
                        <label className="text-xs text-slate-500 font-bold block mb-3 flex items-center gap-2"><User size={14}/> DADOS DO CLIENTE</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                            <input className="w-full bg-slate-900/50 border border-slate-700 rounded p-2 text-sm text-white" value={formData.clientName} onChange={(e) => handleInputChange('clientName', e.target.value)} placeholder="Nome Completo" />
                            <input className="w-full bg-slate-900/50 border border-slate-700 rounded p-2 text-sm text-white" value={formData.clientPhone} onChange={(e) => handleInputChange('clientPhone', e.target.value)} placeholder="Telefone" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                            <div className="flex flex-col">
                                <label className="text-[10px] text-slate-400 mb-1 flex items-center gap-1"><CreditCard size={10}/> CPF/CNPJ</label>
                                <input className="w-full bg-slate-900/50 border border-slate-700 rounded p-2 text-sm text-white" value={formData.clientCpf || ''} onChange={(e) => handleInputChange('clientCpf', e.target.value)} placeholder="000.000.000-00" />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-[10px] text-slate-400 mb-1 flex items-center gap-1"><MapPin size={10}/> Endereço</label>
                                <input className="w-full bg-slate-900/50 border border-slate-700 rounded p-2 text-sm text-white" value={formData.clientAddress || ''} onChange={(e) => handleInputChange('clientAddress', e.target.value)} placeholder="Rua, Nº, Bairro" />
                            </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-slate-700/50">
                           <label className="text-xs text-slate-500 font-bold block mb-3 flex items-center gap-2"><LayoutList size={14}/> STATUS E PRIORIDADE</label>
                           <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1">
                                    <label className="text-[10px] text-slate-400 block mb-1">Status</label>
                                    <select 
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded p-2 text-sm text-white"
                                        value={formData.columnId}
                                        onChange={(e) => handleInputChange('columnId', e.target.value)}
                                    >
                                        {COLUMNS.map(col => (
                                            <option key={col.id} value={col.id}>{col.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] text-slate-400 block mb-1">Prioridade</label>
                                    <select 
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded p-2 text-sm text-white"
                                        value={formData.priority}
                                        onChange={(e) => handleInputChange('priority', e.target.value)}
                                    >
                                        {Object.values(Priority).map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                           </div>
                        </div>
                    </div>
                    
                    {/* CHECKLIST E EQUIPAMENTO */}
                    <div className="glass-panel p-4 md:p-5 rounded-lg border border-slate-700/50 flex flex-col">
                        <label className="text-xs text-slate-500 font-bold block mb-3 flex items-center gap-2"><Monitor size={14}/> EQUIPAMENTO</label>
                        <div className="flex flex-col sm:flex-row gap-2 mb-3">
                             <input className="w-full bg-slate-900/50 border border-slate-700 rounded p-2 text-sm text-white" value={formData.equipment} onChange={(e) => handleInputChange('equipment', e.target.value)} placeholder="Modelo" />
                             <input className="w-full bg-slate-900/50 border border-slate-700 rounded p-2 text-sm text-white" value={formData.serialNumber || ''} onChange={(e) => handleInputChange('serialNumber', e.target.value)} placeholder="Nº Série / IMEI" />
                        </div>
                        <label className="text-[10px] text-slate-400 block mb-1">Defeito Relatado</label>
                        <textarea className="w-full h-20 bg-slate-900/50 border border-slate-700 rounded p-2 text-sm text-white resize-none mb-3" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Descrição do problema..." />
                        
                        {/* Checklist Integrado */}
                        <div className="flex-1 overflow-y-auto border-t border-slate-700 pt-3">
                             <div className="flex justify-between items-center mb-2"><span className="text-[10px] uppercase font-bold text-slate-500">Checklist de Entrada</span></div>
                             <div className="grid grid-cols-2 gap-2">
                                {formData.checklist.map(item => (
                                    <button key={item.id} onClick={() => toggleChecklist(item.id)} className={`text-xs p-1.5 rounded border text-left flex items-center gap-2 ${item.checked ? 'bg-green-900/20 border-green-800 text-green-400' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'}`}>
                                        {item.checked ? <CheckCircle2 size={12}/> : <div className="w-3 h-3 border border-slate-500 rounded-full"></div>}
                                        <span className="truncate">{item.label}</span>
                                    </button>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'technical' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-panel p-4 rounded-lg border border-slate-700/50">
                         <label className="text-xs text-blue-400 font-bold block mb-2">LAUDO TÉCNICO</label>
                         <textarea className="w-full h-64 bg-slate-900/50 border border-slate-700 rounded p-3 text-sm text-white resize-none" value={formData.technicalObservation || ''} onChange={(e) => handleInputChange('technicalObservation', e.target.value)} placeholder="Diagnóstico técnico detalhado..." />
                    </div>
                    <div className="glass-panel p-4 rounded-lg border border-slate-700/50">
                        <div className="flex justify-between mb-2"><span className="text-xs text-slate-300 font-bold">FOTOS (Max 4)</span><button onClick={() => fileInputRef.current?.click()} className="text-xs bg-blue-600 px-2 py-1 rounded text-white">+ Add</button><input type="file" ref={fileInputRef} className="hidden" onChange={handlePhotoUpload} /></div>
                        <div className="grid grid-cols-2 gap-2">
                             {(formData.photos || []).map((photo, idx) => (
                                 <div key={idx} className="relative aspect-video bg-black rounded border border-slate-700"><img src={photo} className="w-full h-full object-cover" /><button onClick={() => removePhoto(idx)} className="absolute top-1 right-1 bg-red-600 text-white p-0.5 rounded"><X size={10} /></button></div>
                             ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-700">
                             <button onClick={() => setIsSigningTech(true)} className={`w-full py-2 text-xs rounded border ${formData.techSignature ? 'bg-green-900/20 border-green-500 text-green-400' : 'bg-slate-700 border-slate-600 text-slate-300'}`}>{formData.techSignature ? 'Assinado Digitalmente' : 'Assinar Laudo'}</button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'financial' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="glass-panel p-6 rounded-lg border border-slate-700/50">
                        <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2"><DollarSign size={20} /> Orçamento</h3>
                        
                        <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-700/50 mb-4 flex justify-between items-center">
                            <label className="text-xs text-yellow-500 font-bold flex items-center gap-2"><Calendar size={14}/> Validade da Proposta</label>
                            <input 
                                type="date" 
                                className="bg-transparent text-white text-sm focus:outline-none text-right"
                                value={new Date(formData.budgetExpiryDate || Date.now()).toISOString().split('T')[0]}
                                onChange={(e) => {
                                    if(e.target.value) {
                                        handleInputChange('budgetExpiryDate', new Date(e.target.value).getTime())
                                    }
                                }}
                            />
                        </div>

                        <div className="space-y-4">
                             <div>
                                <label className="text-xs text-slate-400">Peças</label>
                                <div className="flex gap-2 text-white text-xl font-bold bg-slate-900/50 border border-slate-700 rounded p-2">
                                    <span className="text-slate-500">R$</span>
                                    <input 
                                        type="text"
                                        inputMode="numeric"
                                        className="bg-transparent w-full focus:outline-none"
                                        value={formatCurrencyValue(formData.partsCost)} 
                                        onChange={(e) => handleCurrencyChange('partsCost', e.target.value)}
                                        placeholder="0,00"
                                    />
                                </div>
                             </div>
                             <div>
                                <label className="text-xs text-slate-400">Mão de Obra</label>
                                <div className="flex gap-2 text-white text-xl font-bold bg-slate-900/50 border border-slate-700 rounded p-2">
                                    <span className="text-slate-500">R$</span>
                                    <input 
                                        type="text"
                                        inputMode="numeric"
                                        className="bg-transparent w-full focus:outline-none"
                                        value={formatCurrencyValue(formData.serviceCost)} 
                                        onChange={(e) => handleCurrencyChange('serviceCost', e.target.value)}
                                        placeholder="0,00"
                                    />
                                </div>
                             </div>
                             <div className="pt-4 border-t border-slate-700 flex justify-between text-xl font-bold text-green-400"><span>TOTAL</span><span>R$ {((formData.serviceCost || 0) + (formData.partsCost || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                             <div className="text-[10px] text-red-400 italic text-right mt-1">Em caso de recusa, aplicar taxa de: R$ {CONFIG.diagnosticFee.toFixed(2)}</div>
                        </div>
                     </div>
                     <div className="glass-panel p-5 rounded-lg border border-slate-700/50 flex flex-col">
                        <div className="flex justify-between mb-2"><h3 className="text-sm font-bold text-slate-300">Plano de Ação</h3><button onClick={handleDiagnosis} disabled={isDiagnosing} className="text-xs text-blue-400 border border-blue-500/30 px-2 py-1 rounded">IA Gerar</button></div>
                        <div className="flex-1 overflow-y-auto space-y-2 text-sm text-slate-300">{(formData.subtasks || []).map((st, i) => <div key={i} className="bg-slate-800/50 p-2 rounded border border-slate-700/50">{i+1}. {st.title}</div>)}</div>
                     </div>
                </div>
            )}

            {activeTab === 'chat' && (
                <div className="flex flex-col h-full">
                     <div className="glass-panel bg-slate-800/20 border border-slate-700/50 rounded-lg flex-1 mb-4 p-4 overflow-y-auto">
                        {formData.chatHistory.map(msg => <div key={msg.id} className={`flex mb-2 ${msg.sender === 'tech' ? 'justify-end' : 'justify-start'}`}><div className={`p-2 rounded-lg text-sm ${msg.sender === 'tech' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'}`}>{msg.message}</div></div>)}
                     </div>
                     <form onSubmit={handleSendChat} className="flex gap-2"><input className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white" value={chatInput} onChange={e => setChatInput(e.target.value)} /><button type="submit" className="bg-blue-600 px-4 rounded-lg text-white"><Send size={20} /></button></form>
                </div>
            )}
        </div>

        <div className="flex-none p-4 border-t border-white/10 bg-slate-900/60 flex flex-col md:flex-row justify-between gap-4 md:gap-0">
            <div className="flex gap-2 justify-between md:justify-start">
                 <button onClick={(e) => { e.preventDefault(); setShowDeleteConfirm(true); }} className="text-slate-500 hover:text-red-400 p-2"><Trash2 size={18} /></button>
                 <button onClick={() => { setPdfMode('full'); setIsPrinting(true); }} className="text-slate-400 hover:text-white flex items-center gap-2 px-2"><Printer size={18} /> PDF</button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
                 {formData.columnId === ColumnType.Entry && <button onClick={handleSendToApproval} className="flex-1 whitespace-nowrap bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-3 md:py-2 rounded text-sm font-bold">Enviar Aprovação</button>}
                 {formData.columnId === ColumnType.Execution && <button onClick={handleFinishService} className="flex-1 whitespace-nowrap bg-green-600 hover:bg-green-500 text-white px-4 py-3 md:py-2 rounded text-sm font-bold">Concluir</button>}
                 <button onClick={handleSave} className="flex-1 whitespace-nowrap bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 md:py-2 rounded text-sm font-bold">Salvar</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceModal;
