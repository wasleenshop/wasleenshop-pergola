import { Connection, Image, MoneyV2, Metafield, SEO, Maybe } from './shopify';

export interface ProductMetafields {
  ded_licensed?: boolean;
  made_in_uae?: boolean;
  installation_included?: boolean;
  warranty_years?: number;
  material?: string;
  dimensions?: string;
  features?: string[];
}

export interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  price: MoneyV2;
  compareAtPrice?: Maybe<MoneyV2>;
  image?: Maybe<Image>;
  metafields?: Metafield[];
}

export interface Product {
  id: string;
  handle: string;
  availableForSale: boolean;
  title: string;
  description: string;
  descriptionHtml: string;
  options: ProductOption[];
  priceRange: {
    maxVariantPrice: MoneyV2;
    minVariantPrice: MoneyV2;
  };
  variants: Connection<ProductVariant>;
  featuredImage: Maybe<Image>;
  images: Connection<Image>;
  seo: SEO;
  tags: string[];
  updatedAt: string;
  metafields: ProductMetafields;
}

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description: string;
  seo: SEO;
  updatedAt: string;
  products: Connection<Product>;
}

export interface CartLine {
  id: string;
  quantity: number;
  cost: {
    totalAmount: MoneyV2;
  };
  merchandise: ProductVariant & { product: Pick<Product, 'id' | 'handle' | 'title'> };
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  cost: {
    subtotalAmount: MoneyV2;
    totalAmount: MoneyV2;
    totalTaxAmount: MoneyV2;
  };
  lines: Connection<CartLine>;
  totalQuantity: number;
}
