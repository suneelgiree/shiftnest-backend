import { Response } from 'express';
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: any;
    timestamp: string;
}
export declare const sendResponse: <T>(res: Response, statusCode: number, message: string, data?: T, error?: any) => Response;
export declare const sendSuccess: <T>(res: Response, message: string, data?: T, statusCode?: number) => Response;
export declare const sendError: (res: Response, message: string, statusCode?: number, error?: any) => Response;
//# sourceMappingURL=response.d.ts.map