import { Bed, Moon, Sun, LogOut } from 'lucide-react';
import { Patient } from '../../data/mockData';

interface SleepTimeInfoProps {
    currentPatient: Patient;
    isSmallScreen: boolean;
    useScaledDesktopLayout: boolean;
    t: (key: string) => string;
}

export function SleepTimeInfo({
    currentPatient,
    isSmallScreen,
    useScaledDesktopLayout,
    t
}: SleepTimeInfoProps) {
    const timeItems = [
        { label: t('sleep.bedIn'), time: currentPatient.sleepSession?.bedInTime || '22:25', icon: Bed, color: 'text-blue-500' },
        { label: t('sleep.sleep'), time: currentPatient.sleepSession?.sleepTime || '22:55', icon: Moon, color: 'text-purple-500' },
        { label: t('sleep.wakeUp'), time: currentPatient.sleepSession?.wakeUpTime || '06:13', icon: Sun, color: 'text-orange-500' },
        { label: t('sleep.bedOut'), time: currentPatient.sleepSession?.bedOutTime || '06:31', icon: LogOut, color: 'text-teal-500' }
    ];

    return (
        <div
            className={
                isSmallScreen
                    ? 'bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full'
                    : useScaledDesktopLayout
                        ? 'col-span-1 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full'
                        : 'md:col-span-1 xl:col-span-1 bg-white p-4 md:p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full'
            }
        >
            <h3 className={isSmallScreen ? 'text-[12px] font-bold text-gray-900 mb-4 tracking-tight' : 'text-sm font-bold text-gray-900 mb-6 uppercase tracking-widest'}>
                {t('sleep.timeInfo')}
            </h3>

            <div className={isSmallScreen ? 'grid grid-cols-2 gap-3 flex-1' : 'grid grid-cols-2 gap-4 flex-1'}>
                {timeItems.map((item, idx) => (
                    <div
                        key={idx}
                        className={
                            isSmallScreen
                                ? 'bg-gray-50/80 p-3 rounded-xl border border-gray-100 flex flex-col items-center justify-center gap-1.5'
                                : 'bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center justify-center gap-2'
                        }
                    >
                        <item.icon className={isSmallScreen ? `w-4 h-4 ${item.color}` : `w-5 h-5 ${item.color}`} />
                        <p className={isSmallScreen ? 'text-[13px] font-black text-gray-900 tracking-tight leading-none' : 'text-[15px] font-black text-gray-900 tracking-tight'}>
                            {item.time}
                        </p>
                        <p className={isSmallScreen ? 'text-[9px] text-gray-400 font-bold leading-tight' : 'text-[10px] text-gray-400 font-bold uppercase'}>
                            {item.label}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
