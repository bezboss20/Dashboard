import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface HypnogramData {
    time: string;
    stage: number;
}

interface HypnogramProps {
    data: HypnogramData[];
    isSmallScreen: boolean;
    useScaledDesktopLayout: boolean;
    t: (key: string) => string;
}

export function Hypnogram({
    data,
    isSmallScreen,
    useScaledDesktopLayout,
    t
}: HypnogramProps) {
    return (
        <div
            className={[
                useScaledDesktopLayout ? 'col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col p-6 overflow-hidden' : '',
                !useScaledDesktopLayout
                    ? ['md:col-span-1 xl:col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col', isSmallScreen ? 'p-1' : 'p-4 md:p-6', 'overflow-hidden'].join(' ')
                    : ''
            ].join(' ')}
        >
            <div className={isSmallScreen ? 'flex items-center justify-between mb-2' : 'flex items-center justify-between mb-8'}>
                <h3 className={isSmallScreen ? 'w-full text-center text-base font-bold text-gray-900' : 'w-full text-center text-lg font-bold text-gray-900'}>
                    {t('sleep.hypnogram')}
                </h3>
            </div>

            <div className={isSmallScreen ? 'w-full h-[260px] overflow-hidden min-w-0' : 'flex-1 min-h-[300px] w-full min-w-0'}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <LineChart
                        data={data}
                        margin={{
                            top: 6,
                            right: isSmallScreen ? 10 : 30,
                            left: isSmallScreen ? 2 : 20,
                            bottom: isSmallScreen ? 42 : 20
                        }}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="time"
                            stroke="#94a3b8"
                            fontSize={isSmallScreen ? 9 : 11}
                            fontWeight={800}
                            tickLine={false}
                            axisLine={false}
                            interval={isSmallScreen ? 5 : 6}
                            tickMargin={10}
                            minTickGap={isSmallScreen ? 10 : 12}
                            angle={isSmallScreen ? -35 : 0}
                            textAnchor={isSmallScreen ? 'end' : 'middle'}
                            height={isSmallScreen ? 44 : 28}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={isSmallScreen ? 9 : 11}
                            fontWeight={800}
                            tickLine={false}
                            axisLine={false}
                            domain={[0.2, 4.8]}
                            ticks={[1, 2, 3, 4]}
                            tickMargin={6}
                            tick={{ dx: -2 }}
                            tickFormatter={val => {
                                if (val === 4) return t('detail.awake');
                                if (val === 3) return t('detail.remSleep');
                                if (val === 2) return t('detail.lightSleep');
                                if (val === 1) return t('detail.deepSleep');
                                return '';
                            }}
                            width={isSmallScreen ? 38 : 60}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                            }}
                            labelStyle={{ fontWeight: 800, marginBottom: '4px' }}
                        />
                        <Line type="stepAfter" dataKey="stage" stroke="#6366f1" strokeWidth={2.5} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
