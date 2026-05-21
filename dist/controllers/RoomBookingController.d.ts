import { Request, Response } from 'express';
export declare class RoomBookingController {
    private roomBookingRepository;
    private roomRepository;
    private generateBookingId;
    bookRoom(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getMyBookings(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getBookingById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    cancelBooking(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=RoomBookingController.d.ts.map