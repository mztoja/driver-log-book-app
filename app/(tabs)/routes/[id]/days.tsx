import { useLocalSearchParams } from 'expo-router';
import { DayRecords } from '@/components/records/DayRecords';

export default function TourDaysScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    return <DayRecords source={{ kind: 'tour', tourId: Number(id) }} />;
}
