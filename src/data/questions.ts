export interface Question {
  id: number;
  text: string;
  options: {
    text: string;
    type: 'D' | 'I' | 'S' | 'C';
  }[];
}

export const questions: Question[] = [
  {
    id: 1,
    text: "Ao iniciar um novo projeto, você geralmente:",
    options: [
      { text: "Assume o comando e define os objetivos rapidamente", type: "D" },
      { text: "Motiva a equipe e cria entusiasmo", type: "I" },
      { text: "Ouve todos e busca consenso antes de agir", type: "S" },
      { text: "Analisa todos os detalhes e riscos antes de começar", type: "C" }
    ]
  },
  {
    id: 2,
    text: "Em situações de pressão, você tende a:",
    options: [
      { text: "Agir rapidamente e tomar decisões firmes", type: "D" },
      { text: "Buscar apoio da equipe e manter o otimismo", type: "I" },
      { text: "Manter a calma e trabalhar de forma constante", type: "S" },
      { text: "Analisar a situação cuidadosamente antes de agir", type: "C" }
    ]
  },
  {
    id: 3,
    text: "Como você prefere se comunicar?",
    options: [
      { text: "De forma direta e objetiva", type: "D" },
      { text: "De maneira entusiasmada e expressiva", type: "I" },
      { text: "Com calma e paciência", type: "S" },
      { text: "De forma precisa e detalhada", type: "C" }
    ]
  },
  {
    id: 4,
    text: "Ao resolver problemas, você:",
    options: [
      { text: "Foca na solução mais rápida e eficaz", type: "D" },
      { text: "Busca ideias criativas e inovadoras", type: "I" },
      { text: "Procura uma solução que agrade a todos", type: "S" },
      { text: "Analisa dados e procura a solução mais lógica", type: "C" }
    ]
  },
  {
    id: 5,
    text: "Em reuniões, você costuma:",
    options: [
      { text: "Liderar a discussão e tomar decisões", type: "D" },
      { text: "Compartilhar ideias e energizar o grupo", type: "I" },
      { text: "Ouvir atentamente e apoiar os outros", type: "S" },
      { text: "Questionar detalhes e buscar clareza", type: "C" }
    ]
  },
  {
    id: 6,
    text: "O que mais te motiva no trabalho?",
    options: [
      { text: "Alcançar resultados e vencer desafios", type: "D" },
      { text: "Trabalhar com pessoas e ser reconhecido", type: "I" },
      { text: "Ter estabilidade e harmonia na equipe", type: "S" },
      { text: "Fazer um trabalho de qualidade e preciso", type: "C" }
    ]
  },
  {
    id: 7,
    text: "Como você reage a mudanças?",
    options: [
      { text: "Abraço as mudanças como oportunidades", type: "D" },
      { text: "Fico animado com novas possibilidades", type: "I" },
      { text: "Prefiro avaliar cuidadosamente antes de aceitar", type: "S" },
      { text: "Analiso o impacto e os riscos envolvidos", type: "C" }
    ]
  },
  {
    id: 8,
    text: "Seu estilo de liderança é mais:",
    options: [
      { text: "Autoritário e focado em resultados", type: "D" },
      { text: "Inspirador e motivador", type: "I" },
      { text: "Colaborativo e empático", type: "S" },
      { text: "Metódico e baseado em dados", type: "C" }
    ]
  },
  {
    id: 9,
    text: "Como você lida com conflitos?",
    options: [
      { text: "Enfrento diretamente e busco resolver rápido", type: "D" },
      { text: "Tento aliviar a tensão e mediar", type: "I" },
      { text: "Evito conflitos e busco a paz", type: "S" },
      { text: "Analiso os fatos e busco uma solução justa", type: "C" }
    ]
  },
  {
    id: 10,
    text: "Ao trabalhar em equipe, você prefere:",
    options: [
      { text: "Liderar e delegar tarefas", type: "D" },
      { text: "Motivar e integrar o time", type: "I" },
      { text: "Apoiar e colaborar com todos", type: "S" },
      { text: "Garantir a qualidade e precisão do trabalho", type: "C" }
    ]
  },
  {
    id: 11,
    text: "Como você define suas prioridades?",
    options: [
      { text: "Foco no que traz resultados imediatos", type: "D" },
      { text: "Priorizo o que é mais interessante e envolvente", type: "I" },
      { text: "Considero o impacto nas pessoas e na harmonia", type: "S" },
      { text: "Analiso cuidadosamente e organizo metodicamente", type: "C" }
    ]
  },
  {
    id: 12,
    text: "Sua maior força é:",
    options: [
      { text: "Determinação e foco em objetivos", type: "D" },
      { text: "Carisma e habilidade de comunicação", type: "I" },
      { text: "Paciência e lealdade", type: "S" },
      { text: "Atenção aos detalhes e precisão", type: "C" }
    ]
  },
  {
    id: 13,
    text: "Como você toma decisões importantes?",
    options: [
      { text: "Rapidamente, confiando na intuição", type: "D" },
      { text: "Consultando outras pessoas e considerando o impacto social", type: "I" },
      { text: "Com cautela, evitando riscos desnecessários", type: "S" },
      { text: "Após análise detalhada de todas as variáveis", type: "C" }
    ]
  },
  {
    id: 14,
    text: "Em um ambiente de trabalho ideal, você prefere:",
    options: [
      { text: "Autonomia e desafios constantes", type: "D" },
      { text: "Interação social e variedade", type: "I" },
      { text: "Estabilidade e previsibilidade", type: "S" },
      { text: "Ordem, estrutura e clareza", type: "C" }
    ]
  },
  {
    id: 15,
    text: "Ao receber feedback, você:",
    options: [
      { text: "Foca no que precisa ser melhorado imediatamente", type: "D" },
      { text: "Aprecia o reconhecimento e usa para motivação", type: "I" },
      { text: "Aceita com calma e processa internamente", type: "S" },
      { text: "Analisa criticamente e busca entender os detalhes", type: "C" }
    ]
  },
  {
    id: 16,
    text: "Seu maior medo profissional é:",
    options: [
      { text: "Perder o controle ou não atingir metas", type: "D" },
      { text: "Ser rejeitado ou não ser reconhecido", type: "I" },
      { text: "Mudanças súbitas ou perder a estabilidade", type: "S" },
      { text: "Cometer erros ou falhar na qualidade", type: "C" }
    ]
  },
  {
    id: 17,
    text: "Como você gerencia seu tempo?",
    options: [
      { text: "Foco em atividades de alto impacto", type: "D" },
      { text: "Flexível, adaptando conforme o interesse", type: "I" },
      { text: "De forma consistente e organizada", type: "S" },
      { text: "Com planejamento detalhado e listas", type: "C" }
    ]
  },
  {
    id: 18,
    text: "Ao iniciar uma conversa, você tende a:",
    options: [
      { text: "Ir direto ao ponto", type: "D" },
      { text: "Ser amigável e criar conexão", type: "I" },
      { text: "Ouvir primeiro antes de falar", type: "S" },
      { text: "Fazer perguntas específicas", type: "C" }
    ]
  },
  {
    id: 19,
    text: "Em situações de incerteza, você:",
    options: [
      { text: "Age com confiança e toma o controle", type: "D" },
      { text: "Mantém o otimismo e busca o lado positivo", type: "I" },
      { text: "Procura segurança e estabilidade", type: "S" },
      { text: "Busca mais informações antes de decidir", type: "C" }
    ]
  },
  {
    id: 20,
    text: "Como você prefere aprender coisas novas?",
    options: [
      { text: "Fazendo e experimentando diretamente", type: "D" },
      { text: "Através de interação e discussão em grupo", type: "I" },
      { text: "Com orientação passo a passo", type: "S" },
      { text: "Estudando e pesquisando profundamente", type: "C" }
    ]
  },
  {
    id: 21,
    text: "Seu ritmo de trabalho é geralmente:",
    options: [
      { text: "Rápido e intenso", type: "D" },
      { text: "Variável, dependendo do interesse", type: "I" },
      { text: "Constante e equilibrado", type: "S" },
      { text: "Metódico e cuidadoso", type: "C" }
    ]
  },
  {
    id: 22,
    text: "Como você celebra conquistas?",
    options: [
      { text: "Parto rapidamente para o próximo desafio", type: "D" },
      { text: "Compartilho com todos e celebro", type: "I" },
      { text: "Aprecio internamente e agradeço a equipe", type: "S" },
      { text: "Analiso o que funcionou para replicar", type: "C" }
    ]
  },
  {
    id: 23,
    text: "Ao delegar tarefas, você:",
    options: [
      { text: "Define claramente o resultado esperado", type: "D" },
      { text: "Motiva e inspira a pessoa", type: "I" },
      { text: "Fornece todo o suporte necessário", type: "S" },
      { text: "Dá instruções detalhadas e padrões", type: "C" }
    ]
  },
  {
    id: 24,
    text: "Em negociações, seu estilo é:",
    options: [
      { text: "Assertivo e focado em ganhar", type: "D" },
      { text: "Persuasivo e carismático", type: "I" },
      { text: "Colaborativo e flexível", type: "S" },
      { text: "Baseado em dados e lógica", type: "C" }
    ]
  },
  {
    id: 25,
    text: "Como você reage a críticas?",
    options: [
      { text: "Defendo meu ponto de vista", type: "D" },
      { text: "Fico afetado emocionalmente", type: "I" },
      { text: "Aceito passivamente", type: "S" },
      { text: "Analiso se há fundamento", type: "C" }
    ]
  },
  {
    id: 26,
    text: "Seu maior valor no trabalho é:",
    options: [
      { text: "Eficiência e resultados", type: "D" },
      { text: "Relacionamentos e reconhecimento", type: "I" },
      { text: "Lealdade e cooperação", type: "S" },
      { text: "Qualidade e precisão", type: "C" }
    ]
  },
  {
    id: 27,
    text: "Como você lida com tarefas repetitivas?",
    options: [
      { text: "Busco automatizar ou delegar", type: "D" },
      { text: "Tento tornar mais interessante e social", type: "I" },
      { text: "Faço com consistência e paciência", type: "S" },
      { text: "Aperfeiçoo o processo continuamente", type: "C" }
    ]
  },
  {
    id: 28,
    text: "Ao apresentar ideias, você:",
    options: [
      { text: "Foca nos benefícios e resultados", type: "D" },
      { text: "Usa entusiasmo e storytelling", type: "I" },
      { text: "Apresenta de forma calma e clara", type: "S" },
      { text: "Usa dados e evidências", type: "C" }
    ]
  },
  {
    id: 29,
    text: "Em momentos de crise, você:",
    options: [
      { text: "Tomo controle e ajo rapidamente", type: "D" },
      { text: "Mantenho o moral alto e apoio outros", type: "I" },
      { text: "Ofereço estabilidade e suporte", type: "S" },
      { text: "Analiso a situação e crio um plano", type: "C" }
    ]
  },
  {
    id: 30,
    text: "Seu lema de vida é mais próximo de:",
    options: [
      { text: "Agir é melhor que esperar", type: "D" },
      { text: "A vida é melhor com pessoas ao redor", type: "I" },
      { text: "Devagar e sempre", type: "S" },
      { text: "Faça certo ou não faça", type: "C" }
    ]
  }
];
