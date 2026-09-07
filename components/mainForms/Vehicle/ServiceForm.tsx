import React from "react";
import { ScrollView } from "react-native";
import { MainFormModal } from "../MainFormModal";
import { STYLES } from "@/constants/STYLES";
import { getText } from "@/utils/getText";
import {
    AddServiceData,
    GeneralFormData,
    ServiceEnum,
    serviceTypeEnum,
    vehicleTypeEnum,
} from "@/types";
import API_ENDPOINTS from "@/constants/API_ENDPOINTS";
import { useApi } from "@/hooks/useApi";
import { useSnackbar } from "@/hooks/useSnackbar";
import { useGlobalState } from "@/hooks/useGlobalState";
import { DateTimeInput } from "@/components/inputs/commons/DateTimeInput";
import { OdometerInput } from "@/components/inputs/commons/OdometerInput";
import { PlaceInput } from "@/components/inputs/commons/PlaceInput";
import { NotesInput } from "@/components/inputs/commons/NotesInput";
import { SendButton } from "@/components/buttons/SendButton";
import { ServiceTypeSelect } from "@/components/inputs/vehicles/ServiceTypeSelect";
import { VehicleTypeSelect } from "@/components/inputs/vehicles/VehicleTypeSelect";
import { VehicleRegistrationSelect } from "@/components/inputs/vehicles/VehicleRegistrationSelect";
import { ServiceEntryInput } from "@/components/inputs/vehicles/ServiceEntryInput";

interface Props {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    form: GeneralFormData;
    setForm: (key: keyof GeneralFormData, value: string) => void;
    setlastLogRefresh: React.Dispatch<React.SetStateAction<boolean>>;
    serviceType: ServiceEnum;
}

export const ServiceForm: React.FC<Props> = (props: Props): JSX.Element => {

    const { form, setForm, serviceType } = props;
    const { lang } = useGlobalState();
    const { fetchData, loading } = useApi();
    const { showSnackbar } = useSnackbar();

    const isLube = serviceType === ServiceEnum.fifthWheelLube;

    const txt = {
        title: isLube ? getText('home', 'addLubrication', lang) : getText('home', 'addService', lang),
        action: getText('home', 'addServiceAction', lang),
        success: getText('home', 'addServiceSuccess', lang),
        lubrication: getText('home', 'addLubrication', lang),
        chooseVehicle: getText('home', 'chooseServicedVehicle', lang),
        noEntry: getText('home', 'noServiceEntry', lang),
    };

    const isTruck = isLube || form.serviceVehicleType === vehicleTypeEnum.truck.toString();
    const vehicleType = isLube
        ? vehicleTypeEnum.truck
        : (form.serviceVehicleType === vehicleTypeEnum.trailer.toString()
            ? vehicleTypeEnum.trailer
            : vehicleTypeEnum.truck);

    const entryValue = isLube ? txt.lubrication : form.serviceEntry;

    const send = (): void => {
        if (Number(form.serviceVehicleId) < 1) {
            showSnackbar(txt.chooseVehicle, 'warning');
            return;
        }
        if (!isLube && form.serviceEntry.trim().length < 1) {
            showSnackbar(txt.noEntry, 'warning');
            return;
        }
        const sendData: AddServiceData = {
            date: form.date,
            country: form.country,
            place: form.place,
            placeId: form.placeId,
            odometer: isTruck ? form.odometer : '0',
            notes: form.notes,
            action: txt.action,
            serviceVehicleId: form.serviceVehicleId,
            serviceType: isLube ? serviceTypeEnum.maintenance.toString() : form.serviceType,
            serviceEntry: entryValue,
        };
        fetchData(API_ENDPOINTS.createService, { method: 'POST', sendData }, { showSnackbar })
            .then((res) => {
                if (res.success) {
                    showSnackbar(txt.success, 'success');
                    props.setlastLogRefresh((prev) => !prev);
                    setForm('notes', '');
                    setForm('serviceEntry', '');
                    props.setVisible(false);
                }
            });
    };

    return (
        <MainFormModal
            visible={props.visible}
            setVisible={props.setVisible}
            title={txt.title}
        >
            <ScrollView style={STYLES.scrollView}>
                <DateTimeInput value={form.date} onChange={(e) => setForm('date', e)} />
                {serviceType === ServiceEnum.standard &&
                    <>
                        <ServiceTypeSelect value={form.serviceType} onChange={(e) => setForm('serviceType', e)} />
                        <VehicleTypeSelect value={form.serviceVehicleType} onChange={(e) => setForm('serviceVehicleType', e)} />
                    </>
                }
                <VehicleRegistrationSelect
                    value={form.serviceVehicleId}
                    onChange={(e) => setForm('serviceVehicleId', e)}
                    vehicleType={vehicleType}
                />
                {isTruck &&
                    <OdometerInput value={form.odometer} onChange={(e) => setForm('odometer', e)} />
                }
                <PlaceInput
                    place={form.place}
                    placeId={form.placeId}
                    onChange={(e) => setForm('place', e)}
                    onChangeId={(e) => setForm('placeId', e)}
                    country={form.country}
                    onChangeCountry={(e) => setForm('country', e)}
                />
                <ServiceEntryInput
                    value={entryValue}
                    onChange={(e) => setForm('serviceEntry', e)}
                    disabled={isLube}
                />
                <NotesInput value={form.notes} onChange={(e) => setForm('notes', e)} />
                <SendButton onPress={send} text={txt.title} loading={loading} />
            </ScrollView>
        </MainFormModal>
    );
};
