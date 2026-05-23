import { Vehicle } from '../models/Vehicle';
export interface FareBreakdown {
    vehicleType: string;
    displayName: string;
    baseFare: number;
    helpers: number;
    helpersCost: number;
    serviceFee: number;
    totalFare: number;
}
export declare class FareCalculatorService {
    private vehicleRepository;
    estimate(vehicleType: string, helpers: number): Promise<FareBreakdown>;
    getAllVehicles(): Promise<Vehicle[]>;
}
//# sourceMappingURL=FareCalculatorService.d.ts.map