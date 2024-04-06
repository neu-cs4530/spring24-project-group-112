import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Login from './Authenticator';

describe('Authenticator', () => {
    it('renders the login form', () => {
        render(<Login app={app} callback={callback} />);
        
        // Assert that the login form elements are rendered
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
    });

    it('calls the signInWithEmailAndPassword function when the Sign In button is clicked', () => {
        const signInWithEmailAndPassword = jest.fn();
        jest.spyOn(firebase.auth, 'signInWithEmailAndPassword').mockImplementation(signInWithEmailAndPassword);
        render(<Authenticator />);
        
        // Simulate user input
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
        
        // Click the Sign In button
        fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
        
        // Assert that the signInWithEmailAndPassword function is called with the correct arguments
        expect(signInWithEmailAndPassword).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('calls the createUserWithEmailAndPassword function when the Create Account button is clicked', () => {
        const createUserWithEmailAndPassword = jest.fn();
        jest.spyOn(firebase.auth, 'createUserWithEmailAndPassword').mockImplementation(createUserWithEmailAndPassword);
        render(<Authenticator />);
        
        // Simulate user input
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
        
        // Click the Create Account button
        fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
        
        // Assert that the createUserWithEmailAndPassword function is called with the correct arguments
        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith('test@example.com', 'password123');
    });
});
