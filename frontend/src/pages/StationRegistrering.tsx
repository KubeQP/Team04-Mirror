import { ChevronDownIcon, ChevronUpIcon, Trash2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Station = {
	station_name: string;
	order: string;
};

export default function StationRegistrering() {
	const [stationName, setStationName] = useState('');
	const [order, setOrder] = useState('');
	const [stations, setStations] = useState<Station[]>([]);

	const fetchStations = async () => {
		const res = await fetch('http://localhost:8000/api/stations/getstations');
		if (!res.ok) return;
		const data = await res.json();
		setStations((data as Array<Station>).sort((a, b) => Number(a.order) - Number(b.order)));
	};

	useEffect(() => {
		fetchStations();
	}, []);

	const addStation = async () => {
		console.log('add station');

		if (!stationName.trim()) return;
		if (!order.trim()) return;

		try {
			const res = await fetch('http://localhost:8000/api/stations/registerstation', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					station_name: stationName,
					order: order,
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

			setOrder('');
			setStationName('');
		} catch (err) {
			console.error('Fetch error:', err);
		}
	};

	return (
		<div>
			<h1 className="text-xl font-bold pb-2">Hantera stationer:</h1>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					addStation();
				}}
			>
				<div className="flex items-end gap-4">
					<FieldGroup className="grid max-w-sm grid-cols-2">
						<Field>
							<FieldLabel>Namn</FieldLabel>
							<Input
								id="stationNamnInput"
								placeholder="Start"
								type="text"
								value={stationName}
								onChange={(e) => setStationName(e.target.value)}
							/>
						</Field>
						<Field>
							<FieldLabel>Ordning</FieldLabel>
							<Input
								id="orderInput"
								placeholder="0"
								type="text"
								value={order}
								onChange={(e) => setOrder(e.target.value)}
							/>
						</Field>
					</FieldGroup>
					<Button type="submit" variant="default" disabled={!order.trim() || !stationName.trim()}>
						Registrera
					</Button>
				</div>
			</form>
			<h2 className="mt-6 text-lg font-semibold">Stationer</h2>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Namn</TableHead>
						<TableHead>Ordning</TableHead>
						<TableHead className="text-right">Ändra</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{stations.map((station) => (
						<TableRow key={station.order}>
							<TableCell className="font-medium">{station.station_name}</TableCell>
							<TableCell>{station.order}</TableCell>
							<TableCell className="text-right">
								<div className="flex items-center justify-end gap-2">
									<Button variant="ghost" size="icon" className="size-8">
										<ChevronDownIcon />
										<span className="sr-only">Flytta ned</span>
									</Button>
									<Button variant="ghost" size="icon" className="size-8">
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
		</div>
	);
}
