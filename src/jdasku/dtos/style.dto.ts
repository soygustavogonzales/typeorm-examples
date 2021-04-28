import { StyleColorDto } from './styleColor.dto';
import { StyleDetails } from './styleDetails.dto';

export class StyleDto {
    id: number;
    code: string;
    codeNumber: string;
    brand: string;
    brandId: number;
    brandCode: string;
    brandJdaCode: string;
    articleType: string;
    cbm: number;
    dimension: string;
    seasonProduct: string;
    seasonProductJda: string;
    classType: string;
    classTypeId: number;
    classTypeCode: string;
    subDepartmentId: number;
    subDepartment: string;
    subDepartmentCode: string;
    department: string;
    departmentId: number;
    departmentCode: string;
    profileId: number;
    profile: string;
    profileJdaCode: string;
    divisionId: number;
    division: string;
    divisionMaster: number;
    styleColorCount: number;
    colors: StyleColorDto[];
    description: string;
    createDate: Date;
    details: StyleDetails;
}
