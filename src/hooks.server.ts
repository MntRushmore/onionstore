import { sequence } from '@sveltejs/kit/hooks';
import { UserService } from '$lib/server/airtable';
import { redirect, type Handle } from '@sveltejs/kit';

const authMiddleware: Handle = async ({ event, resolve }) => {
	// Skip auth for login and API routes
	if (event.url.pathname.startsWith('/login') || 
		event.url.pathname.startsWith('/logout') || 
		event.url.pathname.startsWith('/api/')) {
		return resolve(event);
	}

	const sessionCookie = event.cookies.get('session');
	if (!sessionCookie) {
		// No session, redirect to login
		throw redirect(302, '/login');
	}

	try {
		// Parse session data (simple approach - in production use proper session management)
		const sessionData = JSON.parse(sessionCookie);
		
		if (!sessionData.email) {
			throw new Error('Invalid session data');
		}

		// Get fresh user data from Airtable
		const user = await UserService.getUserWithTokens(sessionData.email);
		if (!user) {
			// User doesn't exist anymore, clear session
			event.cookies.delete('session', { path: '/' });
			throw redirect(302, '/login');
		}

		// Set user in locals for access in routes
		event.locals.user = user;
		
	} catch (error) {
		// Invalid session, clear it and redirect to login
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