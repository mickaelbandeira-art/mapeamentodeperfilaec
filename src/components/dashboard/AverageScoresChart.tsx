
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";

interface AverageScoresChartProps {
    participants: any[];
}

export const AverageScoresChart = ({ participants }: AverageScoresChartProps) => {
    // Calculate averages
    const completedTests = participants.filter(p => p.has_completed_test);
    const total = completedTests.length;

    if (total === 0) return null;

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
        { name: "Dominância", score: Math.round(sums.D / total), color: "hsl(var(--disc-dominance))" },
        { name: "Influência", score: Math.round(sums.I / total), color: "hsl(var(--disc-influence))" },
        { name: "Estabilidade", score: Math.round(sums.S / total), color: "hsl(var(--disc-stability))" },
        { name: "Conformidade", score: Math.round(sums.C / total), color: "hsl(var(--disc-conformity))" },
    ];

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Média de Pontuação por Perfil</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                            />
                            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
