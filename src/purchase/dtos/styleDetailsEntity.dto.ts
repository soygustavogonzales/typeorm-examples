import { SeasonSticker } from '../../entities/seasonSticker.entity';
import { Size } from '../../entities/size.entity';
import { Ratio } from '../../entities/ratio.entity';
import { Shipmethod } from '../../entities/shipmethod.entity';
import { Rse } from '../../entities/rse.entity';
import { PurchaseStyle } from '../../entities/purchaseStyle.entity';
import { Segment } from '../../entities/segment.entity';
import { Cso } from '../../entities/cso.entity';
import { OriginCountry } from '../../entities/originCountry.entity';
import { Provider } from '../../entities/provider.entity';
import { Packaging } from '../../entities/packaging.entity';
import { Category } from '../../entities/category.entity';
import { ExitPort } from '../../entities/exitPort.entity';
import { PurchaseStyleNegotiation } from '../../entities/purchaseStyleNegotiation.entity';

export class StyleDetails {
    id: number;
    atc: boolean;
    fob: number;
    fobReferencial: number;
    price: number;
    hanger: boolean;
    vstTag: boolean;
    merchandiser: string;
    productManager: string;
    brandManager: string;
    designer: string;
    negotiatior: string;
    techFile: boolean;
    sizeSpec: boolean;
    internetDescription: string;
    gauge: string;
    seasonSticker: SeasonSticker;
    size: Size;
    ratio: Ratio;
    shippingMethod: Shipmethod;
    collection: string;
    event: string;
    target: number;
    sato: number;
    additionalAccesory: string;
    composition: string;
    fabricWight: string;
    fabricConstruction: string;
    fabricWeaving: string;
    dollarChange: number;
    importFactor: number;
    cost: number;
    imu: number;
    rse: Rse;
    rseId: number;
    purchaseStyle: PurchaseStyle;
    purchaseStyleId: number;
    segment: Segment;
    referencialProvider: string;
    cso: Cso;
    provider: Provider;
    origin: OriginCountry;
    packingMethod: Packaging;
    packingMethodId: number;
    category: Category;
    exitPort: ExitPort;
    purchaseStyleNegotiation: PurchaseStyleNegotiation;
    createDate: Date;
    updateDate: Date;
    deleteDate: Date;
}
