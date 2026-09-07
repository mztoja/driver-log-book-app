import { FinanceRecords } from '@/components/records/FinanceRecords';

export default function AllFinancesScreen() {
    return <FinanceRecords source={{ kind: 'all' }} />;
}
