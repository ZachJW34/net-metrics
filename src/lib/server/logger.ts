import pino, { type Logger } from 'pino';

let _logger: Logger;

export function logger(): Logger {
	if (!_logger) {
		_logger = pino({ level: process.env.LOG_LEVEL || 'debug' });
	}

	return _logger;
}
