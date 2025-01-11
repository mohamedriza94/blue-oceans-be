import { IOneTimePassword } from "../../../../entities/otp/i";

export interface IGenerateOTP extends IOneTimePassword {}

export interface IVerifyOTP extends IOneTimePassword {}

export interface IRequestOTP extends IGenerateOTP {
  otpDigitCount?: number;
  mail?: {
    title?: string;
    text?: string;
  };
}
