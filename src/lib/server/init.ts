import { NetMetricsDatabase } from './db';
import { logger } from './logger';
import { startSpeedTestInterval } from './speedtest';

export function init(): { db: NetMetricsDatabase } {
	logger.debug('Initing Database and speed test interval...');
	const SQLITE_FILE = NetMetricsDatabase.INIT();
	const db = new NetMetricsDatabase(SQLITE_FILE);
	startSpeedTestInterval(db, Number(process.env.SPEED_TEST_INTERVAL));

	return { db };
}
