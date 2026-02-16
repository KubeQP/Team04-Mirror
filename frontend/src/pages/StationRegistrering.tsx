import { ChevronDownIcon, ChevronUpIcon, Trash2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { API_BASE_URL } from '../config/api';
import { updateStationOrder } from '../api/PatchStationOrder';


type Station = {
	station_name: string;
	order: string;
};

export default function StationRegistrering() {
	const [stationName, setStationName] = useState('');
	const [order, setOrder] = useState('');
	const [stations, setStations] = useState<Station[]>([]);

	const fetchStations = async () => {
		const res = await fetch(`${API_BASE_URL}/api/stations/getstations`);
		if (!res.ok) return;
		const data = await res.json();
		setStations((data as Array<Station>).sort((a, b) => Number(a.order) - Number(b.order)));
	};

    const moveStation = async (index: number, direction: 'up' | 'down') => {
        const newStations = [...stations];

        const targetIndex =
            direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newStations.length) return;

        // 1. Byt plats lokalt
        [newStations[index], newStations[targetIndex]] = [
            newStations[targetIndex],
            newStations[index],
        ];

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



	useEffect(() => {
		fetchStations();
	}, []);

	const addStation = async () => {
		console.log('add station');

		if (!stationName.trim()) return;
		if (!order.trim()) return;

		try {
			const res = await fetch(`${API_BASE_URL}/api/stations/registerstation`, {
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
			<h1 className="text-xl font-bold pb-4">Hantera stationer:</h1>
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
