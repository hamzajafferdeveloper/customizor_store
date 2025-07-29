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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plan } from '@/types/data';
import { useForm } from '@inertiajs/react';
import { LoaderCircle, X } from 'lucide-react';
import { FormEventHandler, KeyboardEvent, useEffect, useState } from 'react';

type Props = {
    open: boolean;
    onOpenChange: () => void;
    plan: Plan;
};

export default function EditPlanModal({ open, onOpenChange, plan }: Props) {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: plan.name,
        description: plan.description ?? '',
        price: String(plan.price),
        features: plan.features || [],
        billing_cycle: plan.billing_cycle,
    });

    const [featureInput, setFeatureInput] = useState('');

    useEffect(() => {
        if (open) {
            setData({
                name: plan.name,
                description: plan.description ?? '',
                price: String(plan.price),
                features: plan.features || [],
                billing_cycle: plan.billing_cycle,
            });
        } else {
            reset();
            setFeatureInput('');
        }
    }, [open, plan]);

    const addFeature = () => {
        const feature = featureInput.trim();
        if (feature && !data.features.includes(feature)) {
            setData('features', [...data.features, feature]);
            setFeatureInput('');
        }
    };

    const removeFeature = (index: number) => {
        setData(
            'features',
            data.features.filter((_, i) => i !== index)
        );
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addFeature();
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('superadmin.plan.update', plan.id), {
            onSuccess: () => {
                onOpenChange();
                reset();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg rounded-2xl shadow-xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Edit Subscription Plan</DialogTitle>
                    <DialogDescription className="text-gray-500">
                        Update the details of this subscription plan.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="grid gap-4 py-2">
                    {/* Name */}
                    <div className="grid gap-2">
                        <Label htmlFor="name">Plan Name</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        <InputError message={errors.name} />
                    </div>

                    {/* Description */}
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                        />
                        <InputError message={errors.description} />
                    </div>

                    {/* Price */}
                    <div className="grid gap-2">
                        <Label htmlFor="price">Price (USD)</Label>
                        <Input
                            id="price"
                            type="number"
                            step="0.01"
                            required
                            value={data.price}
                            onChange={(e) => setData('price', e.target.value)}
                        />
                        <InputError message={errors.price} />
                    </div>

                    {/* Billing Cycle */}
                    <div className="grid gap-2">
                        <Label>Billing Cycle</Label>
                        <Select
                            value={data.billing_cycle}
                            onValueChange={(val) => setData('billing_cycle', val as 'monthly' | 'yearly')}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Billing Cycle" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.billing_cycle} />
                    </div>

                    {/* Features */}
                    <div className="grid gap-2">
                        <Label>Features</Label>
                        <div className="flex gap-2">
                            <Input
                                value={featureInput}
                                onChange={(e) => setFeatureInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a feature and press Enter"
                            />
                            <Button type="button" onClick={addFeature} variant="secondary">
                                Add
                            </Button>
                        </div>

                        {/* Feature List */}
                        {data.features.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                                
                                {data.features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm"
                                    >
                                        {feature}
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(index)}
                                            className="hover:text-red-500"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-sm mt-1">No features added yet.</p>
                        )}
                        <InputError message={errors.features} />
                    </div>

                    <DialogFooter className="mt-4">
                        <Button className="w-full" type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Update Plan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
