import { LoadRecords } from '@/components/records/LoadRecords';

export default function AllLoadsScreen() {
    return <LoadRecords source={{ kind: 'all' }} />;
}
