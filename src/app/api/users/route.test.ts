import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";

const { mockAuth, mockPrisma, mockBcryptHash } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockPrisma: {
    user: {
      findMany: vi.fn(),
      create: vi.fn(),
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

function adminSession() {
  return { user: { id: "admin-1", role: "ADMIN" } };
}

function salesSession() {
  return { user: { id: "sales-1", role: "SALES" } };
}

async function readJson(response: Response) {
  return response.json();
}

describe("GET /api/users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const request = new Request("http://localhost/api/users");
    const response = await GET(request);
    expect(response.status).toBe(403);
    expect(await readJson(response)).toEqual({ error: "Forbidden" });
  });

  it("returns 403 for non-admin user", async () => {
    mockAuth.mockResolvedValue(salesSession());
    const request = new Request("http://localhost/api/users");
    const response = await GET(request);
    expect(response.status).toBe(403);
    expect(await readJson(response)).toEqual({ error: "Forbidden" });
  });

  it("returns all users for admin without search", async () => {
    mockAuth.mockResolvedValue(adminSession());
    const users = [
      { id: "u1", name: "Alice", email: "alice@test.com", role: "ADMIN", isActive: true, createdAt: "2024-01-01", updatedAt: "2024-01-01" },
      { id: "u2", name: "Bob", email: "bob@test.com", role: "SALES", isActive: true, createdAt: "2024-01-02", updatedAt: "2024-01-02" },
    ];
    mockPrisma.user.findMany.mockResolvedValue(users);

    const request = new Request("http://localhost/api/users");
    const response = await GET(request);
    expect(response.status).toBe(200);
    expect(await readJson(response)).toEqual(users);

    expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });

  it("filters users by search query", async () => {
    mockAuth.mockResolvedValue(adminSession());
    const users = [{ id: "u1", name: "Alice", email: "alice@test.com", role: "ADMIN", isActive: true, createdAt: "2024-01-01", updatedAt: "2024-01-01" }];
    mockPrisma.user.findMany.mockResolvedValue(users);

    const request = new Request("http://localhost/api/users?search=alice");
    const response = await GET(request);
    expect(response.status).toBe(200);
    expect(await readJson(response)).toEqual(users);

    expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { name: { contains: "alice", mode: "insensitive" } },
          { email: { contains: "alice", mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      select: expect.any(Object),
    });
  });

  it("does not return password in response", async () => {
    mockAuth.mockResolvedValue(adminSession());
    const users = [{ id: "u1", name: "Alice", email: "alice@test.com", role: "ADMIN", isActive: true, createdAt: "2024-01-01", updatedAt: "2024-01-01" }];
    mockPrisma.user.findMany.mockResolvedValue(users);

    const request = new Request("http://localhost/api/users");
    const response = await GET(request);
    const data = await readJson(response);
    expect(data[0]).not.toHaveProperty("password");
  });
});

describe("POST /api/users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const request = new Request("http://localhost/api/users", {
      method: "POST",
      body: JSON.stringify({ name: "Alice", email: "alice@test.com", password: "secret" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(403);
  });

  it("returns 403 for non-admin user", async () => {
    mockAuth.mockResolvedValue(salesSession());
    const request = new Request("http://localhost/api/users", {
      method: "POST",
      body: JSON.stringify({ name: "Alice", email: "alice@test.com", password: "secret" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(403);
  });

  it("returns 400 when name is missing", async () => {
    mockAuth.mockResolvedValue(adminSession());
    const request = new Request("http://localhost/api/users", {
      method: "POST",
      body: JSON.stringify({ email: "alice@test.com", password: "secret" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(await readJson(response)).toEqual({ error: "Name, email and password are required" });
  });

  it("returns 400 when email is missing", async () => {
    mockAuth.mockResolvedValue(adminSession());
    const request = new Request("http://localhost/api/users", {
      method: "POST",
      body: JSON.stringify({ name: "Alice", password: "secret" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 when password is missing", async () => {
    mockAuth.mockResolvedValue(adminSession());
    const request = new Request("http://localhost/api/users", {
      method: "POST",
      body: JSON.stringify({ name: "Alice", email: "alice@test.com" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 when fields are empty strings", async () => {
    mockAuth.mockResolvedValue(adminSession());
    const request = new Request("http://localhost/api/users", {
      method: "POST",
      body: JSON.stringify({ name: "   ", email: "   ", password: "" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("creates user with hashed password and returns 201", async () => {
    mockAuth.mockResolvedValue(adminSession());
    mockBcryptHash.mockResolvedValue("hashed-secret");
    const createdUser = { id: "u1", name: "Alice", email: "alice@test.com", role: "SALES", isActive: true, createdAt: "2024-01-01", updatedAt: "2024-01-01" };
    mockPrisma.user.create.mockResolvedValue(createdUser);

    const request = new Request("http://localhost/api/users", {
      method: "POST",
      body: JSON.stringify({ name: "Alice", email: "alice@test.com", password: "secret", role: "SALES" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(201);
    expect(await readJson(response)).toEqual(createdUser);

    expect(mockBcryptHash).toHaveBeenCalledWith("secret", 10);
    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: {
        name: "Alice",
        email: "alice@test.com",
        password: "hashed-secret",
        role: "SALES",
        isActive: true,
      },
      select: expect.any(Object),
    });
  });

  it("normalizes email to lowercase", async () => {
    mockAuth.mockResolvedValue(adminSession());
    mockBcryptHash.mockResolvedValue("hashed");
    mockPrisma.user.create.mockResolvedValue({ id: "u1", name: "Alice", email: "alice@test.com", role: "SALES", isActive: true, createdAt: "2024-01-01", updatedAt: "2024-01-01" });

    const request = new Request("http://localhost/api/users", {
      method: "POST",
      body: JSON.stringify({ name: "Alice", email: "ALICE@TEST.COM", password: "secret" }),
    });
    await POST(request);

    expect(mockPrisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ email: "alice@test.com" }),
      })
    );
  });

  it("defaults role to SALES when not ADMIN", async () => {
    mockAuth.mockResolvedValue(adminSession());
    mockBcryptHash.mockResolvedValue("hashed");
    mockPrisma.user.create.mockResolvedValue({ id: "u1", name: "Alice", email: "alice@test.com", role: "SALES", isActive: true, createdAt: "2024-01-01", updatedAt: "2024-01-01" });

    const request = new Request("http://localhost/api/users", {
      method: "POST",
      body: JSON.stringify({ name: "Alice", email: "alice@test.com", password: "secret", role: "INVALID" }),
    });
    await POST(request);

    expect(mockPrisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ role: "SALES" }),
      })
    );
  });

  it("allows creating ADMIN user", async () => {
    mockAuth.mockResolvedValue(adminSession());
    mockBcryptHash.mockResolvedValue("hashed");
    mockPrisma.user.create.mockResolvedValue({ id: "u1", name: "Alice", email: "alice@test.com", role: "ADMIN", isActive: true, createdAt: "2024-01-01", updatedAt: "2024-01-01" });

    const request = new Request("http://localhost/api/users", {
      method: "POST",
      body: JSON.stringify({ name: "Alice", email: "alice@test.com", password: "secret", role: "ADMIN" }),
    });
    await POST(request);

    expect(mockPrisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ role: "ADMIN" }),
      })
    );
  });

  it("returns 409 when email already exists", async () => {
    mockAuth.mockResolvedValue(adminSession());
    mockBcryptHash.mockResolvedValue("hashed");
    mockPrisma.user.create.mockRejectedValue({ code: "P2002" });

    const request = new Request("http://localhost/api/users", {
      method: "POST",
      body: JSON.stringify({ name: "Alice", email: "alice@test.com", password: "secret" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(409);
    expect(await readJson(response)).toEqual({ error: "Email already exists" });
  });

  it("returns 500 on unexpected database error", async () => {
    mockAuth.mockResolvedValue(adminSession());
    mockBcryptHash.mockResolvedValue("hashed");
    mockPrisma.user.create.mockRejectedValue(new Error("DB down"));

    const request = new Request("http://localhost/api/users", {
      method: "POST",
      body: JSON.stringify({ name: "Alice", email: "alice@test.com", password: "secret" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(500);
    expect(await readJson(response)).toEqual({ error: "Failed to create user" });
  });
});
