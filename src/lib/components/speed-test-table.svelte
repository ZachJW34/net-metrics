<script lang="ts">
	import type { ColumnDef } from '@tanstack/table-core';
	import DataTable, { createHeaderWithSubtitle } from './ui/data-table';
	import { type SqlSpeedTestMetrics } from '$lib/server/speedtest';
	import { formatMbps, formatTimestamp } from '$lib/utils';

	let { metrics }: { metrics: SqlSpeedTestMetrics[] } = $props();

	const columns: ColumnDef<SqlSpeedTestMetrics>[] = [
		{
			accessorKey: 'timestamp',
			header: 'Date',
			cell: (props) => formatTimestamp(props.row.original.timestamp)
		},
		{
			id: 'download',
			header: () => createHeaderWithSubtitle('Download', '(Mbps)'),
			accessorFn: (row) => formatMbps(row.download_bandwidth, { precision: 0 })
		},
		{
			id: 'upload',
			header: () => createHeaderWithSubtitle('Upload', '(Mbps)'),
			accessorFn: (row) => formatMbps(row.upload_bandwidth, { precision: 0 })
		},
		{
			id: 'ping',
			header: () => createHeaderWithSubtitle('Ping', '(ms)'),
			accessorFn: (row) => row.ping_latency.toFixed(0)
		},
		{
			id: 'jitter',
			header: () => createHeaderWithSubtitle('Jitter', '(ms)'),
			accessorFn: (row) => row.ping_jitter.toFixed(0)
		},
		{
			id: 'loss',
			header: () => createHeaderWithSubtitle('Loss', '(%)'),
			accessorFn: (row) => row.packet_loss.toFixed(1)
		}
	];
</script>

<DataTable data={metrics} {columns}></DataTable>
