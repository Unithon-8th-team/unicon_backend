import * as bcrypt from 'bcrypt';

export const hashedPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

export const validateUser = async (
  plainPassword: string,
  userPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, userPassword);
};
