import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function Sparkline({ data }: { data: number[] }) {
    const chartData = data.map((value, index) => ({ name: index, value }));
    return (
        <ResponsiveContainer width="100%" height={50}>
            <LineChart data={chartData}>
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
        </ResponsiveContainer>
    );
}
