import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from './types';

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateFormat = (format: string): format is 'png' | 'svg' => {
  return format === 'png' || format === 'svg';
};

export const validateSize = (size: number): boolean => {
  return !isNaN(size) && size >= 100 && size <= 1000;
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const createErrorResponse = (error: string, message: string): ErrorResponse => {
  return { error, message };
};
