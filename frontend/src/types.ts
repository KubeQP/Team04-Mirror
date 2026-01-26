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

export interface ExampleTable {
	headings: [string];
	body: [[string]];
}
