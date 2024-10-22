import { View, StyleSheet, Button, ScrollView, ImageBackground } from "react-native";
import { useCallback, useState } from "react";
import { NewDayModal } from "@/components/mainFormModals/NewDayModal";
import { useTheme } from "@/hooks/useTheme";
import { MainFormButton } from "@/components/buttons/MainFormButton";
import { getText } from "@/utils/getText";
import { useGlobalState } from "@/hooks/useGlobalState";
import { useApi } from "@/hooks/useApi";
import API_ENDPOINTS from "@/constants/API_ENDPOINTS";
import { UserInterface, userLangEnum, userStatusEnum } from "@/types";
import { useFocusEffect } from "expo-router";
import { STYLES } from "@/constants/STYLES";
import { ThemedText } from "@/components/ThemedText";


export default function Home() {

  const { theme, colors } = useTheme();
  const { setUser, user, lang } = useGlobalState();
  const { fetchData } = useApi();
  const [newDayVisible, setNewDayVisible] = useState<boolean>(false);
  const [finishDayVisible, setFinishDayVisible] = useState<boolean>(false);
  const [borderCrossVisible, setBorderCrossVisible] = useState<boolean>(false);
  const [logAddVisible, setLogAddVisible] = useState<boolean>(false);
  const [expenceAddVisible, setExpenceAddVisible] = useState<boolean>(false);

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

  return (
    <ScrollView style={[STYLES.scrollView, { backgroundColor: colors.background }]}>

      <NewDayModal visible={newDayVisible} setVisible={setNewDayVisible} />

      <ImageBackground
        source={require('@/assets/images/activitiesBackground.png')}
        style={[styles.imageBackground, { opacity: imageOpacity }]}
        imageStyle={styles.imageStyle}
        resizeMode="cover"
      >
        <View style={styles.buttonsGroup}>
          <View style={styles.buttonView}>
            <MainFormButton onPress={() => setNewDayVisible(true)} text={getText('home', 'dayStart', lang)} />
          </View>
          <View style={styles.buttonView}>
            <MainFormButton onPress={() => setFinishDayVisible(true)} text={getText('home', 'dayStop', lang)} />
          </View>
          <View style={styles.buttonView}>
            <MainFormButton onPress={() => setBorderCrossVisible(true)} text={getText('home', 'crossBorder', lang)} />
          </View>
          <View style={styles.buttonView}>
            <MainFormButton onPress={() => setLogAddVisible(true)} text={getText('home', 'addLog', lang)} />
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
          <MainFormButton onPress={() => setExpenceAddVisible(true)} text={getText('home', 'dieselRefuel', lang)} />
        </View>
        <View style={styles.buttonView}>
          <MainFormButton onPress={() => setExpenceAddVisible(true)} text={getText('home', 'adblueRefuel', lang)} />
        </View>
        <View style={styles.buttonView}>
          <MainFormButton onPress={() => setExpenceAddVisible(true)} text={getText('home', 'expenceAdd', lang)} />
        </View>
      </ImageBackground>

      <ImageBackground
        source={require('@/assets/images/loadingsBackground.png')}
        style={[styles.imageBackground, { opacity: imageOpacity }]}
        imageStyle={styles.imageStyle}
        resizeMode="cover"
      >
        <View style={styles.buttonView}>
          <Button onPress={() => setNewDayVisible(true)} title='Dojazd na załadunek' />
        </View>
        <View style={styles.buttonView}>
          <Button onPress={() => setNewDayVisible(true)} title='Zakończenie załadunku' />
        </View>
        <View style={styles.buttonView}>
          <Button onPress={() => setNewDayVisible(true)} title='Dojazd na rozładunek' />
        </View>
        <View style={styles.buttonView}>
          <Button onPress={() => setNewDayVisible(true)} title='Zakończenie rozładunku' />
        </View>
      </ImageBackground>

      <ImageBackground
        source={require('@/assets/images/vehiclesBackground.png')}
        style={[styles.imageBackground, { opacity: imageOpacity }]}
        imageStyle={styles.imageStyle}
        resizeMode="cover"
      >
        <View style={styles.buttonView}>
          <Button onPress={() => setNewDayVisible(true)} title='Podepnij naczepę' />
        </View>
        <View style={styles.buttonView}>
          <Button onPress={() => setNewDayVisible(true)} title='Odepnij naczepę' />
        </View>
        <View style={styles.buttonView}>
          <Button onPress={() => setNewDayVisible(true)} title='Smarowanie siodła' />
        </View>
        <View style={styles.buttonView}>
          <Button onPress={() => setNewDayVisible(true)} title='Serwis / obsługa pojazdu' />
        </View>
      </ImageBackground>
      <View style={[styles.buttonView, { marginVertical: 30, opacity: imageOpacity }]}>
        <Button onPress={() => setNewDayVisible(true)} title='Koniec trasy' />
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