import type { productColors, Template } from './helper';

export interface Category {
    id: number;
    name: string;
    slug_short: string;
    own_product_image: CreateOwnProductType;
    created_at: string;
    updated_at: string;
}

export interface Color {
    id: number;
    name: string;
    hexCode: string;
    color_type: 'protection' | 'leather';
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: number;
    title: string;
    user_id: number;
    image: string;
    sku: string;
    slug: string;
    type: string;
    sizes: string[];
    materials: string[];
    product_colors: productColors[];
    template: Template;
    categories_id: number;
    price: string;
    price_type: 'physical' | 'digital';
    store_id: number;
}

export interface LogoGallery {
    id: number;
    category_id: number;
    name: string;
    source: string;
    created_at: string;
    updated_at: string;
}

export interface LogoCategory {
    id: number;
    name: string;
    logos: LogoGallery[];
    created_at: string;
    updated_at: string;
}

export interface AllowedPermission {
    permissions: Permission[];
    fonts: Font[];
}

export interface Permission {
    id: number;
    key: string;
    pivot: any;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface Plan {
    id: number;
    name: string;
    description: string;
    price: string;
    billing_cycle: string; // e.g., monthly, yearly
    features: string; // JSON or text field for features
    created_at: string;
    updated_at: string;
    permissions: Permission[]; // Array of permissions associated with the plan
}

export interface Font {
    id: number;
    name: string;
    path: string;
    created_at: string;
    updated_at: string;
}

export interface PartCategroyWithPart {
    id: number;
    name: string;
    parts: Part[]
    created_at: string;
    updated_at: string;
}

export interface Part {
    id: number;
    name: string;
    path: string;
    parts_category_id: number;
    created_at: string;
    updated_at: string;
}


export interface CreateOwnProductType {
    id: number;
    category_id: number;
    image: string;
    category? : Category
    created_at: string;
    updated_at: string;
}
