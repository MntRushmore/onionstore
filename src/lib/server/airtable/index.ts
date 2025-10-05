import Airtable from 'airtable';

if (!process.env.AIRTABLE_API_KEY) {
	throw new Error('AIRTABLE_API_KEY environment variable is required');
}

if (!process.env.AIRTABLE_BASE_ID) {
	throw new Error('AIRTABLE_BASE_ID environment variable is required');
}

// Initialize Airtable
const base = new Airtable({
	apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID);

// Table names - customize these to match your Airtable base
const TABLES = {
	USERS: process.env.AIRTABLE_USERS_TABLE || 'Users',
	SHOP_ITEMS: process.env.AIRTABLE_SHOP_ITEMS_TABLE || 'Shop Items',
	SHOP_ORDERS: process.env.AIRTABLE_SHOP_ORDERS_TABLE || 'Shop Orders',
	PAYOUTS: process.env.AIRTABLE_PAYOUTS_TABLE || 'Payouts'
};

export { base, TABLES };

// Export our service modules
export * from './users';
export * from './shop-items';
export * from './shop-orders';
export * from './payouts';
export * from './types';