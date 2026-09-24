import { LogEditData } from '../log';
import { serviceTypeEnum } from './ServiceEnums';

export interface ServiceEditData {
  id: number;
  logData: LogEditData;
  type: serviceTypeEnum;
  entry: string;
}
