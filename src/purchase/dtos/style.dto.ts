import { StyleColorDto } from './styleColor.dto';
import { StyleDetails } from './styleDetailsEntity.dto';

export class StyleDto {
    id: number;
    code: string;
    profileJdaCode: string;
    brand: string;
    brandId: number;
    brandCode: string;
    brandJdaCode: string;
    articleType: string;
    seasonProduct: string;
    seasonProductJda: string;
    classType: string;
    classTypeCode: string;
    subDepartment: string;
    department: string;
    departmentId: number;
    departmentCode: string;
    division: string;
    divisionMaster: number;
    styleColorCount: number;
    colors: StyleColorDto[];
    createDate: Date;
    details: StyleDetails;
}
