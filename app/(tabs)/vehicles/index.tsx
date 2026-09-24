import { useLocalSearchParams } from 'expo-router';
import { VehiclesList } from '@/components/vehicles/VehiclesList';

export default function VehiclesScreen() {
    // ?id=… – głęboki link z panelu Info („Pokaż szczegóły pojazdu")
    const { id } = useLocalSearchParams<{ id?: string }>();
    return <VehiclesList focusId={id ? Number(id) : undefined} />;
}
