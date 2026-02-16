export interface ExampleData {
	title: string;
	body: string;
}

export interface CompetitorData {
	id: number;
	start_number: string;
	name: string;
	competition_id: number;
}

export interface TimeData {
	id: number;
	competitor_id: number;
	timestamp: string;
	station_id: number;
	competition_id: number;
}

export interface StationData {
	id: number;
	station_name: string;
	order: string;
	competition_id: number;
}
