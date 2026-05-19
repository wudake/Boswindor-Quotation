// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UsersPage from "./page";

const mockFetch = vi.fn();
const mockConfirm = vi.fn();

global.fetch = mockFetch as unknown as typeof fetch;
global.confirm = mockConfirm;

describe("UsersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function mockUsersResponse(users: unknown[]) {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => users,
    });
  }

  it("renders loading state initially", () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    render(<UsersPage />);
    expect(screen.getByText("User Management")).toBeInTheDocument();
    expect(document.querySelector("[data-slot='table-body']")).toBeInTheDocument();
  });

  it("renders user list after loading", async () => {
    mockUsersResponse([
      { id: "u1", name: "Alice", email: "alice@test.com", role: "ADMIN", isActive: true, createdAt: "2024-01-15", updatedAt: "2024-01-15" },
      { id: "u2", name: "Bob", email: "bob@test.com", role: "SALES", isActive: false, createdAt: "2024-01-10", updatedAt: "2024-01-10" },
    ]);
    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("alice@test.com")).toBeInTheDocument();
    expect(screen.getByText("bob@test.com")).toBeInTheDocument();
  });

  it("shows empty state when no users", async () => {
    mockUsersResponse([]);
    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText("暂无用户")).toBeInTheDocument();
    });
  });

  it("searches users by query", async () => {
    mockUsersResponse([]);
    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText("暂无用户")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("搜索姓名或邮箱...");
    fireEvent.change(searchInput, { target: { value: "alice" } });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/users?search=alice");
    });
  });

  it("opens add user form when clicking add button", async () => {
    mockUsersResponse([]);
    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText("暂无用户")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("添加用户"));
    expect(screen.getByText("添加新用户")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("用户姓名")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("设置密码")).toBeInTheDocument();
  });

  it("closes form when clicking cancel", async () => {
    mockUsersResponse([]);
    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText("暂无用户")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("添加用户"));
    expect(screen.getByText("添加新用户")).toBeInTheDocument();

    fireEvent.click(screen.getByText("取消"));
    await waitFor(() => {
      expect(screen.queryByText("添加新用户")).not.toBeInTheDocument();
    });
  });

  it("shows validation message when creating user without password", async () => {
    mockUsersResponse([]);
    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText("暂无用户")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("添加用户"));
    const nameInput = screen.getByPlaceholderText("用户姓名");
    const emailInput = screen.getByPlaceholderText("邮箱地址");

    fireEvent.change(nameInput, { target: { value: "Alice" } });
    fireEvent.change(emailInput, { target: { value: "alice@test.com" } });

    const createButton = screen.getByText("创建");
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText("创建用户时必须设置密码")).toBeInTheDocument();
    });
  });

  it("creates user successfully", async () => {
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (url.startsWith("/api/users") && init?.method === "POST") {
        return Promise.resolve({ ok: true, json: async () => ({ id: "u3", name: "Charlie", email: "charlie@test.com", role: "SALES", isActive: true }) });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });

    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText("暂无用户")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("添加用户"));
    fireEvent.change(screen.getByPlaceholderText("用户姓名"), { target: { value: "Charlie" } });
    fireEvent.change(screen.getByPlaceholderText("邮箱地址"), { target: { value: "charlie@test.com" } });
    fireEvent.change(screen.getByPlaceholderText("设置密码"), { target: { value: "password123" } });

    fireEvent.click(screen.getByText("创建"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/users",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            name: "Charlie",
            email: "charlie@test.com",
            role: "SALES",
            password: "password123",
          }),
        })
      );
    });
  });

  it("opens edit form with user data pre-filled", async () => {
    mockUsersResponse([
      { id: "u1", name: "Alice", email: "alice@test.com", role: "ADMIN", isActive: true, createdAt: "2024-01-15", updatedAt: "2024-01-15" },
    ]);
    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    const editButton = screen.getByTitle("编辑");
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText("编辑用户")).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue("Alice") as HTMLInputElement;
    expect(nameInput.value).toBe("Alice");
    const emailInput = screen.getByDisplayValue("alice@test.com") as HTMLInputElement;
    expect(emailInput.value).toBe("alice@test.com");
  });

  it("updates user successfully", async () => {
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (url.startsWith("/api/users") && (!init || !init.method)) {
        return Promise.resolve({ ok: true, json: async () => [{ id: "u1", name: "Alice", email: "alice@test.com", role: "ADMIN", isActive: true, createdAt: "2024-01-15", updatedAt: "2024-01-15" }] });
      }
      if (typeof url === "string" && url.startsWith("/api/users/") && init?.method === "PUT") {
        return Promise.resolve({ ok: true, json: async () => ({ id: "u1", name: "Alice Updated", email: "alice@test.com", role: "ADMIN", isActive: true }) });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });

    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle("编辑"));
    await waitFor(() => {
      expect(screen.getByText("编辑用户")).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue("Alice");
    fireEvent.change(nameInput, { target: { value: "Alice Updated" } });

    fireEvent.click(screen.getByText("保存"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/users/u1",
        expect.objectContaining({
          method: "PUT",
          body: expect.stringContaining("Alice Updated"),
        })
      );
    });
  });

  it("toggles user active status", async () => {
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (url.startsWith("/api/users") && (!init || !init.method)) {
        return Promise.resolve({ ok: true, json: async () => [{ id: "u1", name: "Alice", email: "alice@test.com", role: "ADMIN", isActive: true, createdAt: "2024-01-15", updatedAt: "2024-01-15" }] });
      }
      if (typeof url === "string" && url.startsWith("/api/users/") && init?.method === "PUT") {
        return Promise.resolve({ ok: true, json: async () => ({}) });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });

    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle("禁用账号"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/users/u1",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ isActive: false }),
        })
      );
    });
  });

  it("deletes user after confirmation", async () => {
    mockConfirm.mockReturnValue(true);
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (url.startsWith("/api/users") && (!init || !init.method)) {
        return Promise.resolve({ ok: true, json: async () => [{ id: "u1", name: "Alice", email: "alice@test.com", role: "ADMIN", isActive: true, createdAt: "2024-01-15", updatedAt: "2024-01-15" }] });
      }
      if (typeof url === "string" && url.startsWith("/api/users/") && init?.method === "DELETE") {
        return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });

    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle("删除"));

    expect(mockConfirm).toHaveBeenCalledWith("确认删除此用户？此操作不可恢复。");
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/users/u1", { method: "DELETE" });
    });
  });

  it("does not delete user when confirmation is cancelled", async () => {
    mockConfirm.mockReturnValue(false);
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (url.startsWith("/api/users") && (!init || !init.method)) {
        return Promise.resolve({ ok: true, json: async () => [{ id: "u1", name: "Alice", email: "alice@test.com", role: "ADMIN", isActive: true, createdAt: "2024-01-15", updatedAt: "2024-01-15" }] });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });

    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle("删除"));

    expect(mockConfirm).toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalledWith(
      expect.stringContaining("/api/users/u1"),
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("shows error message when delete fails", async () => {
    mockConfirm.mockReturnValue(true);
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (url.startsWith("/api/users") && (!init || !init.method)) {
        return Promise.resolve({ ok: true, json: async () => [{ id: "u1", name: "Alice", email: "alice@test.com", role: "ADMIN", isActive: true, createdAt: "2024-01-15", updatedAt: "2024-01-15" }] });
      }
      if (typeof url === "string" && url.startsWith("/api/users/") && init?.method === "DELETE") {
        return Promise.resolve({ ok: false, json: async () => ({ error: "Cannot delete yourself" }) });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });

    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle("删除"));

    await waitFor(() => {
      expect(screen.getByText("Cannot delete yourself")).toBeInTheDocument();
    });
  });
});
