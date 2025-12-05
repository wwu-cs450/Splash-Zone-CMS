import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getAllMembers as fetchAllMembers,
  getMember as getMemberFromDB,
  createMember as createMemberInDB,
  updateMember as updateMemberInDB,
  deleteMember as deleteMemberInDB,
} from '../api/firebase-crud';

const MembersContext = createContext();

export const useMembers = () => {
  const context = useContext(MembersContext);
  if (!context) {
    throw new Error('useMembers must be used within a MembersProvider');
  }
  return context;
};

export const MembersProvider = ({ children, user }) => {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load members once when provider mounts and user is authenticated
  useEffect(() => {
    const loadMembers = async () => {
      if (!user) {
        setMembers([]);
        setIsLoading(false);
        setIsInitialized(false);
        return;
      }

      if (isInitialized) {
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchAllMembers();
        setMembers(data);
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to load members:', err);
        setError('Failed to load members. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    loadMembers();
  }, [user, isInitialized]);

  // Get single member: check cache first, then fetch from DB if needed
  const getMember = useCallback(async (id) => {
    try {
      const cachedMember = members.find((m) => m.id === id);

      if (cachedMember) {
        return cachedMember;
      }

      const memberFromDB = await getMemberFromDB(id);

      if (memberFromDB && !members.find((m) => m.id === memberFromDB.id)) {
        setMembers((prev) => [...prev, memberFromDB]);
      }

      return memberFromDB;
    } catch (err) {
      console.error('Failed to get member:', err);
      throw err;
    }
  }, [members]);

  // Create member: update both local cache and remote DB
  const createMember = useCallback(async (id, name, car, isActive, validPayment, notes) => {
    try {
      await createMemberInDB(id, name, car, isActive, validPayment, notes);

      const newMember = {
        id,
        name,
        car,
        isActive,
        validPayment,
        notes,
      };

      setMembers((prev) => [...prev, newMember]);
      return id;
    } catch (err) {
      console.error('Failed to create member:', err);
      throw err;
    }
  }, []);

  // Update member: update both local cache and remote DB
  const updateMember = useCallback(async (id, updates) => {
    try {
      await updateMemberInDB(id, updates);

      setMembers((prev) =>
        prev.map((member) =>
          member.id === id ? { ...member, ...updates } : member
        )
      );
      return id;
    } catch (err) {
      console.error('Failed to update member:', err);
      throw err;
    }
  }, []);

  // Delete member: update both local cache and remote DB
  const deleteMember = useCallback(async (id) => {
    try {
      await deleteMemberInDB(id);

      setMembers((prev) => prev.filter((member) => member.id !== id));
      return id;
    } catch (err) {
      console.error('Failed to delete member:', err);
      throw err;
    }
  }, []);

  // Refresh members (in case manual sync is needed)
  const refreshMembers = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAllMembers();
      setMembers(data);
    } catch (err) {
      console.error('Failed to refresh members:', err);
      setError('Failed to refresh members.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const value = {
    members,
    isLoading,
    error,
    getMember,
    createMember,
    updateMember,
    deleteMember,
    refreshMembers,
  };

  return (
    <MembersContext.Provider value={value}>
      {children}
    </MembersContext.Provider>
  );
};
