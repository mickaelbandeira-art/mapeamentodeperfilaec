import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface DiscChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
}

export const DiscChart = ({ data }: DiscChartProps) => {
  return (
    <div className="h-[300px] w-full relative group">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
            stroke="hsl(var(--foreground))"
            strokeWidth={4}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--foreground))',
              border: '4px solid hsl(var(--primary))',
              borderRadius: '0px',
              padding: '10px'
            }}
            itemStyle={{
              color: 'hsl(var(--background))',
              fontWeight: '900',
              textTransform: 'uppercase',
              fontStyle: 'italic',
              fontSize: '10px'
            }}
            cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Brutalist Legend */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 flex-wrap pb-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-3 h-3 border-2 border-foreground"
              style={{ backgroundColor: `hsl(${item.color})` }}
            />
            <span className="text-[10px] font-black uppercase italic text-foreground">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
