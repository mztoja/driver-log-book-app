import { DayRecords } from '@/components/records/DayRecords';

export default function AllDaysScreen() {
    return <DayRecords source={{ kind: 'all' }} />;
}
