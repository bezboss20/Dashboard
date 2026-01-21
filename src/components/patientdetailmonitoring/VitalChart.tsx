import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    ReferenceLine
} from 'recharts';

type TimeRange = '5분' | '15분' | '30분' | '1시간' | '6시간' | '24시간';

interface MonitoringPoint {
    time: string;
    timestamp: number;
    hr: number;
    rr: number;
}

interface VitalChartProps {
    title: string;
    data: MonitoringPoint[];
    dataKey: 'hr' | 'rr';
    baseline: number | null;
    currentRange: TimeRange;
    onRangeChange: (range: TimeRange) => void;
    color: string;
    unit: string;
    gradientId: string;
}

function CustomTooltip({ active, payload, label, baseline, unit }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
    baseline: number | null;
    unit: string;
}) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-200 rounded-xl shadow-lg text-[12px] font-bold">
                <p className="text-gray-500 mb-1">시간: {label}</p>
                <p className="text-gray-900">
                    수치: {payload[0].value} {unit}
                </p>
                {baseline && (
                    <div className="mt-2 pt-2 border-t border-gray-100 text-gray-400">
                        Baseline: {baseline} {unit}
                    </div>
                )}
            </div>
        );
    }
    return null;
}

function TimeRangeSelector({
    current,
    onChange
}: {
    current: TimeRange;
    onChange: (range: TimeRange) => void;
}) {
    const ranges: TimeRange[] = ['5분', '15분', '30분', '1시간', '6시간', '24시간'];
    return (
        <div className="w-full max-w-full overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex items-center gap-1 whitespace-nowrap pr-2">
                {ranges.map(range => (
                    <button
                        key={range}
                        onClick={() => onChange(range)}
                        className={`px-2 py-1 text-[10px] font-bold rounded-full transition-all duration-200 ${current === range ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                            }`}
                    >
                        {range}
                    </button>
                ))}
            </div>
        </div>
    );
}

export function VitalChart({
    title,
    data,
    dataKey,
    baseline,
    currentRange,
    onRangeChange,
    color,
    unit,
    gradientId
}: VitalChartProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6 overflow-hidden">
            <div className="mb-2.5 sm:mb-6">
                <div className="flex gap-2 flex-col sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-[15px] sm:text-[17px] font-bold text-gray-900 leading-tight break-keep">
                        {title}
                    </h3>
                    <div className="w-full sm:w-auto">
                        <TimeRangeSelector current={currentRange} onChange={onRangeChange} />
                    </div>
                </div>
            </div>

            <div className="h-[210px] sm:h-[260px] lg:h-[280px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <AreaChart data={data} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.1} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />

                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 500 }}
                            dy={8}
                        />

                        <YAxis
                            width={28}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 500 }}
                            domain={dataKey === 'hr' ? ['dataMin - 10', 'dataMax + 10'] : ['dataMin - 5', 'dataMax + 5']}
                        />

                        <Tooltip content={<CustomTooltip baseline={baseline} unit={unit} />} />

                        {baseline && (
                            <ReferenceLine y={baseline} stroke="#94a3b8" strokeDasharray="6 6" strokeWidth={1.5} />
                        )}

                        <Area
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill={`url(#${gradientId})`}
                            isAnimationActive={true}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
                <p className="text-[11px] sm:text-[12px] text-gray-400 font-bold whitespace-nowrap">최근 {currentRange}</p>
                {baseline && (
                    <div className="flex items-center gap-1.5">
                        <div className="w-4 sm:w-6 h-0.5 border-t-2 border-dashed border-slate-400 flex-shrink-0"></div>
                        <span className="text-[10px] sm:text-[11px] text-gray-500 font-semibold whitespace-nowrap">
                            Baseline: {baseline} {unit}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
