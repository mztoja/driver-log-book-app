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
  },
  dark: {
    text: '#ECEDEE',
    background: '#212121',
    headerBackground: '#121212',
    tabBarBackground: '#121212',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#960b0b',
    tabBackgroundSelected: '#212121',
  },
};
