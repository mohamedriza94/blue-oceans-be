export const generateRandomPassword = (): string => {
  const upperCaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowerCaseChars = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const allChars = upperCaseChars + lowerCaseChars + numbers;

  let password = "";

  // Ensure at least one character of each type
  password += upperCaseChars[Math.floor(Math.random() * upperCaseChars.length)];
  password += lowerCaseChars[Math.floor(Math.random() * lowerCaseChars.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];

  // Generate remaining characters
  for (let i = password.length; i < 8; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the characters to make it more random
  password = password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");

  return password;
}
