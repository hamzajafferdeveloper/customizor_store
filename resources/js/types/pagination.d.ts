import { User } from '.';
import { Category, Color, Font, LogoGallery, Part, Product } from './data';

export interface BasePagination {
    current_page: number;
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

export interface CategoryPagination implements BasePagination {
    data: Category[];
}

export interface ColorPagination implements BasePagination {
    data: Color[];
}

export interface ProductPagination implements BasePagination {
    data: Product[];
}

export interface LogoGalleryPagination implements BasePagination {
    data: LogoGallery[];
}

export interface UserPagination implements BasePagination {
    data: User[];
}

export interface FontPagination implements BasePagination {
    data: Font[];
}

export interface PartPagination implements BasePagination {
    data: Part[];
}

export interface CreateOwnProductPagination implements BasePagination {
    data: CreateOwnProductType[];
}
