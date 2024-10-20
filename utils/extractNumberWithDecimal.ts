import { REG_EXP } from "@/constants/REG_EXP";

export const extractNumberWithDecimal = (string: string): string => {
    const match = string.replace(',', '.').match(REG_EXP.amount);
    return match ? match[0] : '';
}