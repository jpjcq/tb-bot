export interface Order {
  tokenInSymbol: string;
  tokenOutSymbol: string;
  tokenAmount: number;
  price: number;
  feeAmount?: number;
}

export interface ChainOrderbook {
  [key: string]: Order;
}

export interface OrderbookType {
  [key: string]: ChainOrderbook;
}
