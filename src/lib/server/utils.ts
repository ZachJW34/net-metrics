import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

export function ensureDirSync(file: string) {
	const parsed = path.parse(path.resolve(process.cwd(), file));

	if (!fs.existsSync(parsed.dir)) {
		fs.mkdirSync(parsed.dir, { recursive: true });
	}
}

export function setIntervalImmediate(...[callback, time]: Parameters<typeof setInterval>) {
	callback();
	return setInterval(callback, time);
}
