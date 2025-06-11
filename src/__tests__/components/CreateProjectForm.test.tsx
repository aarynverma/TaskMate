import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/router";

jest.mock("next-auth/react", () => ({
  useSession: () => ({
    data: {
      user: { id: "user1", name: "Test User", email: "test@example.com" },
    },
    status: "authenticated",
  }),
}));

const mockPush = jest.fn();
jest.mock("next/router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("CreateProjectForm", () => {
  it("submits the form and redirects to '/'", async () => {
    const invalidateMock = jest.fn();

    jest.doMock("@/utils/api", () => ({
      api: {
        useUtils: () => ({
          project: {
            getProjects: {
              invalidate: invalidateMock,
            },
          },
        }),
        project: {
          createProject: {
            useMutation: () => ({
              mutate: (_data: any) => {
                invalidateMock();
                mockPush("/");
              },
              status: "idle",
            }),
          },
        },
      },
    }));

    const { CreateProjectForm } = await import("@/components/CreateProjectForm");

    render(<CreateProjectForm />);

    fireEvent.change(screen.getByPlaceholderText("Project Name"), {
      target: { value: "Test Project" },
    });

    fireEvent.change(screen.getByPlaceholderText("Description (optional)"), {
      target: { value: "Test description" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
      expect(invalidateMock).toHaveBeenCalled();
    });
  });
});
