import { ChevronDownIcon, ChevronUpIcon, Trash2Icon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useCompetition } from '@/components/Competition';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { updateStationOrder } from '../api/PatchStationOrder';
import { API_BASE_URL } from '../config/api';

type Station = {
	station_name: string;
	order: string;
	competition_id: number;
};

export default function StationRegistrering() {
	const { competition } = useCompetition();
	const [stationName, setStationName] = useState('');
	const [stations, setStations] = useState<Station[]>([]);

	const fetchStations = useCallback(async () => {
		const res = await fetch(`${API_BASE_URL}/api/stations/getstations`);
		if (!res.ok) return;
		const data = await res.json();
		setStations(
			(data as Array<Station>)
				.filter((c) => c.competition_id === competition)
				.sort((a, b) => Number(a.order) - Number(b.order)),
		);
	}, [competition]);

	const moveStation = async (index: number, direction: 'up' | 'down') => {
		const newStations = [...stations];

		const targetIndex = direction === 'up' ? index - 1 : index + 1;

		if (targetIndex < 0 || targetIndex >= newStations.length) return;

		// 1. Byt plats lokalt
		[newStations[index], newStations[targetIndex]] = [newStations[targetIndex], newStations[index]];

		// 2. Räkna om order (SOM STRING)
		const reordered = newStations.map((station, i) => ({
			...station,
			order: String(i),
		}));

		// 3. Uppdatera UI direkt
		setStations(reordered);

		// 4. Skicka till backend
		try {
			await updateStationOrder(reordered);
		} catch (err) {
			console.error(err);
		}
	};

	const deleteStation = async (order: string) => {
		try {
			const res = await fetch(`${API_BASE_URL}/api/stations/delete/${order}`, {
				method: 'DELETE',
			});
			console.log('Delete response:', res);

			if (!res.ok) {
				const err = await res.json();

				throw new Error(err.detail || 'Unknown error');
			}

			await fetchStations();
		} catch (err) {
			throw new Error(err instanceof Error ? err.message : 'Fetch error');
		}
	};

	useEffect(() => {
		fetchStations();
	}, [fetchStations]);

	const addStation = async () => {
		console.log('add station');

		if (!stationName.trim()) return;

		try {
			const res = await fetch(`${API_BASE_URL}/api/stations/registerstation`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					station_name: stationName,
					competition_id: competition,
					order: stations.length.toString(),
				}),
			});

			if (!res.ok) {
				const err = await res.json();
				console.error('Error:', err.detail);
				return;
			}

			const data = await res.json();
			console.log('Station registered:', data);

			// NU uppdaterar vi från databasen
			await fetchStations();

			setStationName('');
		} catch (err) {
			console.error('Fetch error:', err);
		}
	};

	return (
		<div>
			<h1 className="text-xl font-bold pb-4">Hantera stationer:</h1>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					addStation();
				}}
			>
				<div className="flex items-end gap-4">
					<Field className="max-w-xs">
						<FieldLabel>Namn</FieldLabel>
						<Field orientation="horizontal" className="gap-2">
							<Input
								id="stationNamnInput"
								placeholder="Start"
								type="text"
								value={stationName}
								onChange={(e) => setStationName(e.target.value)}
							/>
							<Button type="submit" variant="default" disabled={!stationName.trim()}>
								Registrera
							</Button>
						</Field>
					</Field>
				</div>
			</form>
			<h2 className="mt-6 text-lg font-semibold pb-2">Stationer</h2>
			<ScrollArea className="rounded-md border px-4 h-[60vh]">
				<Table>
					<TableHeader className="h-14">
						<TableRow>
							<TableHead>Namn</TableHead>
							<TableHead>Ordning</TableHead>
							<TableHead className="text-right">Ändra</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{stations.map((station, index) => (
							<TableRow key={station.order}>
								<TableCell className="font-medium">{station.station_name}</TableCell>
								<TableCell>{station.order}</TableCell>
								<TableCell className="text-right">
									<div className="flex items-center justify-end gap-2">
										<Button
											variant="ghost"
											size="icon"
											className="size-8"
											onClick={() => moveStation(index, 'down')}
											disabled={index === stations.length - 1}
										>
											<ChevronDownIcon />
											<span className="sr-only">Flytta ned</span>
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="size-8"
											onClick={() => moveStation(index, 'up')}
											disabled={index === 0}
										>
											<ChevronUpIcon />
											<span className="sr-only">Flytta upp</span>
										</Button>
										<div className="h-6 flex items-center">
											<Separator orientation="vertical" />
										</div>

										<Button
											variant="ghost"
											size="icon"
											className="size-8 hover:bg-destructive hover:text-destructive-foreground dark:hover:bg-destructive dark:hover:text-destructive-foreground"
											onClick={async () => {
												toast.promise(deleteStation(station.order), {
													loading: 'Raderar station...',
													success: 'Station raderad',
													error: (err) => `Kunde inte radera: ${err.message}`,
												});
											}}
										>
											<Trash2Icon />
											<span className="sr-only">Radera</span>
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</ScrollArea>
		</div>
	);
}
