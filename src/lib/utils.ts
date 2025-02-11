import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const KILOBIT = 125;
const MEGABIT = KILOBIT * 1000;

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function bytesToMegaBits(value: number) {
	return value / MEGABIT;
}

export function formatMbps(value: number, options: { precision: number } = { precision: 2 }) {
	return bytesToMegaBits(value).toFixed(options.precision);
}

export function formatTimestamp(value: string, hour = true) {
	const date = new Date(value);
	const formattedDate = date.toLocaleString(navigator.language || 'en-US', {
		year: '2-digit',
		month: '2-digit',
		day: '2-digit',
		...(hour ? { hour: '2-digit', minute: '2-digit' } : {}),
		hour12: false
	});

	return formattedDate;
}
