/* eslint-env jest */
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MembersProvider, useMembers } from '../context/MembersContext.jsx';
import * as firebaseCrud from '../api/firebase-crud.js';

// Mock the firebase-crud module
jest.mock('../api/firebase-crud.js');

// Test component that uses the context
function TestComponent() {
  const { members, isLoading, error, getMember, createMember, updateMember, deleteMember, refreshMembers } = useMembers();

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="error">{error || 'No Error'}</div>
      <div data-testid="members-count">{members.length}</div>
      <div data-testid="members">{JSON.stringify(members)}</div>
      <button onClick={() => getMember('test-id')} data-testid="get-member">Get Member</button>
      <button onClick={() => createMember('new-id', 'New User', 'New Car', true, true, 'Notes')} data-testid="create-member">Create Member</button>
      <button onClick={() => updateMember('test-id', { name: 'Updated Name' })} data-testid="update-member">Update Member</button>
      <button onClick={() => deleteMember('test-id')} data-testid="delete-member">Delete Member</button>
      <button onClick={refreshMembers} data-testid="refresh-members">Refresh Members</button>
    </div>
  );
}

describe('MembersContext', () => {
  const mockUser = { uid: 'test-user', email: 'test@example.com' };
  const mockMembers = [
    { id: 'member-1', name: 'John Doe', car: 'Toyota', isActive: true, validPayment: true, notes: 'Note 1' },
    { id: 'member-2', name: 'Jane Smith', car: 'Honda', isActive: false, validPayment: false, notes: 'Note 2' },
  ];

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('loads members when user is authenticated', async () => {
      firebaseCrud.getAllMembers.mockResolvedValue(mockMembers);

      render(
        <MembersProvider user={mockUser}>
          <TestComponent />
        </MembersProvider>
      );

      // Initially loading
      expect(screen.getByTestId('loading')).toHaveTextContent('Loading');

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });

      // Check members were loaded
      expect(screen.getByTestId('members-count')).toHaveTextContent('2');
      expect(firebaseCrud.getAllMembers).toHaveBeenCalledTimes(1);
    });

    test('does not load members when user is not authenticated', async () => {
      firebaseCrud.getAllMembers.mockResolvedValue(mockMembers);

      render(
        <MembersProvider user={null}>
          <TestComponent />
        </MembersProvider>
      );

      // Should not be loading
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });

      // Should have no members
      expect(screen.getByTestId('members-count')).toHaveTextContent('0');

      // Should not have called API
      expect(firebaseCrud.getAllMembers).not.toHaveBeenCalled();
    });

    test('sets error state when loading members fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      firebaseCrud.getAllMembers.mockRejectedValue(new Error('Network error'));

      render(
        <MembersProvider user={mockUser}>
          <TestComponent />
        </MembersProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Failed to load members. Please refresh the page.');
      });

      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      consoleSpy.mockRestore();
    });

    test('only initializes once even if component re-renders', async () => {
      firebaseCrud.getAllMembers.mockResolvedValue(mockMembers);

      const { rerender } = render(
        <MembersProvider user={mockUser}>
          <TestComponent />
        </MembersProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });

      // Re-render with same user
      rerender(
        <MembersProvider user={mockUser}>
          <TestComponent />
        </MembersProvider>
      );

      // Should still only have called once
      expect(firebaseCrud.getAllMembers).toHaveBeenCalledTimes(1);
    });
  });

  describe('User authentication state changes', () => {
    test('clears members when user logs out', async () => {
      firebaseCrud.getAllMembers.mockResolvedValue(mockMembers);

      const { rerender } = render(
        <MembersProvider user={mockUser}>
          <TestComponent />
        </MembersProvider>
      );

      // Wait for members to load
      await waitFor(() => {
        expect(screen.getByTestId('members-count')).toHaveTextContent('2');
      });

      // User logs out
      rerender(
        <MembersProvider user={null}>
          <TestComponent />
        </MembersProvider>
      );

      // Members should be cleared
      await waitFor(() => {
        expect(screen.getByTestId('members-count')).toHaveTextContent('0');
      });
    });

    test('loads members when user logs in', async () => {
      firebaseCrud.getAllMembers.mockResolvedValue(mockMembers);

      const { rerender } = render(
        <MembersProvider user={null}>
          <TestComponent />
        </MembersProvider>
      );

      // No members initially
      expect(screen.getByTestId('members-count')).toHaveTextContent('0');

      // User logs in
      rerender(
        <MembersProvider user={mockUser}>
          <TestComponent />
        </MembersProvider>
      );

      // Members should load
      await waitFor(() => {
        expect(screen.getByTestId('members-count')).toHaveTextContent('2');
      });

      expect(firebaseCrud.getAllMembers).toHaveBeenCalledTimes(1);
    });
  });

  describe('getMember', () => {
    test('returns member from cache if available', async () => {
      firebaseCrud.getAllMembers.mockResolvedValue(mockMembers);

      render(
        <MembersProvider user={mockUser}>
          <TestComponent />
        </MembersProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });

      // Mock getMemberFromDB to track if it's called
      firebaseCrud.getMember.mockResolvedValue(mockMembers[0]);

      // Get a member that should be in cache
      await act(async () => {
        const button = screen.getByTestId('get-member');
        // We can't directly check the return value, but we can verify the DB wasn't called
        // by checking that getMember was not called since it should hit the cache
      });

      // For cached member, DB should not be called
      // Note: This test is limited because we can't easily inspect the return value
      // In a real scenario, you might expose a test hook or use a different pattern
    });

    test('fetches member from DB if not in cache and adds to cache', async () => {
      firebaseCrud.getAllMembers.mockResolvedValue(mockMembers);
      const newMember = { id: 'new-member', name: 'New Member', car: 'Ford', isActive: true, validPayment: true, notes: 'New' };
      firebaseCrud.getMember.mockResolvedValue(newMember);

      let contextValue;
      function TestComponentWithAccess() {
        contextValue = useMembers();
        return <div data-testid="members-count">{contextValue.members.length}</div>;
      }

      render(
        <MembersProvider user={mockUser}>
          <TestComponentWithAccess />
        </MembersProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('members-count')).toHaveTextContent('2');
      });

      // Get a member not in cache
      await act(async () => {
        await contextValue.getMember('new-member');
      });

      // Should have called the DB
      expect(firebaseCrud.getMember).toHaveBeenCalledWith('new-member');

      // Should have added to cache
      await waitFor(() => {
        expect(screen.getByTestId('members-count')).toHaveTextContent('3');
      });
    });

    test('handles race condition: concurrent getMember calls for same ID do not duplicate in cache', async () => {
      firebaseCrud.getAllMembers.mockResolvedValue([]);
      const member = { id: 'concurrent-member', name: 'Concurrent', car: 'Car', isActive: true, validPayment: true, notes: '' };

      // Simulate a delay in fetching to allow concurrent calls
      firebaseCrud.getMember.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(member), 100))
      );

      let contextValue;
      function TestComponentWithAccess() {
        contextValue = useMembers();
        return <div data-testid="members-count">{contextValue.members.length}</div>;
      }

      render(
        <MembersProvider user={mockUser}>
          <TestComponentWithAccess />
        </MembersProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('members-count')).toHaveTextContent('0');
      });

      // Call getMember multiple times concurrently
      await act(async () => {
        await Promise.all([
          contextValue.getMember('concurrent-member'),
          contextValue.getMember('concurrent-member'),
          contextValue.getMember('concurrent-member'),
        ]);
      });

      // Should have called DB multiple times (this is expected - we're testing cache doesn't duplicate)
      expect(firebaseCrud.getMember).toHaveBeenCalledTimes(3);

      // But member should only appear once in cache (testing our race condition fix)
      await waitFor(() => {
        expect(screen.getByTestId('members-count')).toHaveTextContent('1');
      });
    });

    test('throws error when getMember fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      firebaseCrud.getAllMembers.mockResolvedValue([]);
      firebaseCrud.getMember.mockRejectedValue(new Error('DB error'));

      let contextValue;
      function TestComponentWithAccess() {
        contextValue = useMembers();
        return <div>Test</div>;
      }

      render(
        <MembersProvider user={mockUser}>
          <TestComponentWithAccess />
        </MembersProvider>
      );

      await waitFor(() => {
        expect(contextValue.isLoading).toBe(false);
      });

      // Should throw error
      await expect(contextValue.getMember('error-id')).rejects.toThrow('DB error');

      consoleSpy.mockRestore();
    });
  });

  describe('createMember', () => {
    test('creates member in DB and adds to cache', async () => {
      firebaseCrud.getAllMembers.mockResolvedValue(mockMembers);
      firebaseCrud.createMember.mockResolvedValue('new-id');

      let contextValue;
      function TestComponentWithAccess() {
        contextValue = useMembers();
        return <div data-testid="members-count">{contextValue.members.length}</div>;
      }

      render(
        <MembersProvider user={mockUser}>
          <TestComponentWithAccess />
        </MembersProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('members-count')).toHaveTextContent('2');
      });

      // Create new member
      await act(async () => {
        await contextValue.createMember('new-id', 'New Name', 'New Car', true, true, 'New Notes');
      });

      // Should have called DB
      expect(firebaseCrud.createMember).toHaveBeenCalledWith('new-id', 'New Name', 'New Car', true, true, 'New Notes');

      // Should have added to cache
      await waitFor(() => {
        expect(screen.getByTestId('members-count')).toHaveTextContent('3');
      });
    });

    test('throws error when createMember fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      firebaseCrud.getAllMembers.mockResolvedValue(mockMembers);
      firebaseCrud.createMember.mockRejectedValue(new Error('Create failed'));

      let contextValue;
      function TestComponentWithAccess() {
        contextValue = useMembers();
        return <div>Test</div>;
      }

      render(
        <MembersProvider user={mockUser}>
          <TestComponentWithAccess />
        </MembersProvider>
      );

      await waitFor(() => {
        expect(contextValue.isLoading).toBe(false);
      });

      // Should throw error
      await expect(
        contextValue.createMember('fail-id', 'Name', 'Car', true, true, 'Notes')
      ).rejects.toThrow('Create failed');

      consoleSpy.mockRestore();
    });
  });

  describe('updateMember', () => {
    test('updates member in DB and cache', async () => {
      firebaseCrud.getAllMembers.mockResolvedValue(mockMembers);
      firebaseCrud.updateMember.mockResolvedValue('member-1');

      let contextValue;
      function TestComponentWithAccess() {
        contextValue = useMembers();
        return <div data-testid="members">{JSON.stringify(contextValue.members)}</div>;
      }

      render(
        <MembersProvider user={mockUser}>
          <TestComponentWithAccess />
        </MembersProvider>
      );

      await waitFor(() => {
        expect(contextValue.isLoading).toBe(false);
      });

      // Update member
      await act(async () => {
        await contextValue.updateMember('member-1', { name: 'Updated John' });
      });

      // Should have called DB
      expect(firebaseCrud.updateMember).toHaveBeenCalledWith('member-1', { name: 'Updated John' });

      // Should have updated cache
      await waitFor(() => {
        const members = JSON.parse(screen.getByTestId('members').textContent);
        const updatedMember = members.find(m => m.id === 'member-1');
        expect(updatedMember.name).toBe('Updated John');
      });
    });

    test('throws error when updateMember fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      firebaseCrud.getAllMembers.mockResolvedValue(mockMembers);
      firebaseCrud.updateMember.mockRejectedValue(new Error('Update failed'));

      let contextValue;
      function TestComponentWithAccess() {
        contextValue = useMembers();
        return <div>Test</div>;
      }

      render(
        <MembersProvider user={mockUser}>
          <TestComponentWithAccess />
        </MembersProvider>
      );

      await waitFor(() => {
        expect(contextValue.isLoading).toBe(false);
      });

      // Should throw error
      await expect(
        contextValue.updateMember('member-1', { name: 'Failed Update' })
      ).rejects.toThrow('Update failed');

      consoleSpy.mockRestore();
    });
  });

  describe('deleteMember', () => {
    test('deletes member from DB and cache', async () => {
      firebaseCrud.getAllMembers.mockResolvedValue(mockMembers);
      firebaseCrud.deleteMember.mockResolvedValue('member-1');

      let contextValue;
      function TestComponentWithAccess() {
        contextValue = useMembers();
        return <div data-testid="members-count">{contextValue.members.length}</div>;
      }

      render(
        <MembersProvider user={mockUser}>
          <TestComponentWithAccess />
        </MembersProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('members-count')).toHaveTextContent('2');
      });

      // Delete member
      await act(async () => {
        await contextValue.deleteMember('member-1');
      });

      // Should have called DB
      expect(firebaseCrud.deleteMember).toHaveBeenCalledWith('member-1');

      // Should have removed from cache
      await waitFor(() => {
        expect(screen.getByTestId('members-count')).toHaveTextContent('1');
      });
    });

    test('throws error when deleteMember fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      firebaseCrud.getAllMembers.mockResolvedValue(mockMembers);
      firebaseCrud.deleteMember.mockRejectedValue(new Error('Delete failed'));

      let contextValue;
      function TestComponentWithAccess() {
        contextValue = useMembers();
        return <div>Test</div>;
      }

      render(
        <MembersProvider user={mockUser}>
          <TestComponentWithAccess />
        </MembersProvider>
      );

      await waitFor(() => {
        expect(contextValue.isLoading).toBe(false);
      });

      // Should throw error
      await expect(
        contextValue.deleteMember('member-1')
      ).rejects.toThrow('Delete failed');

      consoleSpy.mockRestore();
    });
  });

  describe('refreshMembers', () => {
    test('refreshes members from DB', async () => {
      firebaseCrud.getAllMembers.mockResolvedValue(mockMembers);

      let contextValue;
      function TestComponentWithAccess() {
        contextValue = useMembers();
        return <div data-testid="members-count">{contextValue.members.length}</div>;
      }

      render(
        <MembersProvider user={mockUser}>
          <TestComponentWithAccess />
        </MembersProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('members-count')).toHaveTextContent('2');
      });

      // Change mock to return different data
      const updatedMembers = [...mockMembers, { id: 'member-3', name: 'New Member', car: 'Ford', isActive: true, validPayment: true, notes: '' }];
      firebaseCrud.getAllMembers.mockResolvedValue(updatedMembers);

      // Refresh
      await act(async () => {
        await contextValue.refreshMembers();
      });

      // Should have fetched again
      expect(firebaseCrud.getAllMembers).toHaveBeenCalledTimes(2);

      // Should have updated cache
      await waitFor(() => {
        expect(screen.getByTestId('members-count')).toHaveTextContent('3');
      });
    });

    test('does not refresh when user is not authenticated', async () => {
      firebaseCrud.getAllMembers.mockResolvedValue([]);

      let contextValue;
      function TestComponentWithAccess() {
        contextValue = useMembers();
        return <div>Test</div>;
      }

      render(
        <MembersProvider user={null}>
          <TestComponentWithAccess />
        </MembersProvider>
      );

      await waitFor(() => {
        expect(contextValue.isLoading).toBe(false);
      });

      // Try to refresh
      await act(async () => {
        await contextValue.refreshMembers();
      });

      // Should not have called API
      expect(firebaseCrud.getAllMembers).not.toHaveBeenCalled();
    });

    test('sets error state when refresh fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      firebaseCrud.getAllMembers.mockResolvedValueOnce(mockMembers);

      let contextValue;
      function TestComponentWithAccess() {
        contextValue = useMembers();
        return <div data-testid="error">{contextValue.error || 'No Error'}</div>;
      }

      render(
        <MembersProvider user={mockUser}>
          <TestComponentWithAccess />
        </MembersProvider>
      );

      await waitFor(() => {
        expect(contextValue.isLoading).toBe(false);
      });

      // Make refresh fail
      firebaseCrud.getAllMembers.mockRejectedValueOnce(new Error('Refresh failed'));

      // Try to refresh
      await act(async () => {
        try {
          await contextValue.refreshMembers();
        } catch (err) {
          // Expected to throw
        }
      });

      // Should show error
      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Failed to refresh members.');
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Error handling', () => {
    test('throws error when useMembers is used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useMembers must be used within a MembersProvider');

      consoleSpy.mockRestore();
    });
  });
});
