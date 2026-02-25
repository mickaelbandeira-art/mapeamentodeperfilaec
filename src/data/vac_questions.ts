export interface VACQuestion {
    id: number;
    text: string;
    options: {
        text: string;
        type: 'Visual' | 'Auditivo' | 'Cinestésico';
    }[];
}

export const vacQuestions: VACQuestion[] = [
    {
        id: 1,
        text: "Quando você está aprendendo algo novo, você prefere:",
        options: [
            { text: "Ver gráficos, diagramas ou demonstrações visuais", type: "Visual" },
            { text: "Ouvir explicações detalhadas ou discussões", type: "Auditivo" },
            { text: "Praticar e colocar a mão na massa imediatamente", type: "Cinestésico" }
        ]
    },
    {
        id: 2,
        text: "Ao planejar suas férias, o que mais te atrai?",
        options: [
            { text: "As paisagens e as fotos que poderei tirar", type: "Visual" },
            { text: "O som da natureza ou as músicas locais", type: "Auditivo" },
            { text: "O conforto do hotel ou a sensação da areia/vento", type: "Cinestésico" }
        ]
    },
    {
        id: 3,
        text: "Como você costuma se expressar quando está animado?",
        options: [
            { text: "Seu rosto se ilumina e você usa gestos largos", type: "Visual" },
            { text: "Você fala mais rápido e muda o tom de voz", type: "Auditivo" },
            { text: "Você sente um frio na barriga e quer se movimentar", type: "Cinestésico" }
        ]
    },
    {
        id: 4,
        text: "Em uma apresentação, o que mais te distrai?",
        options: [
            { text: "Luzes piscando ou pessoas passando na frente", type: "Visual" },
            { text: "Barulhos externos ou o tom de voz do palestrante", type: "Auditivo" },
            { text: "Cadeira desconfortável ou temperatura da sala", type: "Cinestésico" }
        ]
    },
    {
        id: 5,
        text: "Como você prefere receber orientações?",
        options: [
            { text: "Por escrito ou através de um mapa/esquema", type: "Visual" },
            { text: "Sendo faladas diretamente para você", type: "Auditivo" },
            { text: "Com alguém te mostrando como fazer na prática", type: "Cinestésico" }
        ]
    }
];
