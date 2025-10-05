import { base, TABLES } from './index';
import type { AirtableUser, UserWithTokens } from './types';

export class UserService {
	/**
	 * Get a user by Slack ID
	 */
	static async getBySlackId(slackId: string): Promise<AirtableUser | null> {
		try {
			const records = await base(TABLES.USERS)
				.select({
					filterByFormula: `{slackId} = '${slackId}'`,
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
			console.error('Error fetching user by Slack ID:', error);
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
	 * Get user with calculated token balance
	 * This method calculates tokens from payouts and orders
	 */
	static async getUserWithTokens(slackId: string): Promise<UserWithTokens | null> {
		try {
			// Get user data
			const user = await this.getBySlackId(slackId);
			if (!user) return null;

			// If tokens are stored directly in Airtable (recommended approach)
			if (typeof user.fields.tokens === 'number') {
				return {
					slackId: user.fields.slackId,
					avatarUrl: user.fields.avatarUrl,
					isAdmin: user.fields.isAdmin || false,
					tokens: user.fields.tokens
				};
			}

			// Fallback: Calculate tokens from payouts and orders
			const tokens = await this.calculateUserTokens(slackId);

			return {
				slackId: user.fields.slackId,
				avatarUrl: user.fields.avatarUrl,
				isAdmin: user.fields.isAdmin || false,
				tokens: tokens
			};
		} catch (error) {
			console.error('Error getting user with tokens:', error);
			throw error;
		}
	}

	/**
	 * Calculate user's token balance from payouts and orders
	 */
	static async calculateUserTokens(slackId: string): Promise<number> {
		try {
			// Get user's payouts
			const payoutRecords = await base(TABLES.PAYOUTS)
				.select({
					filterByFormula: `{userId} = '${slackId}'`
				})
				.all();

			const totalPayouts = payoutRecords.reduce((sum, record) => {
				return sum + (record.get('tokens') as number || 0);
			}, 0);

			// Get user's orders (pending and fulfilled)
			const orderRecords = await base(TABLES.SHOP_ORDERS)
				.select({
					filterByFormula: `AND({userId} = '${slackId}', OR({status} = 'pending', {status} = 'fulfilled'))`
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
	 * Update user's token balance directly (recommended approach)
	 */
	static async updateTokenBalance(slackId: string, tokens: number): Promise<AirtableUser | null> {
		try {
			const user = await this.getBySlackId(slackId);
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
	static async subtractTokens(slackId: string, amount: number): Promise<boolean> {
		try {
			const userWithTokens = await this.getUserWithTokens(slackId);
			if (!userWithTokens) return false;

			if (userWithTokens.tokens < amount) {
				throw new Error('Insufficient tokens');
			}

			const newBalance = userWithTokens.tokens - amount;
			const updated = await this.updateTokenBalance(slackId, newBalance);
			return !!updated;
		} catch (error) {
			console.error('Error subtracting tokens:', error);
			throw error;
		}
	}

	/**
	 * Add tokens to user's balance (for payouts)
	 */
	static async addTokens(slackId: string, amount: number): Promise<boolean> {
		try {
			const userWithTokens = await this.getUserWithTokens(slackId);
			if (!userWithTokens) return false;

			const newBalance = userWithTokens.tokens + amount;
			const updated = await this.updateTokenBalance(slackId, newBalance);
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
				
				let tokens = 0;
				if (typeof fields.tokens === 'number') {
					tokens = fields.tokens;
				} else {
					// Calculate tokens if not stored directly
					tokens = await this.calculateUserTokens(fields.slackId);
				}

				users.push({
					slackId: fields.slackId,
					avatarUrl: fields.avatarUrl,
					isAdmin: fields.isAdmin || false,
					tokens: tokens
				});
			}

			return users;
		} catch (error) {
			console.error('Error getting all users with tokens:', error);
			throw error;
		}
	}
}