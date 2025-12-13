
import React from 'react';
import { ArrowRight, CheckCircle2, Star, ShieldCheck, Clock, MapPin, Phone, Instagram, MessageCircle, Wrench } from 'lucide-react';
import { COMPANY_INFO, MARKETING_SERVICES } from '../constants';

interface LandingPageProps {
  onEnterSystem: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterSystem }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg shadow-lg shadow-blue-500/20">
                <Wrench className="text-white" size={24} />
             </div>
             <div>
                <h1 className="text-xl font-bold text-white tracking-tight">AINFOTECH</h1>
                <p className="text-[10px] text-blue-400 font-medium uppercase tracking-widest">Aracaju - Sergipe</p>
             </div>
          </div>
          <button 
            onClick={onEnterSystem}
            className="hidden md:flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-full font-medium transition-all border border-slate-700 hover:border-slate-500"
          >
            Área do Cliente / Técnico <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Star size={12} fill="currentColor" /> Especialistas em Tecnologia em Aracaju
           </div>
           <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              Soluções para Empresas e <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Atendimento Domiciliar</span>
           </h1>
           <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
              Auditoria corporativa, otimização de fluxo de trabalho e manutenção especializada. Visita técnica em Aracaju com <strong>isenção de taxa</strong> na realização do serviço.
           </p>
           
           <div className="flex flex-col md:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
              <button 
                onClick={onEnterSystem}
                className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-lg shadow-xl shadow-blue-900/20 transition-all hover:scale-105 active:scale-95"
              >
                 Consultar O.S.
              </button>
              <a 
                href={`https://wa.me/5579999080924?text=Ol%C3%A1%2C%20gostaria%20de%20agendar%20uma%20visita%20ou%20auditoria.`}
                target="_blank"
                rel="noreferrer"
                className="w-full md:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-bold text-lg border border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                 <MessageCircle size={20} /> Agendar Visita
              </a>
           </div>
           
           <div className="mt-8 text-xs text-slate-500 animate-in fade-in duration-1000 delay-500">
               📍 {COMPANY_INFO.address}
           </div>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="py-20 bg-slate-900/30 border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6">
           <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">Nossas Especialidades</h2>
              <p className="text-slate-400">Atendemos em nossa loja no Inácio Barbosa ou no seu local (sob consulta).</p>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {MARKETING_SERVICES.map((service, idx) => (
                  <div key={idx} className="p-6 bg-slate-800/40 border border-slate-700/50 rounded-2xl hover:bg-slate-800 transition-colors group">
                      <div className="w-12 h-12 bg-blue-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                          <service.icon className="text-blue-400" size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{service.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{service.desc}</p>
                  </div>
              ))}
           </div>
        </div>
      </section>

      {/* PRICING HIGHLIGHTS */}
      <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
             <div className="text-center mb-16">
                 <h2 className="text-3xl font-bold text-white mb-4">Serviços Padronizados</h2>
                 <p className="text-slate-400">Transparência total. Taxa de diagnóstico isenta ao aprovar o serviço.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* CARD 1 */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative hover:border-slate-600 transition-colors">
                    <h3 className="text-xl font-bold text-white mb-2">Visita Técnica</h3>
                    <p className="text-slate-400 text-sm mb-6">Diagnóstico em Domicílio (Aracaju)</p>
                    <div className="text-4xl font-black text-white mb-6">R$ 70<span className="text-lg text-slate-500 font-medium">,00</span></div>
                    <ul className="space-y-3 mb-8">
                        <li className="flex items-center gap-3 text-sm text-slate-300"><CheckCircle2 className="text-green-500" size={16}/> Isento se realizar o serviço</li>
                        <li className="flex items-center gap-3 text-sm text-slate-300"><CheckCircle2 className="text-green-500" size={16}/> Comodidade e Segurança</li>
                        <li className="flex items-center gap-3 text-sm text-slate-300"><CheckCircle2 className="text-green-500" size={16}/> Atendimento Especializado</li>
                    </ul>
                    <a href="https://wa.me/5579999080924?text=Quero%20agendar%20uma%20visita%20t%C3%A9cnica." target="_blank" rel="noreferrer" className="block w-full text-center py-3 rounded-xl border border-slate-700 text-white font-bold hover:bg-slate-800 transition-colors">Agendar Agora</a>
                </div>

                {/* CARD 2 - DESTAQUE */}
                <div className="bg-gradient-to-b from-blue-900/20 to-slate-900 border border-blue-500/30 rounded-3xl p-8 relative transform md:-translate-y-4 shadow-2xl">
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">EMPRESAS</div>
                    <h3 className="text-xl font-bold text-white mb-2">Auditoria Corporativa</h3>
                    <p className="text-blue-200 text-sm mb-6">Otimização de Fluxo e Redes</p>
                    
                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                           <span className="text-slate-300">Análise de Rede</span>
                           <span className="font-bold text-white">Sob Consulta</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                           <span className="text-slate-300">Manutenção de Frota</span>
                           <span className="font-bold text-white">Contratos</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-2 italic">
                            Melhore o desempenho dos computadores da sua empresa e aumente a produtividade da equipe.
                        </p>
                    </div>
                    
                    <a href="https://wa.me/5579999080924?text=Tenho%20interesse%20em%20auditoria%20para%20minha%20empresa." target="_blank" rel="noreferrer" className="block w-full text-center py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/30">Falar com Consultor</a>
                </div>

                {/* CARD 3 */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative hover:border-slate-600 transition-colors">
                    <h3 className="text-xl font-bold text-white mb-2">Serviços em Loja</h3>
                    <p className="text-slate-400 text-sm mb-6">Traga seu equipamento</p>
                    
                     <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                           <span className="text-slate-300 text-sm">Formatação</span>
                           <span className="font-bold text-white text-xs">R$ 150,00 + backup</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                           <span className="text-slate-300 text-sm">Reparo de TV</span>
                           <span className="font-bold text-white text-xs">A partir de R$ 180</span>
                        </div>
                        <div className="flex justify-between items-center pb-2">
                           <span className="text-slate-300 text-xs italic">*Não retiramos TVs. Trazer à loja.</span>
                        </div>
                    </div>

                    <button onClick={onEnterSystem} className="w-full py-3 rounded-xl border border-slate-700 text-white font-bold hover:bg-slate-800 transition-colors">Ver Status O.S.</button>
                </div>
             </div>
          </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-white/5 pt-16 pb-8 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
             <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                    <Wrench className="text-blue-500" />
                    <h2 className="text-xl font-bold text-white">AINFOTECH</h2>
                </div>
                <p className="text-slate-400 text-sm max-w-sm mb-6">
                    Soluções profissionais em tecnologia. Transparência, qualidade e garantia em todos os serviços. Atendendo Inácio Barbosa e toda Aracaju.
                </p>
                <div className="flex gap-4">
                    <a href="#" className="p-2 bg-slate-900 rounded-lg hover:bg-blue-600 transition-colors text-white"><Instagram size={20}/></a>
                    <a href={`https://wa.me/5579999080924`} className="p-2 bg-slate-900 rounded-lg hover:bg-green-600 transition-colors text-white"><MessageCircle size={20}/></a>
                </div>
             </div>
             
             <div>
                <h3 className="text-white font-bold mb-4">Serviços</h3>
                <ul className="space-y-2 text-sm text-slate-400">
                    <li>Auditoria Corporativa</li>
                    <li>Visita Técnica Domiciliar</li>
                    <li>Venda e Instalação de SSD</li>
                    <li>Reparo de Placas e TVs</li>
                </ul>
             </div>

             <div>
                <h3 className="text-white font-bold mb-4">Contato</h3>
                <ul className="space-y-3 text-sm text-slate-400">
                    <li className="flex items-start gap-3">
                        <MapPin size={16} className="mt-1 text-blue-500 shrink-0"/>
                        {COMPANY_INFO.address}
                    </li>
                    <li className="flex items-center gap-3">
                        <Phone size={16} className="text-blue-500 shrink-0"/>
                        {COMPANY_INFO.phone}
                    </li>
                    <li className="flex items-center gap-3">
                        <Clock size={16} className="text-blue-500 shrink-0"/>
                        Seg - Sex: 08h às 18h
                    </li>
                </ul>
             </div>
          </div>
          
          <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 text-center text-xs text-slate-600">
              &copy; {new Date().getFullYear()} {COMPANY_INFO.fantasyName}. Todos os direitos reservados. CNPJ: {COMPANY_INFO.cnpj}
          </div>
      </footer>
    </div>
  );
};

export default LandingPage;
