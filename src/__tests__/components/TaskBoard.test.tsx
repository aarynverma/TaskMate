import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { createHandleDragEnd, TaskBoard } from "@/components/TaskBoard";
import { DragEndEvent } from "@dnd-kit/core";

let mockCreate: jest.Mock;
let mockAssign: jest.Mock;
let mockInvalidate: jest.Mock;
let mockUpdateStatus: jest.Mock;
let mockUpdateTaskStatus: jest.Mock;

jest.mock("@/utils/api", () => {
  mockCreate = jest.fn();
  mockAssign = jest.fn();
  mockInvalidate = jest.fn();
  mockUpdateStatus = jest.fn();
  mockUpdateTaskStatus = jest.fn();
  const mockUpdateTask = jest.fn();
  const mockDeleteTask = jest.fn();

  return {
    __esModule: true,
    api: {
      useUtils: () => ({
        task: {
          getTasks: {
            invalidate: mockInvalidate,
          },
        },
      }),
      task: {
        getTasks: {
          useQuery: () => ({
            data: [
              {
                id: "task-1",
                title: "Task 1",
                description: "Test Task",
                status: "todo",
                dueDate: new Date().toISOString(),
                priority: "medium",
                assignees: [],
              },
            ],
            refetch: jest.fn(),
          }),
        },
        createTask: {
          useMutation: () => ({
            mutateAsync: mockCreate.mockResolvedValue({ id: "task-2" }),
          }),
        },
        updateTask: {
          useMutation: () => ({
            mutate: mockUpdateTask,
            status: "idle",
          }),
        },
        deleteTask: {
          useMutation: () => ({
            mutate: mockDeleteTask,
            status: "idle",
          }),
        },
        updateTaskStatus: {
          useMutation: () => ({
            mutate: mockUpdateTaskStatus,
          }),
        },
        assignUserToTask: {
          useMutation: () => ({
            mutateAsync: mockAssign,
          }),
        },
        removeUserFromTask: {
          useMutation: () => ({
            mutateAsync: jest.fn(),
          }),
        },
      },
      user: {
        getTeamMembers: {
          useQuery: () => ({
            data: [
              { id: "user-1", name: "User One" },
              { id: "user-2", name: "User Two" },
            ],
          }),
        },
      },
    },
  };
});


describe("TaskBoard", () => {
  it("renders all columns and task card", () => {
    render(<TaskBoard projectId="p1" />);
    expect(screen.getByText("todo")).toBeInTheDocument();
    expect(screen.getByText("in-progress")).toBeInTheDocument();
    expect(screen.getByText("done")).toBeInTheDocument();
    expect(screen.getByText("Task 1")).toBeInTheDocument();
  });

  it("creates a new task in todo column", async () => {
    render(<TaskBoard projectId="p1" />);
    fireEvent.click(screen.getByText("+ Add"));

    fireEvent.change(screen.getByPlaceholderText("Task title"), {
      target: { value: "New Task" },
    });

    fireEvent.click(screen.getByText("Add Task"));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "New Task",
          status: "todo",
        })
      );
    });
  });
 it("calls updateTaskStatus when task is dragged to a new column", async () => {
    const fakeTasks = [
      {
        id: "task-1",
        title: "Task 1",
        description: "Test Task",
        status: "todo",
        dueDate: new Date().toISOString(),
        priority: "medium",
        assignees: [],
      },
    ];

    const fakeSetTasks = jest.fn();

    const handler = createHandleDragEnd(
      { mutate: mockUpdateTaskStatus },
      fakeTasks,
      fakeSetTasks
    );

    const dragEndEvent: DragEndEvent = {
      active: {
        id: "task-1",
        data: { current: { id: "task-1" } },
        rect: { current: null as any },
      },
      over: {
        id: "in-progress",
        rect: {} as DOMRect,
        disabled: false,
        data: { current: {} },
      },
      delta: { x: 0, y: 0 },
      activatorEvent: {} as any,
      collisions: [],
    };

    handler(dragEndEvent);

    await waitFor(() => {
      expect(mockUpdateTaskStatus).toHaveBeenCalledWith({
        taskId: "task-1",
        status: "in-progress",
      });
    });
  });
});
