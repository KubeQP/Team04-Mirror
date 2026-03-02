import { MoreHorizontalIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

import { useCompetition } from '@/components/Competition';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

import { API_BASE_URL } from '../config/api';

type Competitor = {
	start_number: string;
	name: string;
	competition_id: number;
};

type OutletCtx = {
	competitorsVersion: number;
	notifyCompetitorAdded: () => void;
};

export default function Registrering() {
	const { competition } = useCompetition();
	const { notifyCompetitorAdded } = useOutletContext<OutletCtx>();

	const [reg, setReg] = useState('');
	const [name, setName] = useState('');
	const [competitors, setCompetitors] = useState<Competitor[]>([]);
	const [editingCompetitor, setEditingCompetitor] = useState<Competitor | null>(null);
	const [editStartNumber, setEditStartNumber] = useState('');
	const [editName, setEditName] = useState('');
	const [openDropdownFor, setOpenDropdownFor] = useState<string | null>(null);
	const [textareaValue, setTextareaValue] = useState('');

	const openEditDialog = (competitor: Competitor) => {
		setEditingCompetitor(competitor);
		setEditStartNumber(competitor.start_number);
		setEditName(competitor.name);
	};

	const fetchCompetitors = useCallback(async () => {
		const res = await fetch(`${API_BASE_URL}/api/competitors/`);
		if (!res.ok) return;
		const data = await res.json();
		setCompetitors((data as Array<Competitor>).filter((c) => c.competition_id === competition));
	}, [competition]);

	useEffect(() => {
		fetchCompetitors();
	}, [fetchCompetitors]);

	const addReg = async (rawReg: string, rawName: string) => {
		console.log('add reg');
		console.log(reg);
		if (!rawReg.trim()) {
			console.error('Error', 'trim reg' + rawReg);
			return;
		}
		if (isNaN(Number(rawReg))) {
			console.error('Error', 'NAN');
			return;
		}
		if (!rawName.trim()) {
			console.error('Error', 'trim name');
			return;
		}
		console.log('past inital checks');

		const regWithoutInitialZeros = rawReg.replace(/^0+/, '');
		const formattedReg = regWithoutInitialZeros.padStart(3, '0');

		const exists = competitors.some((r) => r.start_number === formattedReg);
		if (exists) {
			console.log('exists');
			return;
		}

		//const time = new Date().toLocaleTimeString('sv-SE'); //kommer inte behövas sen, byts ut mot tiden från databasen.
		//const now = new Date();
		//const time = now.toISOString();
		//const formattedTime = now.toLocaleTimeString('sv-SE');

		try {
			console.log('intry ');
			const res = await fetch(`${API_BASE_URL}/api/competitors/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					start_number: formattedReg,
					name: rawName,
					competition_id: competition,
				}),
			});

			if (!res.ok) {
				const err = await res.json();
				console.error('Error:', err.detail);
				return;
			}

			const data = await res.json();
			console.log('Time registered:', data);

			// NU uppdaterar vi från databasen
			await fetchCompetitors();

			setReg('');
			setName('');
			console.log('somethig ahs happened');
			notifyCompetitorAdded();
		} catch (err) {
			console.error('Fetch error:', err);
		}
	};

	const handleImport = async () => {
		// Use textareaValue here
		const input = textareaValue;
		const rows = input.trim().split('\n');

		// Process each row
		const result = rows.map((row) => {
			// Split each row into parts using the comma as a separator
			const [startNumber, name] = row.split(',').map((part) => part.trim());
			return { startNumber, name };
		});

		result.forEach((value) => {
			//setReg(value.startNumber);
			console.log(value.startNumber, value.name);
			//console.log(reg);
			//setName(value.name);
			addReg(value.startNumber, value.name);
		});
		// Your import logic here
	};

	return (
		<div>
			<h1 className="text-xl font-bold pb-4">Registrera tävlande:</h1>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					addReg(reg, name);
				}}
			>
				<div className="flex items-end gap-4">
					<FieldGroup className="grid max-w-sm grid-cols-2">
						<Field>
							<FieldLabel>Startnummer</FieldLabel>
							<Input
								id="startNbrInput"
								placeholder="123"
								type="text"
								inputMode="numeric"
								maxLength={3}
								value={reg}
								onChange={(e) => {
									const value = e.target.value.replace(/\D/g, '').slice(0, 3);
									setReg(value);
								}}
							/>
						</Field>
						<Field>
							<FieldLabel>Namn</FieldLabel>
							<Input
								id="nameInput"
								placeholder="John Doe"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</Field>
					</FieldGroup>
					<Button type="submit" variant="default" disabled={!reg.trim() || !name.trim()}>
						Registrera
					</Button>
					<Dialog>
						<DialogTrigger asChild>
							<Button variant="outline">Import</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-md">
							<DialogHeader>
								<DialogDescription>Paste in the competitiors you wish to import with the format.</DialogDescription>
							</DialogHeader>
							<div className="flex items-center gap-2">
								<div className="grid flex-1 gap-2">
									<Textarea
										id="textarea-message"
										placeholder="019, Alice och Bob
									039, Charlie och Denver"
										value={textareaValue}
										onChange={(e) => setTextareaValue(e.target.value)}
									/>
								</div>
							</div>
							<DialogFooter className="sm:justify-start">
								<DialogClose asChild>
									<Button
										type="button"
										onClick={async () => {
											await handleImport();
										}}
									>
										Import
									</Button>
								</DialogClose>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</form>
			<h2 className="text-lg mt-6 font-semibold mb-2">Registrerade tävlande</h2>
			<ScrollArea className="h-[60vh] rounded-md border px-4">
				<Table>
					<TableHeader>
						<TableRow className="h-14">
							<TableHead>Startnummer</TableHead>
							<TableHead>Namn</TableHead>
							<TableHead className="text-right">Ändra</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{competitors.map((competitor) => (
							<TableRow key={competitor.start_number}>
								<TableCell className="font-medium">{competitor.start_number}</TableCell>
								<TableCell>{competitor.name}</TableCell>
								<TableCell className="text-right">
									<DropdownMenu
										open={openDropdownFor === competitor.start_number}
										onOpenChange={(isOpen) => setOpenDropdownFor(isOpen ? competitor.start_number : null)}
									>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon">
												<MoreHorizontalIcon />
												<span className="sr-only">Öppna meny</span>
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
												<Dialog
													open={editingCompetitor?.start_number === competitor.start_number}
													onOpenChange={(open) => {
														if (!open) {
															setEditingCompetitor(null);
															setOpenDropdownFor(null);
														}
													}}
												>
													<DialogTrigger asChild>
														<div onClick={() => openEditDialog(competitor)}>Redigera</div>
													</DialogTrigger>
													<DialogContent className="sm:max-w-sm">
														<DialogHeader>
															<DialogTitle>Redigera tävlande</DialogTitle>
														</DialogHeader>
														<FieldGroup>
															<Field>
																<Label>Startnummer</Label>
																<Input value={editStartNumber} onChange={(e) => setEditStartNumber(e.target.value)} />
															</Field>
															<Field>
																<Label>Namn</Label>
																<Input value={editName} onChange={(e) => setEditName(e.target.value)} />
															</Field>
														</FieldGroup>
														<DialogFooter>
															<DialogClose asChild>
																<Button variant="outline">Avbryt</Button>
															</DialogClose>
															<Button
																onClick={async () => {
																	if (!editingCompetitor) return;

																	const formattedReg = editStartNumber.replace(/^0+/, '').padStart(3, '0');

																	await fetch(`${API_BASE_URL}/api/competitors/${editingCompetitor.start_number}`, {
																		method: 'PUT',
																		headers: { 'Content-Type': 'application/json' },
																		body: JSON.stringify({ start_number: formattedReg, name: editName }),
																	});

																	await fetchCompetitors();
																	setEditingCompetitor(null);
																}}
															>
																Spara
															</Button>
														</DialogFooter>
													</DialogContent>
												</Dialog>
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												variant="destructive"
												onSelect={async (e) => {
													e.preventDefault();
													await fetch(`${API_BASE_URL}/api/competitors/${competitor.start_number}`, {
														method: 'DELETE',
													});
													await fetchCompetitors();
												}}
											>
												Radera
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</ScrollArea>
		</div>
	);
}
