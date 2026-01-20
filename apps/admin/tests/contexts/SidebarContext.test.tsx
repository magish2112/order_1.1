import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';

describe('SidebarContext', () => {
  it('должен предоставлять начальное состояние', () => {
    const { result } = renderHook(() => useSidebar(), {
      wrapper: SidebarProvider,
    });

    expect(result.current.collapsed).toBe(false);
    expect(result.current.sidebarWidth).toBe(250);
  });

  it('должен изменять collapsed состояние', () => {
    const { result } = renderHook(() => useSidebar(), {
      wrapper: SidebarProvider,
    });

    act(() => {
      result.current.setCollapsed(true);
    });

    expect(result.current.collapsed).toBe(true);
    expect(result.current.sidebarWidth).toBe(80);
  });

  it('должен изменять sidebarWidth при collapsed', () => {
    const { result } = renderHook(() => useSidebar(), {
      wrapper: SidebarProvider,
    });

    act(() => {
      result.current.setCollapsed(true);
    });

    expect(result.current.sidebarWidth).toBe(80);

    act(() => {
      result.current.setCollapsed(false);
    });

    expect(result.current.sidebarWidth).toBe(250);
  });
});
