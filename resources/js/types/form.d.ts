export type CategoryForm = {
    name: string;
};

export type ColorForm = {
    name: string;
    hexCode: string;
    color_type: 'protection' | 'leather'
};

export type ProductForm = {
  title: string;
  sku: string;
  image: File | null;
  type: string ;
  sizes: string[];
  materials: string[];
  colors: number[];
  categories_id: number | null;
  price: number | string;
  price_type: 'physical' | 'digital';
};

export type EditProductForm = {
  title: string;
  sku: string;
  type: string ;
  sizes: string[];
  materials: string[];
  colors: number[];
  categories_id: number | null;
};

export type LogoForm = {
    category_id: number;
    name: string;
    source: string | blob;
}
