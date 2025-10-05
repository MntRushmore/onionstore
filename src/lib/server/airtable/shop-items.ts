import { base, TABLES } from './index';
import type { AirtableShopItem, ShopItem } from './types';

export class ShopItemService {
	/**
	 * Get all shop items
	 */
	static async getAll(): Promise<ShopItem[]> {
		try {
			const records = await base(TABLES.SHOP_ITEMS)
				.select({
					sort: [{ field: 'price', direction: 'asc' }]
				})
				.all();

			return records.map((record) => this.transformRecord(record));
		} catch (error) {
			console.error('Error fetching shop items:', error);
			throw error;
		}
	}

	/**
	 * Get a shop item by ID
	 */
	static async getById(id: string): Promise<ShopItem | null> {
		try {
			const record = await base(TABLES.SHOP_ITEMS).find(id);
			return this.transformRecord(record);
		} catch (error) {
			if (error.statusCode === 404) {
				return null;
			}
			console.error('Error fetching shop item by ID:', error);
			throw error;
		}
	}

	/**
	 * Create a new shop item
	 */
	static async create(itemData: Omit<ShopItem, 'id'>): Promise<ShopItem> {
		try {
			const fields: AirtableShopItem['fields'] = {
				name: itemData.name,
				description: itemData.description,
				imageUrl: itemData.imageUrl,
				price: itemData.price,
				usd_cost: itemData.usd_cost,
				type: itemData.type
			};

			const records = await base(TABLES.SHOP_ITEMS).create([{ fields }]);
			const record = records[0];

			return this.transformRecord(record);
		} catch (error) {
			console.error('Error creating shop item:', error);
			throw error;
		}
	}

	/**
	 * Update a shop item
	 */
	static async update(id: string, updates: Partial<Omit<ShopItem, 'id'>>): Promise<ShopItem> {
		try {
			const fields: Partial<AirtableShopItem['fields']> = {
				...updates
			};

			const records = await base(TABLES.SHOP_ITEMS).update([
				{
					id,
					fields
				}
			]);

			const record = records[0];
			return this.transformRecord(record);
		} catch (error) {
			console.error('Error updating shop item:', error);
			throw error;
		}
	}

	/**
	 * Delete a shop item
	 */
	static async delete(id: string): Promise<boolean> {
		try {
			await base(TABLES.SHOP_ITEMS).destroy([id]);
			return true;
		} catch (error) {
			console.error('Error deleting shop item:', error);
			throw error;
		}
	}

	/**
	 * Transform Airtable record to ShopItem type
	 */
	private static transformRecord(record: any): ShopItem {
		const fields = record.fields as AirtableShopItem['fields'];

		return {
			id: record.id,
			name: fields.name,
			description: fields.description,
			imageUrl: fields.imageUrl,
			price: fields.price,
			usd_cost: fields.usd_cost,
			type: fields.type
		};
	}
}