import { WebSocketClientSendSchema, wrapServerWs } from '$lib/types';
import type { NetMetricsDatabase } from './db';
import { logger } from './logger';
import { runLiveSpeedTest } from './speedtest';

export function initBunServer(db: NetMetricsDatabase) {
	const port = process.env.PUBLIC_WEBSOCKET_PORT || 5174;
	let liveSpeedTestIsRunning = false;
	const bunServer = Bun.serve({
		async fetch(req, server) {
			const url = new URL(req.url);

			if (url.pathname === '/ws') {
				const upgraded = server.upgrade(req);
				if (!upgraded) {
					return new Response('Upgrade failed', { status: 400 });
				}

				return new Response('WS available');
			}

			return new Response('Not found', { status: 404 });
		},
		websocket: {
			async message(ws, message) {
				logger.debug(`[ws] ${message}`);
				const payload = WebSocketClientSendSchema.parse(JSON.parse(message.toString()));
				const typedWs = wrapServerWs(ws);
				if (payload.type === 'start') {
					if (liveSpeedTestIsRunning) {
						logger.debug('[liveSpeedTest] test is already running, skipping...');
						return;
					}

					liveSpeedTestIsRunning = true;
					runLiveSpeedTest(typedWs)
						.then((res) => {
							if (res) {
								db.speedTestTable.insertSpeedTestMetric(res);
							}
						})
						.finally(() => (liveSpeedTestIsRunning = false));
				}
			}
		},
		port
	});

	logger.debug(`Bun server running on http://localhost:${port}`);

	return bunServer;
}
