/**
 * AuthResponseDto
 * 
 * Data transfer object for authentication responses.
 * Returned after successful registration or login.
 * 
 * Requirements: 1.1, 1.2
 */
export class AuthResponseDto {
  userId: string;
  token: string;
}
