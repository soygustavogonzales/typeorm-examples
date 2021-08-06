export class ResponseApi<T> {
    status: number;
    data: T;
    message?:any;
}