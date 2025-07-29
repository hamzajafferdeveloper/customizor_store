import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Props = {
    open: boolean;
    onOpenChange: () => void;
};

const LimitModal = ({ open, onOpenChange }: Props) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Maximum limit reached.</DialogTitle>
                    <DialogDescription>You can not enter new item.</DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};

export default LimitModal;
