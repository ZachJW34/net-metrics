import type { ServerInit, Handle } from '@sveltejs/kit';

export const init: ServerInit = async () => {
	if (process.env.NODE_ENV !== 'production') {
		await import('$lib/server/init').then(({ init }) => init());
	}
};

export const handle: Handle = async ({ event, resolve }) => {
	if (!event.locals.DB) {
		event.locals.DB = global.__NET_METRICS_DB;
	}
	return resolve(event);
};
