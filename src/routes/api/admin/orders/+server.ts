import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ShopOrderService, ShopItemService } from '$lib/server/airtable';

export const PATCH: RequestHandler = async ({ request, locals }) => {
	try {
		// Check if user is admin
		if (!locals.user?.isAdmin) {
			return json({ error: 'Access denied' }, { status: 403 });
		}

		const { orderId, status, memo } = await request.json();

		if (!orderId || !status) {
			return json({ error: 'Order ID and status are required' }, { status: 400 });
		}

		// Validate status
		if (!['fulfilled', 'rejected'].includes(status)) {
			return json({ error: 'Invalid status' }, { status: 400 });
		}

		// Update the order
		const updatedOrder = await ShopOrderService.updateStatus(
			orderId, 
			status as 'pending' | 'fulfilled' | 'rejected',
			memo
		);

		if (!updatedOrder) {
			return json({ error: 'Order not found' }, { status: 404 });
		}

		// Email notification removed - admin can manually contact users if needed

		return json({
			success: true,
			order: updatedOrder,
			message: `Order ${status} successfully`
		});
	} catch (error) {
		console.error('Order update error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
