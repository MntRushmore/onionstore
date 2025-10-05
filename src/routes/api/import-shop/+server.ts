import { json } from '@sveltejs/kit';
import { ADMIN_KEY } from '$env/static/private';
import { ShopItemService } from '$lib/server/airtable';

export async function POST({ request }) {
	if (request.headers.get('Authorization') !== `Bearer ${ADMIN_KEY}`) {
		return json({ error: 'Pass in an Authorization header.' }, { status: 401 });
	}

	try {
		const items = await request.json();

		if (!Array.isArray(items)) {
			return json({ error: 'Expected an array of shop items' }, { status: 400 });
		}

		const results = [];
		
		for (const item of items) {
			try {
				// Try to update existing item or create new one
				const existing = await ShopItemService.getById(item.id);
				
				if (existing) {
					const updated = await ShopItemService.update(item.id, item);
					results.push(updated);
				} else {
					const created = await ShopItemService.create(item);
					results.push(created);
				}
			} catch (error) {
				console.error(`Failed to process item ${item.id}:`, error);
			}
		}

		return json({
			success: true,
			message: `Successfully processed ${results.length} items`,
			data: results
		});
	} catch (error) {
		console.error('Error processing shop items:', error);
		return json(
			{ error: 'Failed to process shop items', details: String(error) },
			{ status: 500 }
		);
	}
}