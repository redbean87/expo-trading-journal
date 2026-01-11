export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class StorageError extends AppError {
  constructor(
    message: string,
    public operation: 'read' | 'write' | 'delete'
  ) {
    super(message, 'STORAGE_ERROR', true);
    this.name = 'StorageError';
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message, 'VALIDATION_ERROR', true);
    this.name = 'ValidationError';
  }
}

export function logError(error: unknown, context?: string): void {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` [${context}]` : '';

  if (error instanceof AppError) {
    console.error(
      `[${timestamp}]${contextStr} ${error.name} (${error.code}): ${error.message}`
    );
  } else if (error instanceof Error) {
    console.error(
      `[${timestamp}]${contextStr} ${error.name}: ${error.message}`
    );
    if (error.stack) {
      console.error(error.stack);
    }
  } else {
    console.error(`[${timestamp}]${contextStr} Unknown error:`, error);
  }
}

export async function safeAsync<T>(
  fn: () => Promise<T>,
  context?: string
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    logError(error, context);
    return null;
  }
}

export function getUserMessage(error: unknown): string {
  if (error instanceof ValidationError) {
    return error.message;
  }

  if (error instanceof StorageError) {
    switch (error.operation) {
      case 'read':
        return 'Failed to load data. Please try again.';
      case 'write':
        return 'Failed to save data. Please try again.';
      case 'delete':
        return 'Failed to delete data. Please try again.';
    }
  }

  if (error instanceof AppError) {
    return error.recoverable
      ? 'Something went wrong. Please try again.'
      : 'A critical error occurred. Please restart the app.';
  }

  return 'An unexpected error occurred.';
}
