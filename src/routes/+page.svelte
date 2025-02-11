<script lang="ts">
	import SpeedTestTable from '$lib/components/speed-test-table.svelte';
	import UploadDownloadChart from '$lib/components/upload-download-chart.svelte';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();

	function runSpeedTest() {
		fetch('/api/speed-test').then(async (res) => {
			const message = await res.json();
			console.log({ message });
		});
	}
</script>

<div class="flex flex-col gap-2 p-2">
	<button onclick={runSpeedTest}>Run speed test</button>
	<UploadDownloadChart metrics={data.metrics} />
	<SpeedTestTable metrics={data.metrics} />
</div>
