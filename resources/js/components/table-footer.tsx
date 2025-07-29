import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { CategoryPagination, ProductPagination } from '@/types/pagination';
import { Button } from './ui/button';

type Props = {
    perPage: number;
    handlePerPageChange: (value: number) => void;
    handlePageChange: (url: string | null) => void;
    data: CategoryPagination | ProductPagination;
};

export default function CustomTableFooter({ perPage, handlePerPageChange, handlePageChange, data }: Props) {
    return (
        <div className="mt-2 flex justify-between">
            <div className="flex w-1/2 items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="justify-between text-sm">
                            Per Page: {perPage}
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="start">
                        {[5, 10, 25, 50].map((value) => (
                            <DropdownMenuItem
                                key={value}
                                onSelect={() => handlePerPageChange(value)}
                                className={perPage === value ? 'font-semibold' : ''}
                            >
                                {value}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <Pagination className="w-1/2">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={() => handlePageChange(data.prev_page_url)}
                            className={!data.prev_page_url ? 'pointer-events-none opacity-20' : 'cursor-pointer'}
                        />
                    </PaginationItem>
                            <PaginationItem>
                                {data.current_page}
                            </PaginationItem>

                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={() => handlePageChange(data.next_page_url)}
                            className={!data.next_page_url ? 'pointer-events-none opacity-20' : 'cursor-pointer'}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}
