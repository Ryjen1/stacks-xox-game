import { renderHook, act } from '@testing-library/react';
import { useStacks } from '@/hooks/use-stacks';
import { UserData } from '@stacks/connect';

describe('useStacks Hook', () => {
  // Mock the global window object
  const mockWindow = {
    alert: jest.fn(),
    location: {
      reload: jest.fn()
    }
  };

  beforeAll(() => {
    global.window = mockWindow as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with null userData', () => {
    const { result } = renderHook(() => useStacks());

    expect(result.current.userData).toBeNull();
    expect(result.current.stxBalance).toBe(0);
  });

  it('should have connectWallet function', () => {
    const { result } = renderHook(() => useStacks());

    expect(typeof result.current.connectWallet).toBe('function');
  });

  it('should have disconnectWallet function', () => {
    const { result } = renderHook(() => useStacks());

    expect(typeof result.current.disconnectWallet).toBe('function');
  });

  it('should have handleCreateGame function', () => {
    const { result } = renderHook(() => useStacks());

    expect(typeof result.current.handleCreateGame).toBe('function');
  });

  it('should have handleJoinGame function', () => {
    const { result } = renderHook(() => useStacks());

    expect(typeof result.current.handleJoinGame).toBe('function');
  });

  it('should have handlePlayGame function', () => {
    const { result } = renderHook(() => useStacks());

    expect(typeof result.current.handlePlayGame).toBe('function');
  });

  // Note: Testing the actual wallet connection functionality would require
  // mocking the Stacks Connect library and is more complex.
  // This would typically be done in integration tests.
});