import request from "supertest";
// import { UserController } from "./user.controller";
// import { UserService } from "./user.service";
import express, { Request, Response, NextFunction } from "express";
import { UserService } from "app/user/user.service";
import { UserController } from "app/user/user.controller";
import { User } from "app/user/user.model";
// import { User } from "./user.model";

jest.mock("app/user/user.service");

jest.mock("../../middleware/auth.middleware", () => ({
  authenticateToken: () => (req: Request, res: Response, next: NextFunction) => next(),
}));

describe("UserController", () => {
  let app: express.Application;
  let userService: jest.Mocked<UserService>;

  beforeEach(() => {
    userService = new UserService(jest.fn() as any, jest.fn() as any, jest.fn() as any, jest.fn() as any) as jest.Mocked<UserService>;
    const userController = new UserController(userService);
    app = express();
    app.use(express.json());
    app.use("/users", userController.router);
  });

  describe("POST /users", () => {
    it("should create a user and return the user ID", async () => {
      userService.createUser.mockResolvedValue(1);

      const response = await request(app)
        .post("/users")
        .send({ username: "testuser", email: "test@example.com", password: "password", role: "doctor" });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ userId: 1 });
      expect(userService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({ username: "testuser", email: "test@example.com" })
      );
    });

    it("should return 400 if an error occurs", async () => {
      userService.createUser.mockRejectedValue(new Error("Invalid data"));

      const response = await request(app)
        .post("/users")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Invalid data" });
    });
  });

  describe("PUT /users/:userId", () => {
    it("should update a user successfully", async () => {
      userService.updateUser.mockResolvedValue();

      const response = await request(app)
        .put("/users/1")
        .send({ username: "updateduser" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "User updated successfully" });
      expect(userService.updateUser).toHaveBeenCalledWith(1, { username: "updateduser" });
    });

    it("should return 400 if an error occurs", async () => {
      userService.updateUser.mockRejectedValue(new Error("Update failed"));

      const response = await request(app)
        .put("/users/1")
        .send({ username: "updateduser" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Update failed" });
    });
  });

  describe("DELETE /users/:userId", () => {
    it("should delete a user successfully", async () => {
      userService.deleteUser.mockResolvedValue();

      const response = await request(app).delete("/users/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "User deleted successfully" });
      expect(userService.deleteUser).toHaveBeenCalledWith(1);
    });

    it("should return 400 if an error occurs", async () => {
      userService.deleteUser.mockRejectedValue(new Error("Delete failed"));

      const response = await request(app).delete("/users/1");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Delete failed" });
    });
  });

  describe("GET /users", () => {
    it("should return a list of users", async () => {
      const mockUsers: User[] = [
        { id: 1, username: "testuser1", email: "test1@example.com", password: "hashed_password", role: "doctor", departmentId: undefined, specialtyIds: [] },
        { id: 2, username: "testuser2", email: "test2@example.com", password: "hashed_password", role: "patient", departmentId: undefined, specialtyIds: [] },
      ];
      userService.listAllUsers.mockResolvedValue(mockUsers);

      const response = await request(app).get("/users");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsers);
      expect(userService.listAllUsers).toHaveBeenCalled();
    });

    it("should return 500 if an error occurs", async () => {
      userService.listAllUsers.mockRejectedValue(new Error("Server error"));

      const response = await request(app).get("/users");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Server error" });
    });
  });

  describe("POST /users/login", () => {
    it("should authenticate a user and return a token", async () => {
      userService.authenticateAndGenerateToken.mockResolvedValue("mocked_token");

      const response = await request(app)
        .post("/users/login")
        .send({ email: "test@example.com", password: "password" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ token: "mocked_token" });
      expect(userService.authenticateAndGenerateToken).toHaveBeenCalledWith("test@example.com", "password");
    });

    it("should return 401 if authentication fails", async () => {
      userService.authenticateAndGenerateToken.mockResolvedValue(null);

      const response = await request(app)
        .post("/users/login")
        .send({ email: "test@example.com", password: "wrongpassword" });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: "Invalid credentials" });
    });

    it("should return 500 if an error occurs", async () => {
      userService.authenticateAndGenerateToken.mockRejectedValue(new Error("Server error"));

      const response = await request(app)
        .post("/users/login")
        .send({ email: "test@example.com", password: "password" });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Server error" });
    });
  });
});
