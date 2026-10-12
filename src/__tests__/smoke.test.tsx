import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('[BVT] Smoke Test', () => {
  it('renders a basic element correctly', () => {
    render(<div data-testid="test-div">Vitest is working!</div>);

    const element = screen.getByTestId('test-div');
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent('Vitest is working!');
  });
});
