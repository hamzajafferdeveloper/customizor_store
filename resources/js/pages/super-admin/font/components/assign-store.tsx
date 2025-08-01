import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Font } from '@/types/data';
import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { Plan } from '..';



type Props = {
    open: boolean;
    onOpenChange: () => void;
    selectedFont: Font;
    plans: Plan[];
};

export default function AssignPlanModal({ open, onOpenChange, selectedFont, plans }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        plan_ids: [] as number[],
    });

    const togglePlan = (id: number) => {
        if (data.plan_ids.includes(id)) {
            setData('plan_ids', data.plan_ids.filter((pid) => pid !== id));
        } else {
            setData('plan_ids', [...data.plan_ids, id]);
        }
    };

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        post(route('superadmin.fonts.assignPlans', selectedFont.id), {
            onSuccess: () => {
                reset();
                onOpenChange();
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Font to Plans</DialogTitle>
                    <DialogDescription>
                        Select the plans that can use the font <strong>{selectedFont.name}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="grid gap-4">
                    <ScrollArea className="max-h-60 border rounded-md p-2">
                        {plans.length > 0 ? (
                            plans.map((plan) => (
                                <div key={plan.id} className="flex items-center space-x-2 py-1">
                                    <Checkbox
                                        checked={data.plan_ids.includes(plan.id)}
                                        onCheckedChange={() => togglePlan(plan.id)}
                                    />
                                    <label className="text-sm font-medium">{plan.name}</label>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">No plans available</p>
                        )}
                    </ScrollArea>

                    {errors.plan_ids && <p className="text-red-500 text-sm">{errors.plan_ids}</p>}

                    <DialogFooter>
                        <Button className="w-full" type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
