import { Head } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome" />
            <main className="flex min-h-screen items-center justify-center p-6">
                <h1 className="text-3xl font-semibold">Good Morning</h1>
            </main>
        </>
    );
}
