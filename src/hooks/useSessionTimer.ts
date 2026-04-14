"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface TimerState {
  sessionStarted: boolean;
  sessionEnded: boolean;
  timeRemaining: number;
  isLoading: boolean;
  canStart: boolean;
}

export function useSessionTimer(sessionId: string, isMentor: boolean, isMentee: boolean) {
  const [state, setState] = useState<TimerState>({
    sessionStarted: false,
    sessionEnded: false,
    timeRemaining: 900, // 15 minutes default
    isLoading: true,
    canStart: false,
  });
  const [showFeedback, setShowFeedback] = useState(false);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Fetch timer status
  const fetchTimerStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/timer`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const {
            timeRemainingSeconds,
            isRunning,
            isEnded,
            sessionStartedAt,
            canStart,
          } = data.data;

          setState((prev) => ({
            ...prev,
            sessionStarted: !!sessionStartedAt && !isEnded,
            sessionEnded: isEnded,
            timeRemaining: timeRemainingSeconds,
            isLoading: false,
            canStart: canStart,
          }));

          if (isEnded && !showFeedback && isMentee) {
            setShowFeedback(true);
          }
        }
      }
    } catch (e) {
      console.warn("Could not fetch timer status", e);
    }
  }, [sessionId, isMentee, showFeedback]);

  // Start session
  const startSession = useCallback(async () => {
    if (!isMentor) return { success: false, error: "Only mentor can start" };

    try {
      const res = await fetch(`/api/sessions/${sessionId}/timer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setState((prev) => ({
            ...prev,
            sessionStarted: true,
            timeRemaining: data.data.sessionDurationMinutes * 60,
          }));
          return { success: true };
        }
      }
      return { success: false, error: "Failed to start session" };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  }, [sessionId, isMentor]);

  // End session
  const endSession = useCallback(
    async (reason?: string) => {
      try {
        const res = await fetch(`/api/sessions/${sessionId}/timer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "end",
            reason: reason || "Session ended by user",
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setState((prev) => ({
              ...prev,
              sessionEnded: true,
              sessionStarted: false,
            }));
            if (data.data.showFeedback) {
              setShowFeedback(true);
            }
            return { success: true, showFeedback: data.data.showFeedback };
          }
        }
        return { success: false, error: "Failed to end session" };
      } catch (e) {
        return { success: false, error: String(e) };
      }
    },
    [sessionId]
  );

  // Polling effect
  useEffect(() => {
    if (!sessionId) return;

    fetchTimerStatus();
    const timerInterval = setInterval(fetchTimerStatus, 5000);

    return () => clearInterval(timerInterval);
  }, [sessionId, fetchTimerStatus]);

  // Countdown effect
  useEffect(() => {
    if (!state.sessionStarted || state.sessionEnded || state.timeRemaining <= 0)
      return;

    const countdown = setInterval(() => {
      setState((prev) => {
        if (prev.timeRemaining <= 1) {
          clearInterval(countdown);
          // Auto-end handled by server polling
          return { ...prev, timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [state.sessionStarted, state.sessionEnded, state.timeRemaining]);

  return {
    ...state,
    showFeedback,
    setShowFeedback,
    formatTime,
    startSession,
    endSession,
  };
}
