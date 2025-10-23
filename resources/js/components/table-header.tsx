import { Link } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

type Props = {
    searchValue: string;
    setSearchValue: (value: string) => void;
    btnText?: string;
    btnType?: 'button' | 'link';
    btnlink?: string;
    searchTxt: string;
    btnFunc?: () => void;
    heading: string;
    desc: string;
    desc2?: string;
};

export default function TableHeaderCustom({
    searchValue,
    setSearchValue,
    btnText,
    btnType,
    btnlink,
    searchTxt,
    btnFunc,
    heading,
    desc,
    desc2,
}: Props) {
    return (
        <header className="w-full">
            <div className="flex justify-between gap-2">
                <div className="w-full pb-3">
                    <h1 className="text-3xl font-bold">{heading}</h1>
                    <p className="text-xs md:text-sm">{desc}</p>
                    <p className="text-sm">{desc2}</p>
                </div>
                {btnText && (
                    <>
                        {btnType == 'button' && (
                            <Button onClick={btnFunc} className="cursor-pointer">
                                {btnText}
                            </Button>
                        )}
                        {btnType == 'link' && (
                            <Button className="cursor-pointer">
                                {' '}
                                <Link href={btnlink ? btnlink : ''}>{btnText}</Link>{' '}
                            </Button>
                        )}
                    </>
                )}
            </div>
            <div className="flex w-1/2 items-center rounded-lg border shadow">
                <Search className="ml-2 text-gray-500/80" />
                <Input className="border-none" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder={searchTxt} />
            </div>
        </header>
    );
}
