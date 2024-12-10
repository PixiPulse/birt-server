export const hashPassword = async (password: string) => {
  //encrypt password
  const arrayBuffer = await crypto.subtle.digest(
    "SHA-512",
    new TextEncoder().encode(password),
  );

  //   convert into base64
  return Buffer.from(arrayBuffer).toString("base64");
};

export const isValidPassword = async (
  password: string,
  hashedPassword: string,
) => {
  console.log(await hashPassword(password))
  console.log(hashedPassword)
  return (await hashPassword(password)) === hashedPassword;
};
