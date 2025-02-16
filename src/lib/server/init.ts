import { initBunServer } from './bun-server';
import { NetMetricsDatabase } from './db';
import { logger } from './logger';
import { startSpeedTestInterval } from './speedtest';

export async function init(): Promise<void> {
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
