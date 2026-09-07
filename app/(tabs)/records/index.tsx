import { Redirect, type Href } from 'expo-router';

export default function RecordsIndex() {
    return <Redirect href={'/records/logs' as Href} />;
}
