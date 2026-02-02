export interface ExampleData {
	title: string;
	body: string;
}

export interface CompetitorData {
	id: number;
	start_number: string;
	name: string;
}

export interface TimeData {
	id: number;
	competitor_id: number;
	timestamp: string;
	station_id: number
}

export interface StationData {
	id: number;
	station_name: string;
	order: string;
}
