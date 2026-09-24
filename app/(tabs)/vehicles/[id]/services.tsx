import { useLocalSearchParams } from 'expo-router';
import { ServicesList } from '@/components/vehicles/ServicesList';

export default function VehicleServicesScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    return <ServicesList vehicleId={Number(id)} />;
}
