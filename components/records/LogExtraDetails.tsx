import React, { JSX, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Row } from '@/components/tours/DetailCard';
import { useApi } from '@/hooks/useApi';
import { useGlobalState } from '@/hooks/useGlobalState';
import { useTheme } from '@/hooks/useTheme';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import {
    CommonInterface,
    DayInterface,
    FinanceInterface,
    LoadInterface,
    LogInterface,
    logTypeEnum,
    ServiceInterface,
    serviceTypeEnum,
    TourInterface,
    ToursInterface,
} from '@/types';
import { getText } from '@/utils/getText';
import { formatAmount } from '@/utils/formats/formatAmount';
import { formatQuantity } from '@/utils/formats/formatQuantity';
import { formatWeight } from '@/utils/formats/formatWeight';
import { formatOdometer } from '@/utils/formats/formatOdometer';
import { formatTimeToTime } from '@/utils/formats/formatTimeToTime';
import { formatCountry } from '@/utils/formats/formatCountry';

type Details = FinanceInterface | LoadInterface | DayInterface | TourInterface | ServiceInterface;

// Odpowiednik front LogsList.detailsEndpointByType – typy wpisów, które mają pełne dane w osobnej tabeli.
const DETAILS_ENDPOINT: Partial<Record<logTypeEnum, string>> = {
    [logTypeEnum.days]: API_ENDPOINTS.getDayByLogId,
    [logTypeEnum.tours]: API_ENDPOINTS.getRouteByLogId,
    [logTypeEnum.generalExpense]: API_ENDPOINTS.getFinanceByLogId,
    [logTypeEnum.refuelDiesel]: API_ENDPOINTS.getFinanceByLogId,
    [logTypeEnum.refuelAdblue]: API_ENDPOINTS.getFinanceByLogId,
    [logTypeEnum.finishLoading]: API_ENDPOINTS.getLoadingByLogId,
    [logTypeEnum.finishUnloading]: API_ENDPOINTS.getLoadingByLogId,
    [logTypeEnum.service]: API_ENDPOINTS.getServiceByLogId,
    [logTypeEnum.maintenance]: API_ENDPOINTS.getServiceByLogId,
};

// Cache jak na froncie (po log.id / vehicleId) – zwinięcie i ponowne rozwinięcie tego samego
// wpisu nie pyta backendu drugi raz. Na poziomie modułu, bo wiersze listy są przemontowywane.
const detailsCache = new Map<number, Details>();
const vehicleRegCache = new Map<number, string>();

/** po edycji wpisu dane w cache są nieaktualne */
export const clearLogDetailsCache = (): void => {
    detailsCache.clear();
};

/**
 * Szczegóły wpisu dociągane po rozwinięciu wiersza na liście czynności (odpowiednik front
 * `LogsList.renderExtraDetails`): pełny adres miejsca + dane dnia / trasy / wydatku / ładunku / serwisu.
 */
export const LogExtraDetails: React.FC<{ log: LogInterface }> = ({ log }): JSX.Element => {
    const { lang } = useGlobalState();
    const { colors } = useTheme();
    const { fetchData } = useApi();
    const endpoint = DETAILS_ENDPOINT[log.type];
    const [details, setDetails] = useState<Details | null>(detailsCache.get(log.id) ?? null);
    const [loading, setLoading] = useState<boolean>(!!endpoint && !detailsCache.has(log.id));
    const [vehicleReg, setVehicleReg] = useState<string | null>(null);

    const t = (k: keyof ToursInterface['en']) => getText('tours', k, lang);
    const c = (k: keyof CommonInterface['en']) => getText('common', k, lang);

    useEffect(() => {
        if (!endpoint || detailsCache.has(log.id)) return;
        fetchData<Details>(`${endpoint}/${log.id}`).then((res) => {
            if (res.responseData) {
                detailsCache.set(log.id, res.responseData);
                setDetails(res.responseData);
            }
            setLoading(false);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [log.id]);

    // nr rejestracyjny serwisowanego pojazdu (serwis zna tylko vehicleId)
    const serviceVehicleId =
        details && (log.type === logTypeEnum.service || log.type === logTypeEnum.maintenance)
            ? (details as ServiceInterface).vehicleId
            : null;
    useEffect(() => {
        if (serviceVehicleId === null) return;
        const cached = vehicleRegCache.get(serviceVehicleId);
        if (cached !== undefined) {
            setVehicleReg(cached);
            return;
        }
        fetchData<{ data: string }>(`${API_ENDPOINTS.getVehicleRegById}/${serviceVehicleId}`).then((res) => {
            if (res.responseData) {
                vehicleRegCache.set(serviceVehicleId, res.responseData.data);
                setVehicleReg(res.responseData.data);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serviceVehicleId]);

    const place = log.placeData
        ? (
            <View style={{ marginBottom: 4 }}>
                <ThemedText>{log.placeData.name}</ThemedText>
                <ThemedText>{log.placeData.street}</ThemedText>
                <ThemedText>{log.placeData.code} - {log.placeData.city}</ThemedText>
                <ThemedText>{formatCountry(log.placeData.country, lang)}</ThemedText>
            </View>
        )
        : null;

    const renderTyped = (): React.ReactNode => {
        if (loading) return <ActivityIndicator size="small" color={colors.text} style={{ alignSelf: 'flex-start' }} />;
        if (!details) return null;
        switch (log.type) {
            case logTypeEnum.generalExpense:
            case logTypeEnum.refuelDiesel:
            case logTypeEnum.refuelAdblue: {
                const f = details as FinanceInterface;
                return <>
                    <Row label={t('description')} value={f.itemDescription} />
                    <Row label={t('quantity')} value={formatQuantity(Number(f.quantity))} />
                    <Row label={t('amount')} value={formatAmount(Number(f.amount), f.currency)} />
                    {!!f.foreignCurrency &&
                        <Row label={t('foreignAmount')} value={formatAmount(Number(f.foreignAmount), f.foreignCurrency)} />
                    }
                    <Row label={t('payment')} value={f.payment} />
                </>;
            }
            case logTypeEnum.finishLoading:
            case logTypeEnum.finishUnloading: {
                const l = details as LoadInterface;
                return <>
                    <Row label={t('loadNr')} value={String(l.loadNr)} />
                    <Row label={t('description')} value={l.description || '—'} />
                    <Row label={t('quantity')} value={l.quantity || '—'} />
                    <Row label={t('weight')} value={formatWeight(l.weight)} />
                    <Row label={t('reference')} value={l.reference || '—'} />
                    <Row label={t('distance')} value={formatOdometer(l.distance)} />
                </>;
            }
            case logTypeEnum.days: {
                const d = details as DayInterface;
                return <>
                    <Row label={c('driveTime')} value={formatTimeToTime(d.driveTime)} />
                    {d.doubleCrew && <Row label={c('driveTime2')} value={formatTimeToTime(d.driveTime2)} />}
                    <Row label={t('distance')} value={formatOdometer(d.distance)} />
                </>;
            }
            case logTypeEnum.tours: {
                const tr = details as TourInterface;
                return <>
                    <Row label={t('distance')} value={formatOdometer(tr.distance)} />
                    <Row label={t('workTime')} value={formatTimeToTime(tr.workTime)} />
                    <Row label={c('truck')} value={tr.truck} />
                    {!!tr.trailer && <Row label={c('trailer')} value={tr.trailer} />}
                </>;
            }
            case logTypeEnum.service:
            case logTypeEnum.maintenance: {
                const s = details as ServiceInterface;
                return <>
                    <Row label={c('registrationPlate')} value={vehicleReg ?? '...'} />
                    <Row
                        label={c('serviceType')}
                        value={s.type === serviceTypeEnum.service ? c('serviceService') : c('serviceMaintenance')}
                    />
                    <ThemedText>{s.entry}</ThemedText>
                </>;
            }
            default:
                return null;
        }
    };

    return (
        <View style={{ gap: 4 }}>
            {place}
            {renderTyped()}
        </View>
    );
};
