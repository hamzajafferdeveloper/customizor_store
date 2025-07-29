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
    bio: string;
    logo: string;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
}
