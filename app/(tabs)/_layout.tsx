import { Tabs, useSegments, router } from "expo-router";
import { Pressable, View, StyleSheet } from 'react-native';
import { common } from '../../assets/text/common';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useTheme } from "@/hooks/useTheme";
import { useGlobalState } from "@/hooks/useGlobalState";
import { SwitchTheme } from "@/components/SwitchTheme";

export default function TabLayout() {

    const { user } = useGlobalState();
    const { colors } = useTheme();
    // @ts-ignore
    const isProfileScreen = useSegments().includes('profile');

    return (
        <Tabs
            screenOptions={{
                headerStyle: { backgroundColor: colors.headerBackground },
                headerTitleStyle: { color: colors.text },
                tabBarStyle: { backgroundColor: colors.tabBarBackground },
                headerRight: () => (
                    <View style={styles.topBarRightButtons}>
                        <SwitchTheme />
                        <Pressable
                            // @ts-ignore
                            onPress={() => router.push('/profile')}
                            style={{ marginRight: 10 }}
                        >
                            <AntDesign
                                name="setting"
                                size={24}
                                color={!isProfileScreen ? colors.tabIconDefault : colors.tabIconSelected}
                            />
                        </Pressable>
                    </View>
                ),
                tabBarActiveTintColor: colors.tabIconSelected,
                tabBarActiveBackgroundColor: colors.tabBackgroundSelected,

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
                        <AntDesign name="infocirlceo" size={20} color={!focused ? colors.tabIconDefault : colors.tabIconSelected} />
                    ),
                }}
            />
            <Tabs.Screen
                name="routes"
                redirect={!user}
                options={{
                    title: common.pl.routesPageTitle,
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
        </Tabs>
    );
}

const styles = StyleSheet.create({
    topBarRightButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});