import { LogRecords } from '@/components/records/LogRecords';

export default function AllLogsScreen() {
    return <LogRecords source={{ kind: 'all' }} />;
}
