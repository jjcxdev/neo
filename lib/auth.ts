type User = {
  username: string;
  password: string;
};

export function getValidUsers(): User[] {
  const authUsers = process.env.AUTH_USERS || "";
  return authUsers
    .split(",")
    .map((pair) => pair.trim())
    .filter((pair) => pair.includes(":"))
    .map((userString) => {
      const [username, password] = userString.split(":");
      return {
        username: username.trim().toLowerCase(),
        password: password.trim(),
      };
    });
}

export function validateCredentials(username: string, password: string): boolean {
  const validUsers = getValidUsers();
  return validUsers.some((user) => user.username === username && user.password === password);
}

export type AuthUser = ReturnType<typeof getValidUsers>[number];
