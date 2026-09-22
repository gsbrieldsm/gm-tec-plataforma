export type IntegrationCategory = "pagamentos" | "logistica" | "operacao";

export type Integration = {
  id: string;
  category: IntegrationCategory;
  name: string;
  color: string;
  summary: string;
  bestFor: string;
  recommended?: boolean;
  /** O que o lojista precisa ter em mãos antes de ativar. */
  needs: readonly string[];
  /** Passo a passo para conseguir essas informações no provedor. */
  steps: readonly string[];
  docs?: string;
  /** Não depende de API de terceiro. */
  native?: boolean;
};

export const CATEGORY_META: Record<IntegrationCategory, { label: string; intro: string }> = {
  pagamentos: {
    label: "Pagamentos",
    intro: "Como a loja recebe. Você escolhe um ou mais provedores; a cobrança acontece na conta deles e o dinheiro cai direto para você.",
  },
  logistica: {
    label: "Logística",
    intro: "Cálculo de frete no carrinho, etiqueta e rastreio. Os agregadores cotam várias transportadoras de uma vez.",
  },
  operacao: {
    label: "Operação",
    intro: "Nota fiscal, avisos ao cliente e medição. Tudo que roda por trás de um pedido depois que ele é pago.",
  },
};

export const INTEGRATIONS = [
  /* ── Pagamentos ─────────────────────────────────────────────── */
  {
    id: "mercadopago",
    category: "pagamentos",
    name: "Mercado Pago",
    color: "#009ee3",
    summary: "Pix, cartão e boleto num checkout só.",
    bestFor: "Começar rápido — a conta sai no mesmo dia e o Pix já vem pronto.",
    recommended: true,
    needs: ["Conta Mercado Pago (pessoa física ou jurídica)", "Access Token de produção", "Public Key de produção"],
    steps: [
      "Crie ou acesse sua conta no Mercado Pago com os dados da empresa.",
      "Entre no painel de desenvolvedores e crie uma aplicação do tipo checkout online.",
      "Em Credenciais, copie a Public Key e o Access Token de produção.",
      "Ative a conta para receber pagamentos reais — o Mercado Pago pode pedir documentos.",
      "Guarde as chaves com segurança e marque este item como pronto: nossa equipe faz a conexão.",
    ],
    docs: "https://www.mercadopago.com.br/developers",
  },
  {
    id: "asaas",
    category: "pagamentos",
    name: "Asaas",
    color: "#1f5eff",
    summary: "Pix, boleto e cartão com foco em cobrança recorrente.",
    bestFor: "Assinaturas, clube de compras ou venda parcelada no boleto.",
    needs: ["Conta Asaas aprovada", "Chave de API de produção"],
    steps: [
      "Abra sua conta no Asaas e envie os documentos para aprovação.",
      "Em Configurações da conta, abra a área de Integrações.",
      "Gere a chave de API de produção — ela aparece uma única vez, então copie na hora.",
      "Marque este item como pronto para nossa equipe concluir a conexão.",
    ],
    docs: "https://docs.asaas.com",
  },
  {
    id: "pagarme",
    category: "pagamentos",
    name: "Pagar.me",
    color: "#65a300",
    summary: "Gateway da Stone com antifraude e split de pagamento.",
    bestFor: "Operações com volume maior ou que dividem o valor entre parceiros.",
    needs: ["Conta Pagar.me aprovada", "Chave secreta (sk_…)", "Chave pública (pk_…)"],
    steps: [
      "Solicite sua conta no Pagar.me e aguarde a análise cadastral.",
      "No dashboard, abra Desenvolvimento → Chaves.",
      "Copie a chave pública e a chave secreta do ambiente de produção.",
      "Marque este item como pronto.",
    ],
    docs: "https://docs.pagar.me",
  },
  {
    id: "stripe",
    category: "pagamentos",
    name: "Stripe",
    color: "#635bff",
    summary: "Cartões internacionais e carteiras digitais.",
    bestFor: "Quem vende para fora do Brasil ou recebe em outras moedas.",
    needs: ["Conta Stripe ativada", "Publishable key", "Secret key"],
    steps: [
      "Crie a conta no Stripe e complete a ativação com os dados da empresa.",
      "No Dashboard, abra Developers → API keys.",
      "Copie a publishable key e revele a secret key de produção.",
      "Marque este item como pronto.",
    ],
    docs: "https://docs.stripe.com",
  },
  {
    id: "pagbank",
    category: "pagamentos",
    name: "PagBank",
    color: "#1bb99a",
    summary: "Antigo PagSeguro: Pix, cartão e boleto.",
    bestFor: "Quem já usa maquininha PagBank e quer tudo numa conta só.",
    needs: ["Conta PagBank empresarial", "Token de integração"],
    steps: [
      "Acesse sua conta PagBank empresarial.",
      "Na área de integrações, gere o token para vendas online.",
      "Marque este item como pronto.",
    ],
    docs: "https://dev.pagbank.uol.com.br",
  },

  /* ── Logística ──────────────────────────────────────────────── */
  {
    id: "melhorenvio",
    category: "logistica",
    name: "Melhor Envio",
    color: "#2a5bd7",
    summary: "Cota Correios, Jadlog, Loggi e outras numa consulta só.",
    bestFor: "Começar sem contrato com transportadora e pagar a etiqueta avulsa.",
    recommended: true,
    needs: ["Conta Melhor Envio", "CEP e endereço de origem", "Autorização do aplicativo (token)"],
    steps: [
      "Crie a conta no Melhor Envio com o endereço de onde os pedidos saem.",
      "Cadastre as dimensões padrão das suas embalagens.",
      "Na área de integrações, autorize o aplicativo da loja — isso gera o token de acesso.",
      "Adicione saldo na carteira para comprar as etiquetas.",
      "Marque este item como pronto.",
    ],
    docs: "https://docs.melhorenvio.com.br",
  },
  {
    id: "frenet",
    category: "logistica",
    name: "Frenet",
    color: "#f47b20",
    summary: "Cotação multi-transportadora e rastreio unificado.",
    bestFor: "Quem já tem contratos próprios e quer comparar tudo num lugar.",
    needs: ["Conta Frenet", "Token de acesso", "Transportadoras habilitadas no painel"],
    steps: [
      "Crie a conta na Frenet e informe o CEP de origem.",
      "Habilite as transportadoras que você usa (com contrato ou tabela padrão).",
      "Copie o token de acesso no painel.",
      "Marque este item como pronto.",
    ],
    docs: "https://www.frenet.com.br",
  },
  {
    id: "correios",
    category: "logistica",
    name: "Correios (contrato)",
    color: "#ffcc00",
    summary: "Preço e prazo com a tabela do seu próprio contrato.",
    bestFor: "Volume alto de envios, quando o desconto do contrato compensa.",
    needs: ["Contrato comercial com os Correios", "Cartão de postagem", "Usuário e código de acesso às APIs"],
    steps: [
      "Procure uma agência ou o comercial dos Correios para fechar contrato.",
      "Com o contrato ativo, solicite o acesso às APIs com seu usuário.",
      "Anote o número do cartão de postagem e o código de acesso.",
      "Marque este item como pronto.",
    ],
    docs: "https://www.correios.com.br",
  },
  {
    id: "loggi",
    category: "logistica",
    name: "Loggi",
    color: "#00baff",
    summary: "Coleta e entrega expressa nas capitais.",
    bestFor: "Entregas no mesmo dia ou no dia seguinte em grandes cidades.",
    needs: ["Conta Loggi para empresas", "Credenciais de integração"],
    steps: [
      "Cadastre a empresa na Loggi e confirme a área de coleta.",
      "Solicite as credenciais de integração ao time comercial.",
      "Marque este item como pronto.",
    ],
    docs: "https://www.loggi.com",
  },
  {
    id: "retirada",
    category: "logistica",
    name: "Retirada na loja",
    color: "#64748b",
    summary: "O cliente compra online e busca pessoalmente.",
    bestFor: "Quem tem ponto físico ou ateliê aberto ao público.",
    native: true,
    needs: ["Endereço de retirada", "Horário de atendimento"],
    steps: [
      "Preencha a cidade na aba Loja online.",
      "Defina endereço e horário que aparecem para o cliente.",
      "Marque como pronto — não depende de nenhum serviço externo.",
    ],
  },

  /* ── Operação ───────────────────────────────────────────────── */
  {
    id: "bling",
    category: "operacao",
    name: "Bling",
    color: "#38b449",
    summary: "ERP com emissão de nota fiscal e estoque.",
    bestFor: "Emitir NF-e dos pedidos sem montar nada fiscal do zero.",
    recommended: true,
    needs: ["Conta Bling", "Certificado digital A1 da empresa", "Autorização do aplicativo"],
    steps: [
      "Contrate um plano do Bling e cadastre os dados fiscais da empresa.",
      "Envie o certificado digital A1 para liberar a emissão de notas.",
      "Com seu contador, configure natureza de operação e tributação dos produtos.",
      "Autorize o aplicativo da loja na área de integrações do Bling.",
      "Marque este item como pronto.",
    ],
    docs: "https://developer.bling.com.br",
  },
  {
    id: "focusnfe",
    category: "operacao",
    name: "Focus NFe",
    color: "#e2231a",
    summary: "API só de emissão fiscal: NF-e, NFC-e e NFS-e.",
    bestFor: "Quem já tem ERP e só precisa da nota automática.",
    needs: ["Conta Focus NFe", "Certificado digital A1", "Token de produção"],
    steps: [
      "Crie a conta e cadastre a empresa emissora.",
      "Envie o certificado digital A1.",
      "Copie o token de produção no painel.",
      "Marque este item como pronto.",
    ],
    docs: "https://focusnfe.com.br",
  },
  {
    id: "resend",
    category: "operacao",
    name: "E-mail transacional (Resend)",
    color: "#111111",
    summary: "Confirmação de pedido, envio e recuperação de senha.",
    bestFor: "Mandar e-mails com o domínio da sua marca, sem cair no spam.",
    needs: ["Domínio próprio (ex.: sualoja.com.br)", "Acesso ao DNS do domínio", "Chave de API"],
    steps: [
      "Crie a conta no Resend e adicione seu domínio.",
      "Copie os registros DNS indicados e cadastre-os onde o domínio está hospedado.",
      "Aguarde a verificação do domínio.",
      "Gere uma chave de API com permissão de envio.",
      "Marque este item como pronto.",
    ],
    docs: "https://resend.com/docs",
  },
  {
    id: "whatsapp",
    category: "operacao",
    name: "WhatsApp Business",
    color: "#25d366",
    summary: "Aviso automático de pedido pago, enviado e entregue.",
    bestFor: "Clientes que respondem mais no WhatsApp do que no e-mail.",
    needs: ["Conta Meta Business verificada", "Número dedicado ao WhatsApp da loja", "Token permanente da API"],
    steps: [
      "Verifique a empresa no Gerenciador de Negócios da Meta.",
      "Cadastre o número que vai enviar as mensagens — ele não pode estar no app comum.",
      "Crie os modelos de mensagem e aguarde a aprovação da Meta.",
      "Gere o token permanente de acesso.",
      "Marque este item como pronto.",
    ],
    docs: "https://developers.facebook.com/docs/whatsapp",
  },
  {
    id: "ga4",
    category: "operacao",
    name: "Google Analytics 4",
    color: "#f9ab00",
    summary: "Visitas, origem do tráfego e funil de compra.",
    bestFor: "Entender de onde vêm os clientes e onde eles desistem.",
    needs: ["Propriedade GA4", "ID de medição (G-XXXXXXX)"],
    steps: [
      "Crie uma propriedade no Google Analytics.",
      "Adicione um fluxo de dados da Web com o endereço da loja.",
      "Copie o ID de medição, que começa com G-.",
      "Marque este item como pronto.",
    ],
    docs: "https://support.google.com/analytics",
  },
  {
    id: "metapixel",
    category: "operacao",
    name: "Meta Pixel",
    color: "#0866ff",
    summary: "Mede vendas vindas de anúncios no Instagram e Facebook.",
    bestFor: "Quem anuncia e quer saber quais campanhas viram venda.",
    needs: ["Conta de anúncios da Meta", "ID do Pixel"],
    steps: [
      "No Gerenciador de Eventos da Meta, crie um conjunto de dados (Pixel).",
      "Copie o ID do Pixel.",
      "Marque este item como pronto.",
    ],
  },
] as const satisfies readonly Integration[];

export type IntegrationId = (typeof INTEGRATIONS)[number]["id"];

export const INTEGRATION_IDS = INTEGRATIONS.map(i => i.id) as [IntegrationId, ...IntegrationId[]];
