import { AuditService } from "app/audit-logs/audit.service";
import { DepartmentRepository } from "app/department/department.repository";
import { SpecialtyRepository } from "app/specialty/specialty.repository";
import { UserRepository } from "app/user/user.repository";
import { UserService } from "app/user/user.service";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashed_password"),
  compare: jest.fn().mockResolvedValue(true),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("mocked_token"),
}));

describe("UserService", () => {
  let userService: UserService;
  let userRepository: jest.Mocked<UserRepository>;
  let auditService: jest.Mocked<AuditService>;
  let specialtyRepository: jest.Mocked<SpecialtyRepository>;
  let departmentRepository: jest.Mocked<DepartmentRepository>;

  beforeEach(() => {
    userRepository = {
      getUserByEmail: jest.fn(),
      createUser: jest.fn().mockResolvedValue(1),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      listAllUsers: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    auditService = {
      logAction: jest.fn(),
    } as unknown as jest.Mocked<AuditService>;

    specialtyRepository = {
      listSpecialties: jest.fn(),
    } as unknown as jest.Mocked<SpecialtyRepository>;

    departmentRepository = {
      getDepartmentById: jest.fn(),
      listDepartments: jest.fn(),
    } as unknown as jest.Mocked<DepartmentRepository>;

    userService = new UserService(
      userRepository,
      auditService,
      specialtyRepository,
      departmentRepository
    );
  });

  describe("createUser", () => {
    it("should create a user successfully", async () => {
      const user = {
        email: "test@example.com",
        username: "testuser",
        password: "password",
        role: "doctor" as "doctor",
        departmentId: 1,
        specialtyIds: [1],
      };

      userRepository.getUserByEmail.mockResolvedValue(null);
      departmentRepository.getDepartmentById.mockResolvedValue({ id: 1, name: "Test Department" } as any);
      specialtyRepository.listSpecialties.mockResolvedValue([
        { specialtyId: 1, name: "Cardiology", description: "Heart specialist" },
      ]);

      const result = await userService.createUser(user);

      expect(result).toBe(1);
      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(user.email);
      expect(departmentRepository.getDepartmentById).toHaveBeenCalledWith(user.departmentId);
      expect(specialtyRepository.listSpecialties).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(user.password, 10);
      expect(userRepository.createUser).toHaveBeenCalledWith(
        expect.objectContaining({ email: user.email, password: "hashed_password" })
      );
      expect(auditService.logAction).toHaveBeenCalledWith(1, "User created");
    });

    it("should throw an error if the email already exists", async () => {
      const user = { email: "test@example.com", username: "testuser", password: "password", role: "admin" as "admin" };
      userRepository.getUserByEmail.mockResolvedValue({ id: 1, email: user.email } as any);

      await expect(userService.createUser(user)).rejects.toThrow("Email already exists");
      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(user.email);
    });
  });

  describe("authenticateUser", () => {
    it("should authenticate a user with valid credentials", async () => {
      const user = { id: 1, email: "test@example.com", username: "testuser", password: "hashed_password" } as any;
      userRepository.getUserByEmail.mockResolvedValue(user);

      const result = await userService.authenticateUser(user.email, "password");

      expect(result).toEqual(user);
      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(user.email);
      expect(bcrypt.compare).toHaveBeenCalledWith("password", user.password);
      expect(auditService.logAction).toHaveBeenCalledWith(user.id, "User authenticated");
    });

    it("should return null if credentials are invalid", async () => {
      userRepository.getUserByEmail.mockResolvedValue(null);

      const result = await userService.authenticateUser("invalid@example.com", "password");

      expect(result).toBeNull();
      expect(userRepository.getUserByEmail).toHaveBeenCalledWith("invalid@example.com");
    });
  });

  describe("authenticateAndGenerateToken", () => {
    it("should generate a token for valid credentials", async () => {
      const user = { id: 1, email: "test@example.com", username: "testuser", password: "hashed_password", role: "user" } as any;
      userRepository.getUserByEmail.mockResolvedValue(user);

      const result = await userService.authenticateAndGenerateToken(user.email, "password");

      expect(result).toBe("mocked_token");
      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(user.email);
      expect(bcrypt.compare).toHaveBeenCalledWith("password", user.password);
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: user.id, role: user.role },
        expect.any(String),
        { expiresIn: "1h" }
      );
      expect(auditService.logAction).toHaveBeenCalledWith(user.id, "Token generated");
    });
  });

  describe("updateUser", () => {
    it("should update a user and log the action", async () => {
      const updates = { role: "doctor" as "doctor", departmentId: 1, specialtyIds: [1] };
      departmentRepository.getDepartmentById.mockResolvedValue({ id: 1, name: "Test Department" } as any);
      specialtyRepository.listSpecialties.mockResolvedValue([
        { specialtyId: 1, name: "Cardiology", description: "Heart specialist" },
      ]);

      await userService.updateUser(1, updates);

      expect(departmentRepository.getDepartmentById).toHaveBeenCalledWith(updates.departmentId);
      expect(specialtyRepository.listSpecialties).toHaveBeenCalled();
      expect(userRepository.updateUser).toHaveBeenCalledWith(1, updates);
      expect(auditService.logAction).toHaveBeenCalledWith(1, "User updated");
    });
  });

  describe("deleteUser", () => {
    it("should delete a user and log the action", async () => {
      await userService.deleteUser(1);

      expect(userRepository.deleteUser).toHaveBeenCalledWith(1);
      expect(auditService.logAction).toHaveBeenCalledWith(1, "User deleted");
    });
  });

  describe("listAllUsers", () => {
    it("should return a list of users", async () => {
      const users = [
        { id: 1, email: "test@example.com", username: "testuser", password: "hashed_password", role: "user" },
      ];
      userRepository.listAllUsers.mockResolvedValue(users as any);

      const result = await userService.listAllUsers();

      expect(result).toEqual(users);
      expect(userRepository.listAllUsers).toHaveBeenCalled();
    });
  });
});
