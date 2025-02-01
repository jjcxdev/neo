// Note: In production, use environment variables for these values
export const VALID_USERS = [
  { username: "justin", password: "9669" },
  { username: "user2", password: "pass2" },
] as const;

export type AuthUser = (typeof VALID_USERS)[number];

export function validateCredentials(username: string, password: string): boolean {
  return VALID_USERS.some((user) => user.username === username && user.password === password);
}
