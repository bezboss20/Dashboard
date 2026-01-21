import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../../context/LanguageContext';
import { appendNotificationLog, formatTimestamp } from '../../data/notificationLogStore';
import { BasicInfoForm } from '../../components/registration/BasicInfoForm';
import { DeviceInfoCard } from '../../components/registration/DeviceInfoCard';
import { FacilityInfoCard } from '../../components/registration/FacilityInfoCard';
import { RoomInfoCard } from '../../components/registration/RoomInfoCard';
import { SubmitActions } from '../../components/registration/SubmitActions';

// API Configuration
const API_BASE_URL = 'https://kaleidoscopically-prorailroad-kris.ngrok-free.dev';

export function RegistrationPage() {
  const { t, language } = useLanguage();

  const [formData, setFormData] = useState({
    patientNameKorean: '',
    patientNameEnglish: '',
    patientCode: '',
    dateOfBirth: '',
    gender: '',
    contactNumber: '',
    emergencyPhone: '',
    status: 'ACTIVE',
    deviceId: '',
    sensorType: 'Radar',
    wardId: '',
    roomNumber: '',
    bedNumber: '',
    admissionDate: new Date().toISOString().split('T')[0],
    hospital: language === 'ko' ? '서울대학교병원' : 'Main Hospital'
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
      patientCode: '',
      dateOfBirth: '',
      gender: '',
      contactNumber: '',
      emergencyPhone: '',
      status: 'ACTIVE',
      deviceId: '',
      sensorType: 'Radar',
      wardId: '',
      roomNumber: '',
      bedNumber: '',
      admissionDate: new Date().toISOString().split('T')[0],
      hospital: language === 'ko' ? '서울대학교병원' : 'Main Hospital'
    });

    // Regenerate ID for next registration
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    setAutoPatientId(`P${year}${month}${day}-${random}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Map frontend formData to API CreatePatientInput structure
    const createPatientInput = {
      patientCode: formData.patientCode || autoPatientId,
      fullName: {
        ko: formData.patientNameKorean,
        en: formData.patientNameEnglish || undefined,
      },
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender.toUpperCase(), // 'Male' -> 'MALE', 'Female' -> 'FEMALE'
      contact: {
        phone: formData.contactNumber,
        emergencyPhone: formData.emergencyPhone || undefined,
      },
      ward: {
        wardId: formData.wardId || '6969bda17d11a3b1a246a450', // Default Ward ID as requested
        roomNumber: formData.roomNumber ? parseInt(formData.roomNumber) : 101,
        bedNumber: formData.bedNumber ? parseInt(formData.bedNumber) : 1,
      },
      admissionDate: formData.admissionDate,
      status: formData.status,
      facilityName: formData.hospital || undefined,
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/create-patient`, createPatientInput, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (response.data.success) {
        const createdPatient = response.data.data;

        // Add to notification log (Frontend local storage)
        appendNotificationLog({
          id: `REG-${createdPatient._id}-${Date.now()}`,
          timestamp: formatTimestamp(new Date()),
          system: '환자 등록',
          patientId: createdPatient.patientCode,
          patientName: formData.patientNameKorean,
          fullName: { ko: formData.patientNameKorean, en: formData.patientNameEnglish },
          category: '환자 등록/정보 생성',
          type: '환자_등록',
          status: '성공',
          details: '새 환자가 성공적으로 등록되었습니다'
        });

        alert(`${t('registration.success')}\nPatient ID: ${createdPatient.patientCode}`);
        resetForm();
      } else {
        alert(`Error: ${response.data.message || 'Failed to register patient'}`);
      }
    } catch (error) {
      console.error('Registration Error:', error);
      if (axios.isAxiosError(error)) {
        alert(`Registration failed: ${error.response?.data?.message || error.message}`);
      } else {
        alert('An unexpected error occurred during registration.');
      }
    }
  };

  return (
    <div className="w-full min-h-full bg-gray-50 flex flex-col items-stretch">
      {/* Header */}
      <div className="w-full px-4 py-2 bg-white border-b border-gray-200 flex-shrink-0 min-[2500px]:px-12 min-[2500px]:py-8">
        <div className="flex items-center gap-2 min-[2500px]:gap-4 min-[2500px]:!max-w-none min-[2500px]:!mx-0 w-full">
          <UserPlus className="w-4 h-4 text-blue-600 min-[2500px]:w-8 min-[2500px]:h-8" />
          <h1 className="text-gray-900 text-md font-medium min-[2500px]:text-4xl min-[2500px]:font-bold">
            {t('registration.title')}
          </h1>
        </div>
      </div>

      {/* Content wrapper */}
      <div className="flex-1 w-full overflow-auto px-1 py-3 sm:p-3 min-[2500px]:px-12 min-[2500px]:py-10">
        <div className="w-full sm:max-w-[1400px] sm:mx-auto min-[2500px]:!max-w-none min-[2500px]:!mx-0">
          <form onSubmit={handleSubmit} className="space-y-4 min-[2500px]:space-y-8">
            <BasicInfoForm
              formData={formData}
              language={language}
              t={t}
              onInputChange={handleInputChange}
            />

            {/* Commented out as requested - previously verified fix */}
            {/*<div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-[2500px]:gap-6">
              <RoomInfoCard formData={formData} t={t} onInputChange={handleInputChange} />
              <DeviceInfoCard formData={formData} t={t} onInputChange={handleInputChange} />
              <FacilityInfoCard
                formData={formData}
                language={language}
                t={t}
                onInputChange={handleInputChange}
              />
            </div> */}

            <SubmitActions t={t} onReset={resetForm} />
          </form>
        </div>
      </div>
    </div>
  );
}
