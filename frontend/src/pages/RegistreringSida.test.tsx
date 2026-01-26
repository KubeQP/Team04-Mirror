import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import RegistreringSida from './RegistreringSida';

const input = screen.getByPlaceholderText('Skriv startnummer här');

describe('RegisteringSida', () => {
	it('Testar korrekt registrering', () => {

		render(<RegistreringSida />);

		// Skriv in siffror fältet
		
		fireEvent.change(input, { target : { value: '001'}})
			
		// Klicka på knappen
		fireEvent.click(screen.getByText('Registrera'));

		// Efter klick kolla listan
		expect(screen.getByText('Startnummer: 001', {exact:false})).toBeInTheDocument();
		
	});
	
	it('Testar felaktig registrering med bokstäver', () => {

		render(<RegistreringSida />);
	
			// Skriv in bokstäver i fältet
		fireEvent.change(input, { target : { value: 'abc'}})

		// Klicka på knappen
		fireEvent.click(screen.getByText('Registrera'));

		// Efter klick kolla listan
		expect(screen.queryByText('abc')).not.toBeInTheDocument();

	});

	it('Testar registrering med extra nollor framför', () => {

		render(<RegistreringSida />);
		
			// Skriv in med nollor framför
		fireEvent.change(input, { target : { value: '000210'}})

		// Klicka på knappen
		fireEvent.click(screen.getByText('Registrera'));

		// Efter klick kolla listan
		expect(screen.getByText('Startnummer: 210', {exact:false})).not.toBeInTheDocument();
	
	});

	it('Testar registrering med färre än tre siffror', () => {

		render(<RegistreringSida />);
		
			// Skriv in utan extra nollor
		fireEvent.change(input, { target : { value: '13'}})

		// Klicka på knappen
		fireEvent.click(screen.getByText('Registrera'));

		// Efter klick kolla listan
		expect(screen.getByText('Startnummer: 013', {exact:false})).not.toBeInTheDocument();
	
	});
});