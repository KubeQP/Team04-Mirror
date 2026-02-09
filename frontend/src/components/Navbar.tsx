import { MenuIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { ThemeToggle } from './ThemeToggle';

type NavigationItem = {
	title: string;
	href: string;
}[];

const Navbar = ({ navigationData }: { navigationData: NavigationItem }) => {
	return (
		<header className="bg-background sticky top-0 z-50 border-b mb-4">
			<div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-7 sm:px-6">
				<div className="text-muted-foreground md:flex-1 md:justify-center gap-8 font-medium lg:gap-16 md:flex hidden">
					{navigationData.map((item) => (
						<NavLink
							key={item.href}
							to={item.href}
							className={({ isActive }) => `hover:text-primary ${isActive ? 'text-primary font-bold' : ''}`}
						>
							{item.title}
						</NavLink>
					))}
				</div>

				<div className="absolute right-7 hidden md:block">
					<ThemeToggle />
				</div>

				<div className="flex items-center gap-6">
					<DropdownMenu>
						<DropdownMenuTrigger className="md:hidden" asChild>
							<Button variant="outline" size="icon">
								<MenuIcon />
								<span className="sr-only">Menu</span>
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent className="w-56" align="end">
							<DropdownMenuGroup>
								{navigationData.map((item) => (
									<DropdownMenuItem key={item.href} asChild>
										<NavLink to={item.href}>{item.title}</NavLink>
									</DropdownMenuItem>
								))}

								<DropdownMenuItem>
									<ThemeToggle />
								</DropdownMenuItem>
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
};

export default Navbar;
