import { useState } from "react";
import { api } from "@/utils/api";
import { useRouter } from "next/router";

export default function CreateProject() {
  const router = useRouter();
  const createProject = api.project.createProject.useMutation({
    onSuccess: () => {
      alert("Project created!");
      router.push("/tasks/create");
    },
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  return (
    <div className="max-w-xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Create Project</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createProject.mutate(formData);
        }}
        className="space-y-4"
      >
        <input
          className="w-full border px-4 py-2 rounded"
          placeholder="Project Name"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
        />
        <textarea
          className="w-full border px-4 py-2 rounded"
          placeholder="Project Description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded"
        >
          Create Project
        </button>
      </form>
    </div>
  );
}
