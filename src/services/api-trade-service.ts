import { ConvexReactClient } from 'convex/react';

import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { Trade } from '../types';

/**
 * Backend service using Convex
 * Can be swapped out for Firebase, Supabase, or custom API later
 */
export const createApiTradeService = (client: ConvexReactClient) => ({
  async getTrades(): Promise<Trade[]> {
    const trades = await client.query(api.trades.getTrades, {});

    return (
      trades?.map((trade) => ({
        id: trade.id,
        symbol: trade.symbol,
        entryPrice: trade.entryPrice,
        exitPrice: trade.exitPrice,
        quantity: trade.quantity,
        entryTime: new Date(trade.entryTime),
        exitTime: new Date(trade.exitTime),
        side: trade.side as 'long' | 'short',
        pnl: trade.pnl,
        pnlPercent: trade.pnlPercent,
        fees: trade.fees,
        commissions: trade.commissions,
        notes: trade.notes,
        strategy: trade.strategy,
        psychology: trade.psychology,
        whatWorked: trade.whatWorked,
        whatFailed: trade.whatFailed,
        confidence: trade.confidence,
        ruleViolation: trade.ruleViolation,
        importedFrom: trade.importedFrom as Trade['importedFrom'],
        importId: trade.importId,
        orderType: trade.orderType,
        accountBalanceAfter: trade.accountBalanceAfter,
      })) ?? []
    );
  },

  async addTrade(trade: Trade): Promise<Trade> {
    const result = await client.mutation(api.trades.addTrade, {
      symbol: trade.symbol,
      entryPrice: trade.entryPrice,
      exitPrice: trade.exitPrice,
      quantity: trade.quantity,
      entryTime: trade.entryTime.getTime(),
      exitTime: trade.exitTime.getTime(),
      side: trade.side,
      pnl: trade.pnl,
      pnlPercent: trade.pnlPercent,
      fees: trade.fees,
      commissions: trade.commissions,
      notes: trade.notes,
      strategy: trade.strategy,
      psychology: trade.psychology,
      whatWorked: trade.whatWorked,
      whatFailed: trade.whatFailed,
      confidence: trade.confidence,
      ruleViolation: trade.ruleViolation,
      importId: trade.importId,
      orderType: trade.orderType,
      accountBalanceAfter: trade.accountBalanceAfter,
    });

    return {
      ...trade,
      id: result.id,
    };
  },

  async updateTrade(id: string, updates: Partial<Trade>): Promise<Trade> {
    const result = await client.mutation(api.trades.updateTrade, {
      id: id as Id<'trades'>,
      symbol: updates.symbol,
      entryPrice: updates.entryPrice,
      exitPrice: updates.exitPrice,
      quantity: updates.quantity,
      entryTime: updates.entryTime?.getTime(),
      exitTime: updates.exitTime?.getTime(),
      side: updates.side,
      pnl: updates.pnl,
      pnlPercent: updates.pnlPercent,
      fees: updates.fees,
      commissions: updates.commissions,
      notes: updates.notes,
      strategy: updates.strategy,
      psychology: updates.psychology,
      whatWorked: updates.whatWorked,
      whatFailed: updates.whatFailed,
      confidence: updates.confidence,
      ruleViolation: updates.ruleViolation,
      orderType: updates.orderType,
      accountBalanceAfter: updates.accountBalanceAfter,
    });

    return {
      id: result.id,
      symbol: result.symbol,
      entryPrice: result.entryPrice,
      exitPrice: result.exitPrice,
      quantity: result.quantity,
      entryTime: new Date(result.entryTime),
      exitTime: new Date(result.exitTime),
      side: result.side as 'long' | 'short',
      pnl: result.pnl,
      pnlPercent: result.pnlPercent,
      fees: result.fees,
      commissions: result.commissions,
      notes: result.notes,
      strategy: result.strategy,
      psychology: result.psychology,
      whatWorked: result.whatWorked,
      whatFailed: result.whatFailed,
      confidence: result.confidence,
      ruleViolation: result.ruleViolation,
      importId: result.importId,
      orderType: result.orderType,
      accountBalanceAfter: result.accountBalanceAfter,
    };
  },

  async deleteTrade(id: string): Promise<void> {
    await client.mutation(api.trades.deleteTrade, {
      id: id as Id<'trades'>,
    });
  },

  async clearAllTrades(): Promise<void> {
    await client.mutation(api.trades.clearAllTrades, {});
  },

  async importTrades(
    trades: Trade[]
  ): Promise<{ imported: number; skipped: number }> {
    const result = await client.mutation(api.trades.importTrades, {
      trades: trades.map((trade) => ({
        symbol: trade.symbol,
        entryPrice: trade.entryPrice,
        exitPrice: trade.exitPrice,
        quantity: trade.quantity,
        entryTime: trade.entryTime.getTime(),
        exitTime: trade.exitTime.getTime(),
        side: trade.side,
        pnl: trade.pnl,
        pnlPercent: trade.pnlPercent,
        fees: trade.fees,
        commissions: trade.commissions,
        notes: trade.notes,
        strategy: trade.strategy,
        psychology: trade.psychology,
        whatWorked: trade.whatWorked,
        whatFailed: trade.whatFailed,
        confidence: trade.confidence,
        ruleViolation: trade.ruleViolation,
        importedFrom: trade.importedFrom,
        importId: trade.importId,
        orderType: trade.orderType,
        accountBalanceAfter: trade.accountBalanceAfter,
      })),
    });

    return result as { imported: number; skipped: number };
  },
});
