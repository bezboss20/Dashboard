import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  registerNewPatient,
  Patient,
  generateHeartRateHistoryAll,
  generateBreathingRateHistoryAll,
  generateSleepHistory
} from '../../data/mockData';
import { appendNotificationLog, formatTimestamp } from '../../data/notificationLogStore';
import { BasicInfoForm } from '../../components/registration/BasicInfoForm';
import { DeviceInfoCard } from '../../components/registration/DeviceInfoCard';
import { FacilityInfoCard } from '../../components/registration/FacilityInfoCard';
import { SubmitActions } from '../../components/registration/SubmitActions';

export function RegistrationPage() {
  const { t, language } = useLanguage();

  const [formData, setFormData] = useState({
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

  const [autoPatientId, setAutoPatientId] = useState(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `P${year}${month}${day}-${random}`;
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
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
      patientStatus: 'ACTIVE',
      lastUpdated: new Date(),
      heartRateHistory: generateHeartRateHistoryAll(72),
      breathingRateHistory: generateBreathingRateHistoryAll(16),
      sleepHistory: sleepHistory,
      sleepData: {
        duration: latestSleep.durationHours,
        quality: latestSleep.quality,
        stages:
          latestSleep.stages?.map((s) => ({
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
      events: [{ time: t('time.justNow'), type: 'normal', description: t('registration.success') }],
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
      system: '환자 등록',
      patientId: autoPatientId,
      category: '환자 등록/정보 생성',
      type: '환자_등록',
      status: '성공',
      details: '새 환자가 성공적으로 등록되었습니다'
    });

    alert(`${t('registration.success')}\nPatient ID: ${autoPatientId}`);
    setAutoPatientId(`P${new Date().getFullYear()}${Math.floor(Math.random() * 10000)}`);
    resetForm();
  };

  return (
    <div className="min-h-full bg-gray-50 flex flex-col">
      {/* Header (2560-only: larger like expected) */}
      <div className="px-4 py-2 bg-white border-b border-gray-200 flex-shrink-0 min-[2500px]:px-10 min-[2500px]:py-6">
        <div className="flex items-center gap-2 min-[2500px]:gap-3">
          <UserPlus className="w-4 h-4 text-blue-600 min-[2500px]:w-6 min-[2500px]:h-6" />
          <h1 className="text-gray-900 text-md font-medium min-[2500px]:text-3xl min-[2500px]:font-semibold">
            {t('registration.title')}
          </h1>
        </div>
      </div>

      {/* Content wrapper (2560-only: wider + more padding) */}
      <div className="flex-1 overflow-auto px-1 py-3 sm:p-3 min-[2500px]:px-10 min-[2500px]:py-8">
        <div className="w-full max-w-none sm:max-w-[1400px] sm:mx-auto min-[2500px]:max-w-[2100px] min-[2500px]:mx-auto">
          <form onSubmit={handleSubmit} className="space-y-2 min-[2500px]:space-y-6">
            <BasicInfoForm
              formData={formData}
              language={language}
              t={t}
              onInputChange={handleInputChange}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 min-[2500px]:gap-6">
              <DeviceInfoCard formData={formData} t={t} onInputChange={handleInputChange} />
              <FacilityInfoCard
                formData={formData}
                language={language}
                t={t}
                onInputChange={handleInputChange}
              />
            </div>

            <SubmitActions t={t} onReset={resetForm} />
          </form>
        </div>
      </div>
    </div>
  );
}
