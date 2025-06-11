import React from "react";
import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { api } from "@/utils/api";

export function TaskCard({ task }: { task: any }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging,
    } = useDraggable({
        id: task.id,
        data: task,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? "none" : "transform 200ms ease",
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? "grabbing" : "default",
        touchAction: "none",
        position: "relative" as const,
    };

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        title: task.title,
        description: task.description ?? "",
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "",
        priority: task.priority ?? "low",
    });

    const utils = api.useUtils();
    const updateTask = api.task.updateTask.useMutation({
        onSuccess: () => {
            void utils.task.getTasks.invalidate();
            setEditing(false);
        },
    });

    const deleteTask = api.task.deleteTask.useMutation({
        onSuccess: () => void utils.task.getTasks.invalidate(),
    });

    const assignTask = api.task.assignUserToTask.useMutation({
        onSuccess: () => void utils.task.getTasks.invalidate(),
    });

    const removeTask = api.task.removeUserFromTask.useMutation({
        onSuccess: () => void utils.task.getTasks.invalidate(),
    });

    const { data: users = [] } = api.user.getTeamMembers.useQuery();

    const handleButtonClick = (e: React.MouseEvent, callback: () => void) => {
        e.stopPropagation();
        callback();
    };

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className={`bg-white p-3 rounded shadow relative ${isDragging ? "z-10" : ""}`}
            style={style}
            data-task-id={task.id}
        >
            <div
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 cursor-grab"
                title="Drag"
                style={{ pointerEvents: "none" }}
            >
                ⠿
            </div>

            {editing ? (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        updateTask.mutate({
                            id: task.id,
                            title: form.title,
                            description: form.description,
                            dueDate: form.dueDate ? new Date(form.dueDate) : undefined,
                            priority: form.priority,
                        });
                    }}
                    className="space-y-2"
                    onClick={(e) => e.stopPropagation()}
                >
                    <input
                        className="w-full border px-2 py-1 rounded"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="Task Title"
                    />
                    <textarea
                        className="w-full border px-2 py-1 rounded"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Task Description"
                    />
                    <input
                        type="date"
                        className="w-full border px-2 py-1 rounded"
                        value={form.dueDate}
                        onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    />
                    <select
                        className="w-full border px-2 py-1 rounded"
                        value={form.priority}
                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                    </select>
                    <select
                        value={task.assignees?.[0]?.userId ?? ""}
                        onChange={(e) => {
                            const userId = e.target.value;
                            if (!userId) {
                                removeTask.mutate({
                                    taskId: task.id,
                                    userId: task.assignees?.[0]?.userId,
                                });
                            } else {
                                assignTask.mutate({ taskId: task.id, userId });
                            }
                        }}
                        className="w-full border px-2 py-1 rounded"
                    >
                        <option value="">Unassigned</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name ?? user.email}
                            </option>
                        ))}
                    </select>
                    <div className="flex gap-2">
                        <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded">
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={(e) => handleButtonClick(e, () => setEditing(false))}
                            className="bg-gray-300 px-3 py-1 rounded"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <>
                    <p className="font-medium pr-6">{task.title}</p>
                    {task.description && (
                        <p className="text-sm text-gray-500 mb-2">{task.description}</p>
                    )}

                    <div className="space-y-1 text-sm mt-2">
                        {task.dueDate && (
                            <p className="text-xs text-gray-400">
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                            </p>
                        )}

                        <span
                            className={`inline-block text-xs font-medium px-2 py-1 rounded ${task.priority === "high"
                                    ? "bg-red-100 text-red-600"
                                    : task.priority === "medium"
                                        ? "bg-yellow-100 text-yellow-600"
                                        : "bg-green-100 text-green-600"
                                }`}
                        >
                            Priority: {task.priority}
                        </span>

                        <div className="text-xs text-gray-600">
                            Assigned to:{" "}
                            {task.assignees?.[0]?.user?.name ||
                                task.assignees?.[0]?.user?.email ||
                                <span className="italic text-gray-400">Unassigned</span>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-3">
                        <button
                            onClick={(e) => handleButtonClick(e, () => setEditing(true))}
                            className="text-xs text-blue-500 hover:underline"
                        >
                            ✏ Edit
                        </button>
                        <button
                            onClick={(e) =>
                                handleButtonClick(e, () =>
                                    deleteTask.mutate({ taskId: task.id })
                                )
                            }
                            className="text-xs text-red-500 hover:underline"
                        >
                            🗑 Delete
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
