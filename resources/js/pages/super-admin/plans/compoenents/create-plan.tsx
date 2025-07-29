import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { LoaderCircle, X } from 'lucide-react';
import { FormEventHandler, KeyboardEvent, useState } from 'react';

type Props = {
    open: boolean;
    onOpenChange: () => void;
};

type PlanForm = {
    name: string;
    description: string;
    price: string;
    features: string[]; // ✅ Array
    billing_cycle: 'monthly' | 'yearly';
};

export default function CreatePlanModal({ open, onOpenChange }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm<PlanForm>({
        name: '',
        description: '',
        price: '',
        features: [], // ✅ Array
        billing_cycle: 'monthly',
    });

    const [featureInput, setFeatureInput] = useState('');

    const addFeature = () => {
        const feature = featureInput.trim();
        if (feature && !data.features.includes(feature)) {
            setData('features', [...data.features, feature]);
            setFeatureInput('');
        }
    };

    const removeFeature = (index: number) => {
        setData('features', data.features.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addFeature();
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        addFeature(); // Ensure the last feature is added
        post(route('superadmin.plan.store'), {
            onSuccess: () => {
                reset();
                onOpenChange();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg rounded-2xl shadow-xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Create Subscription Plan</DialogTitle>
                    <DialogDescription className="text-gray-500">
                        Fill in the details to create a new subscription plan.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="grid gap-4 py-2">
                    {/* Name */}
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="font-medium">Plan Name</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder='e.g. Basic Plan, Premium Plan'
                        />
                        <InputError message={errors.name} />
                    </div>

                    {/* Description */}
                    <div className="grid gap-2">
                        <Label htmlFor="description" className="font-medium">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder='Describe the features and benefits of this plan...'
                        />
                        <InputError message={errors.description} />
                    </div>

                    {/* Price */}
                    <div className="grid gap-2">
                        <Label htmlFor="price" className="font-medium">Price (USD)</Label>
                        <Input
                            id="price"
                            type="number"
                            step="0.01"
                            required
                            value={data.price}
                            onChange={(e) => setData('price', e.target.value)}
                            placeholder='e.g. 9.99, 19.99'
                        />
                        <InputError message={errors.price} />
                    </div>

                    {/* Billing Cycle */}
                    <div className="grid gap-2">
                        <Label className="font-medium">Billing Cycle</Label>
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
                        <Label className="font-medium">Features</Label>
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

                        <div className="mt-2 flex flex-wrap gap-2">
                            {data.features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm">
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
                        <InputError message={errors.features} />
                    </div>

                    <DialogFooter className="mt-4">
                        <Button className="w-full" type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Save Plan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
