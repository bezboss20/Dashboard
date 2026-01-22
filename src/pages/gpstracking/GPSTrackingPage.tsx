import { useGPSTracking } from '../../hooks/useGPSTracking';
import { GPSTrackingView } from '../../components/gpstracking/GPSTrackingView';

export function GPSTrackingPage() {
    const gpsModel = useGPSTracking();

    return <GPSTrackingView model={gpsModel} />;
}
