import { ApiProperty } from '@nestjs/swagger';
import { Ratio } from '../../entities/ratio.entity';

export class UpdateOrCreateSizeDto {

    @ApiProperty({
        description: 'Id',
        example: '',
    })
    id: number;

    @ApiProperty({
        description: 'Active',
        example: '',
    })
    active: boolean;

    @ApiProperty({
        description: 'Size',
        example: '',
    })
    size: string;

    @ApiProperty({
        description: 'Code',
        example: '',
    })
    code: string;

    @ApiProperty({
        description: 'Ratios',
        example: '',
    })
    ratios: Ratio[];

    /**
     *
     */
    constructor(data: any, ratios: Ratio[]) {
        this.id = data?.id;
        this.size = data?.size;
        this.active = data?.active;
        this.code = data?.code;
        this.ratios = ratios?.filter(ratio => ratio.ratio.split('-').length === this.size.split('-').length) || [];
    }


}
