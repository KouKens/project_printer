export declare const TonerAction: {
    readonly REGISTER: "REGISTER";
    readonly RECEIVE: "RECEIVE";
    readonly ISSUE: "ISSUE";
    readonly DISPOSE: "DISPOSE";
};
export type TonerAction = (typeof TonerAction)[keyof typeof TonerAction];
export declare const SnmpVersion: {
    readonly V1: "V1";
    readonly V2C: "V2C";
};
export type SnmpVersion = (typeof SnmpVersion)[keyof typeof SnmpVersion];
export declare const OrderStatus: {
    readonly PENDING: "PENDING";
    readonly RECEIVED: "RECEIVED";
    readonly CANCELED: "CANCELED";
};
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
