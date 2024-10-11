import { useTheme } from "@/hooks/useTheme";
import { Button } from "react-native-paper"

interface Props {
    onPress: () => void;
    text: string;
    loading?: boolean;
}

export const SendButton: React.FC<Props> = (props: Props): JSX.Element => {

    const { colors } = useTheme();

    return (
        <Button
            mode="outlined"
            onPress={props.onPress}
            textColor={colors.buttonTextColor}
            buttonColor={colors.buttonColor}
            rippleColor={colors.buttonRipleColor}
            style={{ margin: 20 }}
            loading={props.loading}
        >
            {props.text}
        </Button>
    );
}