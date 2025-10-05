import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ShopItemService, ShopOrderService, UserService } from '$lib/server/airtable';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { shopItemId } = await request.json();

		if (!shopItemId) {
			return json({ error: 'Shop item ID is required' }, { status: 400 });
		}

		// Get user from session (assuming you have auth setup)
		const userId = locals.user?.slackId;
		if (!userId) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		// Get the shop item
		const item = await ShopItemService.getById(shopItemId);
		if (!item) {
			return json({ error: 'Shop item not found' }, { status: 404 });
		}

		// Get user's current token balance
		const user = await UserService.getUserWithTokens(userId);
		if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		// Check if user has enough tokens
		if (user.tokens < item.price) {
			return json(
				{
					error: 'Insufficient tokens',
					required: item.price,
					available: user.tokens
				},
				{ status: 400 }
			);
		}

		// Subtract tokens from user's balance (this is the key change for Airtable)
		const tokenSubtracted = await UserService.subtractTokens(userId, item.price);
		if (!tokenSubtracted) {
			return json({ error: 'Failed to process token payment' }, { status: 500 });
		}

		// Create the order
		const newOrder = await ShopOrderService.create({
			shopItemId: item.id,
			priceAtOrder: item.price,
			userId: userId,
			status: 'pending'
		});

		return json({
			success: true,
			order: newOrder,
			message: 'Order created successfully and tokens deducted'
		});
	} catch (error) {
		console.error('Order creation error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
