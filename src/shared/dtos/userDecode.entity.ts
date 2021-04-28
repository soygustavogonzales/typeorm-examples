import { FeatureType } from '../enums/featureType.enum';

export class UserDecode {
    id: number;
    email: string;
    name: string;
    roles: Rol[];
    features: FeatureType[];
    modules: string[];

}

interface Rol {
    id: number, 
    name: string
}

// export class Role {
//     name: string;
//     features: Feature[];
// }

// export class Feature {
//     name: string;
//     code: string;
// }
