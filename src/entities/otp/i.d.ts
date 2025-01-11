export interface IOneTimePassword {
  userID?: string;
  email?: string;
  phoneNumber?: string;
  otp: string;
  createdAt: Date;
  validityDurationInMinutes: number;
}
