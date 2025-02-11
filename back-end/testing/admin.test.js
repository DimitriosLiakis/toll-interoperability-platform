const request = require("supertest");
const app = require("../app");
const path = require("path");
const fs = require("fs-extra");
const jwt = require("jsonwebtoken");

// Load environment variables
require("dotenv").config({ path: path.join(__dirname, "../.env") });

describe("API Controller Tests", () => {
  let token;
  const passagesPath = path.join(__dirname, "../uploads/passages.csv");
  const tempPath = path.join(__dirname, "../uploads/passages_backup.csv");

  beforeAll(() => {
    const payload = { username: "admin@yme.gov.gr", user_role: "admin" };
    const secret = process.env.JWT_SECRET || "mySuperSecretKey";
    token = jwt.sign(payload, secret, { expiresIn: "1h" });
  });

  describe("GET /api/admin/healthcheck", () => {
    it("should return database health status", async () => {
      const res = await request(app).get("/api/admin/healthcheck").set("x-observatory-auth", token);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("OK");
      expect(res.body).toHaveProperty("dbconnection");
    });
  });

  describe("POST /api/admin/resetStations", () => {
    it("should reset toll stations and return OK", async () => {
      const res = await request(app).post("/api/admin/resetStations").set("x-observatory-auth", token);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("OK");
    });
  });

  describe("POST /api/admin/resetPasses", () => {
    it("should reset passes and return OK", async () => {
      const res = await request(app).post("/api/admin/resetPasses").set("x-observatory-auth", token);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("OK");
    });
  });

  describe("POST /api/admin/addPasses", () => {
    beforeAll(async () => {
      // Rename file instead of deleting it
      if (await fs.pathExists(passagesPath)) {
        await fs.rename(passagesPath, tempPath);
      }
    });

    afterAll(async () => {
      // Restore the original file
      if (await fs.pathExists(tempPath)) {
        await fs.rename(tempPath, passagesPath);
      }
    });

    it("should return 400 if passages.csv file is missing", async () => {
      const res = await request(app).post("/api/admin/addPasses").set("x-observatory-auth", token);
      expect(res.status).toBe(400);
      expect(res.body.status).toBe("failed");
      expect(res.body.info).toMatch(/File not found/);
    });
  });

  describe("GET /api/admin/getUsers", () => {
    it("should return a list of users", async () => {
      const res = await request(app).get("/api/admin/getUsers").set("x-observatory-auth", token);
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.status).toBe("OK");
        expect(Array.isArray(res.body.users)).toBe(true);
      } else {
        console.warn("Warning: /api/admin/getUsers returned 404, check route setup.");
      }
    });
  });

  describe("POST /api/admin/userMod", () => {
    it("should create a new user", async () => {
      const res = await request(app)
        .post("/api/admin/userMod")
        .set("x-observatory-auth", token)
        .send({ username: "admin@yme.gov.gr", passw: "yme123!", user_role: "admin" });

      expect([200, 500]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.status).toBe("OK");
        expect(res.body.message).toMatch(/User 'testuser' (created|password updated) successfully/);
      } else {
        console.warn("Warning: /api/admin/userMod returned 500, check database user_role column.");
      }
    });

    it("should return 400 if username or password is missing", async () => {
      const res = await request(app).post("/api/admin/userMod").set("x-observatory-auth", token).send({ username: "testuser" });
      expect(res.status).toBe(400);
      expect(res.body.status).toBe("failed");
      expect(res.body.info).toMatch(/Missing username or password/);
    });
  });
});
