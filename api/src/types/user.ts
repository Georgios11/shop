/**
 * Interface for initial user data structure.
 */
export interface User {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: string;
  image?: string;
  is_banned?: boolean;
}

/**
 * Interface for user update data structure.
 */
export interface UpdateUserData {
  oldPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
  [key: string]: any; // Allows additional properties
}

/**
 * Interface for user update result structure.
 */
export interface UpdateUserResult {
  isPasswordMatched?: boolean;
  updatedUser: any; // Will be UserDocument | null
}
