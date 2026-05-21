import { Response } from 'express';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
  timestamp: string;
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  error?: any
): Response => {
  return res.status(statusCode).json({
    success: statusCode < 400,
    message,
    data,
    error,
    timestamp: new Date().toISOString(),
  } as ApiResponse<T>);
};

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200
): Response => {
  return sendResponse(res, statusCode, message, data);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  error?: any
): Response => {
  return sendResponse(res, statusCode, message, undefined, error);
};
