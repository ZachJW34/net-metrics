import { handler } from '../build/handler';
import express from 'express';
import { init } from './lib/server/init';

const { db } = init();
global.DB = init().db;

const app = express();

app.use(handler);

app.listen(3000, () => {
	console.log('http://localhost:3000');
});

process.on('exit', () => {
	db.close();
});
