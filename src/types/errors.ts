export type ErrorCode = 
  | 'GENERATION_FAILED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INSUFFICIENT_CREDITS'
  | 'INVALID_API_KEY'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'VALIDATION_ERROR';

export type AppError = {
  code: ErrorCode;
  message: string;
  status?: number;
  details?: {
    detail?: string;
    [key: string]: any;
  };
};

export function handleError(error: unknown): never {
  const baseError = error instanceof Error ? error : new Error('Unknown error');
  const apiError = error as { status?: number; body?: { detail?: string } };
  
  const appError: AppError = {
    code: 'GENERATION_FAILED',
    message: baseError.message,
    status: apiError.status,
    details: apiError.body
  };

  // Determine error type and set appropriate code
  if (apiError.status === 429) {
    appError.code = 'RATE_LIMIT_EXCEEDED';
  } else if (apiError.status === 402) {
    appError.code = 'INSUFFICIENT_CREDITS';
  } else if (apiError.status === 401) {
    appError.code = 'INVALID_API_KEY';
  } else if (apiError.status && apiError.status >= 500) {
    appError.code = 'SERVER_ERROR';
  } else if (error instanceof TypeError && error.message.includes('network')) {
    appError.code = 'NETWORK_ERROR';
  }

  // Log the error for debugging
  console.error('Error details:', {
    code: appError.code,
    message: appError.message,
    status: appError.status,
    details: appError.details,
  });

  throw appError;
} 