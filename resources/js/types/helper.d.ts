import { Color } from "./data";

export type productColors = {
    id: number;
    product_id: number;
    color_id: number;
    created_at: string;
    updated_at: string;
    color: Color;
}

export type TemplatePart = {
    id: number;
    part_id: string[];
    template_id: number;
    name: string;
    type: 'protection' | 'leather';
    color: string;
    is_group: boolean;
    created_at: string;
    updated_at: string;
}

export type Template = {
    id: number;
    name: string;
    template: string;
    product_id: number;
    created_at: string;
    updated_at: string;
    part: TemplatePart[];
}

export type ColorOption = {
  name: string;
  code: string;
};

export type SvgColorBar = {
    leatherColors: ColorOption[]
    protectionColors: ColorOption[]
}