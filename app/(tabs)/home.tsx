import { View, StyleSheet, Button, ScrollView, ImageBackground } from "react-native";
import { useState } from "react";
import { NewDayModal } from "@/components/mainFormModals/NewDayModal";
import { useTheme } from "@/hooks/useTheme";
import { MainFormButton } from "@/components/buttons/MainFormButton";
import { getText } from "@/utils/getText";


export default function Home() {

  const { theme, colors } = useTheme();
  const [newDayVisible, setNewDayVisible] = useState<boolean>(false);
  const [finishDayVisible, setFinishDayVisible] = useState<boolean>(false);
  const [borderCrossVisible, setBorderCrossVisible] = useState<boolean>(false);
  const [logAddVisible, setLogAddVisible] = useState<boolean>(false);

  const imageOpacity = theme === 'dark' ? 0.5 : 1;

  return (
    <ScrollView style={[styles.scrollView, { backgroundColor: colors.background }]}>

      <NewDayModal visible={newDayVisible} setVisible={setNewDayVisible} />

      <ImageBackground
        source={require('@/assets/images/activitiesBackground.png')}
        style={[styles.imageBackground, { opacity: imageOpacity }]}
        imageStyle={styles.imageStyle}
        resizeMode="cover"
      >
        <View style={styles.buttonsGroup}>
          <View style={styles.buttonView}>
            <MainFormButton onPress={() => setNewDayVisible(true)} text={getText('common', 'dayStartPageTitle')} />
          </View>
          <View style={styles.buttonView}>
            <MainFormButton onPress={() => setFinishDayVisible(true)} text={getText('common', 'dayStopPageTitle')} />
          </View>
          <View style={styles.buttonView}>
            <MainFormButton onPress={() => setBorderCrossVisible(true)} text={getText('common', 'borderCrossPageTitle')} />
          </View>
          <View style={styles.buttonView}>
            <MainFormButton onPress={() => setLogAddVisible(true)} text={getText('common', 'logAddPageTitle')} />
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
          <Button onPress={() => setNewDayVisible(true)} title='Tankowanie Diesel' />
        </View>
        <View style={styles.buttonView}>
          <Button onPress={() => setNewDayVisible(true)} title='Tankowanie Adblue' />
        </View>
        <View style={styles.buttonView}>
          <Button onPress={() => setNewDayVisible(true)} title='Dodaj inny wydatek' />
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
  scrollView: {
    flex: 1,
  },
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