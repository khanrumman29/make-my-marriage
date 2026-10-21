import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getUserWeddings, getStoredWedding } from '../services/weddings';
import { mockWedding } from '../mock/sampleWeddingData';
import { isSupabaseConfigured } from '../lib/supabase';

const WeddingContext = createContext(null);

export function WeddingProvider({ children }) {
  const { user } = useAuth();
  const [currentWedding, setCurrentWedding] = useState(() => {
    return getStoredWedding() || mockWedding;
  });
  const [userRole, setUserRole] = useState('admin'); // 'admin' | 'family_member' | 'viewer'
  const [weddingsList, setWeddingsList] = useState([]);
  const [isLoadingWedding, setIsLoadingWedding] = useState(false);

  const updateWeddingState = useCallback((updates) => {
    if (!updates) return;
    setCurrentWedding((prev) => {
      const coupleNames = updates.coupleNames || (
        (updates.brideName || updates.groomName)
          ? `${(updates.brideName || prev?.brideName || 'Bride').trim()} & ${(updates.groomName || prev?.groomName || 'Groom').trim()}`
          : prev?.coupleNames
      ) || '';

      const bride = updates.brideName || (coupleNames.includes('&') ? coupleNames.split('&')[0]?.trim() : prev?.brideName);
      const groom = updates.groomName || (coupleNames.includes('&') ? coupleNames.split('&')[1]?.trim() : prev?.groomName);
      const budgetVal = updates.budget !== undefined 
        ? Number(updates.budget) 
        : (updates.totalBudgetPaise !== undefined ? Math.round(Number(updates.totalBudgetPaise) / 100) : prev?.budget);

      const next = {
        ...prev,
        ...updates,
        weddingName: updates.weddingName || updates.name || prev?.weddingName,
        coupleNames: coupleNames || `${bride} & ${groom}`,
        brideName: bride,
        groomName: groom,
        weddingDate: updates.weddingDate ? updates.weddingDate.split('T')[0] : prev?.weddingDate,
        venue: updates.venue ?? prev?.venue,
        city: updates.city ?? prev?.city,
        budget: budgetVal,
        totalBudgetPaise: updates.totalBudgetPaise ?? (budgetVal ? budgetVal * 100 : prev?.totalBudgetPaise),
      };
      return next;
    });

    setWeddingsList((prevList) => {
      if (!prevList || prevList.length === 0) {
        return [{ wedding: updates, role: 'admin' }];
      }
      return prevList.map((m) =>
        m.wedding?.id === currentWedding?.id
          ? { ...m, wedding: { ...m.wedding, ...updates } }
          : m
      );
    });
  }, [currentWedding?.id]);

  const loadWeddings = useCallback(async () => {
    if (!user) {
      const active = getStoredWedding() || mockWedding;
      setCurrentWedding(active);
      setWeddingsList([{ wedding: active, role: 'admin' }]);
      setIsLoadingWedding(false);
      return;
    }

    try {
      setIsLoadingWedding(true);
      const memberships = await getUserWeddings();
      setWeddingsList(memberships);

      if (memberships.length > 0) {
        const primary = (currentWedding?.id && memberships.find((m) => m.wedding?.id === currentWedding.id)) || memberships[0];
        const w = primary.wedding;
        const coupleNames = w.couple_names || w.coupleNames || '';
        const bride = w.brideName || (coupleNames.includes('&') ? coupleNames.split('&')[0]?.trim() : 'Bride');
        const groom = w.groomName || (coupleNames.includes('&') ? coupleNames.split('&')[1]?.trim() : 'Groom');
        const budgetVal = w.total_budget_paise !== undefined
          ? Math.round(Number(w.total_budget_paise) / 100)
          : (w.budget !== undefined ? Number(w.budget) : 2500000);

        setCurrentWedding({
          id: w.id,
          weddingName: w.name || w.weddingName || "Ayesha & Rumman's Wedding",
          brideName: bride,
          groomName: groom,
          coupleNames: coupleNames || `${bride} & ${groom}`,
          weddingDate: (w.wedding_date || w.weddingDate || '2026-12-18').split('T')[0],
          budget: budgetVal,
          totalBudgetPaise: w.total_budget_paise || (budgetVal * 100),
          currency: w.currency_code || w.currency || 'INR',
          venue: w.venue || '',
          city: w.city || '',
        });
        setUserRole(primary.role || 'admin');
      } else {
        const fallback = getStoredWedding() || mockWedding;
        setCurrentWedding(fallback);
        setUserRole('admin');
      }
    } catch (err) {
      console.error('Failed to load user weddings:', err);
      const fallback = getStoredWedding() || mockWedding;
      setCurrentWedding(fallback);
      setUserRole('admin');
    } finally {
      setIsLoadingWedding(false);
    }
  }, [user, currentWedding?.id]);

  useEffect(() => {
    loadWeddings();
  }, [loadWeddings]);

  const switchWedding = (weddingId) => {
    const found = weddingsList.find((m) => m.wedding?.id === weddingId);
    if (found) {
      const w = found.wedding;
      const coupleNames = w.couple_names || w.coupleNames || '';
      const bride = w.brideName || (coupleNames.includes('&') ? coupleNames.split('&')[0]?.trim() : 'Bride');
      const groom = w.groomName || (coupleNames.includes('&') ? coupleNames.split('&')[1]?.trim() : 'Groom');
      const budgetVal = w.total_budget_paise !== undefined
        ? Math.round(Number(w.total_budget_paise) / 100)
        : (w.budget !== undefined ? Number(w.budget) : 2500000);

      setCurrentWedding({
        id: w.id,
        weddingName: w.name || w.weddingName || "Ayesha & Rumman's Wedding",
        brideName: bride,
        groomName: groom,
        coupleNames: coupleNames || `${bride} & ${groom}`,
        weddingDate: (w.wedding_date || w.weddingDate || '2026-12-18').split('T')[0],
        budget: budgetVal,
        totalBudgetPaise: w.total_budget_paise || (budgetVal * 100),
        currency: w.currency_code || w.currency || 'INR',
        venue: w.venue || '',
        city: w.city || '',
      });
      setUserRole(found.role || 'admin');
    }
  };

  const value = {
    currentWedding,
    setCurrentWedding,
    updateWeddingState,
    userRole,
    setUserRole,
    weddingsList,
    isLoadingWedding,
    refreshWeddings: loadWeddings,
    switchWedding,
  };

  return <WeddingContext.Provider value={value}>{children}</WeddingContext.Provider>;
}

export function useWedding() {
  const context = useContext(WeddingContext);
  if (!context) {
    throw new Error('useWedding must be used within a WeddingProvider');
  }
  return context;
}
