import { User } from '.';
import { Category, Color, Font, LogoGallery, Part, Product } from './data';

export interface CategoryPagination {
    current_page: number;
    data: Category[];
    first_page_url: string;
    from: number;
    last_page: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export interface ColorPagination {
    current_page: number;
    data: Color[];
    first_page_url: string;
    from: number;
    last_page: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export interface ProductPagination {
    current_page: number;
    data: Product[];
    first_page_url: string;
    from: number;
    last_page: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export interface LogoGalleryPagination {
    current_page: number;
    data: LogoGallery[];
    first_page_url: string;
    from: number;
    last_page: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export interface UserPagination {
    current_page: number;
    data: User[];
    first_page_url: string;
    from: number;
    last_page: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export interface FontPagination {
    current_page: number;
    data: Font[];
    first_page_url: string;
    from: number;
    last_page: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export interface PartPagination {
    current_page: number;
    data: Part[];
    first_page_url: string;
    from: number;
    last_page: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}
