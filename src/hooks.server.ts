import type { ServerInit, Handle } from '@sveltejs/kit';

export const init: ServerInit = async () => {
	if (process.env.NODE_ENV !== 'production') {
		await import('$lib/server/init').then(({ init }) => {
			global.DB = init().db;
		});
	}
};

export const handle: Handle = async ({ event, resolve }) => {
	// Set the db as our events.db variable.
	event.locals.DB = global.DB;

	const resp = await resolve(event);
	return resp;
};
