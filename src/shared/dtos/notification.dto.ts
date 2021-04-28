import { NotificationTypeEnum } from '../enums/notificationType.enum';

export class NotificationDto {
  description: string;
  notificationType: NotificationTypeEnum;
  originUserId: number;
  creatorPurchaseUserId?: number;
  merchantUserId?: number;
  departmentsRelated?: string;
  tableListChanges?: any[];
}