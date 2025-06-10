import { getCsrfToken, signIn } from "next-auth/react";
import { useState } from "react";

export default function SignIn({ csrfToken }: { csrfToken: string }) {
    const [email, setEmail] = useState("");
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-10 px-4">
            <h1 className="text-2xl font-semibold mb-4 text-center">Sign in with Email</h1>
            <input
                type="email"
                name="email"
                placeholder="Enter your email"
                required
                className="border px-4 py-2 rounded text-black"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                onClick={() => signIn("email", { email, callbackUrl: "/" })}
            >
                Send Magic Link
            </button>
        </div>
    );
}

export async function getServerSideProps() {
    const csrfToken = await getCsrfToken();
    return { props: { csrfToken } };
}
