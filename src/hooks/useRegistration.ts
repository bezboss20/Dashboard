import { useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { appendNotificationLog, formatTimestamp } from '../data/notificationLogStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://kaleidoscopically-prorailroad-kris.ngrok-free.dev';

export function useRegistration() {
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

        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        setAutoPatientId(`P${year}${month}${day}-${random}`);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const createPatientInput = {
            patientCode: formData.patientCode || autoPatientId,
            fullName: {
                ko: formData.patientNameKorean,
                en: formData.patientNameEnglish || undefined,
            },
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender.toUpperCase(),
            contact: {
                phone: formData.contactNumber,
                emergencyPhone: formData.emergencyPhone || undefined,
            },
            ward: {
                wardId: formData.wardId || '6969bda17d11a3b1a246a450',
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

    return {
        state: {
            formData,
            autoPatientId,
        },
        actions: {
            handleInputChange,
            handleSubmit,
            resetForm
        },
        t,
        language
    };
}
