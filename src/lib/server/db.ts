import { ensureDirSync } from './utils';
import { join } from 'node:path';
import { Database } from 'bun:sqlite';
import { SpeedTestTable } from './speedtest';

export class NetMetricsDatabase {
	static INIT(): string {
		const SQLITE_FILE =
			process.env.DB_FILE ||
			join('db', process.env.NODE_ENV === 'production' ? 'prod.sqlite' : 'dev.sqlite');

		try {
			ensureDirSync(SQLITE_FILE);
		} catch (e) {
			console.error('Failed to create sqlite directory:', e);
			process.exit(1);
		}

		return SQLITE_FILE;
	}

	#db: Database;
	speedTestTable: SpeedTestTable;

	constructor(file: string) {
		this.#db = new Database(file, { strict: true });
		this.#db.exec('PRAGMA journal_mode = WAL;');

		this.speedTestTable = new SpeedTestTable(this.#db);
	}

	close() {
		this.#db.close();
	}
}
