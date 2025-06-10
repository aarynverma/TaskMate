import { UserProfileForm } from "@/components/UserProfileForm";
import Link from "next/link";

export default function SetupPage() {
    return (
        <>
            <main className="min-h-screen bg-gray-100 p-6">
                <Link
                    href="/"
                    className="inline-block bg-gray-200 px-4 py-1 rounded hover:bg-gray-300 text-sm mb-4"
                >
                    ← Home
                </Link>
                <UserProfileForm onSuccessRedirect="/" showBackLink={true} />
            </main>
        </>
    )
}
