import {
	CategoryScale,
	Chart,
	LinearScale,
	LineController,
	LineElement,
	PointElement,
	Filler,
	TimeScale,
	Title
} from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(
	LineController,
	PointElement,
	LinearScale,
	LineElement,
	Filler,
	CategoryScale,
	TimeScale,
	Title
);
