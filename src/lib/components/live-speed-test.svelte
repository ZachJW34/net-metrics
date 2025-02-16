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
	import { cubicIn, cubicOut } from 'svelte/easing';

	let testState = $state<{
		testStart?: TestStart;
		ping?: Ping['ping'];
		download?: Download['download'];
		upload?: Upload['upload'];
		result?: SpeedTestMetrics;
		stage: LiveSpeedTest['type'] | 'none' | 'waiting';
	}>({ stage: 'none' });
	let testIsRunning = $derived(testState.stage !== 'none' && testState.stage !== 'result');

	function runSpeedTest() {
		testState = { stage: 'waiting' };
		const { protocol, hostname } = window.location;
		const wsURL = `${protocol === 'http:' ? 'ws' : 'wss'}://${hostname}:${env.PUBLIC_WEBSOCKET_PORT || 5174}/ws`;

		const ws = wrapClientWs(new WebSocket(wsURL));

		ws.addEventListener('open', (event) => {
			ws.send({ type: 'start' });
		});

		ws.addMessageListener((payload) => {
			console.log({ payload });
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
		{:else}
			<Gauge
				width={300}
				stop={1000}
				labels={generateTitles(100, 11)}
				startAngle={45}
				stopAngle={315}
				stroke={10}
				easing={cubicOut}
				value={bytesToMegaBits(testState.download?.bandwidth ?? 0)}
				color={'#3480eb'}
			>
				{#snippet children({ value: download })}
					<Gauge
						stop={1000}
						startAngle={45}
						stopAngle={315}
						stroke={10}
						easing={cubicOut}
						color={'#34eb71'}
						value={bytesToMegaBits(testState.upload?.bandwidth ?? 0)}
					>
						{#snippet children({ value: upload })}
							<div class="gauge-content">
								<span>{Math.round(download)} Mbps ↓</span>
								<span>{Math.round(upload)} Mbps ↑</span>
								<span>Ping: {testState.ping?.latency.toFixed(0)} ms</span>
								<span>Loss: {testState.result?.packetLoss.toFixed(0)} %</span>
							</div>
						{/snippet}
					</Gauge>
				{/snippet}
			</Gauge>
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
</style>
