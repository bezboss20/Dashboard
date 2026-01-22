interface SleepRecord {
    totalDuration: string;
    deep: { label: string; duration: string; pct: number };
    light: { label: string; duration: string; pct: number };
    rem: { label: string; duration: string; pct: number };
    awake: { label: string; duration: string; pct: number };
}

interface SleepAnalysisSectionProps {
    sleepRecord: SleepRecord;
    t: (key: string) => string;
}

export function SleepAnalysisSection({ sleepRecord, t }: SleepAnalysisSectionProps) {
    const stages = [
        { key: 'detail.deepSleep', item: sleepRecord.deep, bullet: 'bg-purple-600' },
        { key: 'detail.lightSleep', item: sleepRecord.light, bullet: 'bg-purple-300' },
        { key: 'detail.remSleep', item: sleepRecord.rem, bullet: 'bg-gray-300' },
        { key: 'detail.awake', item: sleepRecord.awake, bullet: 'bg-orange-400' }
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-3 px-3 sm:p-6">
            <div className="mb-2.5 sm:mb-6">
                <div className="flex gap-2 flex-row items-center justify-between">
                    <h3 className="text-[15px] sm:text-[17px] font-bold text-gray-900 leading-tight break-keep">
                        {t('detail.sleepAnalysis')}
                    </h3>
                    <div className="shrink-0">
                        <span className="whitespace-nowrap text-[10px] font-extrabold bg-gray-50 text-gray-600 border border-gray-100 shadow-sm px-2 py-1 rounded-full">
                            {sleepRecord.totalDuration
                                .replace('h', t('time.hour'))
                                .replace('m', t('time.minute'))
                                .replace('시간', t('time.hour'))
                                .replace('분', t('time.minute'))}
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-2 sm:space-y-5">
                <div className="-mx-1 sm:mx-0">
                    <div className="h-6 sm:h-10 w-[calc(100%+8px)] sm:w-full flex rounded-xl overflow-hidden shadow-inner bg-gray-50">
                        <div
                            style={{ width: `${sleepRecord.deep.pct}%` }}
                            className="bg-gradient-to-r from-purple-700 to-purple-500 transition-all duration-500"
                        />
                        <div
                            style={{ width: `${sleepRecord.light.pct}%` }}
                            className="bg-purple-300 transition-all duration-500"
                        />
                        <div
                            style={{ width: `${sleepRecord.rem.pct}%` }}
                            className="bg-gray-300 transition-all duration-500"
                        />
                        <div
                            style={{ width: `${sleepRecord.awake.pct}%` }}
                            className="bg-orange-400 transition-all duration-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 sm:gap-x-3 sm:gap-y-2">
                    {stages.map((s, idx) => (
                        <div key={idx} className="min-w-0">
                            <div className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full shrink-0 ${s.bullet}`} />
                                <span className="text-[11px] sm:text-[11px] text-gray-600 font-extrabold leading-4 break-keep">
                                    {t(s.key)}
                                </span>
                            </div>

                            <div className="mt-0.5 text-[12px] sm:text-[15px] font-black text-gray-900 leading-5 whitespace-nowrap">
                                {s.item.duration
                                    .replace('h', t('time.hour'))
                                    .replace('m', t('time.minute'))
                                    .replace('시간', t('time.hour'))
                                    .replace('분', t('time.minute'))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
