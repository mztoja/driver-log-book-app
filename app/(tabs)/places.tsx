import { View } from "react-native";
import { ThemedText } from "@/components/ThemedText";

export default function Places() {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <ThemedText>Here we have a Places List and Details.</ThemedText>
        </View>
    );
}
