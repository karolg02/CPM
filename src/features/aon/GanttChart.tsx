import { BarChart, Bar, XAxis, YAxis, Tooltip, LabelList, Cell } from 'recharts';

type GanttChartProps = {
    data: {
        name: string;
        start: number;
        duration: number;
        isCritical?: boolean;
    }[];
};

export const GanttChart = ({ data }: GanttChartProps) => {
    return (
        <BarChart
            layout="vertical"
            width={800}
            height={Math.max(300, data.length * 50)}
            data={data}
            margin={{ top: 20, right: 100, bottom: 20 }}
        >
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" />
            <Tooltip />
            <Bar dataKey="start" stackId="a" fill="transparent" />
            <Bar dataKey="duration" stackId="a" isAnimationActive={false}>
                {
                    data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={entry.isCritical ? "#ff4d4f" : "#1f5f96"}
                        />
                    ))
                }
                <LabelList dataKey="duration" position="insideRight" />
            </Bar>
        </BarChart>
    );
};
