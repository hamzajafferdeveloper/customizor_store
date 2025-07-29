import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Color } from '@/types/data';
import { ColorForm } from '@/types/form';
import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useClickAway } from 'react-use';

type Props = {
  open: boolean;
  onOpenChange: () => void;
  selectedColor: Color
};

export default function EditColorModal({ open, onOpenChange, selectedColor }: Props) {
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const { data, setData, put, processing, errors, reset } =
    useForm<Required<ColorForm>>({
      name: selectedColor.name,
      hexCode: selectedColor.hexCode,
    });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    put(route('superadmin.color.update', selectedColor.id));
    onOpenChange();
  };

  // Close picker on outside click
  useClickAway(pickerRef, () => setShowColorPicker(false));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Color</DialogTitle>
          <DialogDescription>
            Edit Name Or Select Color. Then Click Save.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-4 relative">
          {/* Color Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">Color Name</Label>
            <Input
              id="name"
              type="text"
              required
              autoFocus
              tabIndex={1}
              autoComplete="name"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              placeholder="Red, Blue etc"
            />
            <InputError message={errors.name} />
          </div>

          {/* Hex Code + Picker */}
          <div className="grid gap-2">
            <Label htmlFor="hexCode">Color Code</Label>
            <div className="flex items-center gap-2 relative">
              <div
                className="h-8 w-8 rounded-md border cursor-pointer"
                style={{ backgroundColor: data.hexCode }}
                onClick={() => setShowColorPicker(true)}
              />
              <Input
                id="hexCode"
                type="text"
                required
                tabIndex={2}
                autoComplete="hexCode"
                value={data.hexCode}
                onChange={(e) => setData('hexCode', e.target.value)}
                placeholder="#aabbcc"
              />
            </div>
            <InputError message={errors.hexCode} />

            {showColorPicker && (
              <div
                ref={pickerRef}
                className="absolute z-50 top-full mt-2 left-0 rounded-md shadow-lg border bg-white p-2"
              >
                <HexColorPicker
                  color={data.hexCode}
                  onChange={(color) => setData('hexCode', color)}
                />
              </div>
            )}
          </div>

          {/* Save Button */}
          <DialogFooter>
            <Button
              className="w-full cursor-pointer"
              type="submit"
              tabIndex={3}
              disabled={processing}
            >
              {processing && (
                <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
              )}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
