import {
  AppError,
  StorageError,
  ValidationError,
  getUserMessage,
  logError,
  safeAsync,
} from '../errors';

describe('AppError', () => {
  it('should create an error with code and recoverable flag', () => {
    const error = new AppError('Test error', 'TEST_CODE', false);

    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_CODE');
    expect(error.recoverable).toBe(false);
    expect(error.name).toBe('AppError');
  });

  it('should default to recoverable', () => {
    const error = new AppError('Test error', 'TEST_CODE');

    expect(error.recoverable).toBe(true);
  });
});

describe('StorageError', () => {
  it('should create a storage error with operation', () => {
    const error = new StorageError('Failed to read', 'read');

    expect(error.message).toBe('Failed to read');
    expect(error.operation).toBe('read');
    expect(error.code).toBe('STORAGE_ERROR');
    expect(error.name).toBe('StorageError');
  });
});

describe('ValidationError', () => {
  it('should create a validation error with field', () => {
    const error = new ValidationError('Invalid email', 'email');

    expect(error.message).toBe('Invalid email');
    expect(error.field).toBe('email');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.name).toBe('ValidationError');
  });
});

describe('logError', () => {
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

  beforeEach(() => {
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it('should log AppError with code', () => {
    const error = new AppError('Test', 'CODE');
    logError(error, 'TestContext');

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[TestContext] AppError (CODE): Test')
    );
  });

  it('should log regular Error', () => {
    const error = new Error('Regular error');
    logError(error);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error: Regular error')
    );
  });

  it('should log unknown errors', () => {
    logError('string error');

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Unknown error:'),
      'string error'
    );
  });
});

describe('safeAsync', () => {
  it('should return result on success', async () => {
    const result = await safeAsync(async () => 'success');

    expect(result).toBe('success');
  });

  it('should return null and log on error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const result = await safeAsync(async () => {
      throw new Error('Test error');
    }, 'TestContext');

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});

describe('getUserMessage', () => {
  it('should return validation error message directly', () => {
    const error = new ValidationError('Email is invalid');

    expect(getUserMessage(error)).toBe('Email is invalid');
  });

  it('should return friendly message for storage read error', () => {
    const error = new StorageError('ENOENT', 'read');

    expect(getUserMessage(error)).toBe(
      'Failed to load data. Please try again.'
    );
  });

  it('should return friendly message for storage write error', () => {
    const error = new StorageError('ENOSPC', 'write');

    expect(getUserMessage(error)).toBe(
      'Failed to save data. Please try again.'
    );
  });

  it('should return friendly message for storage delete error', () => {
    const error = new StorageError('EPERM', 'delete');

    expect(getUserMessage(error)).toBe(
      'Failed to delete data. Please try again.'
    );
  });

  it('should return generic message for recoverable AppError', () => {
    const error = new AppError('Internal', 'CODE', true);

    expect(getUserMessage(error)).toBe(
      'Something went wrong. Please try again.'
    );
  });

  it('should return critical message for non-recoverable AppError', () => {
    const error = new AppError('Fatal', 'CODE', false);

    expect(getUserMessage(error)).toBe(
      'A critical error occurred. Please restart the app.'
    );
  });

  it('should return generic message for unknown errors', () => {
    expect(getUserMessage(new Error('Unknown'))).toBe(
      'An unexpected error occurred.'
    );
    expect(getUserMessage('string')).toBe('An unexpected error occurred.');
  });
});
