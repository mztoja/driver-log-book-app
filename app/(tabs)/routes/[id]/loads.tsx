import { useLocalSearchParams } from 'expo-router';
import { LoadRecords } from '@/components/records/LoadRecords';

export default function TourLoadsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    return <LoadRecords source={{ kind: 'tour', tourId: Number(id) }} />;
}
