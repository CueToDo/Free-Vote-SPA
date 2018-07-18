import { SignInStatuses } from './enums';

  // API return object
export class SignInData {
  // Server Error
  Error = '';
  // SignIn Status
  public SignInStatus = SignInStatuses.SignedOut;
  // SignIn Failure
  public AttemptsRemaining = 0;
  // SignIn Success
  public JWT  = '';
  public roles: string[] = [];
}
