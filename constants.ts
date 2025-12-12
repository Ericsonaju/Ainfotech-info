
import { ColumnType, Priority, Task } from './types';

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
  activity: "Reparo e Manutenção de Equipamentos Eletroeletrônicos",
  techName: "Ericson de Brito Santos" // Técnico responsável padrão
};

export const CONFIG = {
    diagnosticFee: 70.00, // Valor da taxa de diagnóstico (Configurável aqui)
    budgetValidityDays: 10 // Validade padrão em dias (Art. 40 § 1º CDC)
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

// TERMOS JURÍDICOS BLINDADOS (BASEADOS NO CDC)
export const LEGAL_TERMS = {
  hardware: `1. GARANTIA LEGAL E CONTRATUAL (ART. 26 CDC):
A garantia de serviços é de 90 (noventa) dias para peças substituídas e mão de obra específica executada, conforme Art. 26, II do CDC. A garantia NÃO cobre: (a) novos defeitos não relacionados ao serviço original; (b) danos causados por mau uso, quedas, líquidos ou oscilações elétricas (Art. 12, §3º, III do CDC); (c) rompimento de lacres de segurança.`,

  software: `2. SERVIÇOS DE SOFTWARE E LÓGICA:
A garantia para formatação, limpeza de vírus e instalação de sistemas é de 7 (sete) dias. Não há garantia para "softwares" contra novos vírus, malwares ou atualizações do fabricante que causem lentidão, pois são fatores externos ao serviço prestado.`,

  backup: `3. PERDA DE DADOS E BACKUP (EXCLUSÃO DE RESPONSABILIDADE):
O cliente declara estar ciente de que serviços de hardware (especialmente em placas-mãe e armazenamento) possuem risco intrínseco de perda de dados. É DEVER EXCLUSIVO DO CONSUMIDOR manter backup atualizado de seus arquivos (fotos, documentos, sistemas) ANTES de deixar o equipamento. A AINFOTECH NÃO SE RESPONSABILIZA POR PERDA DE DADOS, exceto se o serviço "Backup" for explicitamente contratado e pago à parte.`,

  abandonment: `4. ABANDONO DE EQUIPAMENTO (ART. 1.275 DO CÓDIGO CIVIL):
O equipamento deixado para orçamento ou reparo deve ser retirado no prazo máximo de 90 (noventa) dias após a comunicação de conclusão ou laudo. Após este prazo, o bem será considerado ABANDONADO, renunciando o proprietário à sua posse (Art. 1.275, III do CC), podendo a empresa dar-lhe a destinação que convier (venda para custeio, doação ou descarte ecológico) sem direito a indenização futura.`,

  diagnosis: `5. ORÇAMENTO E TAXA DE DIAGNÓSTICO (ART. 40 CDC):
Este orçamento tem validade de ${CONFIG.budgetValidityDays} dias (Art. 40, §1º CDC). A elaboração do orçamento envolve horas técnicas de desmontagem e análise. Caso o serviço seja recusado, será cobrada a TAXA DE DIAGNÓSTICO no valor de R$ ${CONFIG.diagnosticFee.toFixed(2)} para custeio da mão de obra técnica empregada, conforme informado previamente e autorizado na entrega do bem.`
};
