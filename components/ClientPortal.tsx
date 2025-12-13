
import React, { useState, useEffect } from 'react';
import { Task, ColumnType, ChatMessage } from '../types';
import { LEGAL_TERMS, COMPANY_INFO, CONFIG } from '../constants';
import { CheckCircle2, FileText, Download, LogOut, Send, Image as ImageIcon, XCircle, PenTool, AlertTriangle, Clock, MessageSquare, ArrowRight, CalendarClock, Ban, CheckSquare, Camera, X, Bug } from 'lucide-react';
import SignaturePad from './SignaturePad';
import { ToastType } from './Toast';

interface PdfTemplateProps {
    task: Task;
    mode: 'entry' | 'full';
    onReady: () => void;
    diagnosticFee: number;
}

// --- COMPONENTE DE DOCUMENTO PDF DEDICADO ---
export const PdfInvoiceTemplate: React.FC<PdfTemplateProps> = ({ task, mode, onReady, diagnosticFee }) => {
    const totalCost = (Number(task.serviceCost) || 0) + (Number(task.partsCost) || 0);
    const isApproved = task.isApproved;
    const expiryDate = new Date(task.budgetExpiryDate || Date.now());
    const isExpired = !isApproved && Date.now() > expiryDate.getTime();

    // Avisa que o componente montou, mas dá um tempo extra para imagens renderizarem
    useEffect(() => {
        console.log(`[PDF DEBUG] Template montado. Modo: ${mode}. Aguardando renderização de imagens...`);
        const timer = setTimeout(() => {
            console.log("[PDF DEBUG] Tempo de espera concluído. Disparando onReady.");
            onReady();
        }, 3000); // Aumentado para 3s para garantir carregamento de imagens externas
        return () => clearTimeout(timer);
    }, [mode]);

    const textBlack = { color: '#000000', borderColor: '#000000' };

    return (
        <div id="pdf-document-root" style={{ ...textBlack, backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif', padding: '40px', maxWidth: '800px', margin: '0 auto', minHeight: '1123px', position: 'relative' }}>

            {/* BANNER DE STATUS DO DOCUMENTO */}
            <div style={{
                textAlign: 'center',
                padding: '10px',
                backgroundColor: mode === 'entry' ? '#f1f5f9' : (isApproved ? '#dcfce7' : isExpired ? '#fee2e2' : '#fef9c3'),
                border: `2px solid ${mode === 'entry' ? '#475569' : (isApproved ? '#166534' : isExpired ? '#991b1b' : '#854d0e')}`,
                marginBottom: '20px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                color: '#000'
            }}>
                {mode === 'entry'
                    ? 'PROTOCOLO DE ENTRADA E TERMO DE CIÊNCIA'
                    : (isApproved ? 'ORDEM DE SERVIÇO APROVADA' : isExpired ? 'ORÇAMENTO EXPIRADO' : `ORÇAMENTO PRÉVIO - VÁLIDO ATÉ ${expiryDate.toLocaleDateString()}`)
                }
            </div>

            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px', borderBottom: '2px solid #000', marginBottom: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', color: '#000', margin: '0 0 5px 0', letterSpacing: '1px' }}>
                        {mode === 'entry' ? 'RECIBO DE ENTREGA' : (isApproved ? 'ORDEM DE SERVIÇO' : 'ORÇAMENTO')}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '16px', color: '#000', fontWeight: 'bold', backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                            #{task.osNumber}
                        </span>
                        <span style={{ fontSize: '12px', color: '#000' }}>
                            Emissão: {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '11px', color: '#000', lineHeight: '1.4' }}>
                    <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', margin: '0 0 5px 0' }}>{COMPANY_INFO.name}</h2>
                    <p style={{ margin: 0, color: '#000' }}>CNPJ: {COMPANY_INFO.cnpj}</p>
                    <p style={{ margin: 0, color: '#000' }}>{COMPANY_INFO.address}</p>
                    <p style={{ margin: 0, color: '#000' }}>{COMPANY_INFO.phone}</p>
                </div>
            </div>

            {/* DADOS DO CLIENTE */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                <div style={{ flex: 1, border: '1px solid #000', borderRadius: '4px', padding: '10px', position: 'relative' }}>
                    <span style={{ position: 'absolute', top: '-8px', left: '10px', background: 'white', padding: '0 5px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#000' }}>Contratante / Cliente</span>
                    <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', color: '#000' }}>
                        <tbody>
                            <tr><td style={{ fontWeight: 'bold', width: '60px' }}>Nome:</td><td>{task.clientName}</td></tr>
                            <tr><td style={{ fontWeight: 'bold' }}>CPF/CNPJ:</td><td>{task.clientCpf || 'N/I'}</td></tr>
                            <tr><td style={{ fontWeight: 'bold' }}>Endereço:</td><td>{task.clientAddress || 'N/I'}</td></tr>
                            <tr><td style={{ fontWeight: 'bold' }}>Tel:</td><td>{task.clientPhone}</td></tr>
                        </tbody>
                    </table>
                </div>
                <div style={{ flex: 1, border: '1px solid #000', borderRadius: '4px', padding: '10px', position: 'relative' }}>
                    <span style={{ position: 'absolute', top: '-8px', left: '10px', background: 'white', padding: '0 5px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#000' }}>Objeto / Equipamento</span>
                    <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', color: '#000' }}>
                        <tbody>
                            <tr><td style={{ fontWeight: 'bold', width: '60px' }}>Item:</td><td>{task.equipment}</td></tr>
                            <tr><td style={{ fontWeight: 'bold' }}>Serial:</td><td>{task.serialNumber || 'N/A'}</td></tr>
                            <tr><td style={{ fontWeight: 'bold' }}>Defeito:</td><td style={{ fontStyle: 'italic' }}>"{task.description}"</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* VISTORIA DE ENTRADA */}
            <div style={{ marginBottom: '20px', border: '1px solid #000', borderRadius: '4px', padding: '10px', backgroundColor: '#fcfcfc' }}>
                <h3 style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '10px', color: '#000' }}>
                    Laudo Visual de Entrada (Declaração de Estado Físico)
                </h3>

                {/* Checklist Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px', marginBottom: '15px' }}>
                    {(task.checklist || []).map(item => (
                        <div key={item.id} style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '5px', color: '#000' }}>
                            <div style={{
                                width: '12px', height: '12px',
                                border: '1px solid #000',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                backgroundColor: item.checked ? '#000' : 'white'
                            }}>
                                {item.checked && <span style={{ color: 'white', fontSize: '10px' }}>✓</span>}
                            </div>
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>

                {/* Registro Fotográfico de Entrada - Layout Profissional */}
                {(task.photos && task.photos.length > 0) && (
                    <div style={{
                        marginTop: '15px',
                        padding: '10px',
                        border: '2px solid #ea580c',
                        borderRadius: '6px',
                        backgroundColor: '#fff7ed'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '10px',
                            paddingBottom: '8px',
                            borderBottom: '1px solid #fed7aa'
                        }}>
                            <span style={{ fontSize: '16px' }}>📸</span>
                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#9a3412', textTransform: 'uppercase' }}>
                                Registro Fotográfico de Entrada
                            </span>
                            <span style={{ fontSize: '9px', color: '#c2410c', marginLeft: 'auto' }}>
                                {task.photos.length} foto(s) anexada(s)
                            </span>
                        </div>
                        <p style={{ fontSize: '9px', color: '#78350f', marginBottom: '10px', fontStyle: 'italic' }}>
                            As fotos abaixo documentam o estado físico do equipamento no momento da entrada, servindo como prova para ambas as partes.
                        </p>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '8px'
                        }}>
                            {task.photos.map((photo, idx) => (
                                <div key={idx} style={{
                                    border: '2px solid #9a3412',
                                    borderRadius: '4px',
                                    overflow: 'hidden',
                                    backgroundColor: '#000'
                                }}>
                                    <img
                                        src={photo}
                                        crossOrigin="anonymous"
                                        style={{
                                            width: '100%',
                                            height: '80px',
                                            objectFit: 'cover',
                                            display: 'block'
                                        }}
                                        alt={`Foto ${idx + 1}`}
                                    />
                                    <div style={{
                                        backgroundColor: '#9a3412',
                                        color: 'white',
                                        fontSize: '8px',
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        padding: '2px'
                                    }}>
                                        FOTO #{idx + 1}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* LAUDO TÉCNICO */}
            {(mode === 'full' || task.technicalObservation) && (
                <div style={{ marginBottom: '20px', border: '1px solid #000', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ backgroundColor: '#f0f0f0', padding: '5px 10px', borderBottom: '1px solid #000', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#000' }}>
                        Diagnóstico Técnico
                    </div>
                    <div style={{ padding: '10px', fontSize: '12px', lineHeight: '1.5', minHeight: '50px', color: '#000', whiteSpace: 'pre-wrap' }}>
                        {task.technicalObservation || 'Equipamento em fase de análise.'}
                    </div>
                </div>
            )}

            {/* VALORES (APENAS MODO FULL) */}
            {mode === 'full' && (
                <>
                    {/* AVISO IMPORTANTE SE NÃO APROVADO */}
                    {!isApproved && (
                        <div style={{ marginBottom: '20px', border: '1px dashed #000', borderRadius: '4px', padding: '10px', backgroundColor: '#fff', color: '#000' }}>
                            <h4 style={{ margin: '0 0 5px 0', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Validade e Taxas (Art. 40 § 2º CDC)</h4>
                            <p style={{ fontSize: '10px', margin: 0, textAlign: 'justify', lineHeight: '1.4' }}>
                                O orçamento é válido por <strong>{CONFIG.budgetValidityDays} dias</strong>. A execução do serviço é isenta de taxas. Porém, em caso de <strong>recusa, retirada sem reparo ou desistência</strong> após o diagnóstico técnico realizado, será cobrada a
                                <strong> TAXA DE DIAGNÓSTICO de R$ {diagnosticFee.toFixed(2)}</strong> referente às horas técnicas de análise e desmontagem.
                            </p>
                        </div>
                    )}

                    <div style={{ marginBottom: '25px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', border: '1px solid #000', color: '#000' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#e2e8f0', color: '#000' }}>
                                    <th style={{ textAlign: 'left', padding: '6px 10px', borderBottom: '1px solid #000' }}>DESCRIÇÃO</th>
                                    <th style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid #000' }}>VALOR (R$)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td style={{ padding: '6px 10px', borderBottom: '1px solid #000' }}>Peças / Hardware</td><td style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid #000' }}>{Number(task.partsCost || 0).toFixed(2)}</td></tr>
                                <tr><td style={{ padding: '6px 10px', borderBottom: '1px solid #000' }}>Mão de Obra Técnica</td><td style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid #000' }}>{Number(task.serviceCost || 0).toFixed(2)}</td></tr>
                                <tr style={{ fontWeight: 'bold', fontSize: '14px', backgroundColor: '#f0f0f0' }}>
                                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>TOTAL GERAL (SERVIÇO)</td>
                                    <td style={{ textAlign: 'right', padding: '8px 10px' }}>R$ {totalCost.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* TERMOS LEGAIS */}
            <div style={{ marginBottom: '20px', borderTop: '2px solid #000', paddingTop: '10px' }}>
                <h4 style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px', color: '#000' }}>Termos de Ciência e Condições Gerais (Contrato de Serviço)</h4>
                <div style={{ fontSize: '8px', textAlign: 'justify', color: '#000', lineHeight: '1.25', columnCount: 2, columnGap: '20px' }}>
                    <strong>{LEGAL_TERMS.backup}</strong><br /><br />
                    <strong>{LEGAL_TERMS.hardware}</strong><br /><br />
                    <strong>{LEGAL_TERMS.software}</strong><br /><br />
                    <strong>{LEGAL_TERMS.abandonment}</strong>
                    {mode === 'entry' && (
                        <>
                            <br /><br /><strong>DECLARAÇÃO DE VISTORIA:</strong> O cliente declara ter acompanhado a vistoria inicial e concorda com o estado físico relatado acima (checklist e fotos), isentando a assistência de responsabilidade sobre marcas de uso pré-existentes.
                        </>
                    )}
                </div>
            </div>

            {/* ASSINATURAS */}
            <div style={{ border: '2px solid #000', borderRadius: '6px', padding: '15px', marginTop: 'auto' }}>
                <div style={{ fontSize: '10px', textAlign: 'center', marginBottom: '15px', color: '#000', fontStyle: 'italic' }}>
                    {mode === 'entry'
                        ? `Eu, ${task.clientName}, portador(a) do CPF/CNPJ ${task.clientCpf || 'informado'}, DECLARO ter lido os termos acima, especialmente sobre a NÃO RESPONSABILIDADE DA EMPRESA SOBRE MEUS DADOS E ARQUIVOS (item 3), e autorizo a análise técnica.`
                        : (isApproved
                            ? `Eu, ${task.clientName}, APROVO a execução do serviço e valores descritos, estando ciente dos prazos de garantia e condições de pagamento.`
                            : `Eu, ${task.clientName}, recebi este orçamento e estou ciente da validade e da taxa de diagnóstico em caso de recusa posterior.`
                        )
                    }
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '30px' }}>
                    {/* ASSINATURA TÉCNICO */}
                    <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {task.techSignature ? (
                            <img src={task.techSignature} crossOrigin="anonymous" alt="Assinatura Técnico" style={{ height: '50px', marginBottom: '-10px', objectFit: 'contain' }} />
                        ) : <div style={{ height: '50px' }}></div>}
                        <div style={{ width: '100%', borderTop: '1px solid #000', paddingTop: '5px' }}>
                            <p style={{ fontSize: '9px', margin: 0, fontWeight: 'bold', color: '#000' }}>{COMPANY_INFO.techName}</p>
                            <p style={{ fontSize: '8px', margin: 0, color: '#000' }}>Técnico Responsável</p>
                        </div>
                    </div>

                    {/* ASSINATURA CLIENTE */}
                    <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {task.signature ? (
                            <img src={task.signature} crossOrigin="anonymous" alt="Assinatura Cliente" style={{ height: '50px', marginBottom: '-10px', objectFit: 'contain' }} />
                        ) : <div style={{ height: '50px' }}></div>}
                        <div style={{ width: '100%', borderTop: '1px solid #000', paddingTop: '5px' }}>
                            <p style={{ fontSize: '9px', margin: 0, fontWeight: 'bold', color: '#000' }}>{task.clientName}</p>
                            <p style={{ fontSize: '8px', margin: 0, color: '#000' }}>Contratante / Cliente</p>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '8px', color: '#666' }}>
                Documento gerado eletronicamente em {new Date().toLocaleString()} - Autenticação Digital ID: {task.id ? task.id.slice(0, 8) : 'PENDENTE'}
            </div>
        </div>
    );
};

interface ClientPortalProps {
    task: Task;
    onUpdate: (task: Task) => void;
    onLogout: () => void;
    showToast: (title: string, message: string, type: ToastType) => void;
    diagnosticFee: number;
}

const ClientPortal: React.FC<ClientPortalProps> = ({ task, onUpdate, onLogout, showToast, diagnosticFee }) => {
    const [chatInput, setChatInput] = useState('');
    const [isSigning, setIsSigning] = useState(false);
    const [tempSignature, setTempSignature] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [pdfMode, setPdfMode] = useState<'entry' | 'full' | null>(null);

    const totalCost = (task.serviceCost || 0) + (task.partsCost || 0);
    const expiryDate = new Date(task.budgetExpiryDate || Date.now());
    const isExpired = !task.isApproved && Date.now() > expiryDate.getTime();
    const daysLeft = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 3600 * 24));

    // Status Flow Logic
    const steps = [
        { id: ColumnType.Entry, label: 'Triagem', icon: Clock },
        { id: ColumnType.Approval, label: 'Aprovação', icon: AlertTriangle },
        { id: ColumnType.Execution, label: 'Em Reparo', icon: PenTool },
        { id: ColumnType.Done, label: 'Pronto', icon: CheckCircle2 },
    ];
    const currentStepIndex = steps.findIndex(s => s.id === task.columnId);

    const getStatusColor = () => {
        if (isExpired) return 'from-red-900 to-slate-900 border-red-700';
        switch (task.columnId) {
            case ColumnType.Entry: return 'from-slate-800 to-slate-900 border-slate-700';
            case ColumnType.Approval: return 'from-yellow-900/40 to-slate-900 border-yellow-500/50';
            case ColumnType.Execution: return 'from-blue-900/40 to-slate-900 border-blue-500/50';
            case ColumnType.Done: return 'from-green-900/40 to-slate-900 border-green-500/50';
            default: return 'from-slate-800 to-slate-900';
        }
    };

    const handleSendChat = (e: React.FormEvent, customMessage?: string) => {
        if (e) e.preventDefault();
        const msgContent = customMessage || chatInput;
        if (!msgContent.trim()) return;
        const newMessage: ChatMessage = { id: `msg-${Date.now()}`, sender: 'client', message: msgContent, timestamp: Date.now() };
        onUpdate({ ...task, chatHistory: [...task.chatHistory, newMessage] });
        setChatInput('');
    };

    const handleSignatureChange = (base64: string) => setTempSignature(base64);

    const handleConfirmSignature = () => {
        if (!tempSignature) {
            showToast('Assinatura Obrigatória', 'Por favor, assine no campo indicado para confirmar.', 'warning');
            return;
        }
        onUpdate({
            ...task,
            signature: tempSignature,
            isApproved: true,
            columnId: ColumnType.Execution,
            chatHistory: [...task.chatHistory, { id: `sys-${Date.now()}`, sender: 'system', message: '✅ ORÇAMENTO APROVADO PELO CLIENTE', timestamp: Date.now() }]
        });
        showToast('Aprovado!', 'Serviço aprovado com sucesso. O técnico será notificado.', 'success');
        setIsSigning(false);
    };

    const handleRejectSubmit = () => {
        if (!rejectionReason.trim()) {
            showToast('Motivo Necessário', 'Por favor, informe o motivo da recusa.', 'warning');
            return;
        }
        handleSendChat({} as React.FormEvent, `❌ ORÇAMENTO REPROVADO. Motivo: ${rejectionReason}`);
        showToast('Orçamento Recusado', 'A recusa foi registrada.', 'info');
        setIsRejecting(false);
    };

    // --- FUNÇÃO DE GERAÇÃO COM DEBUG ---
    const executePdfGeneration = async () => {
        console.log("[PDF DEBUG] Iniciando processo de geração...");
        const element = document.getElementById('pdf-document-root');

        if (!element) {
            console.error("[PDF DEBUG] Elemento raiz não encontrado!");
            showToast('Erro Interno', 'Elemento do PDF não encontrado na tela.', 'error');
            setPdfMode(null);
            return;
        }

        if (!pdfMode) {
            console.error("[PDF DEBUG] Modo PDF não definido!");
            setPdfMode(null);
            return;
        }

        const html2pdfLib = (window as any).html2pdf;
        if (typeof html2pdfLib === 'undefined') {
            console.error("[PDF DEBUG] Biblioteca html2pdf não carregada no window.");
            showToast('Erro de PDF', 'Biblioteca não carregada. Tente recarregar a página.', 'error');
            setPdfMode(null);
            return;
        }

        console.log(`[PDF DEBUG] Biblioteca OK. Elemento encontrado. Altura: ${element.clientHeight}px`);

        window.scrollTo(0, 0); // Força topo para evitar cortes
        const filename = pdfMode === 'entry' ? `Recibo-Entrada-${task.osNumber}.pdf` : `OS-${task.osNumber}.pdf`;

        const opt = {
            margin: [10, 10, 10, 10],
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 1.5,
                useCORS: true, // Tenta contornar CORS de imagens
                logging: true, // Ativa logs do html2canvas no console
                scrollY: 0,
                backgroundColor: '#ffffff'
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        try {
            console.log("[PDF DEBUG] Chamando html2pdf().save()...");
            await html2pdfLib().set(opt).from(element).save();
            console.log("[PDF DEBUG] PDF gerado e enviado para download.");
            showToast('Download Iniciado', 'Seu documento está sendo baixado.', 'success');
        } catch (e: any) {
            console.error("[PDF DEBUG] Erro fatal na geração:", e);
            showToast('Erro ao Gerar PDF', 'Falha ao processar imagens. Tente imprimir (Ctrl+P).', 'error');
        } finally {
            setPdfMode(null);
        }
    };

    const currentStep = steps.find(s => s.id === task.columnId);
    const StatusIcon = isExpired ? Ban : (currentStep?.icon || Clock);

    return (
        <div className="min-h-screen pb-20 relative bg-slate-950 text-slate-200 font-sans">
            {pdfMode && (
                <div className="fixed inset-0 z-[99999] bg-white overflow-y-auto flex items-center justify-center">
                    <div className="fixed top-0 left-0 w-full h-full bg-white/95 z-[100] flex flex-col items-center justify-center p-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-6"></div>
                        <p className="text-slate-900 font-bold text-lg mb-2">Gerando Documento PDF...</p>
                        <p className="text-slate-500 text-sm mb-6">Processando imagens e assinaturas... (Aguarde até 5s)</p>
                        <p className="text-xs text-red-400 font-mono mb-4 bg-red-100 p-2 rounded">Verifique o console (F12) se demorar muito.</p>
                        <button
                            onClick={() => setPdfMode(null)}
                            className="flex items-center gap-2 px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-full font-bold transition-colors mb-4"
                        >
                            <X size={18} /> Cancelar / Fechar
                        </button>
                    </div>
                    <PdfInvoiceTemplate task={task} mode={pdfMode} onReady={executePdfGeneration} diagnosticFee={diagnosticFee} />
                </div>
            )}

            {/* HEADER */}
            <header className="bg-slate-900/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <FileText className="text-white" size={20} />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-white uppercase">Portal do Cliente</h1>
                            <p className="text-[10px] text-blue-400 font-mono">OS #{task.osNumber}</p>
                        </div>
                    </div>
                    <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-400" title="Sair" aria-label="Sair do portal"><LogOut size={20} /></button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">

                {/* HERO STATUS CARD */}
                <div className={`rounded-2xl border p-6 md:p-10 bg-gradient-to-br ${getStatusColor()} shadow-2xl relative overflow-hidden`}>
                    <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm border border-white/10">
                            <StatusIcon size={40} className={isExpired ? "text-red-300" : ""} />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                {isExpired ? "Orçamento Expirado" : task.columnId === ColumnType.Approval ? "Aprovação Necessária" : "Status Atualizado"}
                            </h2>
                            <p className="text-slate-300 max-w-2xl">
                                {isExpired
                                    ? "A validade deste orçamento expirou. Entre em contato para revalidar os valores."
                                    : task.columnId === ColumnType.Approval
                                        ? "Técnico concluiu o diagnóstico. Confira os valores e aprove para iniciarmos."
                                        : "Acompanhe o andamento do seu serviço em tempo real."}
                            </p>

                            {/* INFO DE VALIDADE DO ORÇAMENTO */}
                            {!task.isApproved && !isExpired && (
                                <div className="mt-4 flex items-center justify-center md:justify-start gap-2 text-yellow-300 bg-yellow-900/30 w-fit px-3 py-1 rounded-full border border-yellow-500/30">
                                    <CalendarClock size={16} />
                                    <span className="text-xs font-bold uppercase">Válido até: {expiryDate.toLocaleDateString()} ({daysLeft} dias restantes)</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => setPdfMode('full')}
                                disabled={!!pdfMode}
                                className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-semibold backdrop-blur-sm transition-all"
                            >
                                <Download size={18} /> Baixar {task.isApproved ? 'Ordem de Serviço' : 'Orçamento'}
                            </button>
                            <button
                                onClick={() => setPdfMode('entry')}
                                disabled={!!pdfMode}
                                className="flex items-center gap-2 px-5 py-2 bg-slate-900/50 hover:bg-slate-900/80 text-slate-300 text-xs border border-slate-700 rounded-lg backdrop-blur-sm transition-all justify-center"
                            >
                                <FileText size={14} /> Baixar Recibo de Entrada
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Timeline */}
                        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between relative">
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -translate-y-1/2 z-0"></div>
                            {steps.map((step, idx) => (
                                <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${idx <= currentStepIndex ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
                                        <step.icon size={14} />
                                    </div>
                                    <span className="text-[10px] text-slate-400">{step.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Detalhes e Laudo */}
                        <div className="glass-panel p-6 rounded-2xl space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label className="text-xs text-slate-500 uppercase font-bold">Equipamento</label><p className="text-white">{task.equipment}</p></div>
                                <div><label className="text-xs text-slate-500 uppercase font-bold">Defeito</label><p className="text-slate-300 text-sm">"{task.description}"</p></div>
                            </div>

                            {/* Exibição Visual do Checklist */}
                            <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                                <label className="text-xs text-slate-500 uppercase font-bold flex gap-2 mb-3"><CheckSquare size={14} /> Checklist de Entrada</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {(task.checklist || []).map(item => (
                                        <div key={item.id} className={`text-xs px-2 py-1 rounded border flex items-center gap-2 ${item.checked ? 'bg-green-900/20 border-green-800 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                                            {item.checked ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 border border-slate-600 rounded-full"></div>}
                                            {item.label}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Fotos */}
                            {(task.photos && task.photos.length > 0) && (
                                <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                                    <label className="text-xs text-slate-500 uppercase font-bold flex gap-2 mb-3"><Camera size={14} /> Fotos do Equipamento</label>
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {task.photos.map((photo, i) => (
                                            <img key={i} src={photo} className="h-20 w-auto rounded border border-slate-600" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {task.technicalObservation && (
                                <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                                    <label className="text-xs text-blue-400 uppercase font-bold flex gap-2"><PenTool size={12} /> Laudo Técnico</label>
                                    <p className="text-slate-200 text-sm mt-2">{task.technicalObservation}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Coluna Ações */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* CARD DE APROVAÇÃO COM AVISO DE TAXA */}
                        {task.columnId === ColumnType.Approval && !task.isApproved && !isExpired && (
                            <div className="bg-slate-800 rounded-2xl border border-yellow-500/30 p-6 shadow-xl relative animate-in slide-in-from-right-4">
                                <div className="flex items-center gap-2 text-yellow-500 mb-4">
                                    <AlertTriangle size={20} className="animate-pulse" />
                                    <h3 className="font-bold">Aprovação Pendente</h3>
                                </div>

                                <div className="space-y-2 mb-6 text-sm">
                                    <div className="flex justify-between text-slate-400"><span>Peças</span><span>R$ {task.partsCost?.toFixed(2)}</span></div>
                                    <div className="flex justify-between text-slate-400"><span>Mão de Obra</span><span>R$ {task.serviceCost?.toFixed(2)}</span></div>
                                    <div className="pt-2 border-t border-slate-700 flex justify-between font-bold text-white text-lg">
                                        <span>Total</span><span className="text-green-400">R$ {totalCost.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* AVISO DA TAXA DE DIAGNÓSTICO */}
                                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg mb-4">
                                    <p className="text-[10px] text-red-300 text-justify leading-tight">
                                        <strong>ATENÇÃO:</strong> O orçamento é gratuito. Porém, em caso de <strong>recusa ou desistência</strong> nesta etapa, será cobrada a taxa de diagnóstico de <strong>R$ {diagnosticFee.toFixed(2)}</strong> (Art. 40 CDC). Aprovando, você é isento desta taxa.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button onClick={() => setIsSigning(true)} className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                                        <PenTool size={18} /> Aprovar (Isento de Taxa)
                                    </button>
                                    <button onClick={() => setIsRejecting(true)} className="w-full py-3 bg-slate-700 text-slate-300 font-medium rounded-xl">
                                        Recusar (Pagar Taxa)
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Chat */}
                        <div className="glass-panel rounded-2xl flex flex-col h-[400px]">
                            <div className="p-4 border-b border-white/5 bg-slate-800/50"><h3 className="font-bold text-white text-sm">Fale com o Técnico</h3></div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/30 custom-scrollbar">
                                {(task.chatHistory || []).map(msg => (
                                    <div key={msg.id} className={`flex flex-col ${msg.sender === 'client' ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[85%] p-3 text-sm rounded-xl ${msg.sender === 'client' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'}`}>{msg.message}</div>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={handleSendChat} className="p-3 bg-slate-800/50 border-t border-white/5 relative">
                                <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Mensagem..." className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-blue-500" />
                                <button type="submit" className="absolute right-5 top-5 text-blue-500 hover:text-white"><Send size={16} /></button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* MODALS */}
                {isSigning && (
                    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
                        <div className="glass-panel bg-slate-900 rounded-2xl w-full max-w-lg p-6 border border-slate-700">
                            <h3 className="text-white font-bold text-lg mb-4">Assinar Aprovação</h3>
                            <p className="text-slate-300 text-xs mb-4">Ao assinar, você aprova o valor de R$ {totalCost.toFixed(2)} e fica <strong>ISENTO</strong> da taxa de diagnóstico.</p>
                            <div className="bg-white rounded-xl overflow-hidden mb-6 border-4 border-slate-700"><SignaturePad onChange={handleSignatureChange} /></div>
                            <div className="flex gap-3">
                                <button onClick={() => setIsSigning(false)} className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl">Cancelar</button>
                                <button onClick={handleConfirmSignature} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold">Confirmar</button>
                            </div>
                        </div>
                    </div>
                )}

                {isRejecting && (
                    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
                        <div className="glass-panel bg-slate-900 rounded-2xl w-full max-w-md p-6 border border-slate-700">
                            <h3 className="text-red-400 font-bold text-lg mb-4 flex items-center gap-2"><AlertTriangle /> Recusar Orçamento</h3>
                            <p className="text-slate-300 text-sm mb-4">
                                Ao recusar, você está ciente da cobrança da <strong>TAXA DE DIAGNÓSTICO de R$ {diagnosticFee.toFixed(2)}</strong> para retirada do equipamento sem reparo.
                            </p>
                            <textarea className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white mb-6 h-24" placeholder="Motivo da recusa..." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
                            <div className="flex gap-3">
                                <button onClick={() => setIsRejecting(false)} className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl">Voltar</button>
                                <button onClick={handleRejectSubmit} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold">Confirmar Recusa</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ClientPortal;
