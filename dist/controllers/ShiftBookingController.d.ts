import { Request, Response } from 'express';
export declare class ShiftBookingController {
    private shiftBookingRepo;
    private driverRepo;
    private vehicleRepo;
    private fareService;
    private generateBookingId;
    estimate(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    book(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getMyShifts(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getShiftById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    trackShift(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    cancelShift(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getVehicles(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    private formatShift;
}
//# sourceMappingURL=ShiftBookingController.d.ts.map