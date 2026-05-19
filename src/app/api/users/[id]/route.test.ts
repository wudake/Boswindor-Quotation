import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PUT, DELETE } from "./route";

const { mockAuth, mockPrisma, mockBcryptHash } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockPrisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
  mockBcryptHash: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: (...args: unknown[]) => mockBcryptHash(...args),
  },
}));

function adminSession(userId = "admin-1") {
  return { user: { id: userId, role: "ADMIN" } };
}

function salesSession() {
  return { user: { id: "sales-1", role: "SALES" } };
}

async function readJson(response: Response) {
  return response.json();
}

function makeParams(id: string) {
  return Promise.resolve({ id });
}

describe("GET /api/users/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const request = new Request("http://localhost/api/users/u1");
    const response = await GET(request, { params: makeParams("u1") });
    expect(response.status).toBe(403);
    expect(await readJson(response)).toEqual({ error: "Forbidden" });
  });

  it("returns 403 for non-admin user", async () => {
    mockAuth.mockResolvedValue(salesSession());
    const request = new Request("http://localhost/api/users/u1");
    const response = await GET(request, { params: makeParams("u1") });
    expect(response.status).toBe(403);
  });

  it("returns 404 when user not found", async () => {
    mockAuth.mockResolvedValue(adminSession());
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const request = new Request("http://localhost/api/users/u1");
    const response = await GET(request, { params: makeParams("u1") });
    expect(response.status).toBe(404);
    expect(await readJson(response)).toEqual({ error: "User not found" });
  });

  it("returns user without password field", async () => {
    mockAuth.mockResolvedValue(adminSession());
    const user = { id: "u1", name: "Alice", email: "alice@test.com", role: "ADMIN", isActive: true, createdAt: "2024-01-01", updatedAt: "2024-01-01" };
    mockPrisma.user.findUnique.mockResolvedValue(user);
    const request = new Request("http://localhost/api/users/u1");
    const response = await GET(request, { params: makeParams("u1") });
    expect(response.status).toBe(200);
    const data = await readJson(response);
    expect(data).toEqual(user);
    expect(data).not.toHaveProperty("password");
  });
});

describe("PUT /api/users/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const request = new Request("http://localhost/api/users/u1", {
      method: "PUT",
      body: JSON.stringify({ name: "New Name" }),
    });
    const response = await PUT(request, { params: makeParams("u1") });
    expect(response.status).toBe(403);
  });

  it("returns 403 for non-admin user", async () => {
    mockAuth.mockResolvedValue(salesSession());
    const request = new Request("http://localhost/api/users/u1", {
      method: "PUT",
      body: JSON.stringify({ name: "New Name" }),
    });
    const response = await PUT(request, { params: makeParams("u1") });
    expect(response.status).toBe(403);
  });

  it("returns 400 when no fields provided", async () => {
    mockAuth.mockResolvedValue(adminSession());
    const request = new Request("http://localhost/api/users/u1", {
      method: "PUT",
      body: JSON.stringify({}),
    });
    const response = await PUT(request, { params: makeParams("u1") });
    expect(response.status).toBe(400);
    expect(await readJson(response)).toEqual({ error: "No fields to update" });
  });

  it("returns 400 when only undefined fields provided", async () => {
    mockAuth.mockResolvedValue(adminSession());
    const request = new Request("http://localhost/api/users/u1", {
      method: "PUT",
      body: JSON.stringify({ name: undefined, email: undefined }),
    });
    // JSON.stringify strips undefined values, so body becomes {}
    const response = await PUT(request, { params: makeParams("u1") });
    expect(response.status).toBe(400);
  });

  it("updates name and returns updated user", async () => {
    mockAuth.mockResolvedValue(adminSession());
    const updatedUser = { id: "u1", name: "Alice Updated", email: "alice@test.com", role: "ADMIN", isActive: true, createdAt: "2024-01-01", updatedAt: "2024-01-02" };
    mockPrisma.user.update.mockResolvedValue(updatedUser);

    const request = new Request("http://localhost/api/users/u1", {
      method: "PUT",
      body: JSON.stringify({ name: "Alice Updated" }),
    });
    const response = await PUT(request, { params: makeParams("u1") });
    expect(response.status).toBe(200);
    expect(await readJson(response)).toEqual(updatedUser);
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { name: "Alice Updated" },
      select: expect.any(Object),
    });
  });

  it("updates email to lowercase", async () => {
    mockAuth.mockResolvedValue(adminSession());
    mockPrisma.user.update.mockResolvedValue({ id: "u1", name: "Alice", email: "new@test.com", role: "ADMIN", isActive: true, createdAt: "2024-01-01", updatedAt: "2024-01-02" });

    const request = new Request("http://localhost/api/users/u1", {
      method: "PUT",
      body: JSON.stringify({ email: "NEW@TEST.COM" }),
    });
    await PUT(request, { params: makeParams("u1") });
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ email: "new@test.com" }),
      })
    );
  });

  it("updates role to ADMIN when specified", async () => {
    mockAuth.mockResolvedValue(adminSession());
    mockPrisma.user.update.mockResolvedValue({ id: "u1", name: "Alice", email: "alice@test.com", role: "ADMIN", isActive: true, createdAt: "2024-01-01", updatedAt: "2024-01-02" });

    const request = new Request("http://localhost/api/users/u1", {
      method: "PUT",
      body: JSON.stringify({ role: "ADMIN" }),
    });
    await PUT(request, { params: makeParams("u1") });
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ role: "ADMIN" }),
      })
    );
  });

  it("defaults role to SALES for invalid values", async () => {
    mockAuth.mockResolvedValue(adminSession());
    mockPrisma.user.update.mockResolvedValue({ id: "u1", name: "Alice", email: "alice@test.com", role: "SALES", isActive: true, createdAt: "2024-01-01", updatedAt: "2024-01-02" });

    const request = new Request("http://localhost/api/users/u1", {
      method: "PUT",
      body: JSON.stringify({ role: "INVALID" }),
    });
    await PUT(request, { params: makeParams("u1") });
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ role: "SALES" }),
      })
    );
  });

  it("updates isActive status", async () => {
    mockAuth.mockResolvedValue(adminSession());
    mockPrisma.user.update.mockResolvedValue({ id: "u1", name: "Alice", email: "alice@test.com", role: "ADMIN", isActive: false, createdAt: "2024-01-01", updatedAt: "2024-01-02" });

    const request = new Request("http://localhost/api/users/u1", {
      method: "PUT",
      body: JSON.stringify({ isActive: false }),
    });
    const response = await PUT(request, { params: makeParams("u1") });
    expect(response.status).toBe(200);
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ isActive: false }),
      })
    );
  });

  it("hashes password when provided and includes it in update", async () => {
    mockAuth.mockResolvedValue(adminSession());
    mockBcryptHash.mockResolvedValue("new-hashed");
    mockPrisma.user.update.mockResolvedValue({ id: "u1", name: "Alice", email: "alice@test.com", role: "ADMIN", isActive: true, createdAt: "2024-01-01", updatedAt: "2024-01-02" });

    const request = new Request("http://localhost/api/users/u1", {
      method: "PUT",
      body: JSON.stringify({ password: "newpassword" }),
    });
    await PUT(request, { params: makeParams("u1") });
    expect(mockBcryptHash).toHaveBeenCalledWith("newpassword", 10);
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ password: "new-hashed" }),
      })
    );
  });

  it("does not hash password when empty string provided", async () => {
    mockAuth.mockResolvedValue(adminSession());
    mockPrisma.user.update.mockResolvedValue({ id: "u1", name: "Alice", email: "alice@test.com", role: "ADMIN", isActive: true, createdAt: "2024-01-01", updatedAt: "2024-01-02" });

    const request = new Request("http://localhost/api/users/u1", {
      method: "PUT",
      body: JSON.stringify({ password: "" }),
    });
    await PUT(request, { params: makeParams("u1") });
    expect(mockBcryptHash).not.toHaveBeenCalled();
  });

  it("updates multiple fields at once", async () => {
    mockAuth.mockResolvedValue(adminSession());
    mockBcryptHash.mockResolvedValue("new-hashed");
    mockPrisma.user.update.mockResolvedValue({ id: "u1", name: "Alice", email: "alice@test.com", role: "ADMIN", isActive: false, createdAt: "2024-01-01", updatedAt: "2024-01-02" });

    const request = new Request("http://localhost/api/users/u1", {
      method: "PUT",
      body: JSON.stringify({ name: "Alice", email: "alice@test.com", role: "ADMIN", isActive: false, password: "newpass" }),
    });
    await PUT(request, { params: makeParams("u1") });
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          name: "Alice",
          email: "alice@test.com",
          role: "ADMIN",
          isActive: false,
          password: "new-hashed",
        },
      })
    );
  });

  it("returns 409 when email already exists", async () => {
    mockAuth.mockResolvedValue(adminSession());
    mockPrisma.user.update.mockRejectedValue({ code: "P2002" });

    const request = new Request("http://localhost/api/users/u1", {
      method: "PUT",
      body: JSON.stringify({ email: "existing@test.com" }),
    });
    const response = await PUT(request, { params: makeParams("u1") });
    expect(response.status).toBe(409);
    expect(await readJson(response)).toEqual({ error: "Email already exists" });
  });

  it("returns 500 on unexpected database error", async () => {
    mockAuth.mockResolvedValue(adminSession());
    mockPrisma.user.update.mockRejectedValue(new Error("DB down"));

    const request = new Request("http://localhost/api/users/u1", {
      method: "PUT",
      body: JSON.stringify({ name: "New" }),
    });
    const response = await PUT(request, { params: makeParams("u1") });
    expect(response.status).toBe(500);
    expect(await readJson(response)).toEqual({ error: "Failed to update user" });
  });
});

describe("DELETE /api/users/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const request = new Request("http://localhost/api/users/u1", { method: "DELETE" });
    const response = await DELETE(request, { params: makeParams("u1") });
    expect(response.status).toBe(403);
  });

  it("returns 403 for non-admin user", async () => {
    mockAuth.mockResolvedValue(salesSession());
    const request = new Request("http://localhost/api/users/u1", { method: "DELETE" });
    const response = await DELETE(request, { params: makeParams("u1") });
    expect(response.status).toBe(403);
  });

  it("returns 400 when trying to delete yourself", async () => {
    mockAuth.mockResolvedValue(adminSession("u1"));
    const request = new Request("http://localhost/api/users/u1", { method: "DELETE" });
    const response = await DELETE(request, { params: makeParams("u1") });
    expect(response.status).toBe(400);
    expect(await readJson(response)).toEqual({ error: "Cannot delete yourself" });
  });

  it("successfully deletes another user", async () => {
    mockAuth.mockResolvedValue(adminSession("admin-1"));
    mockPrisma.user.delete.mockResolvedValue({ id: "u2" });
    const request = new Request("http://localhost/api/users/u2", { method: "DELETE" });
    const response = await DELETE(request, { params: makeParams("u2") });
    expect(response.status).toBe(200);
    expect(await readJson(response)).toEqual({ success: true });
    expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: "u2" } });
  });

  it("returns 500 on database error", async () => {
    mockAuth.mockResolvedValue(adminSession("admin-1"));
    mockPrisma.user.delete.mockRejectedValue(new Error("DB down"));
    const request = new Request("http://localhost/api/users/u2", { method: "DELETE" });
    const response = await DELETE(request, { params: makeParams("u2") });
    expect(response.status).toBe(500);
    expect(await readJson(response)).toEqual({ error: "Failed to delete user" });
  });
});
