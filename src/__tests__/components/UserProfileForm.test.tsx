import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { UserProfileForm } from "@/components/UserProfileForm";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

jest.mock("@/utils/api", () => ({
  api: {
    useUtils: () => ({
      user: { getProfile: { invalidate: jest.fn() } },
    }),
    user: {
      updateProfile: {
        useMutation: jest.fn(),
      },
    },
  },
}));

describe("UserProfileForm", () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push });
  });

  it("renders form and updates profile on submit", () => {
    const mutate = jest.fn();
    (useSession as jest.Mock).mockReturnValue({
      status: "authenticated",
      data: {
        user: { id: "123", name: "Aryan", email: "test@example.com", role: "Developer" },
      },
    });

    (api.user.updateProfile.useMutation as jest.Mock).mockReturnValue({
      mutate,
      isLoading: false,
    });

    render(<UserProfileForm />);

    const nameInput = screen.getByLabelText(/name/i);
    const roleInput = screen.getByLabelText(/role/i);
    const saveButton = screen.getByRole("button", { name: /save profile/i });

    expect(nameInput).toHaveValue("Aryan");
    expect(roleInput).toHaveValue("Developer");

    // Simulate change and submit
    fireEvent.change(nameInput, { target: { value: "Updated Aryan" } });
    fireEvent.click(saveButton);

    expect(mutate).toHaveBeenCalledWith({
      name: "Updated Aryan",
      role: "Developer",
    });
  });

  it("redirects to /auth/signin if unauthenticated", () => {
    (useSession as jest.Mock).mockReturnValue({ status: "unauthenticated", data: null });

    render(<UserProfileForm />);

    expect(push).toHaveBeenCalledWith("/auth/signin");
  });
});
