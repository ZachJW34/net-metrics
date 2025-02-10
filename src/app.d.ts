// See https://svelte.dev/docs/kit/types#app.d.ts

import type { NetMetricsDatabase } from '$lib/server/db';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			DB: Database;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	namespace NodeJS {
		interface Global {
			db: NetMetricsDatabase;
		}

		interface ProcessEnv {
			DB_FILE: string | undefined;
			LOG_LEVEL: 'info' | 'debug' | undefined;
			SPEED_TEST_INTERVAL: string | undefined;
			PORT: string | undefined;
			SERVER_ID: string | undefined;
		}
	}

	// eslint-disable-next-line no-var
	var DB: NetMetricsDatabase;
}

export {};
