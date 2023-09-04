export interface Order {
  tokenIn: string;
  tokenOut: string;
  tokenAmount: number;
  price: number;
  feeAmount?: number;
}

export interface BuySellOrders {
  [key: string]: Order;
}

export interface PairOrderbook {
  [key: string]: BuySellOrders;
}

// export interface ChainOrderbook {
//   [key: string]: PairOrderbook;
// }

export interface OrderbookType {
  [key: string]: PairOrderbook;
}
