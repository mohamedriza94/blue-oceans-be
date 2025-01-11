export interface IVerifyAccount {
  email: string;
}
export interface IVerifyResetToken {
  token: string;
  returnUserID?: boolean;
}
export interface ISavePassword {
  email?: string;
  userID?: string;
  password: string;
  confirmedPassword: string;
  verifyCurrentPassword?: boolean;
  currentPassword?: string;
}

export interface IResetPasswordViaLink extends IVerifyResetToken, ISavePassword {}
