// src/pages/RegistreringStoppTid.tsx
import { EraserIcon, Trash2Icon, Undo2Icon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import vineBoom from '@/assets/audio/vine-boom.mp3';
import { useCompetition } from '@/components/Competition';
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
	competition_id: number;
};

export default function RegistreringStoppTid() {
	const { competition } = useCompetition();

	const [competitors, setCompetitors] = useState<Competitor[]>([]);

	const [selectedStartNumber, setSelectedStartNumber] = useState<string | null>(null);

	const [selectedStationId, setSelectedStationId] = useState<number | ''>('');
	const [stations, setStations] = useState<Station[]>([]);

	const [latestRegistrations, setLatestRegistrations] = useState<LocalTimeEntry[]>([]);

	useEffect(() => {
		const stored = localStorage.getItem('latestStopTimes');
		if (stored) {
			const parsed = JSON.parse(stored);
			console.log('parsed:', parsed);
			console.log('competition:', competition);
			console.log(
				'filtered:',
				parsed.filter((t: LocalTimeEntry) => t.competition_id === competition),
			);
			setLatestRegistrations(parsed.filter((t: LocalTimeEntry) => Number(t.competition_id) === competition));
		}
	}, [competition]);

	const fetchData = useCallback(async () => {
		const result = await getCompetitorData();
		setCompetitors(result.filter((c) => c.competition_id === competition));

		const res = await getStationData();
		setStations(res.filter((c) => c.competition_id === competition));
	}, [competition]);

	// Hämta vid första mount
	useEffect(() => {
		fetchData();
	}, [fetchData]);

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
				competition_id: competition,
			}),
		});

		if (!response.ok) throw new Error('Failed to register time');

		const { id }: { id: string } = await response.json();

		// Create local entry
		const newEntry: LocalTimeEntry = {
			id,
			start_number: selectedStartNumber || null,
			name: selectedCompetitor?.name,
			station_id: selectedStationId as number,
			station_name: stations.find((s) => s.id === selectedStationId)?.station_name,
			timestamp: new Date().toISOString(),
			competition_id: competition,
		};

		// Hämta ALLA sparade tider, inte bara de filtrerade
		const stored = localStorage.getItem('latestStopTimes');
		const allEntries: LocalTimeEntry[] = stored ? JSON.parse(stored) : [];

		const updated = [newEntry, ...allEntries].slice(0, 20);
		localStorage.setItem('latestStopTimes', JSON.stringify(updated));

		// Uppdatera state med bara denna tävlingens tider
		setLatestRegistrations(updated.filter((t) => t.competition_id === competition));

		return response;
	};

	const deleteStopTime = async (entryId: string) => {
		const response = await fetch(`${API_BASE_URL}/api/times/${entryId}`, {
			method: 'DELETE',
		});

		if (!response.ok) {
			throw new Error('Failed to delete time entry');
		}

		const updated = latestRegistrations.filter((entry) => entry.id !== entryId);
		setLatestRegistrations(updated);
		localStorage.setItem('latestStopTimes', JSON.stringify(updated));
	};

	return (
		<div>
			<h1 className="text-xl font-bold pb-2">Tidsregistrering:</h1>

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
						Registrera tid nu
					</Button>
					<Button
						type="button"
						variant="secondary"
						onClick={async () => {
							toast.promise(
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
									<TableHead>Ångra</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{latestRegistrations.map((entry) => (
									<TableRow key={entry.id}>
										<TableCell>{new Date(entry.timestamp).toLocaleTimeString('sv-SE')}</TableCell>
										<TableCell className="font-medium">{entry.start_number}</TableCell>
										<TableCell>{entry.name}</TableCell>
										<TableCell>{entry.station_name}</TableCell>
										<TableCell>
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														onClick={() => {
															toast.promise(deleteStopTime(entry.id), {
																loading: 'Tar bort registrering...',
																success: 'Registrering borttagen',
																error: 'Kunde inte ta bort registrering',
															});
														}}
													>
														<Trash2Icon />
													</Button>
												</TooltipTrigger>
												<TooltipContent>
													<p>Ångra denna registrering (tar bort den från backend)</p>
												</TooltipContent>
											</Tooltip>
										</TableCell>
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
