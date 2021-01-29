import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import '@testing-library/jest-dom/extend-expect';
import ButtonWithEvenAndOddClick from './ButtonWithEvenAndOddClick';

describe('ButtonWithEvenAndOddClick', () => {
  test('should call onOddClick on first click', async () => {
    // Arrange
    const onEvenClick = jest.fn();
    const onOddClick = jest.fn();
    const { getByRole } = render(<ButtonWithEvenAndOddClick label="test" onEvenClick={onEvenClick} onOddClick={onOddClick} />);

    // Act
    fireEvent.click(getByRole('button'));

    // Assert
    await waitFor(() => {
      expect(onOddClick).toHaveBeenCalledTimes(1);
    });
    expect(onEvenClick).toHaveBeenCalledTimes(0);
  });

  test('should call onEvenClick on second click', async () => {
    // Arrange
    const onEvenClick = jest.fn();
    const onOddClick = jest.fn();
    const { getByRole } = render(<ButtonWithEvenAndOddClick label="test" onEvenClick={onEvenClick} onOddClick={onOddClick} />);

    // Act
    fireEvent.click(getByRole('button'));
    fireEvent.click(getByRole('button'));

    // Assert
    await waitFor(() => {
      expect(onEvenClick).toHaveBeenCalledTimes(1);
    });
    expect(onOddClick).toHaveBeenCalledTimes(1);
  });
});
