import dotenv from 'dotenv';
dotenv.config();
console.log("✅ Loaded Airtable Personal Access Token prefix:", process.env.AIRTABLE_ACCESS_TOKEN?.slice(0, 5));

import AirtableConnectModule from '@theo-dev/airtable-connect';
const AirtableConnect = AirtableConnectModule.AirtableConnect;

if (!process.env.AIRTABLE_ACCESS_TOKEN) {
	throw new Error('❌ AIRTABLE_ACCESS_TOKEN environment variable is required. Please add your Airtable Personal Access Token to your .env file.');
}

if (!process.env.AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID === 'appXXXXXXXXXXXXXX') {
	throw new Error(`
❌ AIRTABLE_BASE_ID environment variable is required!

🔧 To fix this:
1. Go to your Airtable base in your browser
2. Look at the URL: https://airtable.com/app[BASE_ID]/...  
3. Copy the "app[BASE_ID]" part (starts with "app")
4. Add it to your .env file:
   AIRTABLE_BASE_ID=app[your_actual_base_id]

Current value: ${process.env.AIRTABLE_BASE_ID}
	`);
}

console.log("✅ Using Airtable Base ID:", process.env.AIRTABLE_BASE_ID);

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
