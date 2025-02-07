// import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { runSpeedTest } from '$lib/server/speedtest';

export const GET: RequestHandler = ({ locals: { DB } }) => {
	runSpeedTest().then((res) => {
		if (res) {
			DB.speedTestTable.insertSpeedTestMetric(res);
		}
	});

	return new Response(JSON.stringify({ message: 'ok' }));
};
