
import React, { useState } from 'react';
import { Search, LogIn, Wrench, ArrowRight, Eye, EyeOff, Instagram, MessageCircle, Phone } from 'lucide-react';
import { supabase } from '../services/supabase';

interface LoginScreenProps {
  onAdminLogin: () => void;
  onClientLogin: (osNumber: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onAdminLogin, onClientLogin }) => {
  const [mode, setMode] = useState<'client' | 'admin'>('client');
  const [osInput, setOsInput] = useState('');
  
  // Auth States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Links Sociais
  const SOCIAL_LINKS = {
      instagram: "https://www.instagram.com/infomedinformatica?igsh=NmJqYzJ4ODk2dGQ=",
      whatsapp: "https://wa.me/5579999080924?text=Ol%C3%A1%2C%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20servi%C3%A7os."
  };

  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!osInput.trim()) return;

    // Lógica Corrigida: Remove tudo que não for dígito e reconstrói o padrão OS-XXXX
    const onlyNumbers = osInput.replace(/\D/g, '');
    
    if (!onlyNumbers) {
        setMessage('Por favor, digite apenas os números da O.S.');
        return;
    }

    const cleanInput = `OS-${onlyNumbers}`;
    console.log(`[LOGIN DEBUG] Input processado: ${cleanInput}`);
    onClientLogin(cleanInput);
  };

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    console.log(`[LOGIN DEBUG] Tentativa de login Admin: ${email}`);

    try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        console.log("[LOGIN DEBUG] Login Admin: SUCESSO");
        onAdminLogin();
    } catch (error: any) {
      console.error("[LOGIN DEBUG] Erro de autenticação:", error);
      let msg = error.message || 'Erro na autenticação';
      if (msg.includes("Invalid login") || msg.includes("invalid_grant")) {
        msg = "E-mail ou senha incorretos.";
      }
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 relative overflow-y-auto">
      
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-slate-900/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden z-10 relative group hover:border-white/20 transition-all duration-500 my-auto">
        
        {/* Left Side: Brand & Social (Desktop Only) */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-slate-900/80 to-slate-900/40 border-r border-white/5 relative">
            <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-500/20 ring-1 ring-white/20">
                    <Wrench className="text-white w-10 h-10" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
                    Service Desk <span className="text-blue-400">Pro</span>
                </h1>
                <p className="text-slate-400 text-base leading-relaxed max-w-sm border-l-2 border-blue-500/50 pl-4">
                    Acompanhamento em tempo real, aprovação digital e gestão inteligente para sua assistência técnica.
                </p>
            </div>

            {/* Social Media Footer */}
            <div className="relative z-10 mt-12">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Conecte-se Conosco</p>
                <div className="flex gap-4">
                    <a 
                        href={SOCIAL_LINKS.instagram} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-3 bg-slate-800/50 hover:bg-gradient-to-tr hover:from-purple-600 hover:to-pink-600 rounded-xl transition-all duration-300 text-slate-400 hover:text-white border border-white/5 hover:border-transparent group/icon shadow-lg"
                        title="Siga no Instagram"
                    >
                        <Instagram size={24} />
                    </a>
                    <a 
                        href={SOCIAL_LINKS.whatsapp} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-3 bg-slate-800/50 hover:bg-green-600 rounded-xl transition-all duration-300 text-slate-400 hover:text-white border border-white/5 hover:border-transparent group/icon shadow-lg"
                        title="Fale no WhatsApp"
                    >
                        <MessageCircle size={24} />
                    </a>
                </div>
                <div className="mt-6 flex items-center gap-2 text-slate-500 text-xs font-mono">
                    <Phone size={12} />
                    <span>(79) 9 9908-0924</span>
                </div>
            </div>
        </div>

        {/* Right Side: Form (Mobile & Desktop) */}
        <div className="p-6 md:p-12 flex flex-col justify-center bg-slate-950/30 relative min-h-[500px]">
            
            {/* Mobile Brand Header */}
            <div className="md:hidden flex flex-col items-center mb-8 text-center">
                 <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg ring-1 ring-white/20">
                    <Wrench className="text-white w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Service Desk Pro</h1>
            </div>

            {/* Toggle Switch */}
            <div className="flex bg-slate-950/50 p-1.5 rounded-xl mb-8 border border-white/5 relative w-full md:w-fit mx-auto md:mx-0">
                <button
                    onClick={() => { setMode('client'); setMessage(''); }}
                    className={`flex-1 md:flex-none px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                    mode === 'client' 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                    Sou Cliente
                </button>
                <button
                    onClick={() => { setMode('admin'); setMessage(''); }}
                    className={`flex-1 md:flex-none px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                    mode === 'admin' 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                    Sou Técnico
                </button>
            </div>

            <div className="mb-8 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {mode === 'client' ? 'Acompanhar Serviço' : 'Acesso Administrativo'}
                </h2>
                <p className="text-slate-400 text-sm">
                    {mode === 'client' 
                        ? 'Digite o número da sua O.S.' 
                        : 'Entre com suas credenciais.'}
                </p>
            </div>

            {mode === 'client' ? (
            <form onSubmit={handleClientSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                {message && (
                    <div className="text-xs p-3 rounded-xl text-center font-medium border bg-red-500/10 text-red-300 border-red-500/20">
                        {message}
                    </div>
                )}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-blue-400 uppercase tracking-wider ml-1">Número da O.S.</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                        </div>
                        <input
                            type="tel" // Use tel for numeric keyboard on mobile
                            placeholder="Ex: 1001"
                            value={osInput}
                            onChange={(e) => setOsInput(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:bg-slate-900 transition-all shadow-inner"
                        />
                    </div>
                </div>

                <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 flex items-center justify-center gap-3 transform hover:-translate-y-0.5 active:scale-95"
                >
                    <span>Consultar Status</span> 
                    <ArrowRight size={20} />
                </button>
            </form>
            ) : (
            <form onSubmit={handleAdminAuth} className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                {message && (
                <div className="text-xs p-4 rounded-xl text-center font-medium border bg-red-500/10 text-red-300 border-red-500/20 flex items-center justify-center gap-2 animate-pulse">
                    <span>⚠️</span> {message}
                </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider ml-1">E-mail Corporativo</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl py-4 px-5 text-white focus:border-indigo-500 focus:bg-slate-900 focus:outline-none transition-all shadow-inner placeholder-slate-600"
                            placeholder="tecnico@infomed.com"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider ml-1">Senha</label>
                        <div className="relative group">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl py-4 pl-5 pr-12 text-white focus:border-indigo-500 focus:bg-slate-900 focus:outline-none transition-all shadow-inner placeholder-slate-600"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-4 text-slate-500 hover:text-indigo-400 transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
                
                <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-900/20 hover:shadow-indigo-900/40 flex items-center justify-center gap-3 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
                >
                    {loading ? (
                        <span className="animate-pulse">Autenticando...</span>
                    ) : (
                        <> <LogIn size={20} /> <span>Acessar Painel</span> </>
                    )}
                </button>
            </form>
            )}

            {/* Mobile Social Links (Visible only on small screens) */}
            <div className="mt-8 pt-8 border-t border-white/5 md:hidden flex justify-center gap-8">
                 <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-pink-500 transition-colors p-2 bg-slate-800 rounded-lg"><Instagram size={24}/></a>
                 <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-green-500 transition-colors p-2 bg-slate-800 rounded-lg"><MessageCircle size={24}/></a>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
