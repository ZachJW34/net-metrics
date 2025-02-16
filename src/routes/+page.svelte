<script lang="ts">
	import LiveSpeedTest from '$lib/components/live-speed-test.svelte';
	import SpeedTestTable from '$lib/components/speed-test-table.svelte';
	import UploadDownloadChart from '$lib/components/upload-download-chart.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="flex flex-col gap-2 p-2">
	<LiveSpeedTest />
	<UploadDownloadChart metrics={data.metrics} />
	<SpeedTestTable metrics={data.metrics} />
</div>
