import { useTheme } from "@/hooks/useTheme";
import { Button } from "react-native-paper"

interface Props {
    onPress: () => void;
    text: string;
}

export const MainFormButton: React.FC<Props> = (props: Props): JSX.Element => {

    const { colors } = useTheme();

    return (
        <Button
            mode="contained-tonal"
            onPress={props.onPress}
            textColor={colors.buttonTextColor}
            buttonColor={colors.buttonColor}
            rippleColor={colors.buttonRipleColor}
        >
            {props.text}
        </Button>
    );
}