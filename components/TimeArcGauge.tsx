import React, { JSX, useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';

interface Props {
    label: string;         // drobny opis pod wartością, np. "Czas pracy dzisiaj"
    seconds: number;       // aktualny upływający czas
    warnSeconds: number;   // próg żółty (ostrzeżenie)
    maxSeconds: number;    // próg czerwony — po przekroczeniu wartość łagodnie pulsuje
    width?: number;        // szerokość w px, domyślnie 150
}

// Odpowiednik front `components/common/TimeArcGauge.tsx` – ta sama geometria płytkiego łuku
// (kąty zegarowe: 0° = godz. 12), napis wewnątrz łuku.
const CX = 100;
const CY = 135.96;
const R = 127.96;
const HALF_ANGLE = 44.7;
// długość łuku do strokeDasharray (react-native-svg nie obsługuje pewnie `pathLength`)
const ARC_LENGTH = R * ((2 * HALF_ANGLE * Math.PI) / 180);

const pointOnArc = (angleDeg: number): { x: number; y: number } => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: CX + R * Math.sin(rad), y: CY - R * Math.cos(rad) };
};

const START = pointOnArc(-HALF_ANGLE);
const END = pointOnArc(HALF_ANGLE);
const ARC_PATH = `M ${START.x} ${START.y} A ${R} ${R} 0 0 1 ${END.x} ${END.y}`;

const formatHm = (totalSeconds: number): string => {
    const safeSeconds = Math.max(0, Math.round(totalSeconds));
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

type Tier = 'ok' | 'warn' | 'over';
const TIER_STROKE: Record<Tier, string> = { ok: '#4caf50', warn: '#ffc107', over: '#f44336' };

export const TimeArcGauge: React.FC<Props> = (props: Props): JSX.Element => {
    const { colors } = useTheme();
    const width = props.width ?? 150;
    const maxSeconds = props.maxSeconds > 0 ? props.maxSeconds : 1;
    const percent = Math.min(Math.max(props.seconds, 0) / maxSeconds, 1);
    const tier: Tier =
        props.seconds >= props.maxSeconds ? 'over' : props.seconds >= props.warnSeconds ? 'warn' : 'ok';

    // „łagodnie i rzadko" — wolny puls tylko po przekroczeniu progu czerwonego
    const opacity = useRef(new Animated.Value(1)).current;
    useEffect(() => {
        if (tier !== 'over') {
            opacity.setValue(1);
            return;
        }
        const loop = Animated.loop(Animated.sequence([
            Animated.timing(opacity, { toValue: 0.4, duration: 1300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]));
        loop.start();
        return () => loop.stop();
    }, [tier, opacity]);

    return (
        <View style={{ width, height: width * 45 / 118, alignSelf: 'center' }}>
            <Svg width="100%" height="100%" viewBox="0 0 200 52" preserveAspectRatio="none">
                <Path d={ARC_PATH} fill="none" stroke={colors.text} strokeOpacity={0.15} strokeWidth={10} strokeLinecap="round" />
                <SvgText x="100" y="48" textAnchor="middle" fontSize={10} fill={colors.text} fillOpacity={0.7}>
                    {props.label}
                </SvgText>
            </Svg>
            <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity }}>
                <Svg width="100%" height="100%" viewBox="0 0 200 52" preserveAspectRatio="none">
                    <Path
                        d={ARC_PATH}
                        fill="none"
                        stroke={TIER_STROKE[tier]}
                        strokeWidth={10}
                        strokeLinecap="round"
                        strokeDasharray={`${ARC_LENGTH} ${ARC_LENGTH}`}
                        strokeDashoffset={ARC_LENGTH * (1 - percent)}
                    />
                    <SvgText x="100" y="40" textAnchor="middle" fontSize={20} fontWeight="bold" fill={TIER_STROKE[tier]}>
                        {formatHm(props.seconds)}
                    </SvgText>
                </Svg>
            </Animated.View>
        </View>
    );
};
