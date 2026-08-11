/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { fetchMyLikes, toggleLike, type LikeAction } from '../api/likes';
import { useToast } from './ToastContext';
import { useLanguage } from './LanguageContext';
import { trackEvent } from '../utils/analytics';

interface LikeContextProps {
  likedIds: Set<string>;
  isLiked: (projectId: string) => boolean;
  toggle: (projectId: string, source: string) => void;
  initialized: boolean;
}

const LikeContext = createContext<LikeContextProps | undefined>(undefined);

export function LikeProvider({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);
  const inFlight = useRef<Set<string>>(new Set());

  // Initialize heart state from the server once on mount.
  useEffect(() => {
    let cancelled = false;
    fetchMyLikes()
      .then((ids) => {
        if (!cancelled) setLikedIds(new Set(ids));
      })
      .catch(() => {
        // Non-fatal: user just won't see their previous likes highlighted.
      })
      .finally(() => {
        if (!cancelled) setInitialized(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const isLiked = useCallback((projectId: string) => likedIds.has(projectId), [likedIds]);

  const toggle = useCallback(
    (projectId: string, source: string) => {
      if (inFlight.current.has(projectId)) return;
      const currentlyLiked = likedIds.has(projectId);
      const action: LikeAction = currentlyLiked ? 'unlike' : 'like';

      // Optimistic update
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (action === 'like') next.add(projectId);
        else next.delete(projectId);
        return next;
      });

      inFlight.current.add(projectId);
      toggleLike({ projectId, source, action })
        .then((res) => {
          // Reconcile with server truth (covers cooldown / conflict edge cases)
          setLikedIds((prev) => {
            const next = new Set(prev);
            if (res.liked) next.add(projectId);
            else next.delete(projectId);
            return next;
          });
          trackEvent('project_like_toggle', { project_id: projectId, source, action });
        })
        .catch(() => {
          // Rollback
          setLikedIds((prev) => {
            const next = new Set(prev);
            if (currentlyLiked) next.add(projectId);
            else next.delete(projectId);
            return next;
          });
          showToast(t('like.toggleError'), 'error');
        })
        .finally(() => {
          inFlight.current.delete(projectId);
        });
    },
    [likedIds, showToast, t],
  );

  return (
    <LikeContext.Provider value={{ likedIds, isLiked, toggle, initialized }}>
      {children}
    </LikeContext.Provider>
  );
}

export function useLike(): LikeContextProps {
  const ctx = useContext(LikeContext);
  if (!ctx) throw new Error('useLike must be used within a LikeProvider');
  return ctx;
}
