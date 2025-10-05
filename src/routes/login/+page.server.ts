import { fail, redirect } from '@sveltejs/kit';
import { AuthService } from '$lib/server/auth';
import { symmetric } from '$lib/server/crypto';
import { SESSIONS_SECRET } from '$env/static/private';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, cookies }) => {
	// Clear any old corrupted session cookies
	cookies.delete('session', { path: '/' });
	
	// If already logged in, redirect to shop
	if (locals.user) {
		throw redirect(302, '/');
	}
	
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const name = formData.get('name') as string;

		if (!email) {
			return fail(400, { error: 'Email is required' });
		}

		if (!AuthService.isValidEmail(email)) {
			return fail(400, { error: 'Please enter a valid email address' });
		}

		try {
			const user = await AuthService.loginWithEmail(email, name);
			
			if (!user) {
				return fail(500, { error: 'Failed to create or login user' });
			}

			// Create encrypted session cookie
			const encryptedSession = await symmetric.encrypt(email, SESSIONS_SECRET);
			cookies.set('session', encryptedSession, {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				maxAge: 60 * 60 * 24 * 30 // 30 days
			});

			throw redirect(302, '/');
		} catch (error) {
			console.error('Login error:', error);
			return fail(500, { error: 'Login failed. Please try again.' });
		}
	}
};