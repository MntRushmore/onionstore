// Airtable adapter that provides the same interface as the original PostgreSQL setup
// This allows us to maintain compatibility with existing code while using Airtable

import { 
	UserService, 
	ShopItemService, 
	ShopOrderService, 
	PayoutService,
	type UserWithTokens,
	type ShopItem,
	type ShopOrder,
	type Payout
} from '../airtable';

/**
 * Airtable adapter that mimics Drizzle ORM interface
 */
export class AirtableAdapter {
	/**
	 * Simulate a select operation for shop items
	 */
	static shopItems = {
		async select() {
			return {
				async from() {
					return {
						async orderBy() {
							return await ShopItemService.getAll();
						}
					};
				}
			};
		},

		async findById(id: string) {
			return await ShopItemService.getById(id);
		},

		async create(data: Omit<ShopItem, 'id'>) {
			return await ShopItemService.create(data);
		},

		async update(id: string, data: Partial<Omit<ShopItem, 'id'>>) {
			return await ShopItemService.update(id, data);
		},

		async delete(id: string) {
			return await ShopItemService.delete(id);
		}
	};

	/**
	 * Simulate a select operation for users with tokens
	 */
	static usersWithTokens = {
		async select() {
			return {
				async from() {
					return {
						async where(filterFn?: (user: UserWithTokens) => boolean) {
							const users = await UserService.getAllUsersWithTokens();
							return filterFn ? users.filter(filterFn) : users;
						},
						async limit(count: number) {
							const users = await UserService.getAllUsersWithTokens();
							return users.slice(0, count);
						}
					};
				}
			};
		},

		async findBySlackId(slackId: string) {
			return await UserService.getUserWithTokens(slackId);
		}
	};

	/**
	 * Shop orders operations
	 */
	static shopOrders = {
		async insert(data: Omit<ShopOrder, 'id' | 'createdAt'>) {
			const order = await ShopOrderService.create(data);
			return {
				returning() {
					return [order];
				}
			};
		},

		async select() {
			return {
				async from() {
					return {
						async where(filterFn?: (order: ShopOrder) => boolean) {
							const orders = await ShopOrderService.getAll();
							return filterFn ? orders.filter(filterFn) : orders;
						},
						async orderBy() {
							return await ShopOrderService.getAll();
						}
					};
				}
			};
		},

		async findById(id: string) {
			return await ShopOrderService.getById(id);
		},

		async update(id: string, updates: { status?: 'pending' | 'fulfilled' | 'rejected', memo?: string }) {
			return await ShopOrderService.updateStatus(id, updates.status || 'pending', updates.memo);
		}
	};

	/**
	 * Payouts operations
	 */
	static payouts = {
		async insert(data: Omit<Payout, 'id' | 'createdAt'>) {
			const payout = await PayoutService.create(data);
			return {
				returning() {
					return [payout];
				}
			};
		},

		async select() {
			return {
				async from() {
					return {
						async where(filterFn?: (payout: Payout) => boolean) {
							const payouts = await PayoutService.getAll();
							return filterFn ? payouts.filter(filterFn) : payouts;
						},
						async orderBy() {
							return await PayoutService.getAll();
						}
					};
				}
			};
		},

		async findById(id: string) {
			return await PayoutService.getById(id);
		},

		async update(id: string, updates: Partial<Omit<Payout, 'id' | 'createdAt'>>) {
			return await PayoutService.update(id, updates);
		}
	};

	/**
	 * Generic select operation
	 */
	static select() {
		return {
			from: (table: any) => {
				if (table === 'shopItems') {
					return {
						orderBy: () => ShopItemService.getAll(),
						where: (filterFn: any) => {
							// Handle where conditions
							return ShopItemService.getAll();
						}
					};
				}
				if (table === 'usersWithTokens') {
					return {
						where: (filterFn: any) => UserService.getAllUsersWithTokens(),
						limit: (count: number) => UserService.getAllUsersWithTokens().then(users => users.slice(0, count))
					};
				}
				if (table === 'shopOrders') {
					return {
						orderBy: () => ShopOrderService.getAll(),
						where: (filterFn: any) => ShopOrderService.getAll()
					};
				}
				if (table === 'payouts') {
					return {
						orderBy: () => PayoutService.getAll(),
						where: (filterFn: any) => PayoutService.getAll()
					};
				}
				return [];
			}
		};
	}
}

// Export the adapter as 'db' to maintain compatibility
export const db = AirtableAdapter;

// Export types for compatibility
export type { UserWithTokens, ShopItem, ShopOrder, Payout };

// Export the services for direct access when needed
export {
	UserService,
	ShopItemService,
	ShopOrderService,
	PayoutService
};