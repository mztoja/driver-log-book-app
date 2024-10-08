import { View } from "react-native";
import { ThemedText } from "@/components/ThemedText";

export default function Profile() {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <ThemedText>Settings Profile</ThemedText>
        </View>
    );
}
