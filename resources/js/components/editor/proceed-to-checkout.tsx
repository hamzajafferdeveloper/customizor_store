import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';

type Props = {
    open: boolean;
    onOpenChange: () => void;
    product_id: number;
};

export default function ProceedToCheckout({ open, onOpenChange, product_id }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        number: '',
        email: '',
        country: '',
        address: '',
        has_delivery_address: false as boolean,
        delivery_address: '',
        product_id: product_id,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('buy.physical.product'));
        onOpenChange();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>Create Category</DialogTitle>
                    <DialogDescription>Enter Name of Category. Then Click Save.</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. John Doe"
                        />
                        <InputError message={errors.name} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Email</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            tabIndex={2}
                            autoComplete="slug_short"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="e.g. johndoe@me.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Number</Label>
                        <Input
                            id="number"
                            type="tel"
                            required
                            tabIndex={2}
                            autoComplete="number"
                            value={data.number}
                            onChange={(e) => setData('number', e.target.value)}
                            placeholder="e.g. +1 (971) 575-1057"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                            id="country"
                            type="text"
                            required
                            tabIndex={2}
                            autoComplete="country"
                            value={data.country}
                            onChange={(e) => setData('country', e.target.value)}
                            placeholder="United State"
                        />
                        <InputError message={errors.country} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Address</Label>
                        <Textarea
                            id="address"
                            required
                            tabIndex={2}
                            autoComplete="address"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            placeholder="Apartment, Suit, Unit, Building Floor"
                        />
                        <InputError message={errors.address} />
                    </div>

                    <div className="flex gap-2">
                        <Checkbox
                            id="has_delivery_address"
                            checked={data.has_delivery_address}
                            onCheckedChange={(checked) => setData('has_delivery_address', checked === true)}
                        />
                        <Label htmlFor="has_delivery_address">Has Delivery Address</Label>
                    </div>

                    {data.has_delivery_address && (
                        <div className="grid gap-2">
                            <Label htmlFor="delivery_address">Dilvery Address</Label>
                            <Textarea
                                id="delivery_address"
                                tabIndex={2}
                                autoComplete="delivery_address"
                                value={data.delivery_address}
                                onChange={(e) => setData('delivery_address', e.target.value)}
                                placeholder="Apartment, Suit, Unit, Building Floor"
                            />
                            <InputError message={errors.delivery_address} />
                        </div>
                    )}
                    <DialogFooter className='sm:flex'>
                        <Button className="w-full cursor-pointer" onClick={onOpenChange} variant="outline" type="submit" tabIndex={2}>

                            Cancel
                        </Button>
                        <Button className="w-full cursor-pointer" type="submit" tabIndex={2} disabled={processing}>
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Proceed To Payment
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
