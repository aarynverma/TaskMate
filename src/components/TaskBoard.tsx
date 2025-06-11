import React from "react";
import {
    DndContext,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
    useDroppable,
    DragOverlay,
    DragStartEvent,
    DragEndEvent,
    pointerWithin,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { api } from "@/utils/api";
import { TaskCard } from "./TaskCard";
import { useEffect, useState } from "react";

const STATUSES = ["todo", "in-progress", "done"] as const;

export function createHandleDragEnd(updateStatus: any, tasks: any[], setTasks: any) {
  return (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !active) return;

    const taskId = String(active.id);
    const newStatus = over.id as string;

    const dragged = tasks.find((t) => t.id === taskId);
    if (!dragged || dragged.status === newStatus) return;

    setTasks((prev: any[]) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    updateStatus.mutate({ taskId, status: newStatus });
  };
}


export function TaskBoard({ projectId }: { projectId: string }) {
    const { data: tasks = [], refetch } = api.task.getTasks.useQuery({ projectId });

    const [localTasks, setLocalTasks] = useState(tasks);
    useEffect(() => {
        setLocalTasks(tasks);
    }, [tasks]);

    const updateStatus = api.task.updateTaskStatus.useMutation({
        onSuccess: () => void refetch(),
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            }
        })
    );

    const [draggingTask, setDraggingTask] = useState<any | null>(null);

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const task = localTasks.find((t) => t.id === active.id);
        setDraggingTask(task ?? null);
    };

    const handleDragEnd = createHandleDragEnd(updateStatus, localTasks, setLocalTasks);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            modifiers={[restrictToVerticalAxis]}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div data-testid="taskboard-dnd-context">

                <div className="grid grid-cols-3 gap-4 w-full">
                    {STATUSES.map((status) => (
                        <Column
                            key={status}
                            id={status}
                            title={status}
                            tasks={localTasks.filter((t) => t.status === status)}
                            projectId={projectId}
                        />
                    ))}
                </div>
                <DragOverlay>
                    {draggingTask && (
                        <div className="bg-white p-3 rounded shadow w-60">
                            <p className="font-medium">{draggingTask.title}</p>
                            {draggingTask.description && (
                                <p className="text-sm text-gray-500">{draggingTask.description}</p>
                            )}
                        </div>
                    )}
                </DragOverlay>
            </div>
        </DndContext>
    );
}

function Column({
    id,
    title,
    tasks,
    projectId,
}: {
    id: string;
    title: string;
    tasks: any[];
    projectId: string;
}) {
    const { setNodeRef, isOver } = useDroppable({ id });
    const [isAdding, setIsAdding] = useState(false);
    const [newTaskData, setNewTaskData] = useState({
        title: "",
        description: "",
        dueDate: new Date(),
        priority: "low",
        assignees: [] as { userId: string }[],
    });

    const utils = api.useUtils();
    const createTask = api.task.createTask.useMutation({
        onSuccess: () => {
            void utils.task.getTasks.invalidate();
            setIsAdding(false);
            setNewTaskData({ title: "", description: "", dueDate: new Date(), priority: "low", assignees: [] });
        },
    });

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskData.title.trim()) return;

        const result = await createTask.mutateAsync({
            title: newTaskData.title,
            description: newTaskData.description,
            projectId,
            status: id as typeof STATUSES[number],
            dueDate: newTaskData.dueDate instanceof Date ? newTaskData.dueDate : new Date(),
            priority: newTaskData.priority,
        });

        const assigneeId = newTaskData.assignees?.[0]?.userId;
        if (assigneeId && result?.id) {
            await assignTask.mutateAsync({
                taskId: result.id,
                userId: assigneeId,
            });
        }

        setNewTaskData({
            title: "",
            description: "",
            dueDate: new Date(),
            priority: "low",
            assignees: [],
        });
        setIsAdding(false);
    };


    const assignTask = api.task.assignUserToTask.useMutation({
        onSuccess: () => void utils.task.getTasks.invalidate(),
    });

    const removeTask = api.task.removeUserFromTask.useMutation({
        onSuccess: () => void utils.task.getTasks.invalidate(),
    });

    const { data: users = [] } = api.user.getTeamMembers.useQuery();


    return (
        <div
            ref={setNodeRef}
            className={`bg-white rounded shadow p-4 min-h-[300px] transition-colors w-full 
        ${isOver ? "bg-blue-50 ring-2 ring-blue-300" : ""}`}
            style={{ position: "relative" }}
        >
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold capitalize">{title}</h2>
                {id === "todo" && <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                    + Add
                </button>}
            </div>

            {isAdding && (
                <form onSubmit={handleAddTask} className="mb-3 bg-blue-50 p-2 rounded">
                    <input
                        className="w-full border px-2 py-1 rounded mb-2"
                        placeholder="Task title"
                        value={newTaskData.title}
                        onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
                        autoFocus
                    />
                    <textarea
                        className="w-full border px-2 py-1 rounded mb-2"
                        placeholder="Description (optional)"
                        value={newTaskData.description}
                        onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
                        rows={2}
                    />
                    <input
                        type="date"
                        className="w-full border px-2 py-1 rounded mb-2"
                        value={newTaskData.dueDate instanceof Date ? newTaskData.dueDate.toISOString().split('T')[0] : ''}
                        onChange={(e) => setNewTaskData({ ...newTaskData, dueDate: e.target.value ? new Date(e.target.value) : new Date() })}
                    />
                    <select
                        className="w-full border px-2 py-1 rounded mb-2"
                        value={newTaskData.priority}
                        onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value })}
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                    <select
                        value={newTaskData.assignees?.[0]?.userId ?? ""}
                        onChange={(e) =>
                            setNewTaskData({
                                ...newTaskData,
                                assignees: e.target.value
                                    ? [{ userId: e.target.value }]
                                    : [],
                            })
                        }
                        className="w-full border px-2 py-1 rounded"
                    >
                        <option value="">Unassigned</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name ?? user.email}
                            </option>
                        ))}
                    </select>
                    <div className="flex gap-2 justify-end">
                        <button
                            type="button"
                            onClick={() => {
                                setIsAdding(false);
                                setNewTaskData({ title: "", description: "", dueDate: new Date(), priority: "low", assignees: [] });
                            }}
                            className="text-xs px-2 py-1 bg-gray-200 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="text-xs px-2 py-1 bg-blue-500 text-white rounded"
                            disabled={!newTaskData.title.trim()}
                        >
                            Add Task
                        </button>
                    </div>
                </form>
            )}

            <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
}