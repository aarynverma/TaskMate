import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { api } from "@/utils/api";

export function UserProfileForm({
    onSuccessRedirect = "/",
    showBackLink = false,
}: {
    onSuccessRedirect?: string;
    showBackLink?: boolean;
}) {
    const { data: session, status, update } = useSession();
    
    const router = useRouter();
    
    const [form, setForm] = useState({
        name: "",
        role: "",
    });

    const refreshSession = async () => {
      await update();
    };
    
    const utils = api.useUtils();
    const updateProfile = api.user.updateProfile.useMutation({
        onSuccess: () => {
            utils.user.getProfile?.invalidate?.();
            alert("Profile updated!");
            router.push(onSuccessRedirect);
            refreshSession();
        },
    });

    useEffect(() => {
        if (status === "unauthenticated") router.push("/auth/signin");
    }, [status, router]);

    useEffect(() => {
        if (session?.user) {
            setForm({
                name: session.user.name ?? "",
                role: session.user.role ?? "",
            });
        }
    }, [session]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) return alert("Name is required");
        updateProfile.mutate({ name: form.name, role: form.role });
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white rounded shadow p-6 w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4">Update Profile</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                        <input
                            id="name"
                            type="text"
                            value={form.name}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, name: e.target.value }))
                            }
                            className="w-full border px-3 py-2 rounded"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="role" className="block text-sm font-medium mb-1">
                            Role (optional)
                        </label>
                        <input
                            id="role"
                            type="text"
                            value={form.role}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, role: e.target.value }))
                            }
                            className="w-full border px-3 py-2 rounded"
                            placeholder="e.g. Developer, Manager"
                        />
                    </div>

                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Save Profile
                    </button>
                </form>
            </div>
        </main>
    );
}
