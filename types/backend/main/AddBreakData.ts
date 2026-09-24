import { AddLogData } from './AddLogData';

export interface AddBreakData extends AddLogData {
  driveTime: string;
  slot: number;
  scenario: 'break' | 'changeSlot1' | 'changeSlot2';
}
