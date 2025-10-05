import { redirect } from '@sveltejs/kit';
import { ShopOrderService, ShopItemService, UserService } from '$lib/server/airtable';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user?.isAdmin) {
		throw redirect(302, '/');
	}

	// Get all orders
	const allOrders = await ShopOrderService.getAll();
	
	// For each order, get the associated shop item and user details
	const ordersWithDetails = await Promise.all(
		allOrders.map(async (order) => {
			const [item, user] = await Promise.all([
				ShopItemService.getById(order.shopItemId),
				UserService.getUserWithTokens(order.userId)
			]);

			return {
				id: order.id,
				status: order.status,
				priceAtOrder: order.priceAtOrder,
				memo: order.memo,
				createdAt: order.createdAt,
				itemName: item?.name || 'Unknown Item',
				itemImageUrl: item?.imageUrl || '',
				itemType: item?.type || 'unknown',
				userSlackId: user?.slackId || 'Unknown User',
				userAvatarUrl: user?.avatarUrl || '',
				userCountry: null, // You can add this to user service if needed
				userYswsDbFulfilled: null // You can add this to user service if needed
			};
		})
	);

	// Apply basic filtering from URL parameters
	const statusFilter = url.searchParams.get('status');
	const sortBy = url.searchParams.get('sortBy') || 'createdAt';
	const sortOrder = url.searchParams.get('sortOrder') || 'desc';

	let filteredOrders = ordersWithDetails;

	// Apply status filter
	if (statusFilter && statusFilter !== 'all') {
		filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
	}

	// Apply sorting
	filteredOrders.sort((a, b) => {
		let aValue, bValue;
		
		switch (sortBy) {
			case 'price':
				aValue = a.priceAtOrder;
				bValue = b.priceAtOrder;
				break;
			case 'status':
				aValue = a.status;
				bValue = b.status;
				break;
			case 'customer':
				aValue = a.userSlackId;
				bValue = b.userSlackId;
				break;
			case 'item':
				aValue = a.itemName;
				bValue = b.itemName;
				break;
			case 'createdAt':
			default:
				aValue = a.createdAt?.getTime() || 0;
				bValue = b.createdAt?.getTime() || 0;
				break;
		}

		if (sortOrder === 'desc') {
			return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
		} else {
			return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
		}
	});

	// Generate filter options
	const uniqueCustomers = [...new Set(ordersWithDetails.map(o => o.userSlackId).filter(Boolean))].sort();
	const uniqueItems = [...new Set(ordersWithDetails.map(o => o.itemName).filter(Boolean))].sort();
	const priceRange = ordersWithDetails.length > 0 ? {
		min: Math.min(...ordersWithDetails.map(o => o.priceAtOrder)),
		max: Math.max(...ordersWithDetails.map(o => o.priceAtOrder))
	} : { min: 0, max: 0 };

	return {
		orders: filteredOrders,
		filters: {
			status: statusFilter,
			sortBy,
			sortOrder
		},
		filterOptions: {
			customers: uniqueCustomers,
			items: uniqueItems,
			countries: [], // Empty for now, can be populated if needed
			priceRange
		}
	};
};