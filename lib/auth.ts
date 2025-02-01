type User = {
  username: string;
  password: string;
};

export function getValidUsers(): User[] {
  const authUsers = process.env.AUTH_USERS || process.env.NEXT_PUBLIC_AUTH_USERS || "";
  console.log("Raw AUTH_USERS:", authUsers); // Debug log

  const users = authUsers
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

  console.log("Parsed Users:", users); // Debug log
  return users;
}

export function validateCredentials(username: string, password: string): boolean {
  const validUsers = getValidUsers();
  console.log("Attempting login with:", { username, password }); // Debug log

  const isValid = validUsers.some((user) => {
    const usernameMatch = user.username === username.toLowerCase().trim();
    const passwordMatch = user.password === password.trim();
    console.log("Checking against:", user, { usernameMatch, passwordMatch }); // Debug log
    return usernameMatch && passwordMatch;
  });

  console.log("Login valid?", isValid); // Debug log
  return isValid;
}

export type AuthUser = ReturnType<typeof getValidUsers>[number];
