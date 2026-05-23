"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FareCalculatorService = void 0;
const data_source_1 = require("../database/data-source");
const Vehicle_1 = require("../models/Vehicle");
class FareCalculatorService {
    constructor() {
        this.vehicleRepository = data_source_1.AppDataSource.getRepository(Vehicle_1.Vehicle);
    }
    async estimate(vehicleType, helpers) {
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
exports.FareCalculatorService = FareCalculatorService;
//# sourceMappingURL=FareCalculatorService.js.map