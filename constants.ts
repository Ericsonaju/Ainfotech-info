
import { ColumnType, Priority, Task } from './types';
import { Monitor, Smartphone, Tv, Router, Code, Video, ShoppingCart, Cpu, Briefcase, Truck } from 'lucide-react';

// --- CONFIGURAÇÃO DA SUA EMPRESA ---
// Dados atualizados da AINFOTECH
export const COMPANY_INFO = {
  name: "AINFOTECH - Reparo e Manutenção",
  fantasyName: "AINFOTECH",
  cnpj: "28.527.762/0001-60",
  owner: "Ericson de Brito Santos",
  cpf: "860.435.765-38",
  address: "Av. Angela Maria Santana Ribeiro, 152 - Inácio Barbosa, Aracaju - SE",
  phone: "(79) 9 9908-0924",
  email: "infomedaju@gmail.com",
  activity: "Reparo e Manutenção de Equipamentos Eletroeletrônicos e Auditoria Corporativa",
  techName: "Ericson de Brito Santos" // Técnico responsável padrão
};

export const CONFIG = {
  diagnosticFee: 70.00, // Valor da taxa de visita/diagnóstico
  budgetValidityDays: 10, // Validade padrão em dias (Art. 40 § 1º CDC)
  siteUrl: 'https://ainfotech.netlify.app', // URL do portal do cliente
  whatsappNumber: '5579999080924' // Número do WhatsApp da empresa
};

export const COLUMNS: { id: ColumnType; title: string; color: string }[] = [
  { id: ColumnType.Entry, title: 'Entrada / Triagem', color: 'bg-slate-500' },
  { id: ColumnType.Approval, title: 'Aguardando Aprovação', color: 'bg-yellow-500' },
  { id: ColumnType.Execution, title: 'Em Execução', color: 'bg-blue-500' },
  { id: ColumnType.Done, title: 'Finalizado / Entregue', color: 'bg-emerald-500' },
];

export const INITIAL_CHECKLIST = [
  { id: 'cl-1', label: 'Liga/Desliga', checked: false },
  { id: 'cl-2', label: 'Tela/Monitor ok', checked: false },
  { id: 'cl-3', label: 'Carregador incluso', checked: false },
  { id: 'cl-4', label: 'Parafusos ok', checked: false },
  { id: 'cl-5', label: 'Teclado/Touchpad', checked: false },
  { id: 'cl-6', label: 'Carcaça íntegra (sem trincas)', checked: false },
];

export const INITIAL_TASKS: Task[] = [];

// --- CATÁLOGO DE SERVIÇOS PADRONIZADOS (AUTOMATIC PRICING) ---
export const PREDEFINED_SERVICES = [
  {
    id: 'fmt-bck-full',
    label: 'Formatação + Backup Completo',
    description: 'Formatação, drivers, Office e Backup de arquivos.',
    serviceCost: 150.00,
    partsCost: 0.00
  },
  {
    id: 'mo-simple',
    label: 'Mão de Obra (Serviço Simples)',
    description: 'Taxa de mão de obra para serviços de reparo padrão.',
    serviceCost: 180.00,
    partsCost: 0.00
  },
  {
    id: 'fmt-only',
    label: 'Formatação Simples (Sem Backup)',
    description: 'Formatação e instalação do Windows 10/11 + Drivers.',
    serviceCost: 80.00,
    partsCost: 0.00
  },
  {
    id: 'visita-tec',
    label: 'Visita Técnica / Diagnóstico',
    description: 'Deslocamento e análise técnica em domicílio (Aracaju).',
    serviceCost: 70.00,
    partsCost: 0.00
  },
  {
    id: 'ssd-120',
    label: 'Peça: SSD 120GB',
    description: 'Unidade SSD 120GB (Apenas Peça).',
    serviceCost: 0.00,
    partsCost: 100.00
  },
  {
    id: 'ssd-240',
    label: 'Peça: SSD 240GB',
    description: 'Unidade SSD 240GB (Apenas Peça).',
    serviceCost: 0.00,
    partsCost: 180.00
  },
  {
    id: 'ssd-480',
    label: 'Peça: SSD 480GB',
    description: 'Unidade SSD 480GB (Apenas Peça).',
    serviceCost: 0.00,
    partsCost: 350.00
  },
  {
    id: 'brd-rec',
    label: 'Recuperação de Placa (Eletrônica)',
    description: 'Reparo eletrônico em placa mãe (curto, solda BGA, componentes).',
    serviceCost: 250.00,
    partsCost: 0.00
  },
  {
    id: 'bck-01',
    label: 'Serviço de Backup Avulso',
    description: 'Cópia de segurança de arquivos do usuário (Até 100GB).',
    serviceCost: 50.00,
    partsCost: 0.00
  }
];

// --- MARKETING / LANDING PAGE CATEGORIES ---
export const MARKETING_SERVICES = [
  { icon: Monitor, title: "Notebooks & Desktops", desc: "Formatação, upgrade de SSD e reparo de placa-mãe." },
  { icon: Briefcase, title: "Auditoria Corporativa", desc: "Otimização de fluxo de trabalho e infraestrutura para empresas." },
  { icon: Truck, title: "Atendimento Domiciliar", desc: "Visita técnica em Aracaju (Sob consulta). Retirada de pequenos equipamentos." },
  { icon: Tv, title: "Smart TVs", desc: "Reparo de LEDs e fontes. (Não realizamos retirada, trazer à loja)." },
  { icon: Smartphone, title: "Celulares & Tablets", desc: "Troca de telas, baterias e conectores de carga." },
  { icon: Router, title: "Redes & Wi-Fi", desc: "Estruturação de rede para melhorar a conectividade da sua empresa." },
  { icon: ShoppingCart, title: "Automação Comercial", desc: "Sistemas para PDV, leitores e impressoras térmicas." },
  { icon: Cpu, title: "Eletrônica Geral", desc: "Reparo especializado em placas de diversos equipamentos." },
];

// TERMOS JURÍDICOS BLINDADOS (BASEADOS NO CDC)
export const LEGAL_TERMS = {
  hardware: `1. GARANTIA LEGAL E TRANSPORTE (ART. 26 CDC):
A garantia de serviços é de 90 dias para peças e mão de obra. OBSERVAÇÃO IMPORTANTE: NÃO REALIZAMOS RETIRADA DE TELEVISORES ou equipamentos de grande porte. Realizamos retirada apenas de equipamentos de PEQUENO PORTE (Notebooks, CPUs, Consoles). O cliente é responsável pelo transporte de TVs até a nossa unidade.`,

  software: `2. SERVIÇOS DE SOFTWARE E LÓGICA:
A garantia para formatação, limpeza de vírus e instalação de sistemas é de 7 (sete) dias. Não há garantia para "softwares" contra novos vírus, malwares ou atualizações do fabricante que causem lentidão, pois são fatores externos ao serviço prestado.`,

  backup: `3. PERDA DE DADOS E BACKUP (EXCLUSÃO DE RESPONSABILIDADE):
O cliente declara estar ciente de que serviços de hardware possuem risco intrínseco de perda de dados. É DEVER EXCLUSIVO DO CONSUMIDOR manter backup atualizado de seus arquivos ANTES de deixar o equipamento. A AINFOTECH NÃO SE RESPONSABILIZA POR PERDA DE DADOS.`,

  abandonment: `4. ABANDONO DE EQUIPAMENTO (ART. 1.275 DO CÓDIGO CIVIL):
O equipamento deixado deve ser retirado no prazo máximo de 90 dias após a comunicação. Após este prazo, o bem será considerado ABANDONADO, podendo ser descartado ou vendido para custeio.`,

  diagnosis: `5. ORÇAMENTO E TAXA DE VISITA/DIAGNÓSTICO:
Este orçamento tem validade de ${CONFIG.budgetValidityDays} dias. POLÍTICA DE TAXA: A Taxa de Diagnóstico/Visita no valor de R$ ${CONFIG.diagnosticFee.toFixed(2)} é cobrada APENAS se o serviço NÃO for realizado (recusa do orçamento ou impossibilidade de reparo). Caso o orçamento seja APROVADO e o serviço executado, o cliente fica ISENTO desta taxa, pagando apenas o valor do serviço/peças.`
};
