import { Request, Response } from 'express';
export declare class AuthController {
    private userRepository;
    private signAccess;
    private signRefresh;
    register(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    login(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    refreshToken(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getMe(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateMe(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    changePassword(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=AuthController.d.ts.map