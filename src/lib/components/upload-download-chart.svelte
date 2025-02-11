<script lang="ts">
	import type { SqlSpeedTestMetrics } from '$lib/server/speedtest';
	import { bytesToMegaBits, formatTimestamp } from '$lib/utils';
	import { Chart } from 'chart.js';
	import { onDestroy, onMount } from 'svelte';

	let canvasEl: HTMLCanvasElement;
	let { metrics }: { metrics: SqlSpeedTestMetrics[] } = $props();
	let chart: Chart<'line'> | undefined;

	onMount(() => {
		chart = new Chart(canvasEl, {
			type: 'line',
			data: {
				labels: metrics.map((d) => new Date(d.timestamp)),
				datasets: [
					{
						label: 'Upload Speed',
						data: metrics.map((d) => bytesToMegaBits(d.upload_bandwidth)),
						borderColor: 'green',
						backgroundColor: 'rgba(0, 255, 0, 0.2)',
						fill: true
					},
					{
						label: 'Download Speed',
						data: metrics.map((d) => bytesToMegaBits(d.download_bandwidth)),
						borderColor: 'blue',
						backgroundColor: 'rgba(0, 0, 255, 0.2)',
						fill: true
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				scales: {
					x: {
						type: 'time',
						time: {
							unit: 'day'
							// tooltipFormat: 'yyyy-MM-dd HH:mm:ss'
						},
						title: {
							display: true,
							text: 'Time'
						}
					},
					y: { title: { display: true, text: 'Speed (Mbps)' } }
				}
			}
		});
	});

	onDestroy(() => {
		chart?.destroy();
	});
</script>

<div class="h-96 w-full">
	<canvas bind:this={canvasEl}> </canvas>
</div>
