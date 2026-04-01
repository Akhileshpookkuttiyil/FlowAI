import React, { useState, useEffect } from 'react';
import { Clock, Trash2, ChevronRight, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as aiService from '../../services/ai.service';
import { toast } from 'react-hot-toast';

export default function HistorySidebar({ isOpen, onClose, onLoadRecord }) {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await aiService.getHistory();
      setHistory(data || []);
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchHistory();
  }, [isOpen]);

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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="history-overlay"
          />
          <motion.div
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
                    <span className="history-item__date">{formatDate(item.createdAt)}</span>
                  </div>
                  <div className="history-item__prompt">{item.prompt}</div>
                  <div className="history-item__response-preview">
                    {item.response.substring(0, 60)}...
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
