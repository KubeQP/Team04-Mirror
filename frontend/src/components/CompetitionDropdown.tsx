import { X, Plus } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export interface CompetitionDropdownProps {
	competitions: Array<{ id: number }>;
	selectedCompetition: number | null;
	onAdd: () => void;
	onRemove: (id: number) => void;
	onSelect: (id: number) => void;
}

export function CompetitionDropdown({
	competitions,
	selectedCompetition,
	onAdd,
	onRemove,
	onSelect,
}: CompetitionDropdownProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">
					{selectedCompetition ? `Tävling ${selectedCompetition}` : 'Välj tävling'} ▾
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56">
				<DropdownMenuLabel>Tävlingar</DropdownMenuLabel>
				<DropdownMenuSeparator />

				{competitions.length === 0 ? (
					<div className="p-2 text-sm text-muted-foreground text-center">Inga tävlingar ännu</div>
				) : (
					competitions.map((comp) => (
						<DropdownMenuItem
							key={comp.id}
							className="flex justify-between items-center"
							onSelect={(e) => {
								e.preventDefault();
							}}
						>
							<span
								className={`flex-1 cursor-pointer ${selectedCompetition === comp.id ? 'font-bold' : ''}`}
								onClick={() => onSelect(comp.id)}
							>
								{selectedCompetition === comp.id && '✓ '}
								Tävling {comp.id}
							</span>
							<button
								onClick={(e) => {
									e.stopPropagation();
									onRemove(comp.id);
								}}
								className="ml-2 hover:bg-destructive hover:text-destructive-foreground rounded p-1"
							>
								<X className="h-4 w-4" />
							</button>
						</DropdownMenuItem>
					))
				)}

				<DropdownMenuSeparator />

				<DropdownMenuItem onSelect={onAdd}>
					<Plus className="mr-2 h-4 w-4" />
					Lägg till ny tävling
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}