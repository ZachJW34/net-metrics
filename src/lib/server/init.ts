import { NetMetricsDatabase } from './db';
import { startSpeedTestInterval } from './speedtest';

export function init(): { db: NetMetricsDatabase } {
	const SQLITE_FILE = NetMetricsDatabase.INIT();
	const db = new NetMetricsDatabase(SQLITE_FILE);
	startSpeedTestInterval(db);

	return { db };
}
