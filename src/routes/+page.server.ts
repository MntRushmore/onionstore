import type { PageServerLoad } from './$types';
import { ShopItemService } from '$lib/server/airtable';

export const load: PageServerLoad = async () => {
	return {
		items: await ShopItemService.getAll()
	};
};
