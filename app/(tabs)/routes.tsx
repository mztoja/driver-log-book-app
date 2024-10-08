import { View } from "react-native";
import { ThemedText } from "@/components/ThemedText";

export default function Routes() {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <ThemedText>Here we have a Routes List and Details.</ThemedText>
        </View>
    );
}
