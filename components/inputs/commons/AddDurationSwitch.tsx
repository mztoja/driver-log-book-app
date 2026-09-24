import React, { JSX, useState } from "react";
import { OnOffSwitch } from "./OnOffSwitch";
import { DriveTimeInput } from "./DriveTimeInput";
import { addTimes } from "@/utils/addTimes";
import { calcSecondsFromTime } from "@/utils/calcSecondsFromTime";

interface Props {
    value: string;              // obecna, docelowa wartość pola (np. form.driveTime)
    onChange: (newValue: string) => void;
    switchLabel: string;
    addLabel: string;
}

/**
 * Odpowiednik front `AddDurationSwitch`. Przełącznik „dopisz czas" — po włączeniu pokazuje dodatkowe
 * pole hh:mm; wpisany tam czas jest na bieżąco doliczany do wartości sprzed włączenia (nie do aktualnie
 * wyświetlanej, żeby kolejne znaki nie sumowały się same ze sobą). Wyłączenie przywraca wartość sprzed włączenia.
 */
export const AddDurationSwitch: React.FC<Props> = (props: Props): JSX.Element => {
    const [active, setActive] = useState<boolean>(false);
    const [base, setBase] = useState<string>('');
    const [addValue, setAddValue] = useState<string>('');

    const toggle = (on: boolean): void => {
        if (on) {
            setBase(props.value);
        } else if (base) {
            props.onChange(base);
        }
        setAddValue('');
        setActive(on);
    };

    const changeAddValue = (v: string): void => {
        setAddValue(v);
        props.onChange(addTimes(base, calcSecondsFromTime(v)));
    };

    return (
        <>
            <OnOffSwitch
                label={props.switchLabel}
                value={active ? 'true' : 'false'}
                onChange={(e) => toggle(e === 'true')}
            />
            {active &&
                <DriveTimeInput
                    value={addValue}
                    onChange={changeAddValue}
                    label={props.addLabel}
                    helperText=''
                />
            }
        </>
    );
};
