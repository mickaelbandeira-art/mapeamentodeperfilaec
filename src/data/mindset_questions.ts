export interface MindsetQuestion {
    id: number;
    text: string;
    options: {
        text: string;
        type: 'Crescimento' | 'Fixo';
    }[];
}

export const mindsetQuestions: MindsetQuestion[] = [
    {
        id: 1,
        text: "Sobre sua inteligência e habilidades, você acredita que:",
        options: [
            { text: "Podem ser desenvolvidas com esforço e prática", type: "Crescimento" },
            { text: "São características básicas que você já nasce com elas", type: "Fixo" }
        ]
    },
    {
        id: 2,
        text: "Ao enfrentar um desafio muito difícil, sua reação imediata é:",
        options: [
            { text: "Ver como uma oportunidade de aprender algo novo", type: "Crescimento" },
            { text: "Ficar frustrado e pensar que talvez não tenha o dom para aquilo", type: "Fixo" }
        ]
    },
    {
        id: 3,
        text: "Quando você recebe uma crítica construtiva, você geralmente:",
        options: [
            { text: "Analisa como pode usar aquilo para melhorar", type: "Crescimento" },
            { text: "Sente-se atacado e tenta se justificar", type: "Fixo" }
        ]
    },
    {
        id: 4,
        text: "Sobre o sucesso de outras pessoas:",
        options: [
            { text: "Sinto-me inspirado e tento aprender com o exemplo delas", type: "Crescimento" },
            { text: "Sinto-me ameaçado ou inferiorizado", type: "Fixo" }
        ]
    },
    {
        id: 5,
        text: "Quando você falha em alguma tarefa, você pensa:",
        options: [
            { text: "Preciso de uma estratégia diferente ou mais esforço na próxima vez", type: "Crescimento" },
            { text: "Talvez eu não seja bom o suficiente nisso", type: "Fixo" }
        ]
    }
];
