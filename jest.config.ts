import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  collectCoverageFrom: ["src/lib/**/*.ts", "src/app/api/**/*.ts"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"]
};

export default config;
