import { JSX } from 'react';
import { Header, HeaderBackButton, getHeaderTitle } from 'expo-router/react-navigation';
import type { NativeStackHeaderProps } from 'expo-router/native-stack';

/**
 * Nagłówek dla natywnych stacków w (tabs) – ten sam komponent `Header`, którego używa `Tabs`,
 * dzięki czemu pasek górny (wysokość, odstępy, pozycja ikon) jest identyczny na wszystkich kartach.
 * Użycie: `screenOptions={{ header: (props) => <StackHeader {...props} />, ... }}`.
 */
export const StackHeader = ({ navigation, route, options, back }: NativeStackHeaderProps): JSX.Element => {
    const { headerLeft, headerRight, headerTintColor, headerStyle, headerTitleStyle } = options;

    return (
        <Header
            title={getHeaderTitle(options, route.name)}
            back={back}
            headerTintColor={headerTintColor}
            headerStyle={headerStyle}
            headerTitleStyle={headerTitleStyle}
            headerRight={headerRight ? (p) => headerRight({ ...p, canGoBack: !!back }) : undefined}
            headerLeft={
                headerLeft
                    ? (p) => headerLeft({ ...p, canGoBack: !!back })
                    : back
                        ? (p) => <HeaderBackButton {...p} onPress={navigation.goBack} />
                        : undefined
            }
        />
    );
};
