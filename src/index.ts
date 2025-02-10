import { handler } from '../build/handler';
import express from 'express';
import { init } from './lib/server/init';

const PORT = process.env.PORT || 3000;

global.DB = init().db;

const app = express();

app.use(handler);

app.listen(PORT, () => {
	console.log(`http://localhost:${PORT}`);
});

process.on('exit', () => {
	global.DB.close();
});
