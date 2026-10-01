import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );

describe('App routing', () => {
  it('REGRESSION: unknown URLs show the 404 page', async () => {
    renderAt('/definitely-not-a-page');
    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });

  it('signed-out visitors to / end up on the login page', async () => {
    renderAt('/');
    expect(await screen.findByRole('tablist', { name: 'Sign-in method' })).toBeInTheDocument();
  });

  it('protected boards route redirects signed-out users to login', async () => {
    renderAt('/boards/abc');
    expect(await screen.findByRole('tablist', { name: 'Sign-in method' })).toBeInTheDocument();
  });

  it('REGRESSION: provides a skip link targeting the main landmark', async () => {
    renderAt('/login');
    const skip = await screen.findByRole('link', { name: 'Skip to main content' });
    expect(skip).toHaveAttribute('href', '#main');
    expect(document.getElementById('main')).toBeInTheDocument();
  });
});
