import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmAction } from './ConfirmAction';
import { Modal } from './Modal';

const setup = (props = {}) => {
  const onConfirm = vi.fn();
  render(<ConfirmAction label="Delete card" message="Delete this card?" onConfirm={onConfirm} {...props} />);
  return { onConfirm, user: userEvent.setup() };
};

describe('ConfirmAction', () => {
  it('requires a second click: the first click only asks', async () => {
    const { onConfirm, user } = setup();
    await user.click(screen.getByRole('button', { name: 'Delete card' }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Delete this card?');
    await user.click(screen.getByRole('button', { name: 'Yes, delete' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('Cancel dismisses without confirming and returns focus to the trigger', async () => {
    const { onConfirm, user } = setup();
    await user.click(screen.getByRole('button', { name: 'Delete card' }));
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Delete card' })).toHaveFocus();
  });

  it('Escape dismisses the confirmation only, not the enclosing dialog', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal title="Card" onClose={onClose}>
        <ConfirmAction label="Delete card" message="Sure?" onConfirm={vi.fn()} />
      </Modal>,
    );
    await user.click(screen.getByRole('button', { name: 'Delete card' }));
    await user.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: 'Delete card' })).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('reports confirming state changes', async () => {
    const onConfirmingChange = vi.fn();
    const { user } = setup({ onConfirmingChange });
    await user.click(screen.getByRole('button', { name: 'Delete card' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onConfirmingChange.mock.calls).toEqual([[true], [false]]);
  });

  it('does not open when disabled', async () => {
    const { user } = setup({ disabled: true });
    await user.click(screen.getByRole('button', { name: 'Delete card' }));
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
