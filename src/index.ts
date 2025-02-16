import { handler } from '../build/handler';
import express from 'express';
import { init } from './lib/server/init';

const PORT = process.env.PORT || 3000;

async function main() {
	await init();

	const app = express();

	app.use(handler);

	app.listen(PORT, () => {
		console.log(`http://localhost:${PORT}`);
	});
}

main();
