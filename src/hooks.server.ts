import type { ServerInit, Handle } from '@sveltejs/kit';

export const init: ServerInit = async () => {
	if (process.env.NODE_ENV !== 'production') {
		await import('$lib/server/init').then(({ init }) => {
			global.DB = init().db;
		});
	}
};

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.DB = global.DB;
	return resolve(event);
};
