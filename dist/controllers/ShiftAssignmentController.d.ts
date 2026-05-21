import { Request, Response } from 'express';
export declare class ShiftAssignmentController {
    private assignmentRepository;
    assignShift(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getAllAssignments(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getAssignmentById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateAssignmentStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getAssignmentsByUser(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    cancelAssignment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=ShiftAssignmentController.d.ts.map