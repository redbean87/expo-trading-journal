import {
  tradeFormSchema,
  tradeSchema,
  storedTradesArraySchema,
  calculatePnl,
  formDataToTrade,
} from '../trade';

describe('tradeFormSchema', () => {
  const validFormData = {
    symbol: 'AAPL',
    entryPrice: '150.00',
    exitPrice: '160.00',
    quantity: '10',
    entryTime: new Date('2024-01-01'),
    exitTime: new Date('2024-01-02'),
    side: 'long' as const,
  };

  it('should validate correct form data', () => {
    const result = tradeFormSchema.safeParse(validFormData);
    expect(result.success).toBe(true);
  });

  it('should reject empty symbol', () => {
    const result = tradeFormSchema.safeParse({ ...validFormData, symbol: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Symbol is required');
    }
  });

  it('should reject symbol over 10 characters', () => {
    const result = tradeFormSchema.safeParse({
      ...validFormData,
      symbol: 'VERYLONGSYMBOL',
    });
    expect(result.success).toBe(false);
  });

  it('should reject negative entry price', () => {
    const result = tradeFormSchema.safeParse({
      ...validFormData,
      entryPrice: '-10',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Entry price must be a positive number'
      );
    }
  });

  it('should reject zero quantity', () => {
    const result = tradeFormSchema.safeParse({
      ...validFormData,
      quantity: '0',
    });
    expect(result.success).toBe(false);
  });

  it('should reject non-numeric price', () => {
    const result = tradeFormSchema.safeParse({
      ...validFormData,
      entryPrice: 'abc',
    });
    expect(result.success).toBe(false);
  });

  it('should reject exit time before entry time', () => {
    const result = tradeFormSchema.safeParse({
      ...validFormData,
      entryTime: new Date('2024-01-02'),
      exitTime: new Date('2024-01-01'),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Exit time must be after entry time'
      );
    }
  });

  it('should accept optional strategy and notes', () => {
    const result = tradeFormSchema.safeParse({
      ...validFormData,
      strategy: 'Momentum',
      notes: 'Good setup',
    });
    expect(result.success).toBe(true);
  });

  it('should reject strategy over 50 characters', () => {
    const result = tradeFormSchema.safeParse({
      ...validFormData,
      strategy: 'A'.repeat(51),
    });
    expect(result.success).toBe(false);
  });
});

describe('tradeSchema', () => {
  const validTrade = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    symbol: 'AAPL',
    entryPrice: 150,
    exitPrice: 160,
    quantity: 10,
    entryTime: new Date('2024-01-01'),
    exitTime: new Date('2024-01-02'),
    side: 'long' as const,
    pnl: 100,
    pnlPercent: 6.67,
  };

  it('should validate correct trade', () => {
    const result = tradeSchema.safeParse(validTrade);
    expect(result.success).toBe(true);
  });

  it('should reject invalid UUID', () => {
    const result = tradeSchema.safeParse({ ...validTrade, id: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });

  it('should uppercase symbol', () => {
    const result = tradeSchema.safeParse({ ...validTrade, symbol: 'aapl' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.symbol).toBe('AAPL');
    }
  });
});

describe('storedTradesArraySchema', () => {
  it('should parse trades with date strings', () => {
    const storedData = [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        symbol: 'AAPL',
        entryPrice: 150,
        exitPrice: 160,
        quantity: 10,
        entryTime: '2024-01-01T00:00:00.000Z',
        exitTime: '2024-01-02T00:00:00.000Z',
        side: 'long',
        pnl: 100,
        pnlPercent: 6.67,
      },
    ];

    const result = storedTradesArraySchema.safeParse(storedData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0].entryTime).toBeInstanceOf(Date);
      expect(result.data[0].exitTime).toBeInstanceOf(Date);
    }
  });
});

describe('calculatePnl', () => {
  it('should calculate profit for long position', () => {
    const { pnl, pnlPercent } = calculatePnl(100, 110, 10, 'long');
    expect(pnl).toBe(100);
    expect(pnlPercent).toBe(10);
  });

  it('should calculate loss for long position', () => {
    const { pnl, pnlPercent } = calculatePnl(100, 90, 10, 'long');
    expect(pnl).toBe(-100);
    expect(pnlPercent).toBe(-10);
  });

  it('should calculate profit for short position', () => {
    const { pnl, pnlPercent } = calculatePnl(100, 90, 10, 'short');
    expect(pnl).toBe(100);
    expect(pnlPercent).toBe(10);
  });

  it('should calculate loss for short position', () => {
    const { pnl, pnlPercent } = calculatePnl(100, 110, 10, 'short');
    expect(pnl).toBe(-100);
    expect(pnlPercent).toBe(-10);
  });

  it('should handle floating-point precision correctly', () => {
    // This would fail with native JS: 0.1 + 0.2 !== 0.3
    const { pnl, pnlPercent } = calculatePnl(10.1, 10.3, 100, 'long');
    expect(pnl).toBe(20); // (10.3 - 10.1) * 100 = 20
    expect(pnlPercent).toBe(1.98); // ((10.3 - 10.1) / 10.1) * 100
  });

  it('should handle 3 decimal place prices', () => {
    const { pnl, pnlPercent } = calculatePnl(1.234, 1.567, 1000, 'long');
    expect(pnl).toBe(333); // (1.567 - 1.234) * 1000 = 333
    expect(pnlPercent).toBe(26.985); // ((1.567 - 1.234) / 1.234) * 100
  });

  it('should deduct fees from pnl', () => {
    const { pnl, pnlPercent } = calculatePnl(100, 110, 10, 'long', 5);
    expect(pnl).toBe(95); // (110 - 100) * 10 - 5 = 95
    expect(pnlPercent).toBe(9.5); // 95 / (100 * 10) * 100
  });

  it('should produce same result as no-fees when fees is 0', () => {
    const withoutFees = calculatePnl(100, 110, 10, 'long');
    const withZeroFees = calculatePnl(100, 110, 10, 'long', 0);
    expect(withZeroFees.pnl).toBe(withoutFees.pnl);
    expect(withZeroFees.pnlPercent).toBe(withoutFees.pnlPercent);
  });

  it('should turn profit into loss when fees exceed gross gain', () => {
    const { pnl, pnlPercent } = calculatePnl(100, 101, 10, 'long', 20);
    expect(pnl).toBe(-10); // (101 - 100) * 10 - 20 = -10
    expect(pnlPercent).toBe(-1); // -10 / (100 * 10) * 100
  });

  it('should deduct commissions from pnl', () => {
    const { pnl, pnlPercent } = calculatePnl(100, 110, 10, 'long', 0, 3);
    expect(pnl).toBe(97); // (110 - 100) * 10 - 3 = 97
    expect(pnlPercent).toBe(9.7); // 97 / (100 * 10) * 100
  });

  it('should deduct both fees and commissions from pnl', () => {
    const { pnl } = calculatePnl(100, 110, 10, 'long', 5, 3);
    expect(pnl).toBe(92); // (110 - 100) * 10 - 5 - 3 = 92
  });
});

describe('formDataToTrade', () => {
  it('should transform form data to trade', () => {
    const formData = {
      symbol: 'aapl',
      entryPrice: '150',
      exitPrice: '160',
      quantity: '10',
      entryTime: new Date('2024-01-01'),
      exitTime: new Date('2024-01-02'),
      side: 'long' as const,
      strategy: 'Momentum',
    };

    const trade = formDataToTrade(
      formData,
      '550e8400-e29b-41d4-a716-446655440000'
    );

    expect(trade.symbol).toBe('AAPL');
    expect(trade.entryPrice).toBe(150);
    expect(trade.exitPrice).toBe(160);
    expect(trade.quantity).toBe(10);
    expect(trade.pnl).toBe(100);
    expect(trade.pnlPercent).toBeCloseTo(6.67, 1);
    expect(trade.strategy).toBe('Momentum');
  });

  it('should deduct fees from pnl when fees are provided', () => {
    const formData = {
      symbol: 'AAPL',
      entryPrice: '150',
      exitPrice: '160',
      quantity: '10',
      entryTime: new Date('2024-01-01'),
      exitTime: new Date('2024-01-02'),
      side: 'long' as const,
      fees: '0.25',
    };

    const trade = formDataToTrade(
      formData,
      '550e8400-e29b-41d4-a716-446655440000'
    );

    expect(trade.fees).toBe(0.25);
    expect(trade.pnl).toBe(99.75); // 100 - 0.25
    expect(trade.pnlPercent).toBeCloseTo(6.65, 1);
  });

  it('should not set fees when fees field is empty string', () => {
    const formData = {
      symbol: 'AAPL',
      entryPrice: '150',
      exitPrice: '160',
      quantity: '10',
      entryTime: new Date('2024-01-01'),
      exitTime: new Date('2024-01-02'),
      side: 'long' as const,
      fees: '',
    };

    const trade = formDataToTrade(
      formData,
      '550e8400-e29b-41d4-a716-446655440000'
    );

    expect(trade.fees).toBeUndefined();
    expect(trade.pnl).toBe(100);
  });
});
