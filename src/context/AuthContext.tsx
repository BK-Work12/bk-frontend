'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { fetchCurrentUser, getToken, isStep2Complete, isStep3Complete, type PublicUser } from '@/lib/auth';
import { UserSocketClient } from '@/lib/socket';
import PersonalInfoPopup from '@/components/ui/personalInfoPopup';
import VerificationModal from '@/components/ui/verificationModal';

type AuthContextType = {
  user: PublicUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  step2Complete: boolean;
  step3Complete: boolean;
  openFinishSetupModal: () => void;
  closeFinishSetupModal: () => void;
  openAlmostThereModal: () => void;
  closeAlmostThereModal: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [finishSetupModalOpen, setFinishSetupModalOpen] = useState(false);
  const [almostThereModalOpen, setAlmostThereModalOpen] = useState(false);

  const step2Complete = useMemo(() => isStep2Complete(user), [user]);
  const step3Complete = useMemo(() => isStep3Complete(user), [user]);
  const openFinishSetupModal = useCallback(() => setFinishSetupModalOpen(true), []);
  const closeFinishSetupModal = useCallback(() => setFinishSetupModalOpen(false), []);
  const openAlmostThereModal = useCallback(() => setAlmostThereModalOpen(true), []);
  const closeAlmostThereModal = useCallback(() => setAlmostThereModalOpen(false), []);

  const refreshUser = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      return;
    }
    try {
      const me = await fetchCurrentUser();
      setUser(me);
    } catch (err) {
      setUser(null);
      const msg = err instanceof Error ? err.message : 'Could not load your session';
      toast.error(msg);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!getToken()) {
        if (mounted) setUser(null);
        if (mounted) setLoading(false);
        return;
      }
      try {
        const me = await fetchCurrentUser();
        if (mounted) setUser(me);
      } catch (err) {
        if (mounted) setUser(null);
        const msg = err instanceof Error ? err.message : 'Could not load your session';
        toast.error(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const userSocketRef = useRef<UserSocketClient | null>(null);

  useEffect(() => {
    if (!user?.id || step3Complete) {
      userSocketRef.current?.disconnect();
      userSocketRef.current = null;
      return;
    }
    const client = new UserSocketClient();
    userSocketRef.current = client;
    client.connect();
    client.subscribeUser(user.id);
    const unsub = client.onVerificationStatus(() => {
      refreshUser();
      closeAlmostThereModal();
    });
    return () => {
      unsub();
      client.disconnect();
      userSocketRef.current = null;
    };
  }, [user?.id, step3Complete, refreshUser, closeAlmostThereModal]);

  const value = useMemo(
    () => ({
      user,
      loading,
      refreshUser,
      step2Complete,
      step3Complete,
      openFinishSetupModal,
      closeFinishSetupModal,
      openAlmostThereModal,
      closeAlmostThereModal,
    }),
    [
      user,
      loading,
      refreshUser,
      step2Complete,
      step3Complete,
      openFinishSetupModal,
      closeFinishSetupModal,
      openAlmostThereModal,
      closeAlmostThereModal,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <PersonalInfoPopup isOpen={finishSetupModalOpen} onClose={closeFinishSetupModal} />
      <VerificationModal isOpen={almostThereModalOpen} onClose={closeAlmostThereModal} />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
