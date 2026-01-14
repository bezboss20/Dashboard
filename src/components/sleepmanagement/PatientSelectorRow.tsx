import { Moon, Clock, AlertCircle, Search, ChevronDown, Download, Activity } from 'lucide-react';
import { Patient } from '../../data/mockData';

interface PatientSelectorRowProps {
    currentPatient: Patient;
    filteredPatients: Patient[];
    selectedPatientId: string;
    isDropdownOpen: boolean;
    searchQuery: string;
    language: string;
    t: (key: string) => string;
    onDropdownToggle: () => void;
    onPatientSelect: (patientId: string) => void;
    onSearchChange: (query: string) => void;
}

export function PatientSelectorRow({
    currentPatient,
    filteredPatients,
    selectedPatientId,
    isDropdownOpen,
    searchQuery,
    language,
    t,
    onDropdownToggle,
    onPatientSelect,
    onSearchChange
}: PatientSelectorRowProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="relative w-full lg:max-w-md min-w-0">
                <button
                    onClick={onDropdownToggle}
                    className="w-full flex items-center justify-between px-3 lg:px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all overflow-hidden"
                >
                    <div className="flex items-center gap-2 lg:gap-3 min-w-0">
                        <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[10px] lg:text-xs flex-shrink-0">
                            {(language === 'ko' ? currentPatient.nameKorean : currentPatient.nameEnglish).substring(0, 1)}
                        </div>
                        <div className="text-left min-w-0">
                            <p className="text-[11px] lg:text-[13px] font-bold text-gray-900 truncate">
                                {currentPatient.id.split('-')[1] || currentPatient.id} - {language === 'ko' ? currentPatient.nameKorean : currentPatient.nameEnglish}
                            </p>
                            <p className="text-[9px] lg:text-[10px] text-gray-500 truncate">
                                {currentPatient.personalInfo.roomNumber}{t('detail.roomNumber')} | {currentPatient.personalInfo.age}{t('detail.yearsOld')}
                            </p>
                        </div>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 lg:w-4 lg:h-4 text-gray-400 flex-shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                        <div className="p-2 border-b border-gray-100">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={t('table.searchPlaceholder')}
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-0"
                                    value={searchQuery}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                            {filteredPatients.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => onPatientSelect(p.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${selectedPatientId === p.id ? 'bg-blue-50' : ''}`}
                                >
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-gray-900">{p.id} - {language === 'ko' ? p.nameKorean : p.nameEnglish}</p>
                                        <p className="text-xs text-gray-500">{p.personalInfo.roomNumber}{t('detail.roomNumber')} | {p.personalInfo.age}{t('detail.yearsOld')}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3">
                <div className="flex flex-col items-end mr-4">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('table.alertStatus')}</p>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${currentPatient.sensorConnected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="text-[13px] font-bold text-gray-700">
                            {currentPatient.sensorConnected ? t('status.online') : t('status.offline')}
                        </span>
                    </div>
                </div>
                <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
                    <Download className="w-4 h-4" />
                    {t('header.exportReport')}
                </button>
                <button className="px-4 py-2 bg-blue-600 rounded-lg text-[13px] font-bold text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-200">
                    {t('header.liveMonitor')}
                </button>
            </div>
        </div>
    );
}
