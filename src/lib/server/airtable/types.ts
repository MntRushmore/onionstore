// Airtable field mappings and types

export interface AirtableUser {
	id?: string;
	fields: {
		email: string;
		name?: string;
		isAdmin?: boolean;
		tokens?: number; // Token balance stored directly
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
		userEmail: string; // User's email
	};
	createdTime?: string;
}

export interface AirtablePayout {
	id?: string;
	fields: {
		tokens: number;
		userEmail: string; // User's email
		memo?: string;
		createdAt?: string;
	};
	createdTime?: string;
}

// Simplified types for email-based authentication
export interface UserWithTokens {
	email: string;
	name?: string;
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
	type?: 'digital' | 'physical';
}

export interface ShopOrder {
	id: string;
	shopItemId: string;
	priceAtOrder: number;
	status: 'pending' | 'fulfilled' | 'rejected';
	memo?: string;
	createdAt?: Date;
	userEmail: string;
}

export interface Payout {
	id: string;
	tokens: number;
	userEmail: string;
	memo?: string;
	createdAt?: Date;
}