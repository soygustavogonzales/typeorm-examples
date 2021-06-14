import { UserDecode } from '../../shared/dtos/userDecode.entity';
import { CleanSkuRuleCause } from '../../shared/enums/cleanSkuRuleCause.enum';

export class CleanSkuDto {
    styles: number[];
    cleanCause: CleanSkuRuleCause;
    user: UserDecode;
}