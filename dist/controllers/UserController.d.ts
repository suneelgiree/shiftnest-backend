import { Request, Response } from 'express';
export declare class UserController {
    private userRepository;
    register(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    login(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getAllUsers(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getUserById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateUser(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteUser(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=UserController.d.ts.map