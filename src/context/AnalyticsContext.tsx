import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, increment, setDoc, collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

export interface UsageEvent {
  id: string;
  tool: string;
  timestamp: number;
  fileCount: number;
  status: 'success' | 'failed';
  duration?: number; // Processing time in milliseconds
}

interface AnalyticsContextType {
  events: UsageEvent[];
  trackEvent: (tool: string, fileCount?: number | string, status?: 'success' | 'failed' | string, duration?: number) => void;
  getTotalUsage: () => number;
  getUsageByTool: () => { name: string; value: number }[];
  getUsageByDate: () => { date: string; count: number }[];
  getAverageDurationByTool: () => { name: string; duration: number }[];
  totalTimeOnWebsite: number;
  totalVisitors: number;
  toolVisitors: Record<string, number>;
  trackPageView: (page: string) => void;
  isFirebaseConnected: boolean;
  firebaseError: string | null;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<UsageEvent[]>(() => {
    try {
      const saved = localStorage.getItem('pdf_tools_analytics');
      return saved && saved !== "null" ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [totalTimeOnWebsite, setTotalTimeOnWebsite] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('pdf_tools_total_time') || '0', 10);
    } catch (e) {
      return 0;
    }
  });

  const [totalVisitors, setTotalVisitors] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('pdf_tools_total_visitors') || '0', 10);
    } catch (e) {
      return 0;
    }
  });

  const [toolVisitors, setToolVisitors] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('pdf_tools_tool_visitors');
      return saved && saved !== "null" ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [totalOperations, setTotalOperations] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('pdf_tools_total_operations') || '0', 10);
    } catch (e) {
      return 0;
    }
  });

  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  const timeAccumulator = useRef(0);

  const handleFirebaseError = (error: any) => {
    if (error?.code === 'permission-denied') {
      setFirebaseError('permission-denied');
    } else if (error?.code === 'unavailable') {
      // In sandboxed/offline environments, Firestore operates in offline mode.
      setFirebaseError('unavailable');
    } else {
      console.warn("Firebase non-fatal notice:", error?.message || error);
    }
  };

  // Sync with Firebase if available
  useEffect(() => {
    if (!db) return;

    // Listen to global stats
    const unsubGlobal = onSnapshot(doc(db, 'analytics', 'global'), 
      (docSnap) => {
        setFirebaseError(null);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTotalTimeOnWebsite(data.totalTimeOnWebsite || 0);
          setTotalVisitors(data.totalVisitors || 0);
          setToolVisitors(data.toolVisitors || {});
          setTotalOperations(data.totalOperations || 0);
        } else {
          // Initialize if not exists
          setDoc(doc(db, 'analytics', 'global'), {
            totalTimeOnWebsite: 0,
            totalVisitors: 0,
            toolVisitors: {},
            totalOperations: 0
          }).catch(handleFirebaseError);
        }
      },
      handleFirebaseError
    );

    // Listen to recent events
    const q = query(collection(db, 'events'), orderBy('timestamp', 'desc'), limit(100));
    const unsubEvents = onSnapshot(q, 
      (snapshot) => {
        const newEvents: UsageEvent[] = [];
        snapshot.forEach((doc) => {
          newEvents.push({ id: doc.id, ...doc.data() } as UsageEvent);
        });
        setEvents(newEvents);
      },
      handleFirebaseError
    );

    return () => {
      unsubGlobal();
      unsubEvents();
    };
  }, []);

  // Sync local storage for fallback
  useEffect(() => {
    if (!db) {
      try {
        localStorage.setItem('pdf_tools_analytics', JSON.stringify(events));
      } catch (e) {}
    }
  }, [events]);

  // Time tracking
  useEffect(() => {
    const interval = setInterval(() => {
      if (!db) {
        setTotalTimeOnWebsite(prev => {
          const next = prev + 1;
          try {
            localStorage.setItem('pdf_tools_total_time', next.toString());
          } catch (e) {}
          return next;
        });
      } else {
        // Firebase mode: accumulate locally, write every 10 seconds to save writes
        timeAccumulator.current += 1;
        if (timeAccumulator.current >= 10) {
          const timeToAdd = timeAccumulator.current;
          timeAccumulator.current = 0;
          setDoc(doc(db, 'analytics', 'global'), {
            totalTimeOnWebsite: increment(timeToAdd)
          }, { merge: true }).catch(handleFirebaseError);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Visitor tracking
  useEffect(() => {
    try {
      if (!sessionStorage.getItem('pdf_tools_session')) {
        sessionStorage.setItem('pdf_tools_session', 'true');
        if (!db) {
          setTotalVisitors(prev => {
            const next = prev + 1;
            try {
              localStorage.setItem('pdf_tools_total_visitors', next.toString());
            } catch (e) {}
            return next;
          });
        } else {
          setDoc(doc(db, 'analytics', 'global'), {
            totalVisitors: increment(1)
          }, { merge: true }).catch(handleFirebaseError);
        }
      }
    } catch (e) {}
  }, []);

  const trackPageView = (page: string) => {
    try {
      const sessionKey = `pdf_tools_visited_${page}`;
      if (!sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, 'true');
        if (!db) {
          setToolVisitors(prev => {
            const next = { ...prev, [page]: (prev[page] || 0) + 1 };
            try {
              localStorage.setItem('pdf_tools_tool_visitors', JSON.stringify(next));
            } catch (e) {}
            return next;
          });
        } else {
          setDoc(doc(db, 'analytics', 'global'), {
            toolVisitors: {
              [page]: increment(1)
            }
          }, { merge: true }).catch(handleFirebaseError);
        }
      }
    } catch (e) {}
  };

  const trackEvent = (
    tool: string,
    fileCountOrToolName?: number | string,
    status?: 'success' | 'failed' | string,
    duration?: number
  ) => {
    let finalTool = tool || 'unknown_tool';
    let finalFileCount = 1;
    let finalStatus: 'success' | 'failed' = 'success';
    let finalDuration: number | undefined = undefined;

    if (typeof fileCountOrToolName === 'number') {
      finalFileCount = Math.max(1, fileCountOrToolName);
    } else if (typeof fileCountOrToolName === 'string') {
      finalTool = `${tool}_${fileCountOrToolName}`;
    }

    if (status === 'failed') {
      finalStatus = 'failed';
    } else {
      finalStatus = 'success';
    }

    if (typeof duration === 'number' && !isNaN(duration)) {
      finalDuration = duration;
    }

    const newEvent: Record<string, any> = {
      tool: finalTool,
      timestamp: Date.now(),
      fileCount: finalFileCount,
      status: finalStatus,
    };

    if (finalDuration !== undefined) {
      newEvent.duration = finalDuration;
    }
    
    if (!db) {
      const eventWithId = { ...newEvent, id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) } as UsageEvent;
      setEvents((prev) => {
        const next = [...prev, eventWithId];
        try {
          localStorage.setItem('pdf_tools_analytics', JSON.stringify(next));
        } catch (e) {}
        return next;
      });
      setTotalOperations(prev => {
        const next = prev + 1;
        try {
          localStorage.setItem('pdf_tools_total_operations', next.toString());
        } catch (e) {}
        return next;
      });
    } else {
      addDoc(collection(db, 'events'), newEvent).catch(handleFirebaseError);
      setDoc(doc(db, 'analytics', 'global'), {
        totalOperations: increment(1)
      }, { merge: true }).catch(handleFirebaseError);
    }
  };

  const getTotalUsage = () => db ? totalOperations : events.length;

  const getUsageByTool = () => {
    const counts: Record<string, number> = {};
    events.forEach((e) => {
      counts[e.tool] = (counts[e.tool] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  const getUsageByDate = () => {
    const counts: Record<string, number> = {};
    events.forEach((e) => {
      const date = new Date(e.timestamp).toLocaleDateString();
      counts[date] = (counts[date] || 0) + 1;
    });
    // Sort by date
    return Object.entries(counts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); // Last 7 days
  };

  const getAverageDurationByTool = () => {
    const tools: Record<string, { total: number; count: number }> = {};
    
    events.forEach((e) => {
      if (e.duration && e.status === 'success') {
        if (!tools[e.tool]) {
          tools[e.tool] = { total: 0, count: 0 };
        }
        tools[e.tool].total += e.duration;
        tools[e.tool].count += 1;
      }
    });

    return Object.entries(tools).map(([name, data]) => ({
      name,
      duration: Math.round(data.total / data.count)
    }));
  };

  return (
    <AnalyticsContext.Provider value={{ 
      events, 
      trackEvent, 
      getTotalUsage, 
      getUsageByTool, 
      getUsageByDate,
      getAverageDurationByTool,
      totalTimeOnWebsite,
      totalVisitors,
      toolVisitors,
      trackPageView,
      isFirebaseConnected: !!db,
      firebaseError
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}
