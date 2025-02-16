import type { ServerWebSocket } from 'bun';
import { z } from 'zod';

const WebSocketStartSchema = z.object({
	type: z.literal('start')
});
const WebSocketErrorSchema = z.object({
	type: z.literal('error'),
	message: z.string()
});
const WebSocketEndSchema = z.object({
	type: z.literal('end')
});

export const TestStartSchema = z.object({
	type: z.literal('testStart'), // Ensures "type" is always "testStart"
	timestamp: z.string().datetime(), // Ensures timestamp is a valid ISO 8601 datetime string
	isp: z.string(), // ISP name
	interface: z.object({
		internalIp: z.string(), // Internal IP address
		name: z.string(), // Interface name
		macAddr: z.string(), // MAC address
		isVpn: z.boolean(), // Whether a VPN is used
		externalIp: z.string() // External IP address
	}),
	server: z.object({
		id: z.number(), // Server ID
		host: z.string(), // Server hostname
		port: z.number(), // Port number
		name: z.string(), // Server name
		location: z.string(), // Server location
		country: z.string(), // Country
		ip: z.string() // Server IP address
	})
});

export type TestStart = typeof TestStartSchema._type;

const PingSchema = z.object({
	type: z.literal('ping'),
	timestamp: z.string().datetime(),
	ping: z.object({
		jitter: z.number(),
		latency: z.number(),
		progress: z.number()
	})
});

export type Ping = typeof PingSchema._type;

const LatencySchema = z
	.object({
		iqm: z.number()
	})
	.optional();

export type Latency = typeof LatencySchema._type;

const DownloadSchema = z.object({
	type: z.literal('download'),
	timestamp: z.string().datetime(),
	download: z.object({
		bandwidth: z.number(),
		bytes: z.number(),
		elapsed: z.number(),
		latency: LatencySchema,
		progress: z.number()
	})
});

export type Download = typeof DownloadSchema._type;

const UploadSchema = z.object({
	type: z.literal('upload'),
	timestamp: z.string().datetime(),
	upload: z.object({
		bandwidth: z.number(),
		bytes: z.number(),
		elapsed: z.number(),
		latency: LatencySchema,
		progress: z.number()
	})
});

export type Upload = typeof UploadSchema._type;

export const TestEndSchema = z.object({
	type: z.literal('result'),
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

export type SpeedTestMetrics = typeof TestEndSchema._type;

export const LiveSpeedTestSchema = z.discriminatedUnion('type', [
	TestStartSchema,
	PingSchema,
	DownloadSchema,
	UploadSchema,
	TestEndSchema
]);

export const WebSocketServerSendSchema = z.discriminatedUnion('type', [
	...LiveSpeedTestSchema.options,
	WebSocketErrorSchema,
	WebSocketEndSchema
]);
export type WebSocketServerSend = typeof WebSocketServerSendSchema._type;

export const WebSocketClientSendSchema = WebSocketStartSchema;
export type WebSocketClientSend = typeof WebSocketClientSendSchema._type;

export const wrapServerWs = (ws: ServerWebSocket<unknown>) => {
	return { ...ws, send: (payload: WebSocketServerSend) => ws.send(JSON.stringify(payload), true) };
};

export const wrapClientWs = (ws: WebSocket) => {
	return {
		close: ws.close.bind(ws),
		addEventListener: ws.addEventListener.bind(ws),
		send: (payload: WebSocketClientSend) => ws.send(JSON.stringify(payload)),
		addMessageListener: (cb: (payload: WebSocketServerSend) => void) =>
			ws.addEventListener('message', (event) => {
				const payload = WebSocketServerSendSchema.parse(JSON.parse(event.data));
				return cb(payload);
			})
	};
};

export type TypedServerWs = ReturnType<typeof wrapServerWs>;
export type TypedClientWs = ReturnType<typeof wrapClientWs>;

export type LiveSpeedTest = typeof LiveSpeedTestSchema._type;
