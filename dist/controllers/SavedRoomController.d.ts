import { Request, Response } from 'express';
export declare class SavedRoomController {
    private savedRoomRepository;
    private roomRepository;
    saveRoom(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getSavedRooms(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    removeSavedRoom(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=SavedRoomController.d.ts.map