import { sequence } from '@sveltejs/kit/hooks';
import { UserService } from '$lib/server/airtable';
import { redirect, type Handle } from '@sveltejs/kit';
import { SESSIONS_SECRET } from '$env/static/private';
import { symmetric } from '$lib/server/crypto';

const authMiddleware: Handle = async ({ event, resolve }) => {
	// Skip auth for login and API routes
	if (event.url.pathname.startsWith('/login') || 
		event.url.pathname.startsWith('/logout') || 
		event.url.pathname.startsWith('/api/')) {
		return resolve(event);
	}

	const sessionCookie = event.cookies.get('session');
	if (!sessionCookie) {
		throw redirect(302, '/login');
	}

	try {
		// Decrypt the email from session
		const email = await symmetric.decrypt(sessionCookie, SESSIONS_SECRET);
		
		if (!email) {
			throw new Error('Invalid session data');
		}

		// Get user from Airtable
		const user = await UserService.getUserWithTokens(email);
		if (!user) {
			event.cookies.delete('session', { path: '/' });
			throw redirect(302, '/login');
		}

		event.locals.user = user;
		
	} catch (error) {
		console.error('Auth error:', error);
		event.cookies.delete('session', { path: '/' });
		throw redirect(302, '/login');
	}

	return resolve(event);
};

const adminMiddleware: Handle = async ({ event, resolve }) => {
	// Check admin access for admin routes
	if (event.locals.user && 
		!event.locals.user.isAdmin && 
		event.url.pathname.startsWith('/admin')) {
		throw redirect(302, '/');
	}

	return resolve(event);
};

export const handle = sequence(authMiddleware, adminMiddleware);