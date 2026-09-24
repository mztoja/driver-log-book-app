import React, { JSX, useEffect, useState } from 'react';
import { Row } from '@/components/tours/DetailCard';
import { useGlobalState } from '@/hooks/useGlobalState';
import { useBaseCountry } from '@/hooks/useBaseCountry';
import { DayInterface } from '@/types';
import { getText } from '@/utils/getText';
import { homeNow } from '@/utils/homeNow';
import { formatTimeToTime } from '@/utils/formats/formatTimeToTime';
import { calcBreakTime, calcWorkTime } from '@/utils/dayTimes';

/**
 * Czas pracy i pauza dnia liczone na bieżąco z dat (jak front DaysList), a nie z day.workTime /
 * day.breakTime z bazy. Tyka co 30 s, żeby dzień w toku i trwająca pauza aktualizowały się na żywo.
 */
export const DayTimes: React.FC<{ day: DayInterface; days: DayInterface[] }> = ({ day, days }): JSX.Element => {
    const { lang } = useGlobalState();
    const baseCountry = useBaseCountry();
    const [, setTick] = useState<number>(0);

    useEffect(() => {
        const id = setInterval(() => setTick((t) => t + 1), 30000);
        return () => clearInterval(id);
    }, []);

    const now = homeNow(baseCountry);
    const breakTime = calcBreakTime(days, day, now);

    return (
        <>
            <Row label={getText('tours', 'workTime', lang)} value={formatTimeToTime(calcWorkTime(day, now))} />
            {breakTime !== null && (
                <Row label={getText('tours', 'breakTime', lang)} value={formatTimeToTime(breakTime)} />
            )}
        </>
    );
};
