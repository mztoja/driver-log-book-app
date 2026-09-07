import React, { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useGlobalState } from '@/hooks/useGlobalState';
import { getText } from '@/utils/getText';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { DayInterface, FinanceInterface, LoadInterface, LogInterface, logTypeEnum } from '@/types';
import { LogEditModal } from './LogEditModal';
import { DayEditModal } from './DayEditModal';
import { FinanceEditModal } from './FinanceEditModal';
import { LoadEditModal } from './LoadEditModal';

interface Props {
    log: LogInterface;
    onClose: () => void;
    onSaved: () => void;
}

type Kind = 'log' | 'day' | 'finance' | 'load';

const kindOf = (type: logTypeEnum): Kind => {
    switch (type) {
        case logTypeEnum.days:
            return 'day';
        case logTypeEnum.generalExpense:
        case logTypeEnum.refuelDiesel:
        case logTypeEnum.refuelAdblue:
            return 'finance';
        case logTypeEnum.finishLoading:
        case logTypeEnum.finishUnloading:
            return 'load';
        default:
            return 'log';
    }
};

/**
 * Rozstrzyga którym modalem edytować dany wpis z listy „Czynności":
 * dzień → DayEditModal, tankowanie/wydatek → FinanceEditModal, za/rozładunek → LoadEditModal,
 * pozostałe → LogEditModal (wzór z driver-log-book-front `LogsList.handleEditButton`).
 */
export const LogEditDispatcher: React.FC<Props> = ({ log, onClose, onSaved }: Props): JSX.Element | null => {
    const { lang } = useGlobalState();
    const { fetchData } = useApi();
    const { showSnackbar } = useSnackbar();
    const kind = kindOf(log.type);

    const [day, setDay] = useState<DayInterface | null>(null);
    const [finance, setFinance] = useState<FinanceInterface | null>(null);
    const [load, setLoad] = useState<LoadInterface | null>(null);

    useEffect(() => {
        if (kind === 'log') return;
        const endpoint =
            kind === 'day'
                ? `${API_ENDPOINTS.getDayByLogId}/${log.id}`
                : kind === 'finance'
                  ? `${API_ENDPOINTS.getFinanceByLogId}/${log.id}`
                  : `${API_ENDPOINTS.getLoadingByLogId}/${log.id}`;
        const setter = kind === 'day' ? setDay : kind === 'finance' ? setFinance : setLoad;
        fetchData(endpoint, { setData: setter as never }).then((res) => {
            if (!res.success) {
                showSnackbar(getText('tours', 'apiError', lang), 'error');
                onClose();
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (kind === 'log') {
        return <LogEditModal log={log} onClose={onClose} onSaved={onSaved} />;
    }
    if (kind === 'day') {
        return day ? <DayEditModal day={day} onClose={onClose} onSaved={onSaved} /> : null;
    }
    if (kind === 'finance') {
        return finance ? <FinanceEditModal finance={finance} onClose={onClose} onSaved={onSaved} /> : null;
    }
    return load ? <LoadEditModal load={load} onClose={onClose} onSaved={onSaved} /> : null;
};
