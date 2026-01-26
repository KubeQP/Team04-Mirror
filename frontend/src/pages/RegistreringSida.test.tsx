import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import RegistreringSida from './RegistreringSida';

describe('RegisteringSida', () => {
	it('låter användaren skriva in och skicka registreringsnummret vid knapptryck', () => {

		render(<RegistreringSida />);


    // Skriv in i fältet
    const input = screen.getByPlaceholderText('Skriv startnummer här');
    fireEvent.change(input, { target : { value: '001'}})
    
		
		// Klicka på knappen
		fireEvent.click(screen.getByText('Registrera'));



		// Efter klick kolla listan
		expect(screen.getByText('Nummer: 001')).toBeInTheDocument();
	});
});