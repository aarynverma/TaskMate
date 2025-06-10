import Head from "next/head";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { CreateProjectForm } from "@/components/CreateProjectForm";
import Link from "next/link";

export default function CreateProjectPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    if (status === "loading") return <p>Loading session...</p>;

    if (status === "unauthenticated") {
        router.push("/auth/signin");
        return null;
    }

    return (
        <>
            <Head>
                <title>Create Project</title>
            </Head>
            <main className="min-h-screen bg-gray-100 p-6">
                <Link
                    href="/"
                    className="inline-block bg-gray-200 px-4 py-1 rounded hover:bg-gray-300 text-sm mb-4"
                >
                    ← Home
                </Link>
                <div className="min-h-screen flex items-center justify-center p-6">
                    <CreateProjectForm />
                </div>
            </main>
        </>
    );
}
