<script lang="ts">
	import SpeedTestTable from '$lib/components/speed-test-table.svelte';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();

	function runSpeedTest() {
		fetch('/api/speed-test').then(async (res) => {
			const message = await res.json();
			console.log({ message });
		});
	}
</script>

<button onclick={runSpeedTest}>Run speed test</button>
<div class="p-4">
	<SpeedTestTable data={data.metrics} />
</div>
