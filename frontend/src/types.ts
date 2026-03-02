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
	start_number?: string;
	competition_id: number;
}

export interface StationData {
	id: number;
	station_name: string;
	order: string;
	competition_id: number;
}

export interface CompetitionData {
	id: number;
}

// ../types/results.ts

export type DriverResult = {
	plac: string;
	startNbr: string;
	name: string;
	totalTime: string;
	startTime: string;
	endTime: string;
};

export type Result = {
	teamToken: string;
	jsonResult: DriverResult[];
};
