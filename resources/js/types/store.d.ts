export interface StoreData {
    id: number;
    name: string;
    user_id: number;
    email: string;
    country: string;
    phone: string;
    type: 'protected' | 'public';
    status: 'active' | 'inactive';
    payment_detail_id: number | null;
    plan_id: number;
    banner: StoreBanner;
    bio: string;
    logo: string;
    created_at: string;
    updated_at: string;
    password: string | null;
    store_key: string | null;
    [key: string]: unknown;
}

export interface StoreBanner {
    path: string;
}
