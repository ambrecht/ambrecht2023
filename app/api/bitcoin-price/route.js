import { NextResponse } from 'next/server';

const SOURCES = [
  {
    url: 'https://api.coindesk.com/v1/bpi/currentprice/BTC.json',
    parse: (data) => data?.bpi?.USD?.rate_float,
  },
  {
    url: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
    parse: (data) => data?.bitcoin?.usd,
  },
  {
    url: 'https://api.coinbase.com/v2/prices/spot?currency=USD',
    parse: (data) => {
      const amount = data?.data?.amount;
      return amount ? Number(amount) : null;
    },
  },
  {
    url: 'https://blockchain.info/ticker',
    parse: (data) => data?.USD?.last,
  },
  {
    url: 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT',
    parse: (data) => {
      const price = data?.price;
      return price ? Number(price) : null;
    },
  },
];

export async function GET() {
  try {
    for (const source of SOURCES) {
      try {
        const response = await fetch(source.url, { cache: 'no-store' });
        if (!response.ok) {
          continue;
        }
        const data = await response.json();
        const price = source.parse(data);
        if (Number.isFinite(price)) {
          return NextResponse.json({ price });
        }
      } catch (error) {
        continue;
      }
    }
    return NextResponse.json({ price: null }, { status: 502 });
  } catch (error) {
    console.error('Failed to fetch BTC price', error);
    return NextResponse.json({ price: null }, { status: 500 });
  }
}
