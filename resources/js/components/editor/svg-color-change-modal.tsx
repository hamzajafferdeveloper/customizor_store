import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { UploadLayer } from '@/types/editor';
import { CanvasItem } from '@/types/editor';
import { useEffect, useMemo, useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import gsap from 'gsap';

type Props = {
  open: boolean;
  onOpenChange: () => void;
  selecetSvgId: string | null;
  uploadedItems: CanvasItem[];
  setUploadedItems: React.Dispatch<React.SetStateAction<CanvasItem[]>>;
};

const SvgColorChangeModal = ({ open, onOpenChange, selecetSvgId, uploadedItems, setUploadedItems }: Props) => {
  const [selectedItem, setSelectedItem] = useState<CanvasItem | null>(null);
  const [decodedSvg, setDecodedSvg] = useState<string>('');
  const [selectedElement, setSelectedElement] = useState<SVGElement | null>(null);
  const [currentColor, setCurrentColor] = useState('#000');
  const [selectedElementIndex, setSelectedElementIndex] = useState<number | null>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [originalSvg, setOriginalSvg] = useState<string>('');
  const pickerRef = useRef<HTMLDivElement>(null);

  // Animate picker when it appears
  useEffect(() => {
    if (selectedElement && pickerRef.current) {
      gsap.fromTo(
        pickerRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }
      );
    }
  }, [selectedElement]);

  // Load and decode SVG when selection changes
  useEffect(() => {
    if (!selecetSvgId) return;
    const item = uploadedItems.find((i) => i.id === selecetSvgId);
    if (!item) return;

    setSelectedItem(item);
    setSelectedElement(null);
    setCurrentColor('#000');

    const loadSvg = async () => {
      if (!isUploadLayer(item)) return;
      if (!item.src) return;

      if (item.src.startsWith('data:image/svg+xml;base64,')) {
        const base64Content = item.src.replace('data:image/svg+xml;base64,', '');
        const decoded = atob(base64Content);
        setDecodedSvg(decoded);
        setOriginalSvg(decoded);
      } else if (item.src.startsWith('<svg')) {
        setDecodedSvg(item.src);
        setOriginalSvg(item.src);
      } else {
        const res = await fetch(item.src);
        const text = await res.text();
        if (text.includes('<svg')) {
          setDecodedSvg(text);
          setOriginalSvg(text);
        } else {
          setDecodedSvg('');
          setOriginalSvg('');
        }
      }
    };

    loadSvg();
  }, [selecetSvgId, uploadedItems]);

  // Make the injected SVG responsive (do not mutate decodedSvg; only for display)
  const makeSvgResponsive = (svgString: string) => {
    if (!svgString) return svgString;
    try {
      return svgString.replace(/<svg\b([^>]*)>/i, (match, attrs) => {
        // preserve original attrs for viewBox fallback detection
        const hasViewBox = /viewBox\s*=/i.test(attrs);

        // find numeric width & height if viewBox missing
        const widthMatch = attrs.match(/width=(?:"|')?([\d.]+)(?:"|')?/i);
        const heightMatch = attrs.match(/height=(?:"|')?([\d.]+)(?:"|')?/i);

        // remove width/height/style/preserveAspectRatio attributes (we'll inject controlled ones)
        const cleanedAttrs = attrs.replace(/\s*(?:width|height|style|preserveAspectRatio)=(".*?"|'.*?'|[^\s>]+)/gi, '');

        // if no viewBox, but width and height are numeric, add a viewBox fallback
        let viewBoxAttr = '';
        if (!hasViewBox && widthMatch && heightMatch) {
          const w = widthMatch[1];
          const h = heightMatch[1];
          viewBoxAttr = ` viewBox="0 0 ${w} ${h}"`;
        }

        return `<svg${cleanedAttrs}${viewBoxAttr} width="100%" height="100%" style="max-width:100%;max-height:100%;display:block" preserveAspectRatio="xMidYMid meet">`;
      });
    } catch (err) {
      // fallback to original if anything goes wrong
      return svgString;
    }
  };

  const sanitizedSvg = useMemo(() => makeSvgResponsive(decodedSvg), [decodedSvg]);

  const handleClickOnSvg = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log('SVG clicked', e);
    const svgRoot = svgContainerRef.current?.querySelector('svg');
    if (!svgRoot) return;
    const allowedTags = ['path', 'rect', 'circle', 'polygon', 'ellipse'];
    const target = e.target as SVGElement;
    if (!target || !target.tagName) return;

    const tag = target.tagName.toLowerCase();
    if (!allowedTags.includes(tag)) {
      // user clicked something else; clear selection
      setSelectedElement(null);
      setSelectedElementIndex(null);
      return;
    }

    setSelectedElement(target);
    const fill = target.getAttribute('fill') || '#000';
    setCurrentColor(fill);

    const elements = Array.from(svgRoot.querySelectorAll(allowedTags.join(',')));
    const idx = elements.indexOf(target);
    setSelectedElementIndex(idx);
  };

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    if (selectedElement && selectedElementIndex !== null) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(decodedSvg, 'image/svg+xml');
      const allowedTags = ['path', 'rect', 'circle', 'polygon', 'ellipse'];
      const elements = Array.from(doc.querySelectorAll(allowedTags.join(',')));
      if (elements[selectedElementIndex]) {
        elements[selectedElementIndex].setAttribute('fill', color );
        const serializer = new XMLSerializer();
        const updatedSvg = serializer.serializeToString(doc.documentElement);
        setDecodedSvg(updatedSvg);
      }
    }
  };

  function isUploadLayer(item: CanvasItem): item is UploadLayer {
    return item.type === 'image';
  }

  const handleCancel = () => {
    setDecodedSvg(originalSvg);
    onOpenChange();
  };

  const handleSave = () => {
    if (!selecetSvgId) return;
    setUploadedItems((prev) =>
      prev.map((item) => {
        if (item.id === selecetSvgId && isUploadLayer(item)) {
          const base64 = btoa(unescape(encodeURIComponent(decodedSvg)));
          return {
            ...item,
            src: 'data:image/svg+xml;base64,' + base64,
          };
        }
        return item;
      })
    );
    onOpenChange();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Use flex layout so header/footer remain fixed and main area can be sized */}
      <DialogContent className="!max-w-none w-[90vw] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">Change SVG Colors</DialogTitle>
        </DialogHeader>

        {/* Main content (fills available space) */}
        <div className="flex-1 flex gap-4 p-2 overflow-hidden">
          {decodedSvg ? (
            <>
              {/* SVG Preview: flex-1 so picker gets fixed width on the right */}
              <div
                ref={svgContainerRef}
                onClick={handleClickOnSvg}
                className="flex-1 border rounded-md cursor-pointer bg-gray-50 flex items-center justify-center overflow-hidden p-2"
                // inject sanitized SVG (responsive for display only)
                dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
              />

              {/* Color Picker (shows after click on a valid element) */}
              {selectedElement && (
                <div
                  ref={pickerRef}
                  className="flex flex-col items-center w-full md:w-56 gap-3 p-3 bg-white border rounded-md shadow-sm z-10"
                >
                  <p className="text-sm font-medium text-gray-700">Pick a Color</p>
                  <HexColorPicker color={currentColor} onChange={handleColorChange} />
                  <div
                    className="w-10 h-10 border rounded-full shadow-sm"
                    style={{ backgroundColor: currentColor }}
                  />
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500">No valid SVG item selected.</p>
          )}
        </div>

        {/* Action Buttons (footer) */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-3 py-1.5 text-sm text-gray-800 bg-gray-200 rounded-md hover:bg-gray-300"
            type="button"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
            type="button"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SvgColorChangeModal;
