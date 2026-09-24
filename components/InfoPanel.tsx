import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Icon, ProgressBar } from 'react-native-paper';
import { router, useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { useGlobalState } from '@/hooks/useGlobalState';
import { useApi } from '@/hooks/useApi';
import { useSnackbar } from '@/hooks/useSnackbar';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { getText } from '@/utils/getText';
import {
    DayInterface,
    LoadInterface,
    LogInterface,
    PlaceInterface,
    TourInterface,
    UserInterface,
    VehicleInterface,
    vehicleTypeEnum,
} from '@/types';
import { formatOdometer } from '@/utils/formats/formatOdometer';
import { formatWeight } from '@/utils/formats/formatWeight';
import { formatDateToTime } from '@/utils/formats/formatDateToTime';
import { formatFuelQuantity } from '@/utils/formats/formatFuelQuantity';
import { formatSimplePlace } from '@/utils/formats/formatSimplePlace';
import { formatShortDate } from '@/utils/formats/formatShortDate';
import { TimeArcGauge } from '@/components/TimeArcGauge';
import { useBaseCountry } from '@/hooks/useBaseCountry';
import { homeNow } from '@/utils/homeNow';
import { VehicleFormModal } from '@/components/vehicles/VehicleFormModal';

// Data z bazy to surowy "wall time". Do liczenia różnic (względem `new Date()`)
// budujemy Date z komponentów wprost z tekstu – bez parsowania przez silnik i bez
// przeliczeń stref (Hermes potrafi je psuć). Lokalne gettery zwracają wtedy
// dokładnie tę godzinę, która jest w bazie.
const toLocalDate = (dateString: string): Date => {
    const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(dateString ?? '');
    if (!m) return new Date(dateString);
    return new Date(
        Number(m[1]),
        Number(m[2]) - 1,
        Number(m[3]),
        Number(m[4] ?? 0),
        Number(m[5] ?? 0),
        Number(m[6] ?? 0),
    );
};

const diffHM = (a: number, b: number): { hours: number; minutes: number } => {
    const diff = Math.abs(a - b);
    return {
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
    };
};

const Card: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => {
    const { colors } = useTheme();
    return (
        <View style={[styles.card, { backgroundColor: colors.inputBackground, borderColor: colors.headerBackground }]}>
            {title ? <ThemedText type="defaultSemiBold" style={styles.cardTitle}>{title}</ThemedText> : null}
            {children}
        </View>
    );
};

const Row: React.FC<{ label: string; value: string; danger?: boolean }> = ({ label, value, danger }) => {
    const { colors } = useTheme();
    return (
        <View style={styles.row}>
            <ThemedText style={styles.rowLabel}>{label}</ThemedText>
            <ThemedText style={[styles.rowValue, danger ? { color: colors.deleteIcon } : null]}>{value}</ThemedText>
        </View>
    );
};

interface Props {
    // wołane, gdy rozwinięte szczegóły pojazdu dostały layout – rodzic (ScrollView) przewija do nich,
    // bo to ostatni element panelu i bez przewinięcia zostają pod krawędzią ekranu
    onDetailsShown?: () => void;
}

export const InfoPanel: React.FC<Props> = (props: Props): JSX.Element => {

    const { colors } = useTheme();
    const { fetchData } = useApi();
    const { showSnackbar } = useSnackbar();
    const {
        user, setUser, lang,
        activeTour, setActiveTour,
        activeDay, setActiveDay,
        lastLog, setLastLog,
        activeLoads, setActiveLoads,
    } = useGlobalState();

    const txt = {
        title: getText('info', 'title', lang),
        noActiveTour: getText('info', 'noActiveTour', lang),
        routeNo: getText('info', 'routeNo', lang),
        distance: getText('info', 'distance', lang),
        lasts: getText('info', 'lasts', lang),
        and: getText('info', 'and', lang),
        day: getText('info', 'day', lang),
        days: getText('info', 'days', lang),
        in: getText('info', 'in', lang),
        youStartedDayAt: getText('info', 'youStartedDayAt', lang),
        traveledToday: getText('info', 'traveledToday', lang),
        workingTimeUntil: getText('info', 'workingTimeUntil', lang),
        dayTitle: getText('info', 'dayTitle', lang),
        tourSetTitle: getText('info', 'tourSetTitle', lang),
        truck: getText('info', 'truck', lang),
        trailer: getText('info', 'trailer', lang),
        fuel: getText('info', 'fuel', lang),
        actualMass: getText('info', 'actualMass', lang),
        noDataInfo: getText('info', 'noDataInfo', lang),
        empty: getText('info', 'empty', lang),
        destination: getText('info', 'destination', lang),
        delete: getText('info', 'delete', lang),
        deleteSuccess: getText('info', 'deleteSuccess', lang),
        noActiveDay: getText('info', 'noActiveDay', lang),
        breakLasts: getText('info', 'breakLasts', lang),
        break9HourEnd: getText('info', 'break9HourEnd', lang),
        break11HourEnd: getText('info', 'break11HourEnd', lang),
        breakOver: getText('info', 'breakOver', lang),
        breakIn: getText('info', 'breakIn', lang),
        carriedLoads: getText('info', 'carriedLoads', lang),
        model: getText('info', 'model', lang),
        isLoadable: getText('info', 'isLoadable', lang),
        tankCapacity: getText('info', 'tankCapacity', lang),
        yearOfProduction: getText('info', 'yearOfProduction', lang),
        weightDisp: getText('info', 'weightDisp', lang),
        techRev: getText('info', 'techRev', lang),
        insurance: getText('info', 'insurance', lang),
        tacho: getText('info', 'tacho', lang),
        nextService: getText('info', 'nextService', lang),
        notes: getText('info', 'notes', lang),
        yes: getText('info', 'yes', lang),
        no: getText('info', 'no', lang),
        expired: getText('info', 'expired', lang),
        workTimeGaugeLabel: getText('info', 'workTimeGaugeLabel', lang),
        edit: getText('info', 'edit', lang),
        showVehicleDetails: getText('info', 'showVehicleDetails', lang),
        addVehicleHint: getText('info', 'addVehicleHint', lang),
    };
    const baseCountry = useBaseCountry();

    const [currentTime, setCurrentTime] = useState<Date>(new Date());
    const [stopDate, setStopDate] = useState<Date | null>(null);
    const [truckData, setTruckData] = useState<VehicleInterface | null>(null);
    const [trailerData, setTrailerData] = useState<VehicleInterface | null>(null);
    const [destinationData, setDestinationData] = useState<PlaceInterface | null>(null);
    const [goodsWeight, setGoodsWeight] = useState<number | null>(null);
    const [vehicleLoaded, setVehicleLoaded] = useState<boolean>(false);
    const [showTruck, setShowTruck] = useState<boolean>(false);
    const [showTrailer, setShowTrailer] = useState<boolean>(false);
    const [, setLastDay] = useState<DayInterface | null>(null);
    // jak front: nieznany pojazd -> formularz dodania z wpisanym numerem; znany -> edycja
    const [addVehicle, setAddVehicle] = useState<{ type: vehicleTypeEnum; registration: string } | null>(null);
    const [editVehicle, setEditVehicle] = useState<VehicleInterface | null>(null);
    const [vehicleRefresh, setVehicleRefresh] = useState<boolean>(false);

    // odświeżenie stanu globalnego przy wejściu na kartę
    useFocusEffect(
        useCallback(() => {
            fetchData<UserInterface>(API_ENDPOINTS.GET, { setData: setUser });
            fetchData<TourInterface>(API_ENDPOINTS.GET_ACTIVE_ROUTE, { setData: setActiveTour });
            fetchData<DayInterface>(API_ENDPOINTS.GET_ACTIVE_DAY, { setData: setActiveDay });
            fetchData<LogInterface>(API_ENDPOINTS.GET_LAST_LOG, { setData: setLastLog });
            fetchData<LoadInterface[]>(API_ENDPOINTS.GET_NOT_UNLOADED_LOADS, { setData: setActiveLoads });
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [])
    );

    // wyświetlane wartości mają rozdzielczość minutową – wystarczy tick co 20 s
    useEffect(() => {
        const id = setInterval(() => setCurrentTime(new Date()), 20000);
        return () => clearInterval(id);
    }, []);

    // odpoczynek dobowy – potrzebny tylko gdy nie ma aktywnego dnia
    useEffect(() => {
        if (activeDay) {
            setStopDate(null);
            return;
        }
        fetchData<DayInterface>(API_ENDPOINTS.getYourLastDay, { setData: setLastDay }).then((res) => {
            if (res.responseData && res.responseData.stopData) {
                setStopDate(toLocalDate(res.responseData.stopData.date));
            } else {
                setStopDate(null);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeDay]);

    // dane pojazdu / masa / cel
    useEffect(() => {
        if (!activeTour) {
            setVehicleLoaded(false);
            return;
        }
        const jobs: Promise<unknown>[] = [];

        jobs.push(fetchData<VehicleInterface>(`${API_ENDPOINTS.GET_VEHICLE_BY_REG}/${activeTour.truck}`, { setData: setTruckData }));

        if (activeTour.trailer) {
            jobs.push(fetchData<VehicleInterface>(`${API_ENDPOINTS.GET_VEHICLE_BY_REG}/${activeTour.trailer}`, { setData: setTrailerData }));
        } else {
            setTrailerData(null);
        }

        jobs.push(
            fetchData<number>(API_ENDPOINTS.getNotUnloadedLoadsMass, { setData: setGoodsWeight }).then((res) => {
                if (!res.success) setGoodsWeight(null);
            })
        );

        if (user && user.markedDepart !== 0) {
            jobs.push(fetchData<PlaceInterface>(`${API_ENDPOINTS.getPlace}/${user.markedDepart}`, { setData: setDestinationData }));
        } else {
            setDestinationData(null);
        }

        Promise.all(jobs).then(() => setVehicleLoaded(true));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTour?.truck, activeTour?.trailer, user?.markedDepart, vehicleRefresh]);

    // --- wyliczenia zależne od zegara ---
    let tourDuration = '';
    if (activeTour && activeTour.startLogData) {
        const start = toLocalDate(activeTour.startLogData.date);
        const { hours, minutes } = diffHM(currentTime.getTime(), start.getTime());
        const hh = (h: number) => h.toString().padStart(2, '0');
        const mm = minutes.toString().padStart(2, '0');
        if (hours < 24) {
            tourDuration = `${hh(hours)}:${mm}`;
        } else {
            const d = Math.floor(hours / 24);
            tourDuration = `${hh(hours % 24)}:${mm} ${txt.and} ${d} ${d === 1 ? txt.day : txt.days}`;
        }
    }

    let breakInfo = '';
    if (!activeDay && stopDate) {
        const { hours, minutes } = diffHM(currentTime.getTime(), stopDate.getTime());
        const endTime = (add: number) => {
            const nd = new Date(stopDate);
            nd.setHours(stopDate.getHours() + add);
            return `${nd.getHours()}:${nd.getMinutes().toString().padStart(2, '0')}`;
        };
        const timeLeft = (add: number) => {
            const nd = new Date(stopDate);
            nd.setHours(stopDate.getHours() + add);
            nd.setMinutes(nd.getMinutes() + 1);
            const { hours: lh, minutes: lm } = diffHM(nd.getTime(), currentTime.getTime());
            return `${lh}:${lm.toString().padStart(2, '0')}`;
        };
        let description = '';
        if (hours >= 11) {
            description = txt.breakOver;
        } else {
            description = `${txt.break11HourEnd} ${endTime(11)} (${txt.breakIn} ${timeLeft(11)})`;
        }
        if (hours < 9) {
            description = `${txt.break9HourEnd} ${endTime(9)} (${txt.breakIn} ${timeLeft(9)})`;
        }
        breakInfo = `${txt.breakLasts}: ${hours}:${minutes.toString().padStart(2, '0')}\n${description}`;
    }

    // Jak front (TimeArcGauge w InfoBar): czas pracy dzisiejszego dnia liczony na żywo od jego
    // rozpoczęcia, progi wg obsady (1-osobowa: 13h/15h, 2-osobowa: 20h/21h). Data z bazy to
    // „ściana zegara" bazy, więc porównujemy z homeNow(kraj bazy), a nie z czasem telefonu.
    const workSeconds = activeDay?.startData
        ? Math.max(0, Math.floor((homeNow(baseCountry).getTime() - toLocalDate(activeDay.startData.date).getTime()) / 1000))
        : 0;
    const workWarnSeconds = (activeDay?.doubleCrew ? 20 : 13) * 3600;
    const workMaxSeconds = (activeDay?.doubleCrew ? 21 : 15) * 3600;

    const totalWeight = (truckData?.weight ?? 0) + (trailerData?.weight ?? 0) + (goodsWeight ?? 0);
    const fuelValue = activeTour
        ? Number(activeTour.fuelStateBefore) + Number(activeTour.totalRefuel) - Number(activeTour.burnedFuelComp)
        : 0;

    const clearDestination = (): void => {
        fetchData(API_ENDPOINTS.markDepart, { method: 'PATCH', sendData: { placeId: 0 } }, { showSnackbar }).then((res) => {
            if (res.success) {
                showSnackbar(txt.deleteSuccess, 'success');
                if (user) setUser({ ...user, markedDepart: 0 });
                setDestinationData(null);
            }
        });
    };

    const isPast = (dateString: string | null): boolean =>
        !!dateString && !isNaN(new Date(dateString).getTime()) && new Date(dateString) < new Date();

    return (
        <View style={styles.container}>
            {addVehicle &&
                <VehicleFormModal
                    visible
                    initialType={addVehicle.type}
                    initialRegistration={addVehicle.registration}
                    onClose={() => setAddVehicle(null)}
                    onSaved={() => setVehicleRefresh((p) => !p)}
                />
            }
            {editVehicle &&
                <VehicleFormModal
                    key={editVehicle.id}
                    visible
                    vehicle={editVehicle}
                    onClose={() => setEditVehicle(null)}
                    onSaved={() => setVehicleRefresh((p) => !p)}
                />
            }

            {!activeTour &&
                <Card>
                    <ThemedText>{txt.noActiveTour}</ThemedText>
                </Card>
            }

            {destinationData &&
                <Card title={txt.destination}>
                    <ThemedText>
                        {destinationData.name}, {destinationData.street}, {destinationData.country}-{destinationData.code} {destinationData.city}
                    </ThemedText>
                    <ThemedText style={styles.dim}>GPS: {destinationData.lat}, {destinationData.lon}</ThemedText>
                    <Pressable onPress={clearDestination} style={styles.linkBtn}>
                        <ThemedText type="link" style={{ color: colors.deleteIcon }}>{txt.delete}</ThemedText>
                    </Pressable>
                </Card>
            }

            {activeTour &&
                <Card title={`${txt.routeNo} ${activeTour.tourNr}`}>
                    <Row label={txt.distance} value={formatOdometer(activeTour.distance)} />
                    {!!tourDuration && <Row label={txt.lasts} value={tourDuration} />}
                </Card>
            }

            <Card title={txt.dayTitle}>
                {activeDay
                    ? <>
                        {activeDay.startData &&
                            <TimeArcGauge
                                label={txt.workTimeGaugeLabel}
                                seconds={workSeconds}
                                warnSeconds={workWarnSeconds}
                                maxSeconds={workMaxSeconds}
                            />
                        }
                        {activeDay.startData &&
                            <ThemedText>
                                {txt.youStartedDayAt} {formatDateToTime(activeDay.startData.date)} {txt.in} {formatSimplePlace(activeDay.startData.place, activeDay.startData.placeData)}
                            </ThemedText>
                        }
                        <Row label={txt.traveledToday} value={formatOdometer(activeDay.distance)} />
                        {activeDay.startData &&
                            <Row
                                label={txt.workingTimeUntil}
                                value={activeDay.doubleCrew
                                    ? formatDateToTime(activeDay.startData.date, 21)
                                    : `${formatDateToTime(activeDay.startData.date, 13)} (${formatDateToTime(activeDay.startData.date, 15)})`
                                }
                            />
                        }
                    </>
                    : <>
                        <ThemedText>{txt.noActiveDay}</ThemedText>
                        {!!breakInfo && <ThemedText style={styles.breakText}>{breakInfo}</ThemedText>}
                    </>
                }
            </Card>

            {activeLoads && activeLoads.length > 0 &&
                <Card title={txt.carriedLoads}>
                    {activeLoads.map((load) => (
                        <View key={load.id} style={styles.loadItem}>
                            <ThemedText>
                                {(load.description || '—')} · {(load.quantity || '—')} · {formatWeight(load.weight)}
                            </ThemedText>
                            <ThemedText style={styles.dim}>
                                → {load.receiverData
                                    ? `${load.receiverData.name}, ${load.receiverData.street}, ${load.receiverData.country}-${load.receiverData.code} ${load.receiverData.city}`
                                    : '—'}
                            </ThemedText>
                            {load.receiverData &&
                                <ThemedText style={styles.dim}>GPS: {load.receiverData.lat}, {load.receiverData.lon}</ThemedText>
                            }
                        </View>
                    ))}
                </Card>
            }

            {activeTour && vehicleLoaded &&
                <Card title={txt.tourSetTitle}>
                    <Pressable onPress={() => truckData
                        ? setShowTruck((p) => !p)
                        : setAddVehicle({ type: vehicleTypeEnum.truck, registration: activeTour.truck })}>
                        <ThemedText>
                            {txt.truck}: <ThemedText type="defaultSemiBold" style={{ color: colors.actionIcon }}>{activeTour.truck}</ThemedText>
                            {!truckData && <ThemedText style={styles.dim}>  ({txt.addVehicleHint})</ThemedText>}
                        </ThemedText>
                    </Pressable>
                    {activeTour.trailer &&
                        <Pressable onPress={() => trailerData
                            ? setShowTrailer((p) => !p)
                            : setAddVehicle({ type: vehicleTypeEnum.trailer, registration: activeTour.trailer ?? '' })}>
                            <ThemedText>
                                {txt.trailer}: <ThemedText type="defaultSemiBold" style={{ color: colors.actionIcon }}>{activeTour.trailer}</ThemedText>
                                {!trailerData && <ThemedText style={styles.dim}>  ({txt.addVehicleHint})</ThemedText>}
                            </ThemedText>
                        </Pressable>
                    }

                    {(!truckData || (activeTour.trailer && !trailerData))
                        ? <ThemedText style={styles.dim}>{txt.noDataInfo}</ThemedText>
                        : <Row
                            label={txt.actualMass}
                            value={`${formatWeight(totalWeight)} (${goodsWeight !== null ? formatWeight(goodsWeight) : txt.empty})`}
                        />
                    }

                    {truckData && truckData.fuel !== null && truckData.fuel > 0 &&
                        <View style={styles.fuelWrap}>
                            <ThemedText>{txt.fuel}: {formatFuelQuantity(fuelValue)}</ThemedText>
                            <ProgressBar
                                progress={Math.max(0, Math.min(1, fuelValue / truckData.fuel))}
                                color={colors.actionIcon}
                                style={styles.fuelBar}
                            />
                        </View>
                    }

                    {showTruck && truckData &&
                        <View style={styles.details} onLayout={() => props.onDetailsShown?.()}>
                            <Row label={txt.model} value={truckData.model || '---'} />
                            <Row label={txt.isLoadable} value={truckData.isLoadable ? txt.yes : txt.no} />
                            <Row label={txt.tankCapacity} value={formatFuelQuantity(truckData.fuel)} />
                            <Row label={txt.yearOfProduction} value={truckData.year === 0 ? '---' : String(truckData.year)} />
                            <Row label={txt.weightDisp} value={formatWeight(truckData.weight)} />
                            <Row label={txt.techRev} value={formatShortDate(truckData.techRev)} danger={isPast(truckData.techRev)} />
                            <Row label={txt.insurance} value={formatShortDate(truckData.insurance)} danger={isPast(truckData.insurance)} />
                            <Row label={txt.tacho} value={formatShortDate(truckData.tacho ?? '')} danger={isPast(truckData.tacho)} />
                            <Row
                                label={txt.nextService}
                                value={formatOdometer(truckData.service ?? 0)}
                                danger={!(truckData.service && lastLog && truckData.service > lastLog.odometer)}
                            />
                            {!!truckData.notes && <ThemedText style={styles.notes}>{txt.notes}: {truckData.notes}</ThemedText>}
                            <VehicleActions
                                editLabel={txt.edit}
                                detailsLabel={txt.showVehicleDetails}
                                onEdit={() => setEditVehicle(truckData)}
                                onDetails={() => router.navigate({ pathname: '/vehicles', params: { id: truckData.id } })}
                            />
                        </View>
                    }

                    {showTrailer && trailerData &&
                        <View style={styles.details} onLayout={() => props.onDetailsShown?.()}>
                            <Row label={txt.model} value={trailerData.model || '---'} />
                            <Row label={txt.yearOfProduction} value={trailerData.year === 0 ? '---' : String(trailerData.year)} />
                            <Row label={txt.weightDisp} value={formatWeight(trailerData.weight)} />
                            <Row label={txt.techRev} value={formatShortDate(trailerData.techRev)} danger={isPast(trailerData.techRev)} />
                            <Row label={txt.insurance} value={formatShortDate(trailerData.insurance)} danger={isPast(trailerData.insurance)} />
                            {!!trailerData.notes && <ThemedText style={styles.notes}>{txt.notes}: {trailerData.notes}</ThemedText>}
                            <VehicleActions
                                editLabel={txt.edit}
                                detailsLabel={txt.showVehicleDetails}
                                onEdit={() => setEditVehicle(trailerData)}
                                onDetails={() => router.navigate({ pathname: '/vehicles', params: { id: trailerData.id } })}
                            />
                        </View>
                    }
                </Card>
            }
        </View>
    );
};

const VehicleActions: React.FC<{ editLabel: string; detailsLabel: string; onEdit: () => void; onDetails: () => void }> = (props) => {
    const { colors } = useTheme();
    return (
        <View style={styles.vehicleActions}>
            <Pressable onPress={props.onEdit} style={styles.vehicleActionRow}>
                <Icon source="pencil" size={20} color={colors.actionIcon} />
                <ThemedText>{props.editLabel}</ThemedText>
            </Pressable>
            <Pressable onPress={props.onDetails} style={styles.vehicleActionRow}>
                <Icon source="truck-outline" size={20} color={colors.actionIcon} />
                <ThemedText>{props.detailsLabel}</ThemedText>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    vehicleActions: { marginTop: 6 },
    vehicleActionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
    container: {
        padding: 12,
        gap: 12,
    },
    card: {
        borderRadius: 10,
        borderWidth: 1,
        padding: 12,
        gap: 4,
    },
    cardTitle: {
        marginBottom: 4,
        fontSize: 17,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
    },
    rowLabel: {
        opacity: 0.8,
        flexShrink: 1,
    },
    rowValue: {
        fontWeight: '600',
        textAlign: 'right',
        flexShrink: 1,
    },
    dim: {
        opacity: 0.7,
    },
    linkBtn: {
        marginTop: 4,
        alignSelf: 'flex-start',
    },
    breakText: {
        marginTop: 4,
    },
    loadItem: {
        marginTop: 4,
    },
    fuelWrap: {
        marginTop: 8,
        gap: 4,
    },
    fuelBar: {
        height: 8,
        borderRadius: 4,
    },
    details: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128,128,128,0.4)',
        gap: 4,
    },
    notes: {
        marginTop: 6,
        opacity: 0.9,
    },
});
