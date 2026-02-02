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
}

export interface StationData {
	id: number;
	station_name: string;
	order: string;
}
