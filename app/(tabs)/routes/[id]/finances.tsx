import { useLocalSearchParams } from 'expo-router';
import { FinanceRecords } from '@/components/records/FinanceRecords';

export default function TourFinancesScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    return <FinanceRecords source={{ kind: 'tour', tourId: Number(id) }} />;
}
