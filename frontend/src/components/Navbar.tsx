import { MenuIcon, TimerIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';

type NavigationItem = {
	title: string;
	href: string;
}[];

const Navbar = ({ navigationData }: { navigationData: NavigationItem }) => {
	return (
		<header className="sticky top-0 z-50 border-b bg-background mb-4">
			<div className="mx-auto flex max-w-7xl items-center font-semibold justify-between gap-8 px-4 py-6 sm:px-6">
				<div className="md:flex w-full items-center justify-center gap-4 text-muted-foreground hidden">
					{navigationData.slice(1, Math.ceil(navigationData.length / 2)).map((item) => (
						<NavLink
							key={item.href}
							to={item.href}
							className={({ isActive }) =>
								`hover:text-primary ${
									isActive ? 'text-primary' : ''
								} px-4 py-2 justify-center flex flex-col items-center`
							}
						>
							{({ isActive }) => (
								<>
									{item.title}

									{isActive && (
										<div className="w-4/5">
											<Separator orientation="horizontal" />
										</div>
									)}
								</>
							)}
						</NavLink>
					))}
					<NavLink to="/" className="flex items-center gap-2 font-bold text-lg px-4 py-2">
						<div className="h-8 w-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
							<TimerIcon className="size-5" />
						</div>
						<p className="text-primary">PlaceholderAppName</p>
					</NavLink>
					{navigationData.slice(navigationData.length / 2 + 1).map((item) => (
						<NavLink
							key={item.href}
							to={item.href}
							className={({ isActive }) =>
								`hover:text-primary ${
									isActive ? 'text-primary' : ''
								} px-4 py-2 justify-center flex flex-col items-center`
							}
						>
							{({ isActive }) => (
								<>
									{item.title}

									{isActive && (
										<div className="w-4/5">
											<Separator orientation="horizontal" />
										</div>
									)}
								</>
							)}
						</NavLink>
					))}
				</div>

				<div className="hidden absolute right-6 md:block">
					<ThemeToggle />
				</div>

				<div className="flex flex-1 justify-end items-center gap-3">
					<Sheet>
						<SheetTrigger asChild>
							<Button variant="outline" size="icon" className="md:hidden">
								<MenuIcon />
								<span className="sr-only">Öppna meny</span>
							</Button>
						</SheetTrigger>

						<SheetContent side="right" className="w-60">
							<SheetHeader>
								<SheetTitle className="flex items-center gap-2">
									<div className="h-7 w-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
										<TimerIcon className="size-5" />
									</div>
									Placeholder
								</SheetTitle>
							</SheetHeader>

							<nav className="mt-4 flex flex-col gap-4 ml-2">
								{navigationData.map((item) => (
									<NavLink key={item.href} to={item.href} className="text-lg font-medium hover:text-primary">
										{item.title}
									</NavLink>
								))}

								<div className="pt-4">
									<ThemeToggle />
								</div>
							</nav>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</header>
	);
};

export default Navbar;
