import React, { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView } from "react-native";
import { MainFormModal } from "../MainFormModal";
import { STYLES } from "@/constants/STYLES";
import { getText } from "@/utils/getText";
import {
    AddLoadingData,
    AddLogData,
    GeneralFormData,
    LoadInterface,
    loadStatusEnum,
    logTypeEnum,
    StartTourData,
    TourInterface,
} from "@/types";
import API_ENDPOINTS from "@/constants/API_ENDPOINTS";
import { useApi } from "@/hooks/useApi";
import { useSnackbar } from "@/hooks/useSnackbar";
import { useGlobalState } from "@/hooks/useGlobalState";
import { DateTimeInput } from "@/components/inputs/commons/DateTimeInput";
import { OdometerInput } from "@/components/inputs/commons/OdometerInput";
import { PlaceInput } from "@/components/inputs/commons/PlaceInput";
import { NotesInput } from "@/components/inputs/commons/NotesInput";
import { FuelInput } from "@/components/inputs/commons/FuelInput";
import { RegNumberInput } from "@/components/inputs/vehicles/RegNumberInput";
import { SendButton } from "@/components/buttons/SendButton";
import ConfirmModal from "@/components/ConfirmModal";

interface Props {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    form: GeneralFormData;
    setForm: (key: keyof GeneralFormData, value: string) => void;
    setlastLogRefresh: React.Dispatch<React.SetStateAction<boolean>>;
    setActiveTourRefresh: React.Dispatch<React.SetStateAction<boolean>>;
    setActiveLoadsRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

type QueueStep = 'trailer' | number;

export const TourStartForm: React.FC<Props> = (props: Props): JSX.Element => {

    const { form, setForm } = props;
    const { lang, setActiveTour } = useGlobalState();
    const { fetchData, loading } = useApi();
    const { showSnackbar } = useSnackbar();

    const [prevRoute, setPrevRoute] = useState<TourInterface | null>(null);
    const [carriedLoads, setCarriedLoads] = useState<LoadInterface[] | null>(null);
    const [answered, setAnswered] = useState<boolean>(false);
    const [queue, setQueue] = useState<QueueStep[]>([]);
    const [stepIdx, setStepIdx] = useState<number>(-1);
    const keepTrailerRef = useRef<boolean>(false);
    const keepLoadIdsRef = useRef<number[]>([]);

    const txt = {
        title: getText('home', 'tourStart', lang),
        truckNoValid: getText('home', 'truckNoValid', lang),
        startedTourAction: getText('home', 'startedTourAction', lang),
        startedTour: getText('home', 'startedTour', lang),
        attachTrailerAction: getText('home', 'attachTrailerAction', lang),
        trailerAttachedBySystemNote: getText('home', 'trailerAttachedBySystemNote', lang),
        loadingCompletedAction: getText('home', 'loadingCompletedAction', lang),
        loadAddedBySystemNote: getText('home', 'loadAddedBySystemNote', lang),
        unloadNote: getText('home', 'finishTourUnloadNote', lang),
    };

    useEffect(() => {
        (async () => {
            const res = await fetchData<TourInterface>(API_ENDPOINTS.getPreviousRoute, { setData: setPrevRoute });
            const prev = res.responseData;
            if (!prev) return;

            if (form.truck.length < 1 && form.fuelQuantity.length < 1) {
                setForm('fuelQuantity', prev.fuelStateAfter.toString());
                setForm('truck', prev.truck.toString());
            }

            const loadsRes = await fetchData<LoadInterface[]>(`${API_ENDPOINTS.getLoadingsByTourId}/${prev.id}`, { setData: setCarriedLoads });
            const carried = (loadsRes.responseData ?? []).filter((l) =>
                l.status === loadStatusEnum.unloaded &&
                l.unloadingLogData?.type === logTypeEnum.finishUnloading &&
                l.unloadingLogData?.notes === txt.unloadNote,
            );
            setCarriedLoads(carried);
        })();
        // eslint-disable-next-line
    }, []);

    const buildQueue = (): QueueStep[] => {
        const q: QueueStep[] = [];
        if (prevRoute?.trailer) q.push('trailer');
        (carriedLoads ?? []).forEach((l) => q.push(l.id));
        return q;
    };

    const createNewRoute = async (): Promise<boolean> => {
        const sendData: StartTourData = {
            action: txt.startedTourAction,
            country: form.country,
            place: form.place,
            truck: form.truck,
            placeId: form.placeId,
            odometer: form.odometer,
            notes: form.notes,
            date: form.date,
            fuelStateBefore: form.fuelQuantity,
        };
        const res = await fetchData<TourInterface>(API_ENDPOINTS.createNewRoute, { method: 'POST', sendData }, { showSnackbar });
        if (res.success && res.responseData) {
            setActiveTour(res.responseData);
        }
        return res.success;
    };

    const attachCarriedTrailer = async (): Promise<void> => {
        if (!keepTrailerRef.current || !prevRoute?.trailer) return;
        const sendData: AddLogData = {
            date: form.date,
            country: form.country,
            place: form.place,
            placeId: form.placeId,
            odometer: form.odometer,
            notes: txt.trailerAttachedBySystemNote,
            action: `${txt.attachTrailerAction}: ${prevRoute.trailer}`,
        };
        await fetchData(API_ENDPOINTS.ATTACH_TRAILER, { method: 'POST', sendData }, { showSnackbar });
    };

    const addCarriedLoads = async (): Promise<void> => {
        for (const id of keepLoadIdsRef.current) {
            const orig = (carriedLoads ?? []).find((l) => l.id === id);
            if (!orig) continue;
            const sendData: AddLoadingData = {
                date: form.date,
                country: form.country,
                place: form.place,
                placeId: form.placeId,
                odometer: form.odometer,
                notes: txt.loadAddedBySystemNote,
                action: txt.loadingCompletedAction,
                vehicle: orig.vehicle,
                senderId: orig.senderId.toString(),
                receiverId: orig.receiverId.toString(),
                weight: orig.weight.toString(),
                quantity: orig.quantity,
                reference: orig.reference,
                description: orig.description,
            };
            await fetchData(API_ENDPOINTS.CREATE_LOAD, { method: 'POST', sendData }, { showSnackbar });
        }
    };

    const doCreateTour = useCallback(async (): Promise<void> => {
        const ok = await createNewRoute();
        if (!ok) return;
        showSnackbar(txt.startedTour, 'success');

        try {
            await attachCarriedTrailer();
            await addCarriedLoads();
        } catch {
            // brak przerwania – trasa już powstała
        }

        props.setlastLogRefresh((prev) => !prev);
        props.setActiveTourRefresh((prev) => !prev);
        props.setActiveLoadsRefresh((prev) => !prev);
        setForm('notes', '');
        props.setVisible(false);
        // eslint-disable-next-line
    }, [prevRoute, carriedLoads, form]);

    const send = (): void => {
        if (form.truck.replace(/\s/g, '').length <= 3) {
            showSnackbar(txt.truckNoValid, 'warning');
            return;
        }
        if (!answered) {
            const q = buildQueue();
            if (q.length > 0) {
                keepTrailerRef.current = false;
                keepLoadIdsRef.current = [];
                setQueue(q);
                setStepIdx(0);
                return;
            }
        }
        void doCreateTour();
    };

    const handleAnswer = (yes: boolean): void => {
        const step = queue[stepIdx];
        if (yes) {
            if (step === 'trailer') {
                keepTrailerRef.current = true;
            } else {
                keepLoadIdsRef.current = [...keepLoadIdsRef.current, step];
            }
        }
        const next = stepIdx + 1;
        if (next >= queue.length) {
            setStepIdx(-1);
            setAnswered(true);
            void doCreateTour();
        } else {
            setStepIdx(next);
        }
    };

    const currentStep: QueueStep | null = stepIdx >= 0 && stepIdx < queue.length ? queue[stepIdx] : null;
    const currentLoad = typeof currentStep === 'number' ? (carriedLoads ?? []).find((l) => l.id === currentStep) ?? null : null;
    const questionText = currentStep === 'trailer'
        ? getText('home', 'tourStartKeepTrailerConfirm', lang, prevRoute?.trailer ?? '')
        : currentLoad
            ? getText('home', 'tourStartKeepLoadConfirm', lang, `„${currentLoad.description || '—'}" (${currentLoad.weight} kg)`)
            : '';

    return (
        <MainFormModal
            visible={props.visible}
            setVisible={props.setVisible}
            title={txt.title}
        >
            <ScrollView style={STYLES.scrollView}>
                <DateTimeInput value={form.date} onChange={(e) => setForm('date', e)} />
                <RegNumberInput value={form.truck} vehicle="truck" onChange={(e) => setForm('truck', e)} />
                <FuelInput value={form.fuelQuantity} onChange={(e) => setForm('fuelQuantity', e)} type="quantity" />
                <OdometerInput value={form.odometer} onChange={(e) => setForm('odometer', e)} />
                <PlaceInput
                    place={form.place}
                    placeId={form.placeId}
                    onChange={(e) => setForm('place', e)}
                    onChangeId={(e) => setForm('placeId', e)}
                    country={form.country}
                    onChangeCountry={(e) => setForm('country', e)}
                />
                <NotesInput value={form.notes} onChange={(e) => setForm('notes', e)} />
                <SendButton onPress={send} text={txt.title} loading={loading} />
            </ScrollView>
            <ConfirmModal
                visible={currentStep !== null}
                text={questionText}
                onConfirm={() => handleAnswer(true)}
                onCancel={() => handleAnswer(false)}
            />
        </MainFormModal>
    );
};
