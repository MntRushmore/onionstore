import dotenv from 'dotenv';
dotenv.config();
console.log("Loaded Airtable token prefix:", process.env.AIRTABLE_ACCESS_TOKEN?.slice(0, 5));

import AirtableConnectModule from '@theo-dev/airtable-connect';
const AirtableConnect = AirtableConnectModule.AirtableConnect;

if (!process.env.AIRTABLE_ACCESS_TOKEN) {
	throw new Error('AIRTABLE_ACCESS_TOKEN environment variable is required');
}

if (!process.env.AIRTABLE_BASE_ID) {
	throw new Error('AIRTABLE_BASE_ID environment variable is required');
}

// Initialize Airtable connection using AirtableConnect wrapper
const { AirtableBase } = new AirtableConnect({
	apiKey: process.env.AIRTABLE_ACCESS_TOKEN!,
	baseId: process.env.AIRTABLE_BASE_ID!,
});

const base = AirtableBase;

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
