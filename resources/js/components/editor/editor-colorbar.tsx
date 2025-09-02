import { Color } from '@/types/data';
import { useEffect, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { TemplatePart } from '@/types/helper';

type Props = {
  parts: TemplatePart[];
  openColorMenu: string;
  paintPart: (part: TemplatePart, color: string) => void;
  ChageLayerColor: boolean;
};

export default function EditorColorBar({ parts, openColorMenu, paintPart, ChageLayerColor }: Props) {
  const [accordionValue, setAccordionValue] = useState<string | undefined>(undefined);
  const [sortedParts, setSortedParts] = useState<TemplatePart[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Fetch colors from backend
  useEffect(() => {
    fetch('/all/colors')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch colors');
        }
        return res.json();
      })
      .then((data) => {
        setColors(data.colors); // 👈 store response in state
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full p-3"
      value={accordionValue}
      onValueChange={(val) => setAccordionValue(val)}
    >
      {ChageLayerColor ? (
        sortedParts.map((part) => (
          <AccordionItem key={part.id} value={`item-${part.id}`}>
            <AccordionTrigger>{part.name}</AccordionTrigger>
            <AccordionContent className="flex flex-wrap gap-2 text-balance">
              {loading ? (
                <p>Loading colors...</p>
              ) : (
                colors
                  .filter((c) => c.color_type === part.type) // 👈 filter by part type
                  .map((c) => (
                    <div key={c.id}>
                      <div
                        className="h-5 w-5 cursor-pointer rounded-md border border-black"
                        style={{ backgroundColor: c.hexCode }}
                        title={c.name}
                        onClick={() => paintPart(part, c.hexCode)}
                      />
                    </div>
                  ))
              )}
            </AccordionContent>
          </AccordionItem>
        ))
      ) : (
        <p className="w-full rounded-md bg-red-400/20 p-3">You can not change layer Color</p>
      )}
    </Accordion>
  );
}
