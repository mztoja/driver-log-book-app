import { useEffect } from "react";
import { Tabs } from "expo-router";
import { useBottomTabBarHeight } from "expo-router/tabs";
import { Portal } from "react-native-paper";
import { setTabBarHeight } from "@/utils/tabBarHeightStore";
import { common } from '../../assets/text/common';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useTheme } from "@/hooks/useTheme";
import { useGlobalState } from "@/hooks/useGlobalState";
import { HeaderRightButtons } from "@/components/HeaderRightButtons";

// zgłasza wysokość dolnego paska zakładek nakładce formularzy (MainFormModal), która siedzi nad Tabs
const TabBarHeightReporter = () => {
    const height = useBottomTabBarHeight();
    useEffect(() => {
        setTabBarHeight(height);
    }, [height]);
    return null;
};

export default function TabLayout() {

    const { user } = useGlobalState();
    const { colors } = useTheme();

    return (
        // host portalu NAD nawigatorem – formularz (MainFormModal) zastępuje górny pasek ekranu,
        // a kończy się nad dolnymi zakładkami, które zostają widoczne i klikalne
        <Portal.Host>
        <Tabs
            screenLayout={({ children }) => <>{children}<TabBarHeightReporter /></>}
            screenOptions={{
                headerStyle: { backgroundColor: colors.headerBackground },
                headerTitleStyle: { color: colors.text },
                tabBarStyle: { backgroundColor: colors.tabBarBackground },
                headerRight: () => <HeaderRightButtons />,
                tabBarActiveTintColor: colors.tabIconSelected,
                tabBarInactiveTintColor: colors.tabIconDefault,
                tabBarActiveBackgroundColor: colors.tabBackgroundSelected,
                tabBarLabelStyle: { fontSize: 11 },
            }}
        >
            <Tabs.Screen
                name="home"
                redirect={!user}
                options={{
                    title: common.pl.homePageTitle,
                    tabBarIcon: ({ focused }) => (
                        <AntDesign name="home" size={20} color={!focused ? colors.tabIconDefault : colors.tabIconSelected} />
                    ),
                }}
            />
            <Tabs.Screen
                name="info"
                redirect={!user}
                options={{
                    title: common.pl.infoPageTitle,
                    tabBarIcon: ({ focused }) => (
                        <AntDesign name="info-circle" size={20} color={!focused ? colors.tabIconDefault : colors.tabIconSelected} />
                    ),
                }}
            />
            <Tabs.Screen
                name="routes"
                redirect={!user}
                options={{
                    title: common.pl.routesPageTitle,
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <FontAwesome5 name="route" size={20} color={!focused ? colors.tabIconDefault : colors.tabIconSelected} />
                    ),
                }}
            />
            <Tabs.Screen
                name="places"
                redirect={!user}
                options={{
                    title: common.pl.placesPageTitle,
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <FontAwesome5 name="address-book" size={20} color={!focused ? colors.tabIconDefault : colors.tabIconSelected} />
                    ),
                }}
            />
            <Tabs.Screen
                name="vehicles"
                redirect={!user}
                options={{
                    title: common.pl.vehiclesPageTitle,
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <FontAwesome5 name="truck" size={20} color={!focused ? colors.tabIconDefault : colors.tabIconSelected} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                redirect={!user}
                options={{
                    title: common.pl.profilePageTitle,
                    href: null,
                }}
            />
            <Tabs.Screen
                name="records"
                redirect={!user}
                options={{
                    href: null,
                    headerShown: false,
                }}
            />
        </Tabs>
        </Portal.Host>
    );
}