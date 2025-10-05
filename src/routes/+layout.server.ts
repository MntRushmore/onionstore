import { UserService } from '$lib/server/airtable';

export async function load({ locals }) {
	let userWithTokens = null;
	
	if (locals.user?.slackId) {
		userWithTokens = await UserService.getUserWithTokens(locals.user.slackId);
	}

	return {
		user: locals.user,
		userWithTokens
	};
}
