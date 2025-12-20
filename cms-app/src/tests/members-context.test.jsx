/* eslint-env vitest */
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { MembersProvider, useMembers } from '../context/MembersContext';
import * as firebaseCrud from '../api/firebase-crud';

// Mock the firebase-crud module
vi.mock('../api/firebase-crud', () => ({
  getAllMembers: vi.fn(),
  getMember: vi.fn(),
  createMember: vi.fn(),
  updateMember: vi.fn(),
  deleteMember: vi.fn(),
}));

describe('MembersContext', () => {
  const mockUser = { uid: 'test-user-123', email: 'test@example.com' };

  const mockMembers = [
    { id: 'B001', name: 'Alice Smith', car: 'Honda', isActive: true, validPayment: true, notes: '' },
    { id: 'D002', name: 'Bob Jones', car: 'Toyota', isActive: true, validPayment: false, notes: 'Payment pending' },
    { id: 'U003', name: 'Charlie Brown', car: 'Ford', isActive: false, validPayment: true, notes: 'Inactive' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useMembers hook', () => {
    test('throws error when used outside MembersProvider', () => {
      // Suppress console.error for this test
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useMembers());
      }).toThrow('useMembers must be used within a MembersProvider');

      consoleErrorSpy.mockRestore();
    });

    test('returns context value when used within MembersProvider', () => {
      firebaseCrud.getAllMembers.mockResolvedValue(mockMembers);

      const wrapper = ({ children }) => (
        <MembersProvider user={mockUser}>{children}</MembersProvider>
      );

      const { result } = renderHook(() => useMembers(), { wrapper });

      expect(result.current).toHaveProperty('members');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('getMember');
      expect(result.current).toHaveProperty('createMember');
      expect(result.current).toHaveProperty('updateMember');
      expect(result.current).toHaveProperty('deleteMember');
      expect(result.current).toHaveProperty('refreshMembers');
    });
  });

  describe('Initial Loading', () => {
    test('loads members when user is authenticated', async () => {
      firebaseCrud.getAllMembers.mockResolvedValue(mockMembers);

      const wrapper = ({ children }) => (
        <MembersProvider user={mockUser}>{children}</MembersProvider>
      );

      const { result } = renderHook(() => useMembers(), { wrapper });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.members).toEqual(mockMembers);
      expect(firebaseCrud.getAllMembers).toHaveBeenCalledTimes(1);
    });

    test('does not load members when user is not authenticated', async () => {
      firebaseCrud.getAllMembers.mockResolvedValue(mockMembers);

      const wrapper = ({ children }) => (
        <MembersProvider user={null}>{children}</MembersProvider>
      );

      const { result } = renderHook(() => useMembers(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.members).toEqual([]);
      expect(firebaseCrud.getAllMembers).not.toHaveBeenCalled();
    });

    test('sets error state when loading fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const errorMessage = 'Network error';
      firebaseCrud.getAllMembers.mockRejectedValue(new Error(errorMessage));

      const wrapper = ({ children }) => (
        <MembersProvider user={mockUser}>{children}</MembersProvider>
      );

      const { result } = renderHook(() => useMembers(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to load members. Please refresh the page.');
      expect(result.current.members).toEqual([]);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getMember', () => {
    test('returns member from cache if available', async () => {
      firebaseCrud.getAllMembers.mockResolvedValue(mockMembers);

      const wrapper = ({ children }) => (
        <MembersProvider user={mockUser}>{children}</MembersProvider>
      );

      const { result } = renderHook(() => useMembers(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let member;
      await act(async () => {
        member = await result.current.getMember('B001');
      });

      expect(member).toEqual(mockMembers[0]);
      expect(firebaseCrud.getMember).not.toHaveBeenCalled();
    });

    test('fetches member from DB if not in cache', async () => {
      const newMember = { id: 'B999', name: 'New Member', car: 'BMW', isActive: true, validPayment: true, notes: '' };
      firebaseCrud.getAllMembers.mockResolvedValue(mockMembers);
      firebaseCrud.getMember.mockResolvedValue(newMember);

      const wrapper = ({ children }) => (
        <MembersProvider user={mockUser}>{children}</MembersProvider>
      );

      const { result } = renderHook(() => useMembers(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let member;
      await act(async () => {
        member = await result.current.getMember('B999');
      });

      expect(member).toEqual(newMember);
      expect(firebaseCrud.getMember).toHaveBeenCalledWith('B999');
      expect(result.current.members).toContainEqual(newMember);
    });

    test('adds fetched member to cache', async () => {
      const newMember = { id: 'B999', name: 'New Member', car: 'BMW', isActive: true, validPayment: true, notes: '' };
      firebaseCrud.getAllMembers.mockResolvedValue(mockMembers);
      firebaseCrud.getMember.mockResolvedValue(newMember);

      const wrapper = ({ children }) => (
        <MembersProvider user={mockUser}>{children}</MembersProvider>
      );

      const { result } = renderHook(() => useMembers(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.getMember('B999');
      });

      expect(result.current.members).toHaveLength(4);
      expect(result.current.members[3]).toEqual(newMember);
    });

    test('throws error when getMember fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      firebaseCrud.getAllMembers.mockResolvedValue(mockMembers);
      firebaseCrud.getMember.mockRejectedValue(new Error('Member not found'));

      const wrapper = ({ children }) => (
        <MembersProvider user={mockUser}>{children}</MembersProvider>
      );

      const { result } = renderHook(() => useMembers(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(act(async () => {
        await result.current.getMember('B999');
      })).rejects.toThrow('Member not found');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('createMember', () => {
    test('creates member in DB and updates cache', async () => {
      firebaseCrud.getAllMembers.mockResolvedValue(mockMembers);
      firebaseCrud.createMember.mockResolvedValue('B123');

      const wrapper = ({ children }) => (
        <MembersProvider user={mockUser}>{children}</MembersProvider>
      );

      const { result } = renderHook(() => useMembers(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialLength = result.current.members.length;

      let memberId;
      await act(async () => {
        memberId = await result.current.createMember('B123', 'John Doe', 'Toyota', true, true, 'Test member');
      });

      expect(memberId).toBe('B123');
      expect(firebaseCrud.createMember).toHaveBeenCalledWith('B123', 'John Doe', 'Toyota', true, true, 'Test member');
      expect(result.current.members).toHaveLength(initialLength + 1);
      expect(result.current.members).toContainEqual({
        id: 'B123',
        name: 'John Doe',
        car: 'Toyota',
        isActive: true,
        validPayment: true,
        notes: 'Test member',
      });
    });

    test('throws error when createMember fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      firebaseCrud.getAllMembers.mockResolvedValue(mockMembers);
      firebaseCrud.createMember.mockRejectedValue(new Error('Failed to create'));

      const wrapper = ({ children }) => (
        <MembersProvider user={mockUser}>{children}</MembersProvider>
      );

      const { result } = renderHook(() => useMembers(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(act(async () => {
        await result.current.createMember('B123', 'John Doe', 'Toyota', true, true, 'Test');
      })).rejects.toThrow('Failed to create');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('updateMember', () => {
    test('updates member in DB and cache', async () => {
      firebaseCrud.getAllMembers.mockResolvedValue(mockMembers);
      firebaseCrud.updateMember.mockResolvedValue('B001');

      const wrapper = ({ children }) => (
        <MembersProvider user={mockUser}>{children}</MembersProvider>
      );

      const { result } = renderHook(() => useMembers(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateMember('B001', { car: 'Tesla', name: 'Alice Updated' });
      });

      expect(firebaseCrud.updateMember).toHaveBeenCalledWith('B001', { car: 'Tesla', name: 'Alice Updated' });

      const updatedMember = result.current.members.find(m => m.id === 'B001');
      expect(updatedMember.car).toBe('Tesla');
      expect(updatedMember.name).toBe('Alice Updated');
      expect(updatedMember.isActive).toBe(true); // Other fields unchanged
    });

    test('throws error when updateMember fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      firebaseCrud.getAllMembers.mockResolvedValue(mockMembers);
      firebaseCrud.updateMember.mockRejectedValue(new Error('Failed to update'));

      const wrapper = ({ children }) => (
        <MembersProvider user={mockUser}>{children}</MembersProvider>
      );

      const { result } = renderHook(() => useMembers(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(act(async () => {
        await result.current.updateMember('B001', { car: 'Tesla' });
      })).rejects.toThrow('Failed to update');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('deleteMember', () => {
    test('deletes member from DB and cache', async () => {
      firebaseCrud.getAllMembers.mockResolvedValue(mockMembers);
      firebaseCrud.deleteMember.mockResolvedValue('B001');

      const wrapper = ({ children }) => (
        <MembersProvider user={mockUser}>{children}</MembersProvider>
      );

      const { result } = renderHook(() => useMembers(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialLength = result.current.members.length;

      await act(async () => {
        await result.current.deleteMember('B001');
      });

      expect(firebaseCrud.deleteMember).toHaveBeenCalledWith('B001');
      expect(result.current.members).toHaveLength(initialLength - 1);
      expect(result.current.members.find(m => m.id === 'B001')).toBeUndefined();
    });

    test('throws error when deleteMember fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      firebaseCrud.getAllMembers.mockResolvedValue(mockMembers);
      firebaseCrud.deleteMember.mockRejectedValue(new Error('Failed to delete'));

      const wrapper = ({ children }) => (
        <MembersProvider user={mockUser}>{children}</MembersProvider>
      );

      const { result } = renderHook(() => useMembers(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(act(async () => {
        await result.current.deleteMember('B001');
      })).rejects.toThrow('Failed to delete');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('refreshMembers', () => {
    test('refreshes members from DB', async () => {
      const initialMembers = [mockMembers[0]];
      const refreshedMembers = mockMembers;

      firebaseCrud.getAllMembers
        .mockResolvedValueOnce(initialMembers)
        .mockResolvedValueOnce(refreshedMembers);

      const wrapper = ({ children }) => (
        <MembersProvider user={mockUser}>{children}</MembersProvider>
      );

      const { result } = renderHook(() => useMembers(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.members).toHaveLength(1);

      await act(async () => {
        await result.current.refreshMembers();
      });

      expect(result.current.members).toHaveLength(3);
      expect(firebaseCrud.getAllMembers).toHaveBeenCalledTimes(2);
    });

    test('does not refresh when user is not authenticated', async () => {
      firebaseCrud.getAllMembers.mockResolvedValue([]);

      const wrapper = ({ children }) => (
        <MembersProvider user={null}>{children}</MembersProvider>
      );

      const { result } = renderHook(() => useMembers(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refreshMembers();
      });

      expect(firebaseCrud.getAllMembers).not.toHaveBeenCalled();
    });

    test('handles errors during refresh', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      firebaseCrud.getAllMembers
        .mockResolvedValueOnce(mockMembers)
        .mockRejectedValueOnce(new Error('Network error'));

      const wrapper = ({ children }) => (
        <MembersProvider user={mockUser}>{children}</MembersProvider>
      );

      const { result } = renderHook(() => useMembers(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Catch the error manually to allow state updates to flush
      let errorThrown = false;
      await act(async () => {
        try {
          await result.current.refreshMembers();
        } catch (err) {
          errorThrown = true;
          expect(err.message).toBe('Network error');
        }
      });

      expect(errorThrown).toBe(true);
      expect(result.current.error).toBe('Failed to refresh members.');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Integration Scenarios', () => {
    test('complete CRUD workflow updates cache correctly', async () => {
      firebaseCrud.getAllMembers.mockResolvedValue(mockMembers);
      firebaseCrud.createMember.mockResolvedValue('B123');
      firebaseCrud.updateMember.mockResolvedValue('B123');
      firebaseCrud.deleteMember.mockResolvedValue('B123');

      const wrapper = ({ children }) => (
        <MembersProvider user={mockUser}>{children}</MembersProvider>
      );

      const { result } = renderHook(() => useMembers(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Initial state
      expect(result.current.members).toHaveLength(3);

      // Create
      await act(async () => {
        await result.current.createMember('B123', 'John Doe', 'Toyota', true, true, 'New');
      });
      expect(result.current.members).toHaveLength(4);

      // Update
      await act(async () => {
        await result.current.updateMember('B123', { car: 'Honda' });
      });
      const updated = result.current.members.find(m => m.id === 'B123');
      expect(updated.car).toBe('Honda');

      // Delete
      await act(async () => {
        await result.current.deleteMember('B123');
      });
      expect(result.current.members).toHaveLength(3);
      expect(result.current.members.find(m => m.id === 'B123')).toBeUndefined();
    });

    test('cache prevents duplicate fetches for same member', async () => {
      firebaseCrud.getAllMembers.mockResolvedValue(mockMembers);

      const wrapper = ({ children }) => (
        <MembersProvider user={mockUser}>{children}</MembersProvider>
      );

      const { result } = renderHook(() => useMembers(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Get same member multiple times
      await act(async () => {
        await result.current.getMember('B001');
        await result.current.getMember('B001');
        await result.current.getMember('B001');
      });

      // Should only use cache, not call DB
      expect(firebaseCrud.getMember).not.toHaveBeenCalled();
    });

    test('fetched member is added to cache and not fetched again', async () => {
      const newMember = { id: 'B999', name: 'New Member', car: 'BMW', isActive: true, validPayment: true, notes: '' };
      firebaseCrud.getAllMembers.mockResolvedValue(mockMembers);
      firebaseCrud.getMember.mockResolvedValue(newMember);

      const wrapper = ({ children }) => (
        <MembersProvider user={mockUser}>{children}</MembersProvider>
      );

      const { result } = renderHook(() => useMembers(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // First fetch - should call DB
      await act(async () => {
        await result.current.getMember('B999');
      });
      expect(firebaseCrud.getMember).toHaveBeenCalledTimes(1);

      // Second fetch - should use cache
      await act(async () => {
        await result.current.getMember('B999');
      });
      expect(firebaseCrud.getMember).toHaveBeenCalledTimes(1); // Still 1, not called again
    });
  });

  describe('Rendering with Provider', () => {
    test('renders children with context value', async () => {
      firebaseCrud.getAllMembers.mockResolvedValue(mockMembers);

      const TestComponent = () => {
        const { members, isLoading } = useMembers();

        if (isLoading) return <div>Loading...</div>;

        return (
          <div>
            <h1>Members: {members.length}</h1>
            {members.map(m => <div key={m.id}>{m.name}</div>)}
          </div>
        );
      };

      render(
        <MembersProvider user={mockUser}>
          <TestComponent />
        </MembersProvider>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('Members: 3')).toBeInTheDocument();
      });

      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Jones')).toBeInTheDocument();
      expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
    });
  });
});
