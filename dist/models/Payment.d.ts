import { User } from './User';
export declare class Payment {
    id: string;
    user: User;
    userId: string;
    bookingRef: string;
    bookingType: string;
    amount: number;
    method: string;
    status: string;
    gatewayRef: string;
    gatewayResponse: object;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=Payment.d.ts.map