import { Request, Response } from 'express';
export declare class RoomController {
    private roomRepository;
    private roomFacilityRepository;
    private roomImageRepository;
    createRoom(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getRooms(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getRoomById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getPopularAreas(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getRecommendedRooms(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateRoom(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteRoom(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    private formatRoomResponse;
    private formatRoomDetailResponse;
}
//# sourceMappingURL=RoomController.d.ts.map