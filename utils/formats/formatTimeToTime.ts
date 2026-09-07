export const formatTimeToTime = (time: string): string => {
    if (!time) return '0:00';
    const [hours, minutes] = time.split(':');
    if (Number(hours) >= 799) {
        return '> 799:99';
    }
    return `${hours}:${minutes ?? '00'}`;
};
