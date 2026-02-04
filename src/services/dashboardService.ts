import { apiClient } from './apiClient';
import { OverviewResponse, SummaryData, AlertData, VitalData } from '../types/dashboard';

export const fetchDashboardOverview = async () => {
    const response = await apiClient.get<any>('/overview');

    // Handle structure extraction similar to what was in the slice
    const responseData = response as any;

    if (!responseData) {
        throw new Error('Empty response from server');
    }

    let extractedData = null;

    if (responseData.success === true && responseData.data) {
        extractedData = responseData.data;
    } else if (responseData.summary || responseData.alerts || responseData.vitals) {
        extractedData = responseData;
    } else if (responseData.data && (responseData.data.summary || responseData.data.alerts)) {
        extractedData = responseData.data;
    }

    if (extractedData) {
        return {
            summary: extractedData.summary as SummaryData,
            alerts: extractedData.alerts as AlertData[],
            vitals: extractedData.vitals as { heartRate: VitalData[], respiratoryRate: VitalData[] },
            serverTime: responseData.updated_at || responseData.timestamp || extractedData.updated_at || extractedData.timestamp || extractedData.serverTime || null
        };
    }

    throw new Error('API returned invalid data format');
};
