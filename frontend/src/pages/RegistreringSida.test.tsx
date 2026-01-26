import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import RegistreringSida from './RegistreringSida';

let input: HTMLElement;

beforeEach(() => {	
	render(<RegistreringSida />);
	input = screen.getByPlaceholderText('Skriv startnummer här');
});


describe('RegisteringSida', () => {
	it('Testar korrekt registrering', () => {

		// Skriv in siffror i fältet
		fireEvent.change(input, { target : { value: '001'}})
			
		// Klicka på knappen
		fireEvent.click(screen.getByText('Registrera'));

		// Efter klick kolla listan
		expect(screen.getByText('Startnummer: 001', {exact:false})).toBeInTheDocument();
		
	});
	
	it('Testar felaktig registrering med bokstäver', () => {
	
		// Skriv in bokstäver i startnummerfältet
		fireEvent.change(input, { target : { value: 'abc'}})

		// Klicka på knappen
		fireEvent.click(screen.getByText('Registrera'));

		// Efter klick kolla listan
		expect(screen.queryByText('abc')).not.toBeInTheDocument();

	});

	it('Testar registrering med extra nollor framför', () => {
		
		// Skriv in med nollor framför
		fireEvent.change(input, { target : { value: '000210'}})

		// Klicka på knappen
		fireEvent.click(screen.getByText('Registrera'));

		// Efter klick kolla listan
		expect(screen.getByText('Startnummer: 210', {exact:false})).toBeInTheDocument();
	
	});

	it('Testar registrering med färre än tre siffror', () => {

		// Skriv in utan extra nollor
		fireEvent.change(input, { target : { value: '13'}})

		// Klicka på knappen
		fireEvent.click(screen.getByText('Registrera'));

		// Efter klick kolla listan
		expect(screen.getByText('Startnummer: 013', {exact:false})).toBeInTheDocument();
	
	});

	it('Testar registrering med fler än tre siffror', () => {

		// Skriv in med extra nollor och tal större än 1000
		fireEvent.change(input, { target : { value: '0001111'}})

		// Klicka på knappen
		fireEvent.click(screen.getByText('Registrera'));

		// Efter klick kolla listan
		expect(screen.getByText('Startnummer: 1111', {exact:false})).toBeInTheDocument();
	
	});

	it('Testar registrering med dubletter', () => {

		// Försöker registrera två likadana tal

		for (let i = 0; i < 2; i++) {
  			fireEvent.change(input, { target: { value: '011' }});
  			fireEvent.click(screen.getByText('Registrera'));
		}

		// Hämta alla registreringar med startnummer 011
  		const matches = screen.getAllByText(/Startnummer: 011/i);

  		// Ska bara finnas EN
  		expect(matches.length).toBe(1);
	});
});