import React, { useState, useEffect, useCallback } from 'react';
import { Clock, ChevronRight, MessageSquare, Loader2, CalendarDays, ArrowUpRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import * as aiService from '../../services/ai.service';

export default function HistorySidebar({ isOpen, onClose, onLoadRecord }) {
  const MotionDiv = motion.div;
  const { isSignedIn } = useUser();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!isSignedIn) return;
    setIsLoading(true);
    try {
      const data = await aiService.getHistory();
      setHistory(data || []);
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (isOpen) fetchHistory();
  }, [fetchHistory, isOpen]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="history-overlay"
          />
          <MotionDiv
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="history-sidebar"
          >
            <div className="history-sidebar__header">
              <div className="history-sidebar__title">
                <Clock size={18} />
                Recent History
              </div>
              <button onClick={onClose} className="history-sidebar__close">
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="history-sidebar__content">
              {isLoading && (
                <div className="history-sidebar__loading">
                  <Loader2 size={16} className="spin" />
                  Loading history...
                </div>
              )}

              {!isLoading && history.length === 0 && (
                <div className="history-sidebar__empty">
                  <MessageSquare size={32} opacity={0.2} />
                  <p>No saved interactions found.</p>
                </div>
              )}

              {history.map((item) => (
                <button
                  key={item._id}
                  onClick={() => {
                    onLoadRecord(item);
                    onClose();
                  }}
                  className="history-item"
                >
                  <div className="history-item__header">
                    <span className="history-item__date">
                      <CalendarDays size={12} />
                      {formatDate(item.createdAt)}
                    </span>
                    <ArrowUpRight size={14} className="history-item__arrow" />
                  </div>
                  <div className="history-item__prompt">{item.prompt}</div>
                  <div className="history-item__response-preview">
                    {item.response.substring(0, 60)}...
                  </div>
                </button>
              ))}
            </div>
          </MotionDiv>
        </>
      )}
    </AnimatePresence>
  );
}
