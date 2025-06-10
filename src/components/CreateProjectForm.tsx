import { useState } from "react";
import { api } from "@/utils/api";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export function CreateProjectForm() {
  const { data: session } = useSession();
  const utils = api.useUtils();
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { mutate, status } = api.project.createProject.useMutation({
    onSuccess: async () => {
      await utils.project.getProjects.invalidate();
      router.push("/");
    },
    onError: (err) => {
      console.error("Mutation failed:", err);
      alert("Failed to create project.");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate({ name, description });
  };

  if (!session) return null;

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white shadow p-6 rounded space-y-4"
    >
      <h2 className="text-xl font-bold">Create New Project</h2>
      <input
        type="text"
        placeholder="Project Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <button
        type="submit"
        disabled={status === "pending"}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {status === "pending" ? "Creating..." : "Create"}
      </button>
    </form>
  );
}
