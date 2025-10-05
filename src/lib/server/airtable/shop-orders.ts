import { base, TABLES } from './index';
import type { AirtableShopOrder, ShopOrder } from './types';

export class ShopOrderService {
	/**
	 * Create a new shop order
	 */
	static async create(orderData: Omit<ShopOrder, 'id' | 'createdAt'>): Promise<ShopOrder> {
		try {
			const fields: AirtableShopOrder['fields'] = {
				shopItemId: orderData.shopItemId,
				priceAtOrder: orderData.priceAtOrder,
				status: orderData.status || 'pending',
				memo: orderData.memo,
				userId: orderData.userId,
				createdAt: new Date().toISOString()
			};

			const records = await base(TABLES.SHOP_ORDERS).create([{ fields }]);
			const record = records[0];

			return this.transformRecord(record);
		} catch (error) {
			console.error('Error creating shop order:', error);
			throw error;
		}
	}

	/**
	 * Get order by ID
	 */
	static async getById(id: string): Promise<ShopOrder | null> {
		try {
			const record = await base(TABLES.SHOP_ORDERS).find(id);
			return this.transformRecord(record);
		} catch (error) {
			if (error.statusCode === 404) {
				return null;
			}
			console.error('Error fetching shop order by ID:', error);
			throw error;
		}
	}

	/**
	 * Get orders by user ID
	 */
	static async getByUserId(userId: string): Promise<ShopOrder[]> {
		try {
			const records = await base(TABLES.SHOP_ORDERS)
				.select({
					filterByFormula: `{userId} = '${userId}'`,
					sort: [{ field: 'createdAt', direction: 'desc' }]
				})
				.all();

			return records.map((record) => this.transformRecord(record));
		} catch (error) {
			console.error('Error fetching orders by user ID:', error);
			throw error;
		}
	}

	/**
	 * Get all orders
	 */
	static async getAll(): Promise<ShopOrder[]> {
		try {
			const records = await base(TABLES.SHOP_ORDERS)
				.select({
					sort: [{ field: 'createdAt', direction: 'desc' }]
				})
				.all();

			return records.map((record) => this.transformRecord(record));
		} catch (error) {
			console.error('Error fetching all orders:', error);
			throw error;
		}
	}

	/**
	 * Update order status
	 */
	static async updateStatus(
		id: string,
		status: 'pending' | 'fulfilled' | 'rejected',
		memo?: string
	): Promise<ShopOrder> {
		try {
			const updateFields: Partial<AirtableShopOrder['fields']> = {
				status
			};

			if (memo !== undefined) {
				updateFields.memo = memo;
			}

			const records = await base(TABLES.SHOP_ORDERS).update([
				{
					id,
					fields: updateFields
				}
			]);

			const record = records[0];
			return this.transformRecord(record);
		} catch (error) {
			console.error('Error updating order status:', error);
			throw error;
		}
	}

	/**
	 * Get orders by status
	 */
	static async getByStatus(status: 'pending' | 'fulfilled' | 'rejected'): Promise<ShopOrder[]> {
		try {
			const records = await base(TABLES.SHOP_ORDERS)
				.select({
					filterByFormula: `{status} = '${status}'`,
					sort: [{ field: 'createdAt', direction: 'desc' }]
				})
				.all();

			return records.map((record) => this.transformRecord(record));
		} catch (error) {
			console.error('Error fetching orders by status:', error);
			throw error;
		}
	}

	/**
	 * Get orders with shop item details (for admin panel)
	 */
	static async getAllWithDetails(): Promise<(ShopOrder & { shopItem?: any })[]> {
		try {
			// Get all orders
			const orders = await this.getAll();

			// You can expand this to include linked shop item data
			// This would require setting up linked fields in Airtable
			return orders;
		} catch (error) {
			console.error('Error fetching orders with details:', error);
			throw error;
		}
	}

	/**
	 * Delete an order
	 */
	static async delete(id: string): Promise<boolean> {
		try {
			await base(TABLES.SHOP_ORDERS).destroy([id]);
			return true;
		} catch (error) {
			console.error('Error deleting shop order:', error);
			throw error;
		}
	}

	/**
	 * Get user's total spent amount
	 */
	static async getUserTotalSpent(
		userId: string,
		statuses: ('pending' | 'fulfilled' | 'rejected')[] = ['pending', 'fulfilled']
	): Promise<number> {
		try {
			const statusFilter = statuses.map((status) => `{status} = '${status}'`).join(', ');
			const records = await base(TABLES.SHOP_ORDERS)
				.select({
					filterByFormula: `AND({userId} = '${userId}', OR(${statusFilter}))`
				})
				.all();

			return records.reduce((total, record) => {
				return total + (record.get('priceAtOrder') as number || 0);
			}, 0);
		} catch (error) {
			console.error('Error calculating user total spent:', error);
			throw error;
		}
	}

	/**
	 * Transform Airtable record to ShopOrder type
	 */
	private static transformRecord(record: any): ShopOrder {
		const fields = record.fields as AirtableShopOrder['fields'];

		return {
			id: record.id,
			shopItemId: fields.shopItemId,
			priceAtOrder: fields.priceAtOrder,
			status: fields.status || 'pending',
			memo: fields.memo,
			createdAt: fields.createdAt ? new Date(fields.createdAt) : new Date(record.createdTime),
			userId: fields.userId
		};
	}
}