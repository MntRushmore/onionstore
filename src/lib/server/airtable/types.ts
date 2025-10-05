// User types
export interface AirtableUser {
	id: string;
	fields: {
		filloutemail: string;
		Name: string;
		Tokens?: number;
		isAdmin?: boolean;
		Country?: string;
		Team?: string;
		Account?: string;
	};
	createdTime: string;
}

export interface UserWithTokens {
	email: string;
	name: string;
	isAdmin: boolean;
	tokens: number;
}

// Shop Item types
export interface AirtableShopItem {
	id: string;
	fields: {
		name: string;
		description?: string;
		imageUrl?: string;
		price: number;
		usd_cost?: number;
		type?: string;
		hcbMids?: string; // JSON string
	};
	createdTime: string;
}

export interface ShopItem {
	id: string;
	name: string;
	description?: string;
	imageUrl?: string;
	price: number;
	usd_cost?: number;
	type?: string;
	hcbMids?: string[];
}

// Shop Order types
export interface AirtableShopOrder {
	id: string;
	fields: {
		'Item Name'?: string;
		Email: string;
		userid?: string;
		Account?: string;
		priceAtOrder: number;
		status: 'pending' | 'fulfilled' | 'cancelled';
		'Spent if Approved'?: number;
		shopitemid?: string;
		'name (from shopitemid)'?: string;
		memo?: string;
	};
	createdTime: string;
}

export interface ShopOrder {
	id: string;
	shopItemId: string;
	priceAtOrder: number;
	status: 'pending' | 'fulfilled' | 'cancelled';
	memo?: string;
	createdAt: Date;
	userEmail: string;
}

// Payout/Submission types
export interface AirtablePayout {
	id: string;
	fields: {
		userEmail: string;
		tokens: number;
	};
	createdTime: string;
}