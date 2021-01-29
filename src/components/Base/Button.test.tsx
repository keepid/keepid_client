import React from 'react';
import {
  cleanup, fireEvent, render, screen, waitFor,
} from '@testing-library/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import '@testing-library/jest-dom/extend-expect';
import Button from './Button';

describe('Button', () => {
  test('should call onClick on click', async () => {
    // Arrange
    const onClick = jest.fn();
    render(<Button onClick={onClick} />);

    // Act
    fireEvent.click(screen.getByRole('button'));

    // Assert
    await waitFor(() => {
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  test('should render children as label', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Button Text</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Button Text');
  });
});
