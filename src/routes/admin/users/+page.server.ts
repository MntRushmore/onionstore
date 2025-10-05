import { redirect } from '@sveltejs/kit';
import { UserService, ShopOrderService, ShopItemService } from '$lib/server/airtable';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user?.isAdmin) {
		throw redirect(302, '/');
	}

	// Get all users with their token counts
	const users = await UserService.getAllUsersWithTokens();

	// Get all orders
	const allOrders = await ShopOrderService.getAll();
	
	// Add item details to orders
	const orders = await Promise.all(
		allOrders.map(async (order) => {
			const item = await ShopItemService.getById(order.shopItemId);
			return {
				id: order.id,
				userEmail: order.userEmail,
				priceAtOrder: order.priceAtOrder,
				status: order.status,
				createdAt: order.createdAt,
				itemName: item?.name || 'Unknown Item',
				itemType: item?.type || 'digital'
			};
		})
	);

	return {
		users,
		orders
	};
};
