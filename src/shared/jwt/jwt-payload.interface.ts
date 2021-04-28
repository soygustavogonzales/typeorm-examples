export interface JwtPayload {
    id: number;
    email: string;
    roles: string[];
    features: string[];
    modules: string[];
}