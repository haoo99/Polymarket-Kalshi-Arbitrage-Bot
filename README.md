# Polymarket-Kalshi Arbitrage Bot

This is an arbitrage trading bot that exploits price differences between Polymarket and Kalshi prediction markets for 15-minute BTC markets.
The bot is built with TypeScript and operates on a core principle: when the sum of UP and DOWN token prices across both platforms is below a configurable threshold (default 90), there exists a profitable arbitrage opportunity.

**How It Works:**
The bot continuously scans matched 15-minute BTC markets on both platforms. When it detects that `polymarket_up_price + kalshi_down_price < take_profit` or `polymarket_down_price + kalshi_up_price < take_profit`, it evaluates the opportunity using betted prices to determine the optimal trading direction. The bot then executes simultaneous trades on both platforms and automatically redeems winning positions after market resolution.

**Key Features:**
- Real-time price monitoring with configurable scan intervals
- Intelligent arbitrage detection using betted price analysis
- Simultaneous trade execution on both platforms
- Automatic position tracking and redemption
- Risk management with configurable trade size limits
- Comprehensive error handling and logging

If you want, I can offer full version and can develop customized advanced project[Advantage: Betted price analysis, simultaneous execution, automatic redemption, risk management, TypeScript language].




## Advanced Version
In arbitrage trading bot, there are two main things: 
one is accurately matching markets between platforms and other one is making correct trading decisions based on betted prices.
In the basic version, market matching is done by simple time comparison and trading decisions are based only on price sums. But with the advanced version, I am using sophisticated market matching algorithms that consider market titles, underlying assets, and expiration times. The advanced version also implements intelligent betted price analysis to determine optimal trade directions, handles edge cases where betted prices are unavailable, and includes position validation to prevent duplicate trades. The bot uses parallel API calls for faster price fetching and implements retry logic with exponential backoff for robust error handling. Of course, it needs more development time because it needs to handle market synchronization, price validation, and complex decision trees, but otherwise using basic matching and simple price comparison is too easy for development and understanding.




---

## Directory Structure

```
src/
├── clients/
│   ├── polymarket.ts    # Polymarket API client for market data and trading
│   └── kalshi.ts        # Kalshi API client for market data and trading
│
├── core/
│   ├── arbitrage.ts     # Arbitrage opportunity detection logic
│   ├── trader.ts        # Trade execution logic
│   ├── redeemer.ts      # Automatic redemption after market resolution
│   └── marketMatcher.ts # Matches markets between Polymarket and Kalshi
│
├── types/
│   └── market.ts        # TypeScript type definitions for market data
│
├── utils/
│   ├── logger.ts         # Structured logging utility
│   └── errors.ts         # Custom error classes
│
├── config/
│   └── config.ts         # Configuration management
│
└── index.ts              # Main bot entry point and orchestrator
```
---

    


### How To Run
1. Environment Variables Settings
Create `.env` file with your settings:
```plaintext
POLYMARKET_API_KEY=your_polymarket_api_key_here
POLYMARKET_API_URL=https://clob.polymarket.com
KALSHI_API_KEY=your_kalshi_api_key_here
KALSHI_API_URL=https://trading-api.kalshi.com/trade-api/v2
MIN_TRADE_AMOUNT=10
MAX_TRADE_AMOUNT=1000
TRADE_PERCENTAGE=0.1
AVAILABLE_BALANCE=1000
TAKE_PROFIT=90
SCAN_INTERVAL=5000
REDEEM_CHECK_INTERVAL=60000
```

2. Install dependencies:
   Run `npm install`

3. Build the project:
   Run `npm run build`

4. Run the bot:
   Run `npm start` or `npm run dev` for development mode



### Bot Workflow
#### Price Monitoring
* Continuously monitors UP and DOWN token prices on both Polymarket and Kalshi
* Matches 15-minute BTC markets between platforms based on end times
* Updates prices every 5 seconds (configurable)

#### Arbitrage Detection
* Detects opportunities when: poly_up_price + kalshi_down_price < take_profit (configurable, default 90)
* Detects opportunities when: poly_down_price + kalshi_up_price < take_profit (configurable, default 90)
* Calculates profit potential for each opportunity
* Applies business logic to determine if trade should proceed or skip

#### Trade Execution
* Executes trades when profitable opportunities are detected
* Manages position sizes based on available balance and risk settings
* Tracks all active positions across both platforms

#### Automatic Redemption
* Monitors market resolution status every minute
* Automatically redeems winning tokens after markets resolve
* Updates position status to 'redeemed' after successful redemption



### Arbitrage Logic
#### When Both Cases Match
If both `poly_up + kalshi_down < take_profit` and `poly_down + kalshi_up < take_profit`:
- Compare betted prices between platforms
- If kalshi_betted > poly_betted: Buy Kalshi DOWN + Polymarket UP
- If kalshi_betted < poly_betted: Buy Kalshi UP + Polymarket DOWN
- This handles cases where final price falls between the two betted prices

#### When Only One Case Matches
**Case 1: poly_up + kalshi_down < take_profit**
- If poly_betted < kalshi_betted: Proceed with trade
- If poly_betted >= kalshi_betted: Skip (risk of loss)

**Case 2: poly_down + kalshi_up < take_profit**
- If poly_betted > kalshi_betted: Proceed with trade
- If poly_betted <= kalshi_betted: Skip (risk of loss)

This logic ensures trades only execute when there's a high probability of profit based on the betted prices.



### Test results
#### Arbitrage Execution
* Bot successfully detects arbitrage opportunities in real-time
* Executes trades on both platforms simultaneously
* Tracks positions and calculates expected profits
* Automatically redeems positions after market resolution



### Contact Information
- Telegram: https://t.me/DevCutup
- Whatsapp: https://wa.me/13137423660
- Twitter: https://x.com/devcutup
