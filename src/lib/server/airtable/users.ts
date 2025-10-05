import { base, TABLES } from './index';
import type { AirtableUser, UserWithTokens } from './types';

export class UserService {
	/**
	 * Get a user by email
	 */
	static async getByEmail(email: string): Promise<AirtableUser | null> {
		try {
			const records = await base(TABLES.USERS)
				.select({
					filterByFormula: `{filloutemail} = '${email}'`,
					maxRecords: 1
				})
				.firstPage();

			if (records.length === 0) return null;

			const record = records[0];
			return {
				id: record.id,
				fields: record.fields as AirtableUser['fields'],
				createdTime: record.get('createdTime') as string
			};
		} catch (error) {
			console.error('Error fetching user by email:', error);
			throw error;
		}
	}

	/**
	 * Create a new user
	 */
	static async create(userData: Omit<AirtableUser['fields'], 'tokens'>): Promise<AirtableUser> {
		try {
			const records = await base(TABLES.USERS).create([
				{
					fields: userData
				}
			]);

			const record = records[0];
			return {
				id: record.id,
				fields: record.fields as AirtableUser['fields'],
				createdTime: record.get('createdTime') as string
			};
		} catch (error) {
			console.error('Error creating user:', error);
			throw error;
		}
	}

	/**
	 * Update user data
	 */
	static async update(recordId: string, updates: Partial<AirtableUser['fields']>): Promise<AirtableUser> {
		try {
			const records = await base(TABLES.USERS).update([
				{
					id: recordId,
					fields: updates
				}
			]);

			const record = records[0];
			return {
				id: record.id,
				fields: record.fields as AirtableUser['fields'],
				createdTime: record.get('createdTime') as string
			};
		} catch (error) {
			console.error('Error updating user:', error);
			throw error;
		}
	}

	/**
	 * Get user with token balance
	 */
	static async getUserWithTokens(email: string): Promise<UserWithTokens | null> {
		try {
			// Get user data
			const user = await this.getByEmail(email);
			if (!user) return null;

			// Return user with token balance (stored directly in Airtable)
			return {
				email: user.fields.filloutemail,
				name: user.fields.Name,
				isAdmin: user.fields.isAdmin || false,
				tokens: user.fields.Tokens || 0
			};
		} catch (error) {
			console.error('Error getting user with tokens:', error);
			throw error;
		}
	}

	/**
	 * Calculate user's token balance from payouts and orders (backup method)
	 */
	static async calculateUserTokens(email: string): Promise<number> {
		try {
			// Get user's payouts
			const payoutRecords = await base(TABLES.PAYOUTS)
				.select({
					filterByFormula: `{userEmail} = '${email}'`
				})
				.all();

			const totalPayouts = payoutRecords.reduce((sum, record) => {
				return sum + (record.get('tokens') as number || 0);
			}, 0);

			// Get user's orders (pending and fulfilled)
			const orderRecords = await base(TABLES.SHOP_ORDERS)
				.select({
					filterByFormula: `AND({userEmail} = '${email}', OR({status} = 'pending', {status} = 'fulfilled'))`
				})
				.all();

			const totalSpent = orderRecords.reduce((sum, record) => {
				return sum + (record.get('priceAtOrder') as number || 0);
			}, 0);

			return Math.max(totalPayouts - totalSpent, 0);
		} catch (error) {
			console.error('Error calculating user tokens:', error);
			throw error;
		}
	}

	/**
	 * Update user's token balance directly
	 */
	static async updateTokenBalance(email: string, tokens: number): Promise<AirtableUser | null> {
		try {
			const user = await this.getByEmail(email);
			if (!user || !user.id) return null;

			return await this.update(user.id, { tokens });
		} catch (error) {
			console.error('Error updating token balance:', error);
			throw error;
		}
	}

	/**
	 * Subtract tokens from user's balance (for purchases)
	 */
	static async subtractTokens(email: string, amount: number): Promise<boolean> {
		try {
			const userWithTokens = await this.getUserWithTokens(email);
			if (!userWithTokens) return false;

			if (userWithTokens.tokens < amount) {
				throw new Error('Insufficient tokens');
			}

			const newBalance = userWithTokens.tokens - amount;
			const updated = await this.updateTokenBalance(email, newBalance);
			return !!updated;
		} catch (error) {
			console.error('Error subtracting tokens:', error);
			throw error;
		}
	}

	/**
	 * Add tokens to user's balance (for payouts)
	 */
	static async addTokens(email: string, amount: number): Promise<boolean> {
		try {
			const userWithTokens = await this.getUserWithTokens(email);
			if (!userWithTokens) return false;

			const newBalance = userWithTokens.tokens + amount;
			const updated = await this.updateTokenBalance(email, newBalance);
			return !!updated;
		} catch (error) {
			console.error('Error adding tokens:', error);
			throw error;
		}
	}

	/**
	 * Get all users with their token balances
	 */
	static async getAllUsersWithTokens(): Promise<UserWithTokens[]> {
		try {
			const records = await base(TABLES.USERS).select().all();

			const users: UserWithTokens[] = [];
			
			for (const record of records) {
				const fields = record.fields as AirtableUser['fields'];
				
				users.push({
					email: fields.filloutemail,
					name: fields.Name,
					isAdmin: fields.isAdmin || false,
					tokens: fields.tokens || 0
				});
			}

			return users;
		} catch (error) {
			console.error('Error getting all users with tokens:', error);
			throw error;
		}
	}
}