import { ShopOrderService, ShopItemService } from '$lib/server/airtable';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user?.email) {
		return { orders: [] };
	}

	const orders = await ShopOrderService.getByUserEmail(locals.user.email);

	// Fetch shop item details for each order
	const ordersWithDetails = await Promise.all(
		orders.map(async (order) => {
			const item = order.shopItemId ? await ShopItemService.getById(order.shopItemId) : null;
			
			return {
				id: order.id,
				status: order.status,
				priceAtOrder: order.priceAtOrder,
				memo: order.memo,
				createdAt: order.createdAt,
				itemName: item?.name || 'Unknown Item',
				itemImageUrl: item?.imageUrl || null,
				userEmail: locals.user.email
			};
		})
	);

	return {
		orders: ordersWithDetails
	};
};