import React, { JSX, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Icon, IconButton } from 'react-native-paper';
import { File } from 'expo-file-system';
import { ThemedText } from '@/components/ThemedText';
import { MainFormModal } from '@/components/mainForms/MainFormModal';
import { SendButton } from '@/components/buttons/SendButton';
import { MainFormButton } from '@/components/buttons/MainFormButton';
import { TextField } from '@/components/records/edit/fields';
import { STYLES } from '@/constants/STYLES';
import { useTheme } from '@/hooks/useTheme';
import { useGlobalState } from '@/hooks/useGlobalState';
import { useSnackbar } from '@/hooks/useSnackbar';
import { getText } from '@/utils/getText';
import { buildTourSettlementPdf, MAX_LEG_ROWS, openPdfForEditing, sharePdf } from '@/utils/generateTourSettlement';
import { TourSettleGeneratorInterface, TourSettleGeneratorLeg, ToursInterface } from '@/types';

type Field = keyof Omit<TourSettleGeneratorInterface, 'routes'>;
type LabelKey = keyof ToursInterface['en'];
type Section = 'drivers' | 'tour' | 'refs' | 'fuel' | 'expenses' | 'legs' | 'other';

const EMPTY_LEG: TourSettleGeneratorLeg = {
    startCity: '', startData: '', startOdometer: '',
    borderDate: '', borderPlace: '',
    stopCity: '', stopData: '', stopOdometer: '',
    distance: '', customer: '',
};

// kolejność i etykiety pól odcinka (jak kolumny w szablonie PDF)
const LEG_FIELDS: { key: keyof TourSettleGeneratorLeg; label: LabelKey }[] = [
    { key: 'startCity', label: 'legStartCity' },
    { key: 'startData', label: 'legStartData' },
    { key: 'startOdometer', label: 'legStartOdometer' },
    { key: 'borderDate', label: 'legBorderDate' },
    { key: 'borderPlace', label: 'legBorderPlace' },
    { key: 'stopCity', label: 'legStopCity' },
    { key: 'stopData', label: 'legStopData' },
    { key: 'stopOdometer', label: 'legStopOdometer' },
    { key: 'distance', label: 'legDistance' },
    { key: 'customer', label: 'legCustomer' },
];

const range = (n: number): number[] => Array.from({ length: n }, (_, i) => i + 1);

interface Props {
    data: TourSettleGeneratorInterface;
    onClose: () => void;
}

/**
 * Generator rozliczenia trasy: wszystko, co trafia do PDF, jest tu edytowalne (pola ogólne
 * i odcinki), więc gotowy plik nie wymaga już poprawek w aplikacji PDF. Odcinki – jak front
 * `TourGeneratorSettings` – można też przestawiać, usuwać i dodawać.
 */
export const TourGeneratorModal: React.FC<Props> = (props: Props): JSX.Element => {
    const { colors } = useTheme();
    const { lang, user } = useGlobalState();
    const { showSnackbar } = useSnackbar();
    const t = (k: LabelKey, x?: string) => getText('tours', k, lang, x);

    const [data, setData] = useState<TourSettleGeneratorInterface>(props.data);
    const [open, setOpen] = useState<Section | null>('tour');
    const [openLeg, setOpenLeg] = useState<number | null>(null);
    const [generating, setGenerating] = useState<boolean>(false);
    // ostatnio wygenerowany plik – nieaktualny po każdej zmianie danych
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const title = getText('tours', 'generateTitle', lang, data.routeNr);

    const setField = (key: Field, value: string): void => {
        setData((prev) => ({ ...prev, [key]: value }));
        setPdfFile(null);
    };

    const legs = data.routes;
    const setLegs = (next: TourSettleGeneratorLeg[]): void => {
        setData((prev) => ({ ...prev, routes: next }));
        setPdfFile(null);
    };
    const setLegField = (i: number, key: keyof TourSettleGeneratorLeg, value: string): void =>
        setLegs(legs.map((leg, idx) => (idx === i ? { ...leg, [key]: value } : leg)));

    const moveLeg = (i: number, dir: -1 | 1): void => {
        const j = i + dir;
        if (j < 0 || j >= legs.length) return;
        const next = [...legs];
        [next[i], next[j]] = [next[j], next[i]];
        setLegs(next);
        if (openLeg === i) setOpenLeg(j);
    };
    const removeLeg = (i: number): void => {
        setLegs(legs.filter((_, idx) => idx !== i));
        setOpenLeg(null);
    };
    const addLeg = (): void => {
        if (legs.length >= MAX_LEG_ROWS) return;
        setLegs([...legs, { ...EMPTY_LEG }]);
        setOpenLeg(legs.length);
    };

    const openFile = async (file: File): Promise<void> => {
        if (!(await openPdfForEditing(file, title))) showSnackbar(t('generatorNoPdfApp'), 'warning');
    };
    const shareFile = async (file: File): Promise<void> => {
        if (!(await sharePdf(file, title))) showSnackbar(t('generatorShareError'), 'warning');
    };

    const generate = async (): Promise<void> => {
        if (!user?.tourGenerator) {
            showSnackbar(t('generatorNotFound'), 'info');
            return;
        }
        setGenerating(true);
        const result = await buildTourSettlementPdf(data, user.tourGenerator, title);
        setGenerating(false);
        if (result.status === 'noTemplate') {
            showSnackbar(t('generatorNotFound'), 'info');
            return;
        }
        if (result.status === 'saveError') {
            showSnackbar(t('generateError'), 'error');
            return;
        }
        setPdfFile(result.file);
        if (result.skippedLegs > 0) {
            showSnackbar(t('generatorSkippedLegs', String(result.skippedLegs)), 'warning');
        }
        await openFile(result.file);
    };

    const field = (key: Field, label: string, multiline?: boolean): JSX.Element => (
        <TextField key={key} label={label} value={data[key] ?? ''} onChange={(v) => setField(key, v)} multiline={multiline} />
    );

    const sectionHeader = (id: Section, label: string): JSX.Element => (
        <Pressable
            onPress={() => setOpen(open === id ? null : id)}
            style={[styles.sectionHead, { backgroundColor: colors.inputBackground, borderColor: colors.headerBackground }]}
        >
            <ThemedText type="defaultSemiBold" style={{ flex: 1 }}>{label}</ThemedText>
            <Icon source={open === id ? 'chevron-up' : 'chevron-down'} size={22} color={colors.text} />
        </Pressable>
    );

    return (
        <MainFormModal visible setVisible={() => props.onClose()} title={t('generatorTourEdit')}>
            <ScrollView
                style={STYLES.scrollView}
                contentContainerStyle={[styles.content, { paddingBottom: 24 }]}
                keyboardShouldPersistTaps="handled"
            >
                <ThemedText style={styles.hint}>{t('generatorHint')}</ThemedText>

                {sectionHeader('drivers', t('genSectionDrivers'))}
                {open === 'drivers' && <View style={styles.section}>
                    {field('name1', t('genDriver1'))}
                    {field('name2', t('genDriver2'))}
                </View>}

                {sectionHeader('tour', t('genSectionTour'))}
                {open === 'tour' && <View style={styles.section}>
                    {field('routeNr', t('genRouteNr'))}
                    {field('destonationCity', t('genDestination'))}
                    {field('truck', t('genTruck'))}
                    {field('trailer', t('genTrailer'))}
                    {field('departureDate', t('genDepartureDate'))}
                    {field('departureTime', t('genDepartureTime'))}
                    {field('returnDate', t('genReturnDate'))}
                    {field('returnTime', t('genReturnTime'))}
                    {field('departureOdometer', t('genDepartureOdometer'))}
                    {field('returnOdometer', t('genReturnOdometer'))}
                    {field('distance', t('genDistance'))}
                </View>}

                {sectionHeader('refs', t('genSectionRefs'))}
                {open === 'refs' && <View style={styles.section}>
                    {range(6).map((n) => field(`sci${n}` as Field, t('genRef', String(n))))}
                </View>}

                {sectionHeader('fuel', t('genSectionFuel'))}
                {open === 'fuel' && <View style={styles.section}>
                    {field('fuelBefore', t('genFuelBefore'))}
                    {field('fuelAfter', t('genFuelAfter'))}
                    {field('refueled', t('genRefueled'))}
                    {field('fuelConsumption', t('genFuelConsumption'))}
                    {range(3).map((n) => (
                        <View key={n} style={styles.group}>
                            {field(`fuel${n}Date` as Field, t('genFuelDate', String(n)))}
                            {field(`fuel${n}City` as Field, t('genFuelCity', String(n)))}
                            {field(`fuel${n}Odometer` as Field, t('genFuelOdometer', String(n)))}
                            {field(`fuel${n}Value` as Field, t('genFuelValue', String(n)))}
                        </View>
                    ))}
                </View>}

                {sectionHeader('expenses', t('genSectionExpenses'))}
                {open === 'expenses' && <View style={styles.section}>
                    {range(12).map((n) => field(`expence${n}` as Field, t('genExpense', String(n))))}
                </View>}

                {sectionHeader('legs', `${t('genSectionLegs')} (${legs.length})`)}
                {open === 'legs' && <View style={styles.section}>
                    {legs.map((leg, i) => {
                        const expanded = openLeg === i;
                        return (
                            <View
                                key={i}
                                style={[styles.leg, { backgroundColor: colors.background, borderColor: colors.headerBackground }]}
                            >
                                <View style={styles.legHead}>
                                    <View style={styles.arrows}>
                                        <IconButton icon="arrow-up" size={18} disabled={i === 0}
                                                    iconColor={colors.text} onPress={() => moveLeg(i, -1)} />
                                        <IconButton icon="arrow-down" size={18} disabled={i === legs.length - 1}
                                                    iconColor={colors.text} onPress={() => moveLeg(i, 1)} />
                                    </View>
                                    <Pressable style={{ flex: 1 }} onPress={() => setOpenLeg(expanded ? null : i)}>
                                        <ThemedText style={styles.small}>{t('genLeg', String(i + 1))}</ThemedText>
                                        <ThemedText type="defaultSemiBold">
                                            {leg.startCity || '—'}  →  {leg.stopCity || '—'}
                                        </ThemedText>
                                        {!!leg.customer && <ThemedText style={styles.small}>{leg.customer}</ThemedText>}
                                    </Pressable>
                                    <IconButton icon={expanded ? 'chevron-up' : 'pencil'} size={20}
                                                iconColor={colors.actionIcon} onPress={() => setOpenLeg(expanded ? null : i)} />
                                    <IconButton icon="delete" size={20} iconColor={colors.deleteIcon} onPress={() => removeLeg(i)} />
                                </View>
                                {expanded && (
                                    <View style={styles.legBody}>
                                        {LEG_FIELDS.map((f) => (
                                            <TextField
                                                key={f.key}
                                                label={t(f.label)}
                                                value={leg[f.key] ?? ''}
                                                onChange={(v) => setLegField(i, f.key, v)}
                                            />
                                        ))}
                                    </View>
                                )}
                            </View>
                        );
                    })}
                    {legs.length < MAX_LEG_ROWS &&
                        <MainFormButton onPress={addLeg} text={t('genAddLeg')} />}
                </View>}

                {sectionHeader('other', t('genSectionOther'))}
                {open === 'other' && <View style={styles.section}>
                    {/* w szablonie PDF oba pola są wielowierszowe – enter przechodzi do PDF */}
                    {field('stops', t('genStops'), true)}
                    {field('other', t('genOther'), true)}
                </View>}

                <SendButton onPress={generate} text={t('generateAndOpen')} loading={generating} />
                {pdfFile && (
                    <View style={styles.after}>
                        <MainFormButton onPress={() => openFile(pdfFile)} text={t('generatorOpenAgain')} />
                        <MainFormButton onPress={() => shareFile(pdfFile)} text={t('generatorShare')} />
                        <ThemedText style={styles.hint}>{t('generatorEditHint')}</ThemedText>
                    </View>
                )}
            </ScrollView>
        </MainFormModal>
    );
};

const styles = StyleSheet.create({
    content: { padding: 12, gap: 8 },
    hint: { opacity: 0.8, fontSize: 13 },
    sectionHead: {
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 12,
    },
    section: { paddingHorizontal: 4 },
    group: { marginTop: 8, paddingTop: 4, borderTopWidth: 1, borderTopColor: 'rgba(128,128,128,0.3)' },
    leg: { borderWidth: 1, borderRadius: 10, marginBottom: 8 },
    legHead: { flexDirection: 'row', alignItems: 'center' },
    legBody: { paddingHorizontal: 8, paddingBottom: 8 },
    arrows: { alignItems: 'center' },
    small: { fontSize: 12, opacity: 0.75 },
    after: { gap: 8, marginHorizontal: 20 },
});
