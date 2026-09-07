import { serviceTypeEnum } from './ServiceEnums';
import { LogInterface } from '../log';

export interface ServiceInterface {
  id: number;
  userId: string;
  logId: number;
  logData?: LogInterface;
  type: serviceTypeEnum;
  vehicleId: number;
  entry: string;
}
