// import { UserRepository } from "./user.repository";
import { UserRepository } from "app/user/user.repository";
import { DatabaseService } from "../../database/database.service";
import { User } from "app/user/user.model";
// import { User } from "./user.model";

jest.mock("../../database/database.service");

describe("UserRepository", () => {
  let userRepository: UserRepository;
  let dbService: jest.Mocked<DatabaseService>;

  beforeEach(() => {
    dbService = new DatabaseService() as jest.Mocked<DatabaseService>;
    userRepository = new UserRepository(dbService);
  });

  describe("getUserByEmail", () => {
    it("should return a user when a matching email is found", async () => {
      const mockUser: User = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
        password: "hashed_password",
        role: "doctor",
        departmentId: undefined,
        specialtyIds: [],
      };
      dbService.execQuery.mockResolvedValue([mockUser]);

      const result = await userRepository.getUserByEmail("test@example.com");

      expect(result).toEqual(mockUser);
      expect(dbService.execQuery).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE email = ?",
        ["test@example.com"]
      );
    });

    it("should return null when no matching email is found", async () => {
      dbService.execQuery.mockResolvedValue([]);

      const result = await userRepository.getUserByEmail("nonexistent@example.com");

      expect(result).toBeNull();
      expect(dbService.execQuery).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE email = ?",
        ["nonexistent@example.com"]
      );
    });
  });

  describe("createUser", () => {
    it("should create a user and return the new user ID", async () => {
      dbService.execQuery.mockResolvedValue({ lastID: 1 });

      const user: User = {
        username: "testuser",
        email: "test@example.com",
        password: "hashed_password",
        role: "doctor",
        departmentId: 1,
        specialtyIds: [1, 2],
      };

      const result = await userRepository.createUser(user);

      expect(result).toBe(1);
      expect(dbService.execQuery).toHaveBeenCalledWith(
        "INSERT INTO users (username, email, password, role, departmentId) VALUES (?, ?, ?, ?, ?)",
        ["testuser", "test@example.com", "hashed_password", "doctor", 1]
      );
      expect(dbService.execQuery).toHaveBeenCalledWith(
        "INSERT INTO doctor_specialties (doctorId, specialtyId) VALUES (?, ?)",
        [1, 1]
      );
      expect(dbService.execQuery).toHaveBeenCalledWith(
        "INSERT INTO doctor_specialties (doctorId, specialtyId) VALUES (?, ?)",
        [1, 2]
      );
    });
  });

  describe("getUserById", () => {
    it("should return a user when a matching ID is found", async () => {
      const mockUser: User = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
        password: "hashed_password",
        role: "doctor",
        departmentId: undefined,
        specialtyIds: [],
      };
      dbService.execQuery.mockResolvedValue([mockUser]);

      const result = await userRepository.getUserById(1);

      expect(result).toEqual(mockUser);
      expect(dbService.execQuery).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE id = ?",
        [1]
      );
    });
  });

  describe("updateUser", () => {
    it("should update the user with the specified ID", async () => {
      await userRepository.updateUser(1, { username: "updateduser" });

      expect(dbService.execQuery).toHaveBeenCalledWith(
        "UPDATE users SET username = ? WHERE id = ?",
        ["updateduser", 1]
      );
    });
  });

  describe("deleteUser", () => {
    it("should delete the user with the specified ID", async () => {
      await userRepository.deleteUser(1);

      expect(dbService.execQuery).toHaveBeenCalledWith(
        "DELETE FROM users WHERE id = ?",
        [1]
      );
    });
  });

  describe("listAllUsers", () => {
    it("should return a list of all users", async () => {
      const mockUsers: User[] = [
        {
          id: 1,
          username: "testuser1",
          email: "test1@example.com",
          password: "hashed_password1",
          role: "doctor",
          departmentId: undefined,
          specialtyIds: [],
        },
        {
          id: 2,
          username: "testuser2",
          email: "test2@example.com",
          password: "hashed_password2",
          role: "patient",
          departmentId: undefined,
          specialtyIds: [],
        },
      ];

      dbService.execQuery.mockResolvedValue(mockUsers);

      const result = await userRepository.listAllUsers();

      expect(result).toEqual(mockUsers);
      expect(dbService.execQuery).toHaveBeenCalledWith("SELECT * FROM users");
    });
  });
});
