import { Request, Response } from 'express';
export declare class ShiftController {
    private shiftRepository;
    createShift(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getAllShifts(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getShiftById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateShift(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteShift(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=ShiftController.d.ts.map