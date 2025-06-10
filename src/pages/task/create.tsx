import { api } from "@/utils/api";
import { useState } from "react";


export default function CreateTask() {
    const { data: projects = [] } = api.project.getProjects.useQuery();

    const utils = api.useUtils();
    const createTask = api.task.createTask.useMutation({
        onSuccess: () => {
            alert("Task created!");
        },
    });

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        projectId: "",
        dueDate: "",
        priority: "",
    });

    return (
        <div className="max-w-xl mx-auto mt-10">
            <h2 className="text-2xl font-bold mb-4">Create Task</h2>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    createTask.mutate({
                        ...formData,
                        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
                    });
                }}
                className="space-y-4"
            >
                <input
                    className="w-full border px-4 py-2 rounded"
                    placeholder="Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                <textarea
                    className="w-full border px-4 py-2 rounded"
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <select
                    className="w-full border px-4 py-2 rounded"
                    value={formData.projectId}
                    onChange={(e) =>
                        setFormData({ ...formData, projectId: e.target.value })
                    }
                >
                    <option value="">Select Project</option>
                    {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                            {project.name}
                        </option>
                    ))}
                </select>

                <input
                    className="w-full border px-4 py-2 rounded"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
                <input
                    className="w-full border px-4 py-2 rounded"
                    placeholder="Priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-6 py-2 rounded"
                >
                    Create Task
                </button>
            </form>
        </div>
    );
}
