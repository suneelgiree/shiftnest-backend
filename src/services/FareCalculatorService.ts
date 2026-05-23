import { AppDataSource } from '../database/data-source';
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

export class FareCalculatorService {
  private vehicleRepository = AppDataSource.getRepository(Vehicle);

  async estimate(vehicleType: string, helpers: number): Promise<FareBreakdown> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { vehicleType: vehicleType.toUpperCase(), isActive: true },
    });

    if (!vehicle) {
      throw new Error(`Vehicle type '${vehicleType}' not found`);
    }

    const baseFare = Number(vehicle.baseFare);
    const helperRate = Number(vehicle.helperRate);
    const serviceFee = Number(vehicle.serviceFee);
    const helpersCost = helpers * helperRate;
    const totalFare = baseFare + helpersCost + serviceFee;

    return {
      vehicleType: vehicle.vehicleType,
      displayName: vehicle.displayName,
      baseFare,
      helpers,
      helpersCost,
      serviceFee,
      totalFare,
    };
  }

  async getAllVehicles() {
    return this.vehicleRepository.find({ where: { isActive: true } });
  }
}
