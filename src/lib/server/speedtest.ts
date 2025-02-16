import {
	LiveSpeedTestSchema,
	TestEndSchema,
	type SpeedTestMetrics,
	type TypedServerWs
} from '$lib/types';
import { Database, Statement } from 'bun:sqlite';
import { logger } from './logger';
import type { NetMetricsDatabase } from './db';
// import { setIntervalImmediate } from './utils';

const ONE_MINUTE = 1000 * 60;
const ONE_HOUR = ONE_MINUTE * 60;

export type SqlSpeedTestMetrics = ReturnType<typeof metricToSqlMetric>;

export class SpeedTestTable {
	#db: Database;
	#insertMetricStatement: Statement;

	constructor(db: Database) {
		this.#db = db;
		this.#createTable();
		this.#insertMetricStatement = this.#db.query(`INSERT INTO speed_test (
      id,
      type,
      timestamp,
      ping_jitter, ping_latency, ping_low, ping_high,
      download_bandwidth, download_bytes, download_elapsed, download_latency_iqm, download_latency_low, download_latency_high, download_latency_jitter,
      upload_bandwidth, upload_bytes, upload_elapsed, upload_latency_iqm, upload_latency_low, upload_latency_high, upload_latency_jitter,
      packet_loss,
      isp,
      interface_internal_ip, interface_name, interface_mac_address, interface_is_vpn, interface_external_ip,
      server_id, server_host, server_port, server_name, server_location, server_country, server_ip,
      result_url, result_persisted
    ) VALUES (
      $id,
      $type,
      $timestamp,
      $ping_jitter, $ping_latency, $ping_low, $ping_high,
      $download_bandwidth, $download_bytes, $download_elapsed, $download_latency_iqm, $download_latency_low, $download_latency_high, $download_latency_jitter,
      $upload_bandwidth, $upload_bytes, $upload_elapsed, $upload_latency_iqm, $upload_latency_low, $upload_latency_high, $upload_latency_jitter,
      $packet_loss,
      $isp,
      $interface_internal_ip, $interface_name, $interface_mac_address, $interface_is_vpn, $interface_external_ip, $server_id, $server_host, $server_port, $server_name, $server_location, $server_country, $server_ip,
      $result_url, $result_persisted)`);
	}

	insertSpeedTestMetric(metric: SpeedTestMetrics) {
		const metric_mapped = metricToSqlMetric(metric);
		try {
			this.#insertMetricStatement.run(metric_mapped);
		} catch (e) {
			logger.error(e, 'Failed to insert into speed_table');
		}
	}

	loadSpeedTestMetrics(): SqlSpeedTestMetrics[] {
		return this.#db
			.query('SELECT * from speed_test ORDER BY timestamp DESC')
			.all() as SqlSpeedTestMetrics[];
	}

	#createTable() {
		this.#db.exec(`CREATE TABLE IF NOT EXISTS speed_test (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      
      ping_jitter REAL,
      ping_latency REAL,
      ping_low REAL,
      ping_high REAL,

      download_bandwidth INTEGER,
      download_bytes INTEGER,
      download_elapsed INTEGER,
      download_latency_iqm REAL,
      download_latency_low REAL,
      download_latency_high REAL,
      download_latency_jitter REAL,

      upload_bandwidth INTEGER,
      upload_bytes INTEGER,
      upload_elapsed INTEGER,
      upload_latency_iqm REAL,
      upload_latency_low REAL,
      upload_latency_high REAL,
      upload_latency_jitter REAL,

      packet_loss REAL,

      isp TEXT,

      interface_internal_ip TEXT,
      interface_name TEXT,
      interface_mac_address TEXT,
      interface_is_vpn BOOLEAN,
      interface_external_ip TEXT,

      server_id INTEGER,
      server_host TEXT,
      server_port INTEGER,
      server_name TEXT,
      server_location TEXT,
      server_country TEXT,
      server_ip TEXT,

      result_url TEXT,
      result_persisted BOOLEAN
    );
  `);
	}
}

export async function tryRunSpeedTest(retries: number = 0) {
	const runCount = Math.max(retries + 1, 1);

	for (let i = 0; i < runCount; i++) {
		try {
			const metrics = await runSpeedTest();
			return metrics;
		} catch (e) {
			logger.error(
				`[speedtest] (Attempt ${i + 1}/${runCount}) Failed to run speed test with error ${e}`
			);
			continue;
		}
	}

	logger.info('[speedtest] Failed to record net metrics.');
}

async function runSpeedTest(): Promise<SpeedTestMetrics> {
	const serverId = process.env.SERVER_ID;
	const cmd = ['speedtest', '--accept-license', '--format', 'json'];
	if (serverId) {
		cmd.push('-s', serverId);
	}
	logger.debug(`[speedtest] Executing "${cmd.join(' ')}"...`);
	const speedTestProcess = Bun.spawn({
		cmd,
		stdout: 'pipe'
	});
	const metricsRaw = await Bun.readableStreamToText(speedTestProcess.stdout);
	logger.debug(`[speedtest] Speed Test Results (Raw): ${metricsRaw}`);
	return TestEndSchema.parse(JSON.parse(metricsRaw));
}

export async function runLiveSpeedTest(ws: TypedServerWs): Promise<SpeedTestMetrics | null> {
	const serverId = process.env.SERVER_ID;
	const cmd = ['speedtest', '--accept-license', '--format', 'json', '--progress', 'yes'];
	if (serverId) {
		cmd.push('-s', serverId);
	}
	logger.debug(`[speedtest] Executing "${cmd.join(' ')}"...`);

	const liveSpeedTestProcess = Bun.spawn({
		cmd,
		stdout: 'pipe'
	});

	const reader = liveSpeedTestProcess.stdout.getReader();

	while (true) {
		const { done, value } = await reader.read();

		if (value) {
			const text = Buffer.from(value).toString('utf-8');
			try {
				const payload = LiveSpeedTestSchema.parse(JSON.parse(text));
				ws.send(payload);

				if (payload.type === 'result') {
					return payload;
				}
			} catch (err) {
				logger.error(`Failed to parse LiveTestData: ${err}`);
				ws.send({ type: 'error', message: String(err) });
				break;
			}
		}

		if (done) {
			break;
		}
	}

	return null;
}

export function startSpeedTestInterval(db: NetMetricsDatabase, interval: number) {
	const safeInterval = !interval ? ONE_HOUR : Math.max(interval, ONE_MINUTE);
	logger.debug(`[speedtest] Speed Test Interval=${safeInterval}`);
	let count = 0;

	setInterval(async () => {
		count++;
		logger.debug(`[speedtest] Speed Test Interval running (${count})...`);
		const metrics = await tryRunSpeedTest(2);
		if (metrics) {
			db.speedTestTable.insertSpeedTestMetric(metrics);
		}
	}, safeInterval);
}

function metricToSqlMetric(metric: SpeedTestMetrics) {
	return {
		id: metric.result.id,
		type: metric.type,
		timestamp: metric.timestamp,
		ping_jitter: metric.ping.jitter,
		ping_latency: metric.ping.latency,
		ping_low: metric.ping.low,
		ping_high: metric.ping.high,
		download_bandwidth: metric.download.bandwidth,
		download_bytes: metric.download.bytes,
		download_elapsed: metric.download.elapsed,
		download_latency_iqm: metric.download.latency.iqm,
		download_latency_low: metric.download.latency.low,
		download_latency_high: metric.download.latency.high,
		download_latency_jitter: metric.download.latency.jitter,
		upload_bandwidth: metric.upload.bandwidth,
		upload_bytes: metric.upload.bytes,
		upload_elapsed: metric.upload.elapsed,
		upload_latency_iqm: metric.upload.latency.iqm,
		upload_latency_low: metric.upload.latency.low,
		upload_latency_high: metric.upload.latency.high,
		upload_latency_jitter: metric.upload.latency.jitter,
		packet_loss: metric.packetLoss,
		isp: metric.isp,
		interface_internal_ip: metric.interface.internalIp,
		interface_name: metric.interface.name,
		interface_mac_address: metric.interface.macAddr,
		interface_is_vpn: metric.interface.isVpn,
		interface_external_ip: metric.interface.externalIp,
		server_id: metric.server.id,
		server_host: metric.server.host,
		server_port: metric.server.port,
		server_name: metric.server.name,
		server_location: metric.server.location,
		server_country: metric.server.country,
		server_ip: metric.server.ip,
		result_url: metric.result.url,
		result_persisted: metric.result.persisted
	};
}
