import { z } from 'zod';

export const SpeedTestMetricsSchema = z.object({
	type: z.string(),
	timestamp: z.string(),
	ping: z.object({
		jitter: z.number(),
		latency: z.number(),
		low: z.number(),
		high: z.number()
	}),
	download: z.object({
		bandwidth: z.number(),
		bytes: z.number(),
		elapsed: z.number(),
		latency: z.object({
			iqm: z.number(),
			low: z.number(),
			high: z.number(),
			jitter: z.number()
		})
	}),
	upload: z.object({
		bandwidth: z.number(),
		bytes: z.number(),
		elapsed: z.number(),
		latency: z.object({
			iqm: z.number(),
			low: z.number(),
			high: z.number(),
			jitter: z.number()
		})
	}),
	packetLoss: z.number(),
	isp: z.string(),
	interface: z.object({
		internalIp: z.string(),
		name: z.string(),
		macAddr: z.string(),
		isVpn: z.boolean(),
		externalIp: z.string()
	}),
	server: z.object({
		id: z.number(),
		host: z.string(),
		port: z.number(),
		name: z.string(),
		location: z.string(),
		country: z.string(),
		ip: z.string()
	}),
	result: z.object({
		id: z.string(),
		url: z.string(),
		persisted: z.boolean()
	})
});

export type SpeedTestMetrics = typeof SpeedTestMetricsSchema._type;
