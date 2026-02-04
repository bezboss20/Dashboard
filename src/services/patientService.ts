import { apiClient } from './apiClient';
import { Patient, PatientsResponse, PatientsQueryParams } from '../types/patient';

export const fetchPatients = async (params: PatientsQueryParams = {}): Promise<{ patients: Patient[], total: number, serverTime?: string | null }> => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', String(params.page || 1));
    queryParams.append('limit', String(params.limit || 100));

    if (params.patientStatus && params.patientStatus !== 'ALL') {
        queryParams.append('patientStatus', params.patientStatus);
    }
    if (params.search) {
        queryParams.append('search', params.search);
    }
    if (params.date) {
        queryParams.append('date', params.date);
    }

    try {
        const response = await apiClient.get<PatientsResponse>(`/get-patients?${queryParams.toString()}`);

        // Handle response structure variations
        const responseData = response as unknown as PatientsResponse; // Axios interceptor returns data

        if (responseData && responseData.success) {
            const data = responseData.data;
            const serverTime = responseData.updated_at || (data as any)?.updated_at || null;
            if (Array.isArray(data)) {
                return { patients: data, total: data.length, serverTime };
            }
            if (data && Array.isArray(data.patients)) {
                return { patients: data.patients, total: data.total, serverTime };
            }
        }
    } catch (error) {
        console.warn('Error fetching patients, defaulting to empty list:', error);
        // If API fails (e.g. 404 for no results), return empty list instead of throwing
        return { patients: [], total: 0 };
    }

    // Fallback for unexpected structure or failure
    return { patients: [], total: 0 };
};

export const updatePatientStatus = async (id: string, status: string) => {
    return apiClient.put(`/patients/${id}/status`, { status });
};
