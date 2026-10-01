import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

describe('Modal', () => {
  it('is an accessible modal dialog labelled by its title', () => {
    render(<Modal title="Card" onClose={vi.fn()}>body</Modal>);
    expect(screen.getByRole('dialog', { name: 'Card' })).toHaveAttribute('aria-modal', 'true');
  });

  it('closes via the close button, Escape and overlay click, but not panel clicks', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<Modal title="Card" onClose={onClose}><p>inside</p></Modal>);
    await user.click(screen.getByText('inside'));
    expect(onClose).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Close dialog' }));
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('dialog').parentElement!);
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it('traps Tab focus inside the dialog', async () => {
    const user = userEvent.setup();
    render(<Modal title="Card" onClose={vi.fn()}><button>One</button><button>Two</button></Modal>);
    const close = screen.getByRole('button', { name: 'Close dialog' });
    expect(close).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Two' })).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();
  });

  it('locks body scroll and restores scroll and focus on unmount', () => {
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();
    const { unmount } = render(<Modal title="Card" onClose={vi.fn()}>x</Modal>);
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
    expect(opener).toHaveFocus();
    opener.remove();
  });
});
