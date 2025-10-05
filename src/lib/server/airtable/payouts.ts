import { base, TABLES } from './index';
import type { AirtablePayout, Payout } from './types';

export class PayoutService {
	/**
	 * Create a new payout
	 */
	static async create(payoutData: Omit<Payout, 'id' | 'createdAt'>): Promise<Payout> {
		try {
			const fields: AirtablePayout['fields'] = {
				tokens: payoutData.tokens,
				userEmail: payoutData.userEmail,
				memo: payoutData.memo,
				createdAt: new Date().toISOString()
			};

			const records = await base(TABLES.PAYOUTS).create([{ fields }]);
			const record = records[0];

			return this.transformRecord(record);
		} catch (error) {
			console.error('Error creating payout:', error);
			throw error;
		}
	}

	/**
	 * Get payout by ID
	 */
	static async getById(id: string): Promise<Payout | null> {
		try {
			const record = await base(TABLES.PAYOUTS).find(id);
			return this.transformRecord(record);
		} catch (error) {
			if (error.statusCode === 404) {
				return null;
			}
			console.error('Error fetching payout by ID:', error);
			throw error;
		}
	}

	/**
	 * Get payouts by user email
	 */
	static async getByUserEmail(userEmail: string): Promise<Payout[]> {
		try {
			const records = await base(TABLES.PAYOUTS)
				.select({
					filterByFormula: `{userEmail} = '${userEmail}'`,
					sort: [{ field: 'createdAt', direction: 'desc' }]
				})
				.all();

			return records.map((record) => this.transformRecord(record));
		} catch (error) {
			console.error('Error fetching payouts by user email:', error);
			throw error;
		}
	}

	/**
	 * Get all payouts
	 */
	static async getAll(): Promise<Payout[]> {
		try {
			const records = await base(TABLES.PAYOUTS)
				.select({
					sort: [{ field: 'createdAt', direction: 'desc' }]
				})
				.all();

			return records.map((record) => this.transformRecord(record));
		} catch (error) {
			console.error('Error fetching all payouts:', error);
			throw error;
		}
	}

	/**
	 * Update payout
	 */
	static async update(id: string, updates: Partial<Omit<Payout, 'id' | 'createdAt'>>): Promise<Payout> {
		try {
			const updateFields: Partial<AirtablePayout['fields']> = {
				...updates
			};

			const records = await base(TABLES.PAYOUTS).update([
				{
					id,
					fields: updateFields
				}
			]);

			const record = records[0];
			return this.transformRecord(record);
		} catch (error) {
			console.error('Error updating payout:', error);
			throw error;
		}
	}

	/**
	 * Mark payout as submitted to unified system
	 */
	static async markSubmittedToUnified(id: string): Promise<Payout> {
		try {
			return await this.update(id, { submittedToUnified: true });
		} catch (error) {
			console.error('Error marking payout as submitted:', error);
			throw error;
		}
	}

	/**
	 * Get user's total payout amount
	 */
	static async getUserTotalPayouts(userEmail: string): Promise<number> {
		try {
			const records = await base(TABLES.PAYOUTS)
				.select({
					filterByFormula: `{userEmail} = '${userEmail}'`
				})
				.all();

			return records.reduce((total, record) => {
				return total + (record.get('tokens') as number || 0);
			}, 0);
		} catch (error) {
			console.error('Error calculating user total payouts:', error);
			throw error;
		}
	}



	/**
	 * Delete a payout
	 */
	static async delete(id: string): Promise<boolean> {
		try {
			await base(TABLES.PAYOUTS).destroy([id]);
			return true;
		} catch (error) {
			console.error('Error deleting payout:', error);
			throw error;
		}
	}

	/**
	 * Batch create payouts
	 */
	static async createBatch(payoutsData: Omit<Payout, 'id' | 'createdAt'>[]): Promise<Payout[]> {
		try {
			const fieldsArray = payoutsData.map((payoutData) => ({
				fields: {
					tokens: payoutData.tokens,
					userEmail: payoutData.userEmail,
					memo: payoutData.memo,
					createdAt: new Date().toISOString()
				} as AirtablePayout['fields']
			}));

			// Airtable limits batch operations to 10 records at a time
			const batchSize = 10;
			const batches = [];
			for (let i = 0; i < fieldsArray.length; i += batchSize) {
				batches.push(fieldsArray.slice(i, i + batchSize));
			}

			const allRecords = [];
			for (const batch of batches) {
				const records = await base(TABLES.PAYOUTS).create(batch);
				allRecords.push(...records);
			}

			return allRecords.map((record) => this.transformRecord(record));
		} catch (error) {
			console.error('Error batch creating payouts:', error);
			throw error;
		}
	}

	/**
	 * Transform Airtable record to Payout type
	 */
	private static transformRecord(record: any): Payout {
		const fields = record.fields as AirtablePayout['fields'];

		return {
			id: record.id,
			tokens: fields.tokens,
			userEmail: fields.userEmail,
			memo: fields.memo,
			createdAt: fields.createdAt ? new Date(fields.createdAt) : new Date(record.createdTime)
		};
	}
}