import { Head } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome" />
            <main className="flex min-h-screen items-center justify-center bg-[#FDFDFC] p-6 text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                <h1 className="text-3xl font-semibold">Good Morning</h1>
            </main>
        </>
    );
}
