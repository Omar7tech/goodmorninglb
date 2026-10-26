import { Head } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome" />
            <main className="flex min-h-screen items-center justify-center p-6">
                <h1 className="font-heading text-5xl">Good Morning</h1>
            </main>
        </>
    );
}
