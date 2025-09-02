import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (angle: number) => void;
  initialAngle?: number;
};

export default function RotateAngleModal({ open, onOpenChange, onConfirm, initialAngle = 0 }: Props) {
  const [angle, setAngle] = useState(initialAngle);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Rotation Angle</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            type="number"
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            placeholder="Enter angle in degrees"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm(angle);
              onOpenChange(false);
            }}
          >
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
