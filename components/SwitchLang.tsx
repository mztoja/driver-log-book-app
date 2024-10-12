import { useGlobalState } from "@/hooks/useGlobalState";
import { LangInterface, userLangEnum } from "@/types";
import { useEffect, useState } from "react";
import { Pressable, View, Image, ViewStyle, ImageStyle } from "react-native";

interface Props {
    style: ViewStyle;
    flagStyle: ImageStyle;
}

export const SwitchLang: React.FC<Props> = (props: Props): JSX.Element => {
    const { lang, setLang, setUser } = useGlobalState();
    const [enOpacity, enSetOpacity] = useState<number>(0.5);
    const [plOpacity, plSetOpacity] = useState<number>(0.5);

    const set = (lang: LangInterface): void => {
        setLang(lang);
        setUser((prev) => {
            if (prev) {
                return { ...prev, lang: userLangEnum[lang] };
            }
            return prev;
        });
    }

    useEffect(() => {
        switch (lang) {
            case "en":
                enSetOpacity(1);
                plSetOpacity(0.5);
                break;
            case 'pl':
                enSetOpacity(0.5);
                plSetOpacity(1);
                break;
            default:
                enSetOpacity(1);
                plSetOpacity(0.5);
                break;

        }
    }, [lang]);



    return (
        <View style={props.style}>
            <Pressable onPress={() => set('en')}>
                <Image source={require('@/assets/images/en.jpg')} style={[props.flagStyle, { opacity: enOpacity }]} />
            </Pressable>
            <Pressable onPress={() => set('pl')}>
                <Image source={require('@/assets/images/pl.jpg')} style={[props.flagStyle, { opacity: plOpacity }]} />
            </Pressable>
        </View>
    );
}