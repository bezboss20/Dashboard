import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    LabelList
} from 'recharts';

interface TrendData {
    label: string;
    hours: number;
}

interface WeeklyTrendProps {
    trendData: TrendData[];
    trendView: 'Day' | 'Weekly' | 'Monthly';
    trendMinWidth: number;
    isSmallScreen: boolean;
    useScaledDesktopLayout: boolean;
    onTrendViewChange: (view: 'Day' | 'Weekly' | 'Monthly') => void;
    t: (key: string) => string;
}

export function WeeklyTrend({
    trendData,
    trendView,
    trendMinWidth,
    isSmallScreen,
    useScaledDesktopLayout,
    onTrendViewChange,
    t
}: WeeklyTrendProps) {
    return (
        <div className={useScaledDesktopLayout ? 'col-span-3 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full min-w-0' : 'md:col-span-1 xl:col-span-3 bg-white p-4 md:p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full min-w-0'}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8 min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 whitespace-nowrap">{t('sleep.trend')}</h3>

                <div className="flex w-full sm:w-auto bg-gray-50 p-1 rounded-lg border border-gray-200">
                    {[
                        { id: 'Day', label: t('sleep.day') },
                        { id: 'Weekly', label: t('sleep.weekly') },
                        { id: 'Monthly', label: t('sleep.monthly') }
                    ].map(view => (
                        <button
                            key={view.id}
                            onClick={() => onTrendViewChange(view.id as 'Day' | 'Weekly' | 'Monthly')}
                            className={`flex-1 sm:flex-none px-2 sm:px-3 py-1 text-[10px] sm:text-[11px] font-bold rounded-md transition-all ${trendView === view.id ? 'text-blue-600 bg-white shadow-sm' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {view.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 w-full overflow-x-auto">
                <div
                    className="h-[220px] sm:h-[250px] min-w-0"
                    style={{
                        minWidth: trendView === 'Monthly' ? `${trendMinWidth}px` : isSmallScreen ? '420px' : '520px'
                    }}
                >
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <BarChart
                            data={trendData}
                            margin={{
                                top: isSmallScreen ? 20 : 30,
                                right: isSmallScreen ? 14 : 30,
                                left: isSmallScreen ? 8 : 20,
                                bottom: isSmallScreen ? 14 : 16
                            }}
                            barCategoryGap={trendView === 'Monthly' ? (isSmallScreen ? '35%' : '45%') : '25%'}
                            barGap={trendView === 'Monthly' ? (isSmallScreen ? 6 : 8) : 4}
                        >
                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                                dataKey="label"
                                stroke="#94a3b8"
                                fontSize={isSmallScreen ? 10 : 12}
                                fontWeight={700}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                                interval={0}
                                tickMargin={8}
                                minTickGap={trendView === 'Monthly' ? (isSmallScreen ? 18 : 24) : 12}
                                angle={trendView === 'Monthly' && isSmallScreen ? -20 : 0}
                                textAnchor={trendView === 'Monthly' && isSmallScreen ? 'end' : 'middle'}
                                height={trendView === 'Monthly' && isSmallScreen ? 44 : 30}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                fontSize={isSmallScreen ? 10 : 12}
                                fontWeight={700}
                                tickLine={false}
                                axisLine={false}
                                dx={-6}
                                width={isSmallScreen ? 34 : 44}
                                domain={[0, 12]}
                                ticks={isSmallScreen ? [0, 3, 6, 9, 12] : [0, 2, 4, 6, 8, 10, 12]}
                                tickFormatter={val => `${val}h`}
                            />
                            <Tooltip
                                cursor={{ fill: '#f8fafc', radius: 4 }}
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                }}
                            />
                            <Bar dataKey="hours" radius={[6, 6, 0, 0]} barSize={trendView === 'Monthly' ? (isSmallScreen ? 14 : 18) : isSmallScreen ? 26 : 44}>
                                <LabelList
                                    dataKey="hours"
                                    position="top"
                                    offset={8}
                                    style={{
                                        fill: '#64748b',
                                        fontSize: isSmallScreen ? '10px' : '11px',
                                        fontWeight: '800'
                                    }}
                                    formatter={(val) => `${val}h`}
                                />
                                {trendData.map((_entry: TrendData, index: number) => (
                                    <Cell key={`cell-${index}`} fill={index === trendData.length - 1 ? '#2563eb' : '#dbeafe'} className="transition-all duration-300" />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
