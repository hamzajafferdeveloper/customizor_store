import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StoreLayout from '@/layouts/store-layout';
import { StoreData } from '@/types/store';
import { Head, useForm } from '@inertiajs/react';

type Props = {
    store: StoreData;
};

export default function AccessStorePassword({ store }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        password: '',
    });

    const submit: React.FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        post(route('store.user.login', { storeSlug: store.slug }), {
            // @ts-ignore
            password: data.password,
        });
    };
    return (
        <StoreLayout store={store}>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
                <div className="flex w-full max-w-md flex-col gap-3 rounded bg-white p-8 shadow-md">
                    <div className="text-center">
                        <h2 className="text-2xl font-semibold text-gray-800">This Store is Protected</h2>
                        <p className="text-sm">Please Enter Password to access this store</p>
                    </div>
                    <form onSubmit={submit}>
                        <div className="mb-4">
                            <label htmlFor="store-password" className="mb-2 block text-sm font-medium text-gray-700">
                                Enter Store Password
                            </label>
                            <Input
                                type="password"
                                id="store-password"
                                name="store-password"
                                className="w-full"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Store Password"
                                required
                            />
                            {errors.password && <InputError message={errors.password} />}
                        </div>
                        <Button type="submit" disabled={processing} className="w-full">
                            Access Store
                        </Button>
                    </form>
                </div>
            </div>
        </StoreLayout>
    );
}
