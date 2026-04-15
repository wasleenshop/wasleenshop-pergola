export type Maybe<T> = T | null;

export interface Connection<T> {
  edges: Array<Edge<T>>;
  pageInfo: PageInfo;
}

export interface Edge<T> {
  node: T;
  cursor: string;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

export interface Image {
  url: string;
  altText: string;
  width: number;
  height: number;
}

export interface MoneyV2 {
  amount: string;
  currencyCode: string;
}

export interface Metafield {
  id: string;
  namespace: string;
  key: string;
  value: string;
  type: string;
}

export interface SEO {
  title: string;
  description: string;
}

export interface CustomAttribute {
  key: string;
  value: string;
}
