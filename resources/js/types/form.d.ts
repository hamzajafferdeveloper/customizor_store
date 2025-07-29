export type CategoryForm = {
    name: string;
};

export type ColorForm = {
    name: string;
    hexCode: string;
};

export type ProductForm = {
  title: string;
  sku: string;
  image: File | null;
  type: string ;
  sizes: string[];
  materials: string[];
  colors: number[]; // assuming you're storing selected color IDs (not names)
  categories_id: number | null;
  price: string;
};

export type EditProductForm = {
  title: string;
  sku: string;
  type: string ;
  sizes: string[];
  materials: string[];
  colors: number[]; // assuming you're storing selected color IDs (not names)
  categories_id: number | null;
};

export type LogoForm = {
    category_id: number;
    name: string;
    source: string | blob;
}
