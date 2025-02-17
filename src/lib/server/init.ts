import { initBunServer } from './bun-server';
import { NetMetricsDatabase } from './db';
import { logger } from './logger';
import { startSpeedTestInterval } from './speedtest';

export async function init(): Promise<void> {
	logger.debug(
		`Envs: ${JSON.stringify(
			{
				DB_FILE: process.env.DB_FILE,
				LOG_LEVEL: process.env.LOG_LEVEL,
				SPEED_TEST_INTERVAL: process.env.SPEED_TEST_INTERVAL,
				PORT: process.env.PORT,
				PUBLIC_WEBSOCKET_PORT: process.env.PUBLIC_WEBSOCKET_PORT,
				SERVER_ID: process.env.SERVER_ID
			},
			null,
			2
		)}`
	);

	if (global.__NET_METRICS_DB && global.__NET_METRICS_BUN_SERVER) {
		console.log('Cleaning up globals..');
		global.__NET_METRICS_DB.close();
		await global.__NET_METRICS_BUN_SERVER.stop(true);
	}

	logger.debug('Initing Database and speed test interval...');
	const SQLITE_FILE = NetMetricsDatabase.INIT();
	const db = new NetMetricsDatabase(SQLITE_FILE);
	startSpeedTestInterval(db, Number(process.env.SPEED_TEST_INTERVAL));

	const bunServer = initBunServer(db);

	global.__NET_METRICS_DB = db;
	global.__NET_METRICS_BUN_SERVER = bunServer;
}
