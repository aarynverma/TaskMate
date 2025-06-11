import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TaskCard } from "@/components/TaskCard";

const mockAssign = jest.fn();
const mockRemove = jest.fn();
const mockInvalidate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

jest.mock("@/utils/api", () => ({
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
      updateTask: {
        useMutation: () => ({
          mutate: mockUpdate,
          status: "idle",
        }),
      },
      deleteTask: {
        useMutation: () => ({
          mutate: mockDelete,
          status: "idle",
        }),
      },
      assignUserToTask: {
        useMutation: () => ({
          mutate: mockAssign,
          status: "idle",
        }),
      },
      removeUserFromTask: {
        useMutation: () => ({
          mutate: mockRemove,
          status: "idle",
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
}));

const mockTask = {
  id: "task-1",
  title: "Test Task",
  description: "Test description",
  dueDate: new Date("2025-06-10").toISOString(),
  priority: "medium",
  assignees: [
    {
      userId: "user-1",
      user: { name: "User One", email: "user1@example.com" },
    },
  ],
};

describe("TaskCard", () => {
  beforeEach(() => {
    mockAssign.mockClear();
    mockRemove.mockClear();
    mockInvalidate.mockClear();
  });

  it("updates assigned user", async () => {
    render(<TaskCard task={mockTask} />);
    fireEvent.click(screen.getByText(/✏ Edit/i));

    const selects = screen.getAllByRole("combobox");
    const assigneeSelect = selects[1] as HTMLSelectElement;

    fireEvent.change(assigneeSelect, { target: { value: "user-2" } });

    await waitFor(() => {
      expect(mockAssign).toHaveBeenCalledWith({
        taskId: "task-1",
        userId: "user-2",
      });
    });
  });

  it("unassigns user when empty value selected", async () => {
    render(<TaskCard task={mockTask} />);
    fireEvent.click(screen.getByText(/✏ Edit/i));

    const selects = screen.getAllByRole("combobox");
    const assigneeSelect = selects[1] as HTMLSelectElement;

    fireEvent.change(assigneeSelect, { target: { value: "" } });

    await waitFor(() => {
      expect(mockRemove).toHaveBeenCalledWith({
        taskId: "task-1",
        userId: "user-1",
      });
    });
  });
});
