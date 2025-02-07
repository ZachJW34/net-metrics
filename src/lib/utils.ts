import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const KILOBIT = 125;
const MEGABIT = KILOBIT * 1000;

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatMbps(value: number, options: { precision: number } = { precision: 2 }) {
	return (value / MEGABIT).toFixed(options.precision);
}
