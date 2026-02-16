// src/pages/RegistreringStoppTid.tsx
import { EraserIcon, Undo2Icon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'sonner';
import vineBoom from '@/assets/audio/vine-boom.mp3';

import { Button } from '@/components/ui/button';
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from '@/components/ui/combobox';
import { Field, FieldLabel } from '@/components/ui/field';
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { getCompetitorData } from '../api/getCompetitorData';
import { getStationData } from '../api/getStationData';
import { API_BASE_URL } from '../config/api';

type Competitor = {
	start_number: string;
	name: string;
};

type Station = {
	id: number;
	station_name: string;
	order: string;
};

type LocalTimeEntry = {
	id: string;
	start_number: string | null;
	name?: string;
	station_id: number;
	station_name?: string;
	timestamp: string;
};

type OutletCtx = {
	competitorsVersion: number;
	notifyCompetitorAdded: () => void; // finns, men används inte här
};

export default function RegistreringStoppTid() {
	const { competitorsVersion } = useOutletContext<OutletCtx>();

	const [competitors, setCompetitors] = useState<Competitor[]>([]);

	const [selectedStartNumber, setSelectedStartNumber] = useState<string | null>(null);

	const [selectedStationId, setSelectedStationId] = useState<number | ''>('');
	const [stations, setStations] = useState<Station[]>([]);

	const [latestRegistrations, setLatestRegistrations] = useState<LocalTimeEntry[]>([]);

	useEffect(() => {
		const stored = localStorage.getItem('latestStopTimes');
		if (stored) {
			setLatestRegistrations(JSON.parse(stored));
		}
	}, []);

	// fetchData: hämtar konkurrenter och stationer, utan autoplay
    const fetchData = async () => {
        const result = await getCompetitorData();
        setCompetitors(result);

        const res = await getStationData();
        setStations(res);
    };



	// Hämta vid första mount
	useEffect(() => {
		fetchData();
	}, []);

	// Hämta igen när någon registrerar en ny tävlande på registreringssidan
	useEffect(() => {
		fetchData();
	}, [competitorsVersion]);

	const selectedCompetitor = useMemo(
		() => competitors.find((c) => c.start_number === selectedStartNumber),
		[competitors, selectedStartNumber],
	);

	const recordStopTimeNow = async () => {
		const response = await fetch(`${API_BASE_URL}/api/times/record`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				start_number: selectedStartNumber,
				station_id: selectedStationId,
				timestamp: new Date().toISOString(),
			}),
		});

		if (!response.ok) {
			throw new Error('Failed to register time');
		}

		// Create local entry
		const newEntry: LocalTimeEntry = {
			id: crypto.randomUUID(),
			start_number: selectedStartNumber || null,
			name: selectedCompetitor?.name,
			station_id: selectedStationId as number,
			station_name: stations.find((s) => s.id === selectedStationId)?.station_name,
			timestamp: new Date().toISOString(),
		};

		const updated = [newEntry, ...latestRegistrations].slice(0, 20); // keep last 20
		setLatestRegistrations(updated);
		localStorage.setItem('latestStopTimes', JSON.stringify(updated));

		return response;
	};

	return (
		<div>
			<h1 className="text-xl font-bold pb-2">Registrera stopptid:</h1>

			<Field className="my-2">
				<FieldLabel>Station</FieldLabel>
				<div className="flex items-center gap-0.5">
					<Select
						disabled={selectedStationId !== '' || stations.length === 0}
						value={selectedStationId.toString()}
						onValueChange={(value) => setSelectedStationId(Number(value))}
					>
						<SelectTrigger className="w-full max-w-48">
							<SelectValue placeholder="Välj station" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Stationer</SelectLabel>
								{stations.map((station) => (
									<SelectItem
										key={station.id}
										value={station.id.toString()}
										onSelect={() => setSelectedStationId(station.id)}
									>
										{station.station_name}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								hidden={selectedStationId === ''}
								onClick={() => setSelectedStationId('')}
								size="icon"
							>
								<Undo2Icon />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Ångra val av station</p>
						</TooltipContent>
					</Tooltip>
				</div>
			</Field>
			<Field className="my-4">
				<FieldLabel>Välj tävlande</FieldLabel>
				<Field orientation="horizontal" className="gap-2">
					<Combobox
						items={competitors}
						value={selectedStartNumber ?? ''}
						onInputValueChange={(value) => setSelectedStartNumber(value === '' ? null : value)}
					>
						<ComboboxInput placeholder="Sök tävlande..." className="w-1/4" maxLength={3} />
						<ComboboxContent>
							<ComboboxEmpty>Kunde inte hitta några tävlande.</ComboboxEmpty>
							<ComboboxList>
								{(competitor: Competitor) => (
									<ComboboxItem key={competitor.start_number} value={competitor.start_number}>
										<Item size="sm" className="p-0">
											<ItemContent>
												<ItemTitle className="whitespace-nowrap">{competitor.start_number}</ItemTitle>
												<ItemDescription>{competitor.name}</ItemDescription>
											</ItemContent>
										</Item>
									</ComboboxItem>
								)}
							</ComboboxList>
						</ComboboxContent>
					</Combobox>
					<Button
						type="button"
						disabled={!selectedStationId}
						onClick={async () => {
							toast.promise(recordStopTimeNow(), {
								loading: 'Registrerar stopptid...',
								success: () =>
									selectedStartNumber
										? `Stopptid registrerad för: ${selectedCompetitor?.name ?? ''} (${selectedStartNumber})`
										: 'Stopptid registrerad utan kopplad tävlande',
								error: 'Kunde inte registrera stopptid',
							});
						}}
					>
						Registrera stopptid nu
					</Button>
					<Button
                        type="button"
                        variant="secondary"
                        onClick={async () => {
                            await toast.promise(
                                (async () => {
                                    await fetchData();

                                    // Spela ljud NU – webbläsaren tillåter detta eftersom det sker efter klick
                                    const audio = new Audio(vineBoom); // public/assets
                                    audio.play().catch(() => console.warn('Kunde inte spela ljud'));
                                })(),
                                {
                                    loading: 'Uppdaterar lista...',
                                    success: 'Lista uppdaterad',
                                    error: 'Kunde inte uppdatera lista',
                                },
                            );
                        }}
                    >
                        Uppdatera lista
                    </Button>
				</Field>
			</Field>
			<div className="flex gap-6 mt-8">
				<div className="w-full">
					<h2 className="text-lg font-semibold mb-2">Alla tävlande</h2>
					<ScrollArea className="h-[50vh] rounded-md border px-2">
						<Table>
							<TableHeader className="h-12">
								<TableRow>
									<TableHead>Startnummer</TableHead>
									<TableHead>Namn</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{competitors.map((competitor) => (
									<TableRow key={competitor.start_number}>
										<TableCell className="font-medium">{competitor.start_number}</TableCell>
										<TableCell>{competitor.name}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</ScrollArea>
				</div>
				<div className="w-full">
					<div className="flex">
						<h2 className="text-lg flex-1 font-semibold mb-2">Senaste registreringar</h2>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									onClick={() => {
										setLatestRegistrations([]);
										localStorage.removeItem('latestStopTimes');
									}}
								>
									<EraserIcon />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Rensa senaste registreringar (lokalt, påverkar inte backend)</p>
							</TooltipContent>
						</Tooltip>
					</div>
					<ScrollArea className="h-[50vh] rounded-md border px-2">
						<Table>
							<TableHeader className="h-12">
								<TableRow>
									<TableHead>Tid</TableHead>
									<TableHead>Startnummer</TableHead>
									<TableHead>Namn</TableHead>
									<TableHead>Station</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{latestRegistrations.map((entry) => (
									<TableRow key={entry.id}>
										<TableCell>{new Date(entry.timestamp).toLocaleTimeString('sv-SE')}</TableCell>
										<TableCell className="font-medium">{entry.start_number}</TableCell>
										<TableCell>{entry.name}</TableCell>
										<TableCell>{entry.station_name}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</ScrollArea>
				</div>
			</div>
		</div>
	);
}
