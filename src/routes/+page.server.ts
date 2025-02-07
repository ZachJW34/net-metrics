import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals: { DB } }) => {
	const metrics = DB.speedTestTable.loadSpeedTestMetrics();

	return {
		metrics
	};
};
