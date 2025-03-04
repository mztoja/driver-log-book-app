export const extractTime = (input: string, longTime?: boolean): string => {

    const regex = !longTime
        ? /(\d{0,2}):?(\d{0,2})/
        : /(\d{0,3}):?(\d{0,2})/;
    const match = input.match(regex);
    if (match) {
        let hours = match[1];
        let minutes = match[2];

        hours = !longTime
            ? hours.slice(0, 2)
            : hours.slice(0, 3);

        if (minutes.length > 2) {
            minutes = minutes.slice(0, 2);
        }

        minutes = parseInt(minutes) > 59 ? '59' : minutes;

        if (hours) {
            if (longTime && hours.length === 2 && match[0].includes(':') && minutes === '') {
                return hours + ':';
            }
            return hours + (minutes ? ':' + minutes : '');
        }
    }

    return '';
}
