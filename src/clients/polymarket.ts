/**
 * Polymarket API Client
 * Handles fetching market data and executing trades on Polymarket
 */

import axios, { AxiosInstance } from 'axios';
import { MarketPrice, Trade } from '../types/market';

export class PolymarketClient {
  private api: AxiosInstance;
  private apiKey?: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
    this.baseUrl = process.env.POLYMARKET_API_URL || 'https://clob.polymarket.com';
    
    this.api = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
      },
      timeout: 10000,
    });
  }

  /**
   * Fetches current market prices for a specific market
   */
  async getMarketPrices(marketId: string): Promise<MarketPrice> {
    try {
      // Fetch order book for the market
      const response = await this.api.get(`/markets/${marketId}/book`);
      const book = response.data;

      // Calculate best bid/ask prices
      const upBids = book.bids?.filter((b: any) => b.outcome === 'YES') || [];
      const upAsks = book.asks?.filter((a: any) => a.outcome === 'YES') || [];
      const downBids = book.bids?.filter((b: any) => b.outcome === 'NO') || [];
      const downAsks = book.asks?.filter((a: any) => a.outcome === 'NO') || [];

      // Get best prices (highest bid, lowest ask)
      const upPrice = upAsks.length > 0 ? parseFloat(upAsks[0].price) * 100 : 50;
      const downPrice = downAsks.length > 0 ? parseFloat(downAsks[0].price) * 100 : 50;

      // Get betted price if market is resolved
      const bettedPrice = book.bettedPrice ? parseFloat(book.bettedPrice) * 100 : undefined;

      return {
        upPrice,
        downPrice,
        bettedPrice,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error(`[Polymarket] Error fetching market ${marketId}:`, error);
      throw error;
    }
  }

  /**
   * Fetches all active 15-minute BTC markets
   */
  async getActiveBTCMarkets(): Promise<any[]> {
    try {
      const response = await this.api.get('/markets', {
        params: {
          active: true,
          token: 'BTC',
          duration: '15m',
        },
      });
      return response.data || [];
    } catch (error) {
      console.error('[Polymarket] Error fetching BTC markets:', error);
      throw error;
    }
  }

  /**
   * Places a buy order on Polymarket
   */
  async buyToken(marketId: string, outcome: 'YES' | 'NO', amount: number, maxPrice: number): Promise<Trade> {
    try {
      const response = await this.api.post('/orders', {
        market: marketId,
        outcome,
        side: 'buy',
        amount: amount.toString(),
        price: (maxPrice / 100).toString(), // Convert to 0-1 range
      });

      return {
        id: response.data.id,
        marketId,
        platform: 'polymarket',
        side: outcome === 'YES' ? 'up' : 'down',
        amount,
        price: maxPrice,
        timestamp: Date.now(),
        status: 'pending',
        txHash: response.data.txHash,
      };
    } catch (error) {
      console.error(`[Polymarket] Error buying token:`, error);
      throw error;
    }
  }

  /**
   * Checks if a market is resolved and can be redeemed
   */
  async isMarketResolved(marketId: string): Promise<boolean> {
    try {
      const response = await this.api.get(`/markets/${marketId}`);
      return response.data.resolved || false;
    } catch (error) {
      console.error(`[Polymarket] Error checking market resolution:`, error);
      return false;
    }
  }

  /**
   * Redeems tokens after market resolution
   */
  async redeemTokens(marketId: string, outcome: 'YES' | 'NO'): Promise<boolean> {
    try {
      const response = await this.api.post(`/markets/${marketId}/redeem`, {
        outcome,
      });
      return response.data.success || false;
    } catch (error) {
      console.error(`[Polymarket] Error redeeming tokens:`, error);
      return false;
    }
  }

  /**
   * Gets current positions/balances
   */
  async getPositions(): Promise<any[]> {
    try {
      const response = await this.api.get('/positions');
      return response.data || [];
    } catch (error) {
      console.error('[Polymarket] Error fetching positions:', error);
      return [];
    }
  }
}
