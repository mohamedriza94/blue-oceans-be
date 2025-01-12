/**
 * VerifyAccount():
 * Verifies the user's account and then generates a password reset link.
 * 
 * - Validates input email.
 * - Checks if the account is active and not deleted.
 * - Generates a JWT for password reset with a validity duration.
 * - Sends a reset password email with a link.
 */

/**
 * VerifyResetToken():
 * Verifies the password reset token.
 * 
 * - Validates the token and decodes it.
 * - Verifies the user ID from the token.
 * - Fetches user account details to ensure the user exists and is not deleted.
 */

/**
 * SavePassword():
 * Updates the new password.
 * 
 * - Validates the new password and confirms it matches the confirmed password.
 * - Hashes the new password before saving.
 * - Updates the user's password in the database.
 */

/**
 * ResetPasswordViaLink():
 * Handles password reset for LINK-BASED resets ONLY by verifying the token, updating the password, and notifying the user.
 * 
 * - Verifies the reset token to ensure the link is valid and prevent unauthorized access.
 * - Updates the user's password in the database after successful token validation.
 * - Sends a confirmation email notifying the user of the successful password reset.
 */