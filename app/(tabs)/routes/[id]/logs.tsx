import { useLocalSearchParams } from 'expo-router';
import { LogRecords } from '@/components/records/LogRecords';

export default function TourLogsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    return <LogRecords source={{ kind: 'tour', tourId: Number(id) }} />;
}
