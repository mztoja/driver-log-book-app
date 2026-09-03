import { View, StyleSheet, Button, ScrollView, ImageBackground } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { MainFormButton } from "@/components/buttons/MainFormButton";
import { getText } from "@/utils/getText";
import { useGlobalState } from "@/hooks/useGlobalState";
import { useApi } from "@/hooks/useApi";
import API_ENDPOINTS from "@/constants/API_ENDPOINTS";
import { DayInterface, ExpenseEnum, GeneralFormData, LoadInterface, LogInterface, TourInterface, UserInterface, userStatusEnum } from "@/types";
import { useFocusEffect } from "expo-router";
import { STYLES } from "@/constants/STYLES";
import { ThemedText } from "@/components/ThemedText";
import { NewDayForm, BorderCrossForm, AddLogForm, FinishDayForm } from "@/components/mainForms";
import { useSnackbar } from "@/hooks/useSnackbar";
import { ExpenseAdd } from "@/components/mainForms/Finances/ExpenseAdd";
import { LoadingArrival } from "@/components/mainForms/Loadings/LoadingArrival";
import { LoadingCompleted } from "@/components/mainForms/Loadings/LoadingCompleted";
import { UnloadingArrival } from "@/components/mainForms/Loadings/UnloadingArrival";
import { UnloadingCompleted } from "@/components/mainForms/Loadings/UnloadingCompleted";
import { AttachTrailerForm } from "@/components/mainForms/Vehicle/AttachTrailerForm";
import { DetachTrailerForm } from "@/components/mainForms/Vehicle/DetachTrailerForm";

export default function Home() {

  const { theme, colors } = useTheme();
  const { setUser, user, lang, lastLog, setLastLog, activeDay, setActiveDay, setActiveTour, activeLoads, setActiveLoads } = useGlobalState();
  const { fetchData } = useApi();
  const { showSnackbar } = useSnackbar();
  const [lastLogRefresh, setLastLogRefresh] = useState<boolean>(false);
  const [activeDayRefresh, setActiveDayRefresh] = useState<boolean>(false);
  const [activeTourRefresh, setActiveTourRefresh] = useState<boolean>(false);
  const [activeLoadsRefresh, setActiveLoadsRefresh] = useState<boolean>(false);
  const [newDayVisible, setNewDayVisible] = useState<boolean>(false);
  const [finishDayVisible, setFinishDayVisible] = useState<boolean>(false);
  const [borderCrossVisible, setBorderCrossVisible] = useState<boolean>(false);
  const [addLogVisible, setAddLogVisible] = useState<boolean>(false);
  const [expenceAddVisible, setExpenceAddVisible] = useState<boolean>(false);
  const [expenceType, setExpenceType] = useState<ExpenseEnum>(ExpenseEnum.standard);
  const [loadingArrivalVisible, setLoadingArrivalVisible] = useState<boolean>(false);
  const [loadingCompletedVisible, setLoadingCompletedVisible] = useState<boolean>(false);
  const [unloadingArrivalVisible, setUnloadingArrivalVisible] = useState<boolean>(false);
  const [unloadingCompletedVisible, setUnoadingCompletedVisible] = useState<boolean>(false);
  const [attachTrailerVisible, setAttachTrailerVisible] = useState<boolean>(false);
  const [detachTrailerVisible, setDetachTrailerVisible] = useState<boolean>(false);

  const txt = {
    dayExist: getText('home', 'dayExist', lang),
    dayNotExist: getText('home', 'dayNotExist', lang),
    dayStart: getText('home', 'dayStart', lang),
    dayStop: getText('home', 'dayStop', lang),
    crossBorder: getText('home', 'crossBorder', lang),
    addLog: getText('home', 'addLog', lang),
    addExpense: getText('home', 'addExpense', lang),
    dieselRefuel: getText('home', 'dieselRefuel', lang),
    adblueRefuel: getText('home', 'adblueRefuel', lang),
    loadingArrival: getText('home', 'loadingArrival', lang),
    loadingCompleted: getText('home', 'loadingCompleted', lang),
    unloadingArrival: getText('home', 'unloadingArrival', lang),
    unloadingCompleted: getText('home', 'unloadingCompleted', lang),
    attachTrailer: getText('home', 'attachTrailer', lang),
    detachTrailer: getText('home', 'detachTrailer', lang),
  }

  const imageOpacity = theme === 'dark' ? 0.5 : 1;

  useFocusEffect(
    useCallback(() => {
      fetchData<UserInterface>(API_ENDPOINTS.GET, { setData: setUser }).then();
    }, [])
  );

  if (user?.status === userStatusEnum.blocked) {
    return (
      <View style={[STYLES.mainView, { backgroundColor: colors.background }]}>
        <ThemedText>{getText('home', 'blockedDescription', lang)}</ThemedText>
      </View>
    );
  }

  const [generalFormData, setGeneralFormData] = useState<GeneralFormData>({
    date: '',
    truck: '',
    trailer: '',
    vehicle: '',
    odometer: '',
    action: '',
    fuelQuantity: '',
    fuelCombustion: '',
    place: '',
    placeId: '',
    country: '',
    senderId: '',
    receiverId: '',
    notes: '',
    doubleCrew: 'false',
    cardInserted: 'false',
    cardTakeOut: 'false',
    driveTime: '',
    driveTime2: '',
    addNewBorder: 'false',
    description: '',
    quantity: '',
    weight: '',
    reference: '',
    loadId: '',
    payment: '',
    expenseItemDescription: '',
    expenseQuantity: '1',
    expenseUnitPrice: '',
    expenseAmount: '',
    expenseCurrency: '',
    expenseForeignAmount: '',
    expenseForeignCurrency: '',
    serviceEntry: '',
    serviceType: '',
    serviceVehicleId: '',
    serviceVehicleType: '',
  });
  const updateGeneralFormData = useCallback((key: keyof GeneralFormData, value: string): void => {
    setGeneralFormData((values: GeneralFormData) => ({
      ...values,
      [key]: value,
    }));
  }, []);

  useEffect(() => {
    fetchData<LogInterface>(API_ENDPOINTS.GET_LAST_LOG, { setData: setLastLog });
    fetchData<UserInterface>(API_ENDPOINTS.GET, { setData: setUser });
  }, [lastLogRefresh]);

  useEffect(() => {
    updateGeneralFormData('odometer', lastLog ? lastLog.odometer.toString() : '');
    updateGeneralFormData('place', lastLog?.place ? lastLog.place : '');
    updateGeneralFormData('placeId', lastLog ? lastLog.placeId.toString() : '');
    updateGeneralFormData('country', lastLog ? lastLog.country : '');
    updateGeneralFormData('action', '');
    updateGeneralFormData('notes', '');
  }, [lastLog]);

  useEffect(() => {
    fetchData<DayInterface>(API_ENDPOINTS.GET_ACTIVE_DAY, { setData: setActiveDay });
  }, [activeDayRefresh]);

  useEffect(() => {
    fetchData<TourInterface>(API_ENDPOINTS.GET_ACTIVE_ROUTE, { setData: setActiveTour });
  }, [activeTourRefresh]);

  useEffect(() => {
    fetchData<LoadInterface[]>(API_ENDPOINTS.GET_NOT_UNLOADED_LOADS, { setData: setActiveLoads });
  }, [activeLoadsRefresh]);

  return (
    <ScrollView style={[STYLES.scrollView, { backgroundColor: colors.background }]}>

      <NewDayForm
        visible={newDayVisible}
        setVisible={setNewDayVisible}
        form={generalFormData}
        setForm={updateGeneralFormData}
        setlastLogRefresh={setLastLogRefresh}
        setActiveDayRefresh={setActiveDayRefresh}
      />
      <FinishDayForm
        visible={finishDayVisible}
        setVisible={setFinishDayVisible}
        form={generalFormData}
        setForm={updateGeneralFormData}
        setlastLogRefresh={setLastLogRefresh}
        setActiveDayRefresh={setActiveDayRefresh}
      />
      <BorderCrossForm
        visible={borderCrossVisible}
        setVisible={setBorderCrossVisible}
        form={generalFormData}
        setForm={updateGeneralFormData}
        setlastLogRefresh={setLastLogRefresh}
      />
      <AddLogForm
        visible={addLogVisible}
        setVisible={setAddLogVisible}
        form={generalFormData}
        setForm={updateGeneralFormData}
        setlastLogRefresh={setLastLogRefresh}
      />
      <ExpenseAdd
        visible={expenceAddVisible}
        setVisible={setExpenceAddVisible}
        form={generalFormData}
        setForm={updateGeneralFormData}
        setlastLogRefresh={setLastLogRefresh}
        expenseType={expenceType}
      />

      <LoadingArrival
        visible={loadingArrivalVisible}
        setVisible={setLoadingArrivalVisible}
        form={generalFormData}
        setForm={updateGeneralFormData}
        setlastLogRefresh={setLastLogRefresh}
      />

      <LoadingCompleted
        visible={loadingCompletedVisible}
        setVisible={setLoadingCompletedVisible}
        form={generalFormData}
        setForm={updateGeneralFormData}
        setlastLogRefresh={setLastLogRefresh}
        setActiveLoadsRefresh={setActiveLoadsRefresh}
      />

      <UnloadingArrival
        visible={unloadingArrivalVisible}
        setVisible={setUnloadingArrivalVisible}
        form={generalFormData}
        setForm={updateGeneralFormData}
        setlastLogRefresh={setLastLogRefresh}
      />

      <UnloadingCompleted
        visible={unloadingCompletedVisible}
        setVisible={setUnoadingCompletedVisible}
        form={generalFormData}
        setForm={updateGeneralFormData}
        setlastLogRefresh={setLastLogRefresh}
        setActiveLoadsRefresh={setActiveLoadsRefresh}
      />

      <AttachTrailerForm
        visible={attachTrailerVisible}
        setVisible={setAttachTrailerVisible}
        form={generalFormData}
        setForm={updateGeneralFormData}
        setlastLogRefresh={setLastLogRefresh}
        setActiveTourRefresh={setActiveTourRefresh}
      />

      <DetachTrailerForm
        visible={detachTrailerVisible}
        setVisible={setDetachTrailerVisible}
        form={generalFormData}
        setForm={updateGeneralFormData}
        setlastLogRefresh={setLastLogRefresh}
        setActiveTourRefresh={setActiveTourRefresh}
        setActiveLoadsRefresh={setActiveLoadsRefresh}
      />

      <ImageBackground
        source={require('@/assets/images/activitiesBackground.png')}
        style={[styles.imageBackground, { opacity: imageOpacity }]}
        imageStyle={styles.imageStyle}
        resizeMode="cover"
      >
        <View style={styles.buttonsGroup}>
          <View style={styles.buttonView}>
            <MainFormButton onPress={() => activeDay ? showSnackbar(txt.dayExist, 'info') : setNewDayVisible(true)} text={txt.dayStart} />
          </View>
          <View style={styles.buttonView}>
            <MainFormButton onPress={() => activeDay ? setFinishDayVisible(true) : showSnackbar(txt.dayNotExist, 'info')} text={txt.dayStop} />
          </View>
          <View style={styles.buttonView}>
            <MainFormButton onPress={() => setBorderCrossVisible(true)} text={txt.crossBorder} />
          </View>
          <View style={styles.buttonView}>
            <MainFormButton onPress={() => setAddLogVisible(true)} text={txt.addLog} />
          </View>
        </View>
      </ImageBackground>

      <ImageBackground
        source={require('@/assets/images/financesBackground.png')}
        style={[styles.imageBackground, { opacity: imageOpacity }]}
        imageStyle={styles.imageStyle}
        resizeMode="cover"
      >
        <View style={styles.buttonView}>
          <MainFormButton onPress={() => {
            setExpenceAddVisible(true);
            setExpenceType(ExpenseEnum.standard);
          }} text={txt.addExpense} />
        </View>
        <View style={styles.buttonView}>
          <MainFormButton onPress={() => {
            setExpenceAddVisible(true);
            setExpenceType(ExpenseEnum.fuel);
          }} text={txt.dieselRefuel} />
        </View>
        <View style={styles.buttonView}>
          <MainFormButton onPress={() => {
            setExpenceAddVisible(true);
            setExpenceType(ExpenseEnum.def);
          }} text={txt.adblueRefuel} />
        </View>
      </ImageBackground>

      <ImageBackground
        source={require('@/assets/images/loadingsBackground.png')}
        style={[styles.imageBackground, { opacity: imageOpacity }]}
        imageStyle={styles.imageStyle}
        resizeMode="cover"
      >
        <View style={styles.buttonView}>
          <MainFormButton onPress={() => setLoadingArrivalVisible(true)} text={txt.loadingArrival} />
        </View>
        <View style={styles.buttonView}>
          <MainFormButton onPress={() => setLoadingCompletedVisible(true)} text={txt.loadingCompleted} />
        </View>
        <View style={styles.buttonView}>
          <MainFormButton onPress={() => setUnloadingArrivalVisible(true)} text={txt.unloadingArrival} />
        </View>
        <View style={styles.buttonView}>
          <MainFormButton onPress={() => setUnoadingCompletedVisible(true)} text={txt.unloadingCompleted} />
        </View>
      </ImageBackground>

      <ImageBackground
        source={require('@/assets/images/vehiclesBackground.png')}
        style={[styles.imageBackground, { opacity: imageOpacity }]}
        imageStyle={styles.imageStyle}
        resizeMode="cover"
      >
        <View style={styles.buttonView}>
          <MainFormButton onPress={() => setAttachTrailerVisible(true)} text={txt.attachTrailer} />
        </View>
        <View style={styles.buttonView}>
          <MainFormButton onPress={() => setDetachTrailerVisible(true)} text={txt.detachTrailer} />
        </View>
        <View style={styles.buttonView}>
          <Button onPress={() => setNewDayVisible(true)} title='Smarowanie siodła' />
        </View>
        <View style={styles.buttonView}>
          <Button onPress={() => setNewDayVisible(true)} title='Serwis / obsługa pojazdu' />
        </View>
      </ImageBackground>
      <View style={[styles.buttonView, { marginVertical: 30, opacity: imageOpacity }]}>
        <Button onPress={() => setActiveTourRefresh((prev) => !prev)} title='Koniec trasy' />
      </View>

    </ScrollView >
  );
}

const styles = StyleSheet.create({
  imageBackground: {
    justifyContent: 'center',
    height: 230,
    width: '99%',
    padding: 5,
    marginVertical: 5,
    alignSelf: 'center',
  },
  imageStyle: {
    borderRadius: 10,
    opacity: 0.6,
  },
  buttonView: {
    margin: 5,
    marginHorizontal: 60,
    opacity: 0.9,
  },
  buttonsGroup: {
    marginVertical: 20,
  },
});