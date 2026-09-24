import { Platform } from 'react-native';
import { PDFDocument } from 'pdf-lib';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import CONFIG from '@/constants/CONFIG';
import { TourSettleGeneratorInterface, TourSettleGeneratorLeg } from '@/types';

/*
 * Odpowiednik front `utils/generateTourSettlement.ts`: wypełnia formularz szablonu PDF
 * (user.tourGenerator) danymi z /tours/generator. Na komputerze PDF otwiera się w przeglądarce
 * i tam dopisuje się resztę pól – tutaj plik trafia do cache aplikacji, skąd można go otworzyć
 * w aplikacji PDF telefonu (edycja pól formularza) albo od razu udostępnić.
 */

const diacriticsMap: { [key: string]: string } = {
    'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
    'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N', 'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z',
};
// czcionka pól formularza w szablonie nie ma polskich znaków (jak na froncie)
const replaceDiacritics = (str: string): string =>
    String(str ?? '').replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, (m) => diacriticsMap[m]);

// Pola odcinków w szablonie PDF: startCity1..startCityN itd.
const LEG_FIELDS: (keyof TourSettleGeneratorLeg)[] = [
    'startCity', 'startData', 'startOdometer', 'borderDate', 'borderPlace',
    'stopCity', 'stopData', 'stopOdometer', 'distance', 'customer',
];
export const MAX_LEG_ROWS = 20;

export type BuildResult =
    | { status: 'ok'; file: File; skippedLegs: number }
    | { status: 'noTemplate' }
    | { status: 'saveError' };

/** Wypełnia szablon i zapisuje PDF w cache aplikacji. */
export const buildTourSettlementPdf = async (
    data: TourSettleGeneratorInterface,
    tourGenerator: string,
    title: string,
): Promise<BuildResult> => {
    let pdfBytes: Uint8Array;
    let skippedLegs = 0;
    try {
        const res = await fetch(`${CONFIG.TOUR_TEMPLATES_URL}/${tourGenerator}.pdf`);
        if (!res.ok) return { status: 'noTemplate' };
        const pdfDoc = await PDFDocument.load(await res.arrayBuffer());
        const form = pdfDoc.getForm();
        // ile wierszy odcinków faktycznie ma szablon (np. stertrans.pdf: 10, nie 20) – nadmiarowe
        // odcinki nie trafią do PDF, więc zgłaszamy ich liczbę zamiast gubić je po cichu
        const fieldNames = new Set(form.getFields().map((f) => f.getName()));
        let capacity = 0;
        while (capacity < MAX_LEG_ROWS && fieldNames.has(`startCity${capacity + 1}`)) capacity++;
        skippedLegs = Math.max(0, data.routes.length - capacity);

        (Object.keys(data) as (keyof TourSettleGeneratorInterface)[]).forEach((fieldName) => {
            if (fieldName === 'routes') return; // odcinki spłaszczamy poniżej
            try {
                form.getTextField(fieldName).setText(replaceDiacritics(data[fieldName] as string));
            } catch {
                // pola nieobecnego w szablonie po prostu nie wypełniamy
            }
        });
        // Wszystkie sloty – niewykorzystane czyścimy, inaczej w PDF zostają przykładowe wartości z szablonu.
        for (let n = 1; n <= MAX_LEG_ROWS; n++) {
            const leg = data.routes[n - 1];
            LEG_FIELDS.forEach((f) => {
                try {
                    form.getTextField(`${f}${n}`).setText(replaceDiacritics(leg ? (leg[f] ?? '') : ''));
                } catch {
                    // brak pola w szablonie
                }
            });
        }
        pdfDoc.setTitle(title);
        // pola formularza zostają edytowalne (bez flatten) – resztę szczegółów dopisuje się w aplikacji PDF
        pdfBytes = await pdfDoc.save();
    } catch {
        return { status: 'noTemplate' };
    }

    try {
        const safeName = title.replace(/[\\/:*?"<>|]/g, '-');
        const file = new File(Paths.cache, `${safeName}.pdf`);
        file.create({ overwrite: true });
        file.write(pdfBytes);
        return { status: 'ok', file, skippedLegs };
    } catch {
        return { status: 'saveError' };
    }
};

// Android Intent flags: FLAG_GRANT_READ_URI_PERMISSION | FLAG_GRANT_WRITE_URI_PERMISSION –
// aplikacja PDF może odczytać plik i zapisać w nim wypełnione pola
const GRANT_READ_WRITE = 0x1 | 0x2;

/** Systemowe okno udostępniania (zapis, e-mail, komunikator). */
export const sharePdf = async (file: File, title: string): Promise<boolean> => {
    try {
        if (!(await Sharing.isAvailableAsync())) return false;
        await Sharing.shareAsync(file.uri, { mimeType: 'application/pdf', dialogTitle: title, UTI: 'com.adobe.pdf' });
        return true;
    } catch {
        return false;
    }
};

/**
 * Otwiera PDF w aplikacji PDF telefonu (edycja pól formularza, dalej wysyłka już z niej).
 * iOS nie ma „otwórz w" przez intent – tam systemowy arkusz z podglądem / Oznaczeniami / „Otwórz w…".
 */
export const openPdfForEditing = async (file: File, title: string): Promise<boolean> => {
    try {
        if (Platform.OS === 'android') {
            await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                data: file.contentUri,
                type: 'application/pdf',
                flags: GRANT_READ_WRITE,
            });
            return true;
        }
        return await sharePdf(file, title);
    } catch {
        // brak aplikacji obsługującej PDF
        return false;
    }
};
