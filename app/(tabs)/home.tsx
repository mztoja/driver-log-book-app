import { View, StyleSheet, ScrollView, ImageBackground } from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { MainFormButton } from "@/components/buttons/MainFormButton";
import { getText } from "@/utils/getText";
import { useGlobalState } from "@/hooks/useGlobalState";
import { useApi } from "@/hooks/useApi";
import API_ENDPOINTS from "@/constants/API_ENDPOINTS";
import { DayInterface, ExpenseEnum, GeneralFormData, LoadInterface, LogInterface, ServiceEnum, TourInterface, UserInterface, userStatusEnum } from "@/types";
import { useFocusEffect } from "expo-router";
import { STYLES } from "@/constants/STYLES";
import { ThemedText } from "@/components/ThemedText";
import { NewDayForm, BorderCrossForm, AddLogForm, AddBreakForm, FinishDayForm, TourStartForm, TourStopForm, ServiceForm } from "@/components/mainForms";
import { useSnackbar } from "@/hooks/useSnackbar";
import { ExpenseAdd } from "@/components/mainForms/Finances/ExpenseAdd";
import { LoadingArrival } from "@/components/mainForms/Loadings/LoadingArrival";
import { LoadingCompleted } from "@/components/mainForms/Loadings/LoadingCompleted";
import { UnloadingArrival } from "@/components/mainForms/Loadings/UnloadingArrival";
import { UnloadingCompleted } from "@/components/mainForms/Loadings/UnloadingCompleted";
import { AttachTrailerForm } from "@/components/mainForms/Vehicle/AttachTrailerForm";
import { DetachTrailerForm } from "@/components/mainForms/Vehicle/DetachTrailerForm";
import { BrowseRecordsSection } from "@/components/records/BrowseRecordsSection";
import { UserNotes } from "@/components/UserNotes";
import { useKeyboardHeight } from "@/hooks/useKeyboardHeight";
import { homeButtonOpacity, homeImageOpacity } from "@/utils/homeButtonOpacity";

export default function Home() {

  const { theme, colors } = useTheme();
  const { setUser, user, lang, lastLog, setLastLog, activeDay, setActiveDay, activeTour, setActiveTour, setActiveLoads } = useGlobalState();
  const { fetchData } = useApi();
  const { showSnackbar } = useSnackbar();
  const [lastLogRefresh, setLastLogRefresh] = useState<boolean>(false);
  const [activeDayRefresh, setActiveDayRefresh] = useState<boolean>(false);
  const [activeTourRefresh, setActiveTourRefresh] = useState<boolean>(false);
  const [activeLoadsRefresh, setActiveLoadsRefresh] = useState<boolean>(false);
  const [tourChecked, setTourChecked] = useState<boolean>(false);
  const [newDayVisible, setNewDayVisible] = useState<boolean>(false);
  const [finishDayVisible, setFinishDayVisible] = useState<boolean>(false);
  const [tourStartVisible, setTourStartVisible] = useState<boolean>(false);
  const [tourStopVisible, setTourStopVisible] = useState<boolean>(false);
  const [borderCrossVisible, setBorderCrossVisible] = useState<boolean>(false);
  const [addLogVisible, setAddLogVisible] = useState<boolean>(false);
  const [addBreakVisible, setAddBreakVisible] = useState<boolean>(false);
  const [expenceAddVisible, setExpenceAddVisible] = useState<boolean>(false);
  const [expenceType, setExpenceType] = useState<ExpenseEnum>(ExpenseEnum.standard);
  const [loadingArrivalVisible, setLoadingArrivalVisible] = useState<boolean>(false);
  const [loadingCompletedVisible, setLoadingCompletedVisible] = useState<boolean>(false);
  const [unloadingArrivalVisible, setUnloadingArrivalVisible] = useState<boolean>(false);
  const [unloadingCompletedVisible, setUnoadingCompletedVisible] = useState<boolean>(false);
  const [attachTrailerVisible, setAttachTrailerVisible] = useState<boolean>(false);
  const [detachTrailerVisible, setDetachTrailerVisible] = useState<boolean>(false);
  const [serviceVisible, setServiceVisible] = useState<boolean>(false);
  const [serviceType, setServiceType] = useState<ServiceEnum>(ServiceEnum.standard);

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
    breakTaken: '',
    breakDriveTime: '',
    breakOnlyBreak: 'false',
    breakChangeToSlot1: 'false',
    breakMyCardInSlot1: 'false',
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
    serviceVehicleReg: '',
    serviceVehicleType: '',
  });
  const updateGeneralFormData = useCallback((key: keyof GeneralFormData, value: string): void => {
    setGeneralFormData((values: GeneralFormData) => ({
      ...values,
      [key]: value,
    }));
  }, []);

  const txt = {
    dayExist: getText('home', 'dayExist', lang),
    dayNotExist: getText('home', 'dayNotExist', lang),
    dayStart: getText('home', 'dayStart', lang),
    dayStop: getText('home', 'dayStop', lang),
    tourStart: getText('home', 'tourStart', lang),
    tourStop: getText('home', 'tourStop', lang),
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
    addService: getText('home', 'addService', lang),
    addLubrication: getText('home', 'addLubrication', lang),
    addBreak: getText('home', 'addBreak', lang),
    driverChange: getText('home', 'driverChange', lang),
    trailerExist: getText('home', 'trailerExist', lang),
    noTrailer: getText('home', 'noTrailer', lang),
    dayExistRegardRoute: getText('home', 'dayExistRegardRoute', lang),
  }

  const imageOpacity = homeImageOpacity(theme);

  // Notatki są na samym dole – przy edycji robimy miejsce na klawiaturę (edge-to-edge na Androidzie
  // nie zmniejsza okna) i przewijamy do nich, żeby wpisywany tekst był widoczny.
  const scrollRef = useRef<ScrollView>(null);
  const keyboardHeight = useKeyboardHeight();
  const [notesFocused, setNotesFocused] = useState<boolean>(false);
  const keyboardSpace = notesFocused ? keyboardHeight : 0;

  // także przy każdej zmianie wysokości treści (notatka rośnie przy pisaniu kolejnych linii)
  const scrollToNotesIfEditing = (): void => {
    if (keyboardSpace > 0) {
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    }
  };

  useEffect(() => {
    scrollToNotesIfEditing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyboardSpace]);

  useFocusEffect(
    useCallback(() => {
      fetchData<UserInterface>(API_ENDPOINTS.GET, { setData: setUser }).then();
    }, [])
  );

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
    fetchData<TourInterface>(API_ENDPOINTS.GET_ACTIVE_ROUTE, { setData: setActiveTour })
      .finally(() => setTourChecked(true));
  }, [activeTourRefresh]);

  useEffect(() => {
    fetchData<LoadInterface[]>(API_ENDPOINTS.GET_NOT_UNLOADED_LOADS, { setData: setActiveLoads });
  }, [activeLoadsRefresh]);

  if (user?.status === userStatusEnum.blocked) {
    return (
      <View style={[STYLES.mainView, { backgroundColor: colors.background }]}>
        <ThemedText>{getText('home', 'blockedDescription', lang)}</ThemedText>
      </View>
    );
  }

  if (!tourChecked) {
    return <View style={[STYLES.mainView, { backgroundColor: colors.background }]} />;
  }

  if (!activeTour) {
    return (
      <ScrollView
        ref={scrollRef}
        style={[STYLES.scrollView, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.noTourContent, { paddingBottom: 30 + keyboardSpace }]}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={scrollToNotesIfEditing}
      >
        <TourStartForm
          visible={tourStartVisible}
          setVisible={setTourStartVisible}
          form={generalFormData}
          setForm={updateGeneralFormData}
          setlastLogRefresh={setLastLogRefresh}
          setActiveTourRefresh={setActiveTourRefresh}
          setActiveLoadsRefresh={setActiveLoadsRefresh}
        />
        <View style={[styles.tourStartOnly, { opacity: homeButtonOpacity(theme) }]}>
          <MainFormButton onPress={() => setTourStartVisible(true)} text={txt.tourStart} />
        </View>
        <BrowseRecordsSection />
        <UserNotes onFocusChange={setNotesFocused} />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      style={[STYLES.scrollView, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: keyboardSpace }}
      keyboardShouldPersistTaps="handled"
        onContentSizeChange={scrollToNotesIfEditing}
    >

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
      <TourStopForm
        visible={tourStopVisible}
        setVisible={setTourStopVisible}
        form={generalFormData}
        setForm={updateGeneralFormData}
        setlastLogRefresh={setLastLogRefresh}
        setActiveTourRefresh={setActiveTourRefresh}
        setActiveLoadsRefresh={setActiveLoadsRefresh}
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
      <AddBreakForm
        visible={addBreakVisible}
        setVisible={setAddBreakVisible}
        form={generalFormData}
        setForm={updateGeneralFormData}
        setlastLogRefresh={setLastLogRefresh}
        setActiveDayRefresh={setActiveDayRefresh}
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

      <ServiceForm
        visible={serviceVisible}
        setVisible={setServiceVisible}
        form={generalFormData}
        setForm={updateGeneralFormData}
        setlastLogRefresh={setLastLogRefresh}
        serviceType={serviceType}
      />

      <ImageBackground
        source={require('@/assets/images/activitiesBackground.jpg')}
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
            <MainFormButton
              onPress={() => activeDay ? setAddBreakVisible(true) : showSnackbar(txt.dayNotExist, 'info')}
              text={activeDay?.doubleCrew ? txt.driverChange : txt.addBreak}
            />
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
        source={require('@/assets/images/financesBackground.jpg')}
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
        source={require('@/assets/images/loadingsBackground.jpg')}
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
        source={require('@/assets/images/vehiclesBackground.webp')}
        style={[styles.imageBackground, { opacity: imageOpacity }]}
        imageStyle={styles.imageStyle}
        resizeMode="cover"
      >
        <View style={styles.buttonView}>
          <MainFormButton onPress={() => activeTour?.trailer ? showSnackbar(txt.trailerExist, 'info') : setAttachTrailerVisible(true)} text={txt.attachTrailer} />
        </View>
        <View style={styles.buttonView}>
          <MainFormButton onPress={() => activeTour?.trailer ? setDetachTrailerVisible(true) : showSnackbar(txt.noTrailer, 'info')} text={txt.detachTrailer} />
        </View>
        <View style={styles.buttonView}>
          <MainFormButton onPress={() => {
            setServiceType(ServiceEnum.fifthWheelLube);
            setServiceVisible(true);
          }} text={txt.addLubrication} />
        </View>
        <View style={styles.buttonView}>
          <MainFormButton onPress={() => {
            setServiceType(ServiceEnum.standard);
            setServiceVisible(true);
          }} text={txt.addService} />
        </View>
      </ImageBackground>

      <View style={[styles.tourStopBottom, { opacity: homeButtonOpacity(theme) }]}>
        <MainFormButton onPress={() => activeDay ? showSnackbar(txt.dayExistRegardRoute, 'info') : setTourStopVisible(true)} text={txt.tourStop} />
      </View>

      <BrowseRecordsSection />

      <UserNotes onFocusChange={setNotesFocused} />

    </ScrollView >
  );
}

const styles = StyleSheet.create({
  imageBackground: {
    justifyContent: 'center',
    minHeight: 230,
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
  tourStopBottom: {
    marginHorizontal: 60,
    marginTop: 20,
    marginBottom: 40,
  },
  tourStartOnly: {
    alignSelf: 'stretch',
    marginHorizontal: 40,
  },
  noTourContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 30,
  },
});
