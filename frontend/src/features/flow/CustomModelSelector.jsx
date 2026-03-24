import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Zap, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomModelSelector({ models, selectedModel, setSelectedModel, failedModels }) {
  const MotionButton = motion.button;
  const MotionDiv = motion.div;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedModelData = models.find(m => m.id === selectedModel) || { name: 'Auto Select (Free Models)', id: '' };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', minWidth: '240px', width: '100%' }}>
      <MotionButton
        whileHover={{ borderColor: '#3b82f6', background: '#f9fafb' }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '8px 12px',
          fontSize: '13px',
          borderRadius: '8px',
          border: '1px solid #d1d5db',
          background: '#fff',
          color: '#374151',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          outline: 'none',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          transition: 'all 0.15s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {selectedModel ? <Sparkles size={14} style={{ color: '#3b82f6' }} /> : <Zap size={14} style={{ color: '#9ca3af' }} />}
          <span style={{ fontWeight: '500' }}>{selectedModelData.name || selectedModelData.id}</span>
        </div>
        <MotionDiv animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} style={{ color: '#6b7280' }} />
        </MotionDiv>
      </MotionButton>

      <AnimatePresence>
        {isOpen && (
          <MotionDiv
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 100,
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '4px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              overflow: 'hidden'
            }}
          >
            <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
              <div
                onClick={() => { setSelectedModel(''); setIsOpen(false); }}
                style={{
                  padding: '8px 12px',
                  fontSize: '13px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: !selectedModel ? '#eff6ff' : 'transparent',
                  color: !selectedModel ? '#1d4ed8' : '#374151',
                  marginBottom: '2px'
                }}
              >
                Auto Select (Free Models)
                {!selectedModel && <Check size={14} />}
              </div>
              
              {models.map((m) => {
                const isSelected = selectedModel === m.id;
                const isFailed = failedModels.has(m.id);
                return (
                  <div
                    key={m.id}
                    onClick={() => { if (!isFailed) { setSelectedModel(m.id); setIsOpen(false); } }}
                    className={isFailed ? 'disabled-option' : ''}
                    style={{
                      padding: '8px 12px',
                      fontSize: '13px',
                      borderRadius: '6px',
                      cursor: isFailed ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: isSelected ? '#eff6ff' : 'transparent',
                      color: isSelected ? '#1d4ed8' : (isFailed ? '#9ca3af' : '#374151'),
                      marginBottom: '2px',
                      opacity: isFailed ? 0.6 : 1
                    }}
                  >
                    {m.name || m.id}
                    {isFailed && <span style={{ fontSize: '10px', fontWeight: 'normal' }}>(unavailable)</span>}
                    {isSelected && <Check size={14} />}
                  </div>
                );
              })}
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
}
