import type { productColors, Template } from './helper';

export interface Category {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface Color {
    id: number;
    name: string;
    hexCode: string;
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

export interface Permission {
    id: number;
    key: string;
    pivot: any
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
