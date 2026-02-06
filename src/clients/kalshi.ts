/**
 * Kalshi API Client
 * Handles fetching market data and executing trades on Kalshi
 */

import axios, { AxiosInstance } from 'axios';
import { MarketPrice, Trade } from '../types/market';

export class KalshiClient {
  private api: AxiosInstance;
  private apiKey?: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
    this.baseUrl = process.env.KALSHI_API_URL || 'https://trading-api.kalshi.com/trade-api/v2';
    
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
      const response = await this.api.get(`/markets/${marketId}`);
      const market = response.data.market;

      // Extract prices from order book
      const yesBids = market.yes_bid || 0;
      const yesAsks = market.yes_ask || 0;
      const noBids = market.no_bid || 0;
      const noAsks = market.no_ask || 0;

      // Calculate prices (Kalshi uses 0-100 scale)
      const upPrice = yesAsks > 0 ? yesAsks : 50;
      const downPrice = noAsks > 0 ? noAsks : 50;

      // Get betted price if available
      const bettedPrice = market.betted_price ? market.betted_price : undefined;

      return {
        upPrice,
        downPrice,
        bettedPrice,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error(`[Kalshi] Error fetching market ${marketId}:`, error);
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
          status: 'open',
          ticker: 'BTC',
          series_ticker: 'BTC-15M',
        },
      });
      return response.data.markets || [];
    } catch (error) {
      console.error('[Kalshi] Error fetching BTC markets:', error);
      throw error;
    }
  }

  /**
   * Places a buy order on Kalshi
   */
  async buyToken(marketId: string, side: 'yes' | 'no', amount: number, maxPrice: number): Promise<Trade> {
    try {
      const response = await this.api.post('/portfolio/orders', {
        ticker: marketId,
        action: 'buy',
        side,
        count: amount,
        type: 'limit',
        yes_price: side === 'yes' ? maxPrice : undefined,
        no_price: side === 'no' ? maxPrice : undefined,
      });

      return {
        id: response.data.order_id,
        marketId,
        platform: 'kalshi',
        side: side === 'yes' ? 'up' : 'down',
        amount,
        price: maxPrice,
        timestamp: Date.now(),
        status: 'pending',
        txHash: response.data.order_id,
      };
    } catch (error) {
      console.error(`[Kalshi] Error buying token:`, error);
      throw error;
    }
  }

  /**
   * Checks if a market is resolved and can be redeemed
   */
  async isMarketResolved(marketId: string): Promise<boolean> {
    try {
      const response = await this.api.get(`/markets/${marketId}`);
      return response.data.market.status === 'resolved';
    } catch (error) {
      console.error(`[Kalshi] Error checking market resolution:`, error);
      return false;
    }
  }

  /**
   * Redeems tokens after market resolution
   */
  async redeemTokens(marketId: string, side: 'yes' | 'no'): Promise<boolean> {
    try {
      const response = await this.api.post(`/portfolio/settlements`, {
        ticker: marketId,
        side,
      });
      return response.data.success || false;
    } catch (error) {
      console.error(`[Kalshi] Error redeeming tokens:`, error);
      return false;
    }
  }

  /**
   * Gets current positions/balances
   */
  async getPositions(): Promise<any[]> {
    try {
      const response = await this.api.get('/portfolio/balance');
      return response.data.positions || [];
    } catch (error) {
      console.error('[Kalshi] Error fetching positions:', error);
      return [];
    }
  }
}
