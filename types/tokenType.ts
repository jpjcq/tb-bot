export interface TokenType {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
}

export type TokensType = {
  [key: string]: any;
};