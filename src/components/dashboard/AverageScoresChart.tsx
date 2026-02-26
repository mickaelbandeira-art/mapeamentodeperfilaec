import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";

interface AverageScoresChartProps {
    participants: any[];
}

export const AverageScoresChart = ({ participants }: AverageScoresChartProps) => {
    const completedTests = participants.filter(p => p.has_completed_test);
    const total = completedTests.length;

    if (total === 0) return (
        <div className="h-[300px] flex items-center justify-center opacity-20">
            <span className="font-black uppercase italic text-4xl">No_Data_Stream</span>
        </div>
    );

    const sums = completedTests.reduce(
        (acc, p) => ({
            D: acc.D + (p.score_d || 0),
            I: acc.I + (p.score_i || 0),
            S: acc.S + (p.score_s || 0),
            C: acc.C + (p.score_c || 0),
        }),
        { D: 0, I: 0, S: 0, C: 0 }
    );

    const data = [
        { name: "DOM", full: "Dominância", score: Math.round(sums.D / total), color: "var(--secondary)" },
        { name: "INF", full: "Influência", score: Math.round(sums.I / total), color: "var(--primary)" },
        { name: "EST", full: "Estabilidade", score: Math.round(sums.S / total), color: "var(--secondary)" },
        { name: "CON", full: "Conformidade", score: Math.round(sums.C / total), color: "var(--primary)" },
    ];

    return (
        <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                    <XAxis
                        dataKey="name"
                        stroke="var(--foreground)"
                        fontSize={10}
                        fontWeight={900}
                        tickLine={true}
                        axisLine={true}
                        tick={{ fill: 'var(--foreground)', fontStyle: 'italic' }}
                    />
                    <YAxis
                        stroke="var(--foreground)"
                        fontSize={10}
                        fontWeight={900}
                        tickLine={true}
                        axisLine={true}
                        tick={{ fill: 'var(--foreground)', fontStyle: 'italic' }}
                    />
                    <Tooltip
                        cursor={{ fill: 'var(--foreground)', opacity: 0.1 }}
                        contentStyle={{
                            backgroundColor: 'var(--foreground)',
                            border: '4px solid var(--secondary)',
                            borderRadius: '0px',
                            padding: '10px'
                        }}
                        itemStyle={{
                            color: 'var(--background)',
                            fontWeight: '900',
                            textTransform: 'uppercase',
                            fontStyle: 'italic',
                            fontSize: '10px'
                        }}
                    />
                    <Bar dataKey="score" stroke="var(--foreground)" strokeWidth={4}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Background Texture */}
            <div className="absolute top-0 right-0 pointer-events-none opacity-5 text-[80px] font-black italic uppercase -mr-4 -mt-4 leading-none select-none">
                Metrics
            </div>
        </div>
    );
};
