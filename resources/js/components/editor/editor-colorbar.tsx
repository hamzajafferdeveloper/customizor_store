import { useEffect, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion';
import { SvgColorBar, TemplatePart } from '../../types/helper';

type Props = {
    parts: TemplatePart[];
    color: SvgColorBar;
    openColorMenu: string;
    paintPart: (part: TemplatePart, color: string) => void;
    ChageLayerColor: boolean;
};

export default function EditorColorBar({ parts, color, openColorMenu, paintPart, ChageLayerColor }: Props) {
    const [accordionValue, setAccordionValue] = useState<string | undefined>(undefined);
    const [sortedParts, setSortedParts] = useState<TemplatePart[]>([]);

    // Handle initial sorting on small screens
    useEffect(() => {
        const isSmallScreen = window.matchMedia('(max-width: 1023px)').matches;

        if (isSmallScreen) {
            const openPart = parts.find((part) => part.name === openColorMenu);
            if (openPart) {
                const reordered = [openPart, ...parts.filter((p) => p.id !== openPart.id)];
                setSortedParts(reordered);
                setAccordionValue(`item-${openPart.id}`);
            } else {
                setSortedParts(parts);
                if (parts.length > 0) {
                    setAccordionValue(`item-${parts[0].id}`);
                }
            }
        } else {
            setSortedParts(parts); // no reordering on desktop
        }
    }, [openColorMenu, parts]);

    // Sync openColorMenu on change (desktop as well)
    useEffect(() => {
        const openPart = parts.find((part) => part.name === openColorMenu);
        if (openPart) {
            setAccordionValue(`item-${openPart.id}`);
        }
    }, [openColorMenu, parts]);

    return (
        <Accordion type="single" collapsible className="w-full p-3" value={accordionValue} onValueChange={(val) => setAccordionValue(val)}>
            {ChageLayerColor ? (
                sortedParts.map((part) => (
                    <AccordionItem key={part.id} value={`item-${part.id}`}>
                        <AccordionTrigger>{part.name}</AccordionTrigger>
                        <AccordionContent className="flex flex-wrap gap-2 text-balance">
                            {part.type === 'leather' &&
                                color.leatherColors.map((data, i) => (
                                    <div key={i}>
                                        <div
                                            className="h-5 w-5 cursor-pointer rounded-md border border-black"
                                            style={{ backgroundColor: data.code }}
                                            onClick={() => paintPart(part, data.code)}
                                        />
                                    </div>
                                ))}
                            {part.type === 'protection' &&
                                color.protectionColors.map((data, i) => (
                                    <div key={i}>
                                        <div
                                            className="h-5 w-5 cursor-pointer rounded-md border border-black"
                                            style={{ backgroundColor: data.code }}
                                            onClick={() => paintPart(part, data.code)}
                                        />
                                    </div>
                                ))}
                        </AccordionContent>
                    </AccordionItem>
                ))
            ) : (
                <p className='bg-red-400/20 w-full p-3 rounded-md'>You can not change layer Color</p>
            )}
        </Accordion>
    );
}
