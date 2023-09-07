export interface Order {
  tokenIn: string;
  tokenOut: string;
  tokenAmount: number;
  price: number;
  defaultFeeAmount?: number;
}

export interface BuySellOrders {
  [key: string]: Order;
}

export interface PairOrderbook {
  [key: string]: BuySellOrders;
}

export interface OrderbookType {
  [key: string]: PairOrderbook;
}
