<script lang="ts">
	import { env } from '$env/dynamic/public';
	import {
		wrapClientWs,
		type Download,
		type LiveSpeedTest,
		type Ping,
		type SpeedTestMetrics,
		type TestStart,
		type Upload
	} from '$lib/types';
	import { bytesToMegaBits } from '$lib/utils';
	import Gauge from 'svelte-gauge';
	import { cubicOut } from 'svelte/easing';

	let testState = $state<{
		testStart?: TestStart;
		ping?: Ping['ping'];
		download?: Download['download'];
		upload?: Upload['upload'];
		result?: SpeedTestMetrics;
		stage: LiveSpeedTest['type'] | 'none' | 'waiting' | 'error';
	}>({ stage: 'none' });
	let testIsRunning = $derived(testState.stage !== 'none' && testState.stage !== 'result');
	let gaugeFormat = $derived.by(() => {
		const PLACEHOLDER = '--';
		const download = bytesToMegaBits(testState.download?.bandwidth ?? 0);
		const upload = bytesToMegaBits(testState.upload?.bandwidth ?? 0);

		return {
			download: {
				raw: download,
				formatted: testState.download ? `${Math.round(download)} Mbps` : PLACEHOLDER
			},
			upload: {
				raw: upload,
				formatted: testState.upload ? `${Math.round(upload)} Mbps` : PLACEHOLDER
			},
			ping: {
				raw: testState.ping?.latency,
				formatted: testState.ping ? `${testState.ping.latency.toFixed(0)} ms` : PLACEHOLDER
			},
			loss: {
				raw: testState.result?.packetLoss,
				formatted: testState.result ? `${testState.result.packetLoss.toFixed(1)} %` : PLACEHOLDER
			}
		};
	});

	function runSpeedTest() {
		testState = { stage: 'waiting' };
		const { protocol, hostname } = window.location;
		const wsURL = `${protocol === 'http:' ? 'ws' : 'wss'}://${hostname}:${env.PUBLIC_WEBSOCKET_PORT || 5174}/ws`;

		const ws = wrapClientWs(new WebSocket(wsURL));

		ws.addEventListener('open', (event) => {
			ws.send({ type: 'start' });
		});

		ws.addMessageListener((payload) => {
			switch (payload.type) {
				case 'testStart': {
					testState.stage = payload.type;
					testState.testStart = payload;
					break;
				}
				case 'ping': {
					testState.stage = payload.type;
					testState.ping = payload.ping;
					break;
				}
				case 'download': {
					testState.stage = payload.type;
					testState.download = payload.download;
					break;
				}
				case 'upload': {
					testState.stage = payload.type;
					testState.upload = payload.upload;
					break;
				}
				case 'result': {
					testState.stage = payload.type;
					testState.result = payload;
					break;
				}
				case 'end': {
					ws.close();
					break;
				}
				case 'error': {
					console.log('Error: ', payload);
					testState.stage = payload.type;
					ws.close();
					break;
				}
			}
		});
	}

	const generateTitles = (step: number, count: number) =>
		Array.from({ length: count }, (_, i) => (i * step).toString());
</script>

<div class="flex flex-col items-center">
	<button disabled={testIsRunning} onclick={runSpeedTest}>Run speed test</button>
	{#if testState.stage !== 'none'}
		{#if testState.stage === 'waiting'}
			Loading...
		{:else if testState.stage === 'error'}
			Error
		{:else}
			<div class="relative">
				<Gauge
					width={300}
					stop={1000}
					labels={generateTitles(100, 11)}
					startAngle={45}
					stopAngle={315}
					stroke={10}
					easing={cubicOut}
					value={gaugeFormat.download.raw}
					color={'#3480eb'}
				>
					<Gauge
						stop={1000}
						startAngle={45}
						stopAngle={315}
						stroke={10}
						easing={cubicOut}
						color={'#34eb71'}
						value={gaugeFormat.upload.raw}
					>
						<div class="gauge-content flex flex-col items-start">
							<span
								><span class="inline-block w-16 text-left">Ping</span>{gaugeFormat.ping
									.formatted}</span
							>
							<span class={{ 'animate-pulse': testState.stage === 'download' }}
								><span class="inline-block w-16 text-left">↓</span>{gaugeFormat.download
									.formatted}</span
							>
							<span class={{ 'animate-pulse': testState.stage === 'upload' }}
								><span class="inline-block w-16 text-left">↑</span>{gaugeFormat.upload
									.formatted}</span
							>
							<span
								><span class="inline-block w-16 text-left">Loss</span>{gaugeFormat.loss
									.formatted}</span
							>
						</div>
					</Gauge>
				</Gauge>
				<div class="progress-gauge absolute top-0">
					<Gauge
						width={255}
						stop={1}
						startAngle={35}
						stopAngle={-35}
						stroke={10}
						value={testState.upload?.progress || testState.download?.progress}
						color={'#808080'}
					>
						<span></span>
					</Gauge>
				</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.gauge-content {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: calc(var(--gauge-radius) / 6);
		text-align: center;
		span {
			white-space: nowrap;
		}
	}

	.progress-gauge {
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
</style>
