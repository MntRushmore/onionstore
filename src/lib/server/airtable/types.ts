// Airtable field mappings and types

export interface AirtableUser {
	id?: string;
	fields: {
		slackId: string;
		avatarUrl: string;
		isAdmin?: boolean;
		country?: string;
		yswsDbFulfilled?: boolean;
		tokens?: number; // Calculated field in Airtable or stored directly
	};
	createdTime?: string;
}

export interface AirtableShopItem {
	id?: string;
	fields: {
		name: string;
		description: string;
		imageUrl: string;
		price: number;
		usd_cost?: number;
		type?: 'hcb' | 'third_party';
		hcbMids?: string; // JSON string of array
	};
	createdTime?: string;
}

export interface AirtableShopOrder {
	id?: string;
	fields: {
		shopItemId: string; // Link to Shop Items table
		priceAtOrder: number;
		status?: 'pending' | 'fulfilled' | 'rejected';
		memo?: string;
		createdAt?: string;
		userId: string; // Link to Users table
	};
	createdTime?: string;
}

export interface AirtablePayout {
	id?: string;
	fields: {
		tokens: number;
		userId: string; // Link to Users table
		memo?: string;
		createdAt?: string;
		submittedToUnified?: boolean;
		baseHackatimeHours?: number;
		overridenHours?: number;
	};
	createdTime?: string;
}

// Types that match the original schema for compatibility
export interface UserWithTokens {
	slackId: string;
	avatarUrl: string;
	isAdmin: boolean;
	tokens: number;
}

export interface ShopItem {
	id: string;
	name: string;
	description: string;
	imageUrl: string;
	price: number;
	usd_cost?: number;
	type?: 'hcb' | 'third_party';
	hcbMids?: string[];
}

export interface ShopOrder {
	id: string;
	shopItemId: string;
	priceAtOrder: number;
	status: 'pending' | 'fulfilled' | 'rejected';
	memo?: string;
	createdAt?: Date;
	userId: string;
}

export interface Payout {
	id: string;
	tokens: number;
	userId: string;
	memo?: string;
	createdAt?: Date;
	submittedToUnified?: boolean;
	baseHackatimeHours?: number;
	overridenHours?: number;
}