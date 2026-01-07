import { useState } from 'react';
import { UserPlus, User, Phone, Calendar, Stethoscope, Building2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
    registerNewPatient,
    Patient,
    generateHeartRateHistoryAll,
    generateBreathingRateHistoryAll,
    generateSleepHistory
} from '../data/mockData';
import { appendNotificationLog, formatTimestamp } from '../data/notificationLogStore';

export function RegistrationPage() {
    const { t, language } = useLanguage();

    const [formData, setFormData] = useState({
        // Basic Info
        patientNameKorean: '',
        patientNameEnglish: '',
        dateOfBirth: '',
        gender: '',
        contactNumber: '',

        // Device Info
        deviceId: '',
        sensorType: '',

        // Hospital Info
        registrationDate: '',
        hospital: ''
    });

    // Generate automatic Patient ID
    const [autoPatientId, setAutoPatientId] = useState(() => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `P${year}${month}${day}-${random}`;
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const sleepHistory = generateSleepHistory(autoPatientId, 90);
        const latestSleep = sleepHistory[0];

        const birthDate = new Date(formData.dateOfBirth);
        const age = new Date().getFullYear() - birthDate.getFullYear();

        const newPatient: Patient = {
            id: autoPatientId,
            name: formData.patientNameKorean,
            nameKorean: formData.patientNameKorean,
            nameEnglish: formData.patientNameEnglish || formData.patientNameKorean,
            heartRate: 72,
            breathingRate: 16,
            sleepState: '정상 수면',
            alertStatus: 'normal',
            stressIndex: 25,
            sleepScore: latestSleep.quality,
            sensorConnected: true,
            radarDetection: true,
            deviceStatus: 'online',
            deviceId: formData.deviceId || `D${Date.now()}`,
            lastUpdated: new Date(),
            heartRateHistory: generateHeartRateHistoryAll(72),
            breathingRateHistory: generateBreathingRateHistoryAll(16),
            sleepHistory: sleepHistory,
            sleepData: {
                duration: latestSleep.durationHours,
                quality: latestSleep.quality,
                stages: latestSleep.stages?.map(s => ({
                    stage: s.stage,
                    duration: s.durationHours || 0,
                    percentage: s.percentage
                })) || []
            },
            sleepSession: {
                bedInTime: '22:25',
                sleepTime: '22:55',
                wakeUpTime: '06:13',
                bedOutTime: '06:31',
                efficiency: 92,
                interruptions: latestSleep.interruptions || 0,
                latency: latestSleep.latencyMinutes || 0,
                avgSpO2: 98,
                weeklyTrends: []
            },
            events: [
                { time: t('time.justNow'), type: 'normal', description: t('registration.success') }
            ],
            personalInfo: {
                age: age,
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender === 'Male' ? '남성' : '여성',
                bloodType: 'A+',
                height: 170,
                weight: 65,
                roomNumber: '301',
                bedNumber: 'A',
                admissionDate: formData.registrationDate,
                contactNumber: formData.contactNumber,
                doctorName: '이민호 과장',
                nurseName: '김지원 간호사',
                doctorNameEnglish: 'Dr. Lee Min-ho',
                nurseNameEnglish: 'Nurse Kim Ji-won',
                hospital: formData.hospital,
                hospitalEnglish: formData.hospital,
                emergencyContact: {
                    name: '보호자',
                    nameEnglish: 'Guardian',
                    relationship: '배우자',
                    relationshipEnglish: 'Spouse',
                    phone: formData.contactNumber
                }
            },
            medicalHistory: {
                diagnoses: [t('detail.noSpecialMemo')],
                allergies: [t('detail.none')],
                medications: [],
                previousSurgeries: [],
                chronicConditions: []
            }
        };

        registerNewPatient(newPatient);

        appendNotificationLog({
            id: `REG-${autoPatientId}-${Date.now()}`,
            timestamp: formatTimestamp(new Date()),
            system: "환자 등록",
            patientId: autoPatientId,
            category: "환자 등록/정보 생성",
            type: "환자_등록",
            status: "성공",
            details: "새 환자가 성공적으로 등록되었습니다"
        });

        alert(`${t('registration.success')}\nPatient ID: ${autoPatientId}`);

        // Generate new ID for next registration
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        setAutoPatientId(`P${year}${month}${day}-${random}`);

        // Reset form
        setFormData({
            patientNameKorean: '',
            patientNameEnglish: '',
            dateOfBirth: '',
            gender: '',
            contactNumber: '',
            deviceId: '',
            sensorType: '',
            registrationDate: '',
            hospital: ''
        });
    };

    return (
        <div className="min-h-full bg-gray-50 flex flex-col">
            {/* Page Header - Compact */}
            <div className="px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-blue-600" />
                    <div>
                        <h1 className="text-gray-900 text-lg">{t('registration.title')}</h1>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-4">
                <div className="max-w-6xl mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Basic Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <h3 className="text-sm text-gray-900 mb-3 flex items-center gap-2">
                                <User className="w-4 h-4 text-blue-600" />
                                {t('registration.basicInfo')}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Korean/Native Name */}
                                <div>
                                    <label className="block text-xs text-gray-700 mb-1">
                                        {t('registration.patientName')} *
                                    </label>
                                    <input
                                        type="text"
                                        name="patientNameKorean"
                                        value={formData.patientNameKorean}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        placeholder={language === 'ko' ? '홍길동' : 'John Doe'}
                                    />
                                </div>

                                {/* Date of Birth */}
                                <div>
                                    <label className="block text-xs text-gray-700 mb-1">
                                        {t('registration.dob')} *
                                    </label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                </div>

                                {/* Gender */}
                                <div>
                                    <label className="block text-xs text-gray-700 mb-1">
                                        {t('registration.gender')} *
                                    </label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    >
                                        <option value="">{t('registration.select')}</option>
                                        <option value="Male">{t('registration.male')}</option>
                                        <option value="Female">{t('registration.female')}</option>
                                    </select>
                                </div>

                                {/* Contact Number */}
                                <div>
                                    <label className="block text-xs text-gray-700 mb-1">
                                        {t('registration.contact')}
                                    </label>
                                    <input
                                        type="tel"
                                        name="contactNumber"
                                        value={formData.contactNumber}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        placeholder="010-1234-5678"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Device Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <h3 className="text-sm text-gray-900 mb-3 flex items-center gap-2">
                                <Stethoscope className="w-4 h-4 text-blue-600" />
                                {t('registration.deviceInfo')}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Device ID */}
                                <div>
                                    <label className="block text-xs text-gray-700 mb-1">
                                        {t('registration.deviceId')} *
                                    </label>
                                    <input
                                        type="text"
                                        name="deviceId"
                                        value={formData.deviceId}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        placeholder="D123456789"
                                    />
                                </div>

                                {/* Sensor Type */}
                                <div>
                                    <label className="block text-xs text-gray-700 mb-1">
                                        {t('registration.sensorType')} *
                                    </label>
                                    <select
                                        name="sensorType"
                                        value={formData.sensorType}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    >
                                        <option value="">{t('registration.select')}</option>
                                        <option value="Radar">{t('registration.radar60ghz')}</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Hospital Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <h3 className="text-sm text-gray-900 mb-3 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-blue-600" />
                                {t('registration.careFacility')}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Hospital */}
                                <div>
                                    <label className="block text-xs text-gray-700 mb-1">
                                        {t('registration.facilityName')} *
                                    </label>
                                    <input
                                        type="text"
                                        name="hospital"
                                        value={formData.hospital}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        placeholder={language === 'ko' ? '서울대학교병원' : 'Main Hospital'}
                                    />
                                </div>

                                {/* Registration Date */}
                                <div>
                                    <label className="block text-xs text-gray-700 mb-1 flex items-center gap-1">
                                        <Calendar className="w-3 h-3 text-gray-400" />
                                        {t('registration.registrationDate')} *
                                    </label>
                                    <input
                                        type="date"
                                        name="registrationDate"
                                        value={formData.registrationDate}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-3 justify-end bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <button
                                type="button"
                                onClick={() => setFormData({
                                    patientNameKorean: '',
                                    patientNameEnglish: '',
                                    dateOfBirth: '',
                                    gender: '',
                                    contactNumber: '',
                                    deviceId: '',
                                    sensorType: '',
                                    registrationDate: '',
                                    hospital: ''
                                })}
                                className="px-5 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                {t('registration.reset')}
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                            >
                                {t('registration.submit')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
