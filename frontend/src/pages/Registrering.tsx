import { MoreHorizontalIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Competitor = {
	start_number: string;
	name: string;
};

type OutletCtx = {
	competitorsVersion: number;
	notifyCompetitorAdded: () => void;
};

export default function Registrering() {
	const { notifyCompetitorAdded } = useOutletContext<OutletCtx>();

	const [reg, setReg] = useState('');
	const [name, setName] = useState('');
	const [competitors, setCompetitors] = useState<Competitor[]>([]);

	const fetchCompetitors = async () => {
		const res = await fetch('http://localhost:8000/api/competitors/');
		if (!res.ok) return;
		const data = await res.json();
		setCompetitors(data);
	};

	useEffect(() => {
		fetchCompetitors();
	}, []);

	const addReg = async () => {
		console.log('add reg');

		if (!reg.trim()) return;
		if (isNaN(Number(reg))) return;
		if (!name.trim()) return;

		const regWithoutInitialZeros = reg.replace(/^0+/, '');
		const formattedReg = regWithoutInitialZeros.padStart(3, '0');

		const exists = competitors.some((r) => r.start_number === formattedReg);
		if (exists) {
			return;
		}

		//const time = new Date().toLocaleTimeString('sv-SE'); //kommer inte behövas sen, byts ut mot tiden från databasen.
		//const now = new Date();
		//const time = now.toISOString();
		//const formattedTime = now.toLocaleTimeString('sv-SE');

		try {
			const res = await fetch('http://localhost:8000/api/competitors/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					start_number: formattedReg,
					name: name,
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

			notifyCompetitorAdded();
		} catch (err) {
			console.error('Fetch error:', err);
		}
	};

	return (
		<div>
			<h1 className="text-xl font-bold pb-4">Registrering:</h1>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					addReg();
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
								value={reg}
								onChange={(e) => setReg(e.target.value)}
							/>
						</Field>
						<Field>
							<FieldLabel>Namn</FieldLabel>
							<Input
								id="nameInput"
								placeholder="Aaron"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</Field>
					</FieldGroup>
					<Button type="submit" variant="default" disabled={!reg.trim() || !name.trim()}>
						Registrera
					</Button>
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
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon" className="size-8">
												<MoreHorizontalIcon />
												<span className="sr-only">Öppna meny</span>
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem>Redigera</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem variant="destructive">Radera</DropdownMenuItem>
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
