/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */
interface ColorEntries {
  text: string;
  background: string;
  headerBackground: string;
  tabBarBackground: string;
  tabIconDefault: string;
  tabIconSelected: string;
  tabBackgroundSelected: string;
  buttonTextColor: string;
  buttonColor: string;
  buttonRipleColor: string;
  inputBackground: string;
  snackbarInfoBackground: string;
  snackbarInfoText: string;
  snackbarErrorBackground: string;
  snackbarErrorText: string;
  snackbarSuccessBackground: string;
  snackbarSuccessText: string;
  snackbarWarningBackground: string;
  snackbarWarningText: string;
}

interface Themes {
  light: ColorEntries;
  dark: ColorEntries;
}

export const COLORS: Themes = {
  light: {
    text: '#11181C',
    background: '#c9c9c9',
    headerBackground: '#ededed',
    tabBarBackground: '#ededed',
    tabIconDefault: '#687076',
    tabIconSelected: '#c71c1c',
    tabBackgroundSelected: '#c9c9c9',
    buttonTextColor: 'black',
    buttonColor: '#34aac2',
    buttonRipleColor: '#1764ad',
    inputBackground: '#d1d1d1',
    snackbarInfoBackground: '#42A5F5',
    snackbarInfoText: '#FFFFFF',
    snackbarErrorBackground: '#EF5350',
    snackbarErrorText: '#FFFFFF',
    snackbarSuccessBackground: '#66BB6A',
    snackbarSuccessText: '#FFFFFF',
    snackbarWarningBackground: '#FFA726',
    snackbarWarningText: '#000000',
  },
  dark: {
    text: '#ECEDEE',
    background: '#212121',
    headerBackground: '#121212',
    tabBarBackground: '#121212',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#960b0b',
    tabBackgroundSelected: '#212121',
    buttonTextColor: 'white',
    buttonColor: '#34aac2',
    buttonRipleColor: '#1764ad',
    inputBackground: '#1c1c1c',
    snackbarInfoBackground: '#64B5F6',
    snackbarInfoText: '#FFFFFF',
    snackbarErrorBackground: '#E57373',
    snackbarErrorText: '#FFFFFF',
    snackbarSuccessBackground: '#81C784',
    snackbarSuccessText: '#FFFFFF',
    snackbarWarningBackground: '#FFB74D',
    snackbarWarningText: '#000000',
  },
};
