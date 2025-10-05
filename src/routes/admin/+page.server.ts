import { redirect } from '@sveltejs/kit';
import { ShopItemService } from '$lib/server/airtable';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user?.isAdmin) {
		throw redirect(302, '/');
	}

	const items = await ShopItemService.getAll();

	return {
		items
	};
};
