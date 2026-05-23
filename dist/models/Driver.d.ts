import { User } from './User';
import { Vehicle } from './Vehicle';
import { ShiftBooking } from './ShiftBooking';
export declare class Driver {
    id: string;
    user: User;
    userId: string;
    vehicle: Vehicle;
    vehicleId: string;
    plateNumber: string;
    rating: number;
    totalRatings: number;
    isAvailable: boolean;
    currentLat: number;
    currentLng: number;
    shiftBookings: ShiftBooking[];
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=Driver.d.ts.map