import { User } from './User';
import { Driver } from './Driver';
import { Vehicle } from './Vehicle';
export declare class ShiftBooking {
    id: string;
    bookingId: string;
    user: User;
    userId: string;
    driver: Driver;
    driverId: string | null;
    vehicle: Vehicle;
    vehicleId: string;
    fromLocation: string;
    toLocation: string;
    moveDate: string;
    helpers: number;
    baseFare: number;
    helpersCost: number;
    serviceFee: number;
    totalFare: number;
    status: string;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=ShiftBooking.d.ts.map