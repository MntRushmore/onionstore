import { UserService } from './airtable';
import type { UserWithTokens } from './airtable/types';

/**
 * Simple email-based authentication
 */
export class AuthService {
	/**
	 * Login or create user with email
	 */
	static async loginWithEmail(email: string, name?: string): Promise<UserWithTokens | null> {
		try {
			// First, try to get existing user
			let user = await UserService.getUserWithTokens(email);
			
			if (!user) {
				// Create new user if doesn't exist
				const newUser = await UserService.create({
					email,
					name: name || email.split('@')[0], // Use name or email prefix
					isAdmin: false,
					tokens: 0 // Start with 0 tokens
				});
				
				if (newUser) {
					user = {
						email: newUser.fields.email,
						name: newUser.fields.name,
						isAdmin: newUser.fields.isAdmin || false,
						tokens: newUser.fields.tokens || 0
					};
				}
			}
			
			return user;
		} catch (error) {
			console.error('Login error:', error);
			throw error;
		}
	}

	/**
	 * Check if email is valid format
	 */
	static isValidEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	/**
	 * Create session data for user
	 */
	static createSession(user: UserWithTokens) {
		return {
			email: user.email,
			name: user.name,
			isAdmin: user.isAdmin,
			tokens: user.tokens
		};
	}
}