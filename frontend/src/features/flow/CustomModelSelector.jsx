import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check, Sparkles, Zap } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

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

  const selectedModelData = models.find((model) => model.id === selectedModel) || {
    name: 'Auto Select (Free Models)',
    id: '',
  };

  return (
    <div ref={dropdownRef} className="model-select">
      <MotionButton
        type="button"
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
        onClick={() => setIsOpen((current) => !current)}
        className="app-control app-button model-select__trigger"
        aria-expanded={isOpen}
      >
        <div className="model-select__label">
          {selectedModel ? <Sparkles size={16} /> : <Zap size={16} />}
          <span className="model-select__label-text">{selectedModelData.name || selectedModelData.id}</span>
        </div>

        <MotionDiv animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronDown size={16} />
        </MotionDiv>
      </MotionButton>

      <AnimatePresence>
        {isOpen && (
          <MotionDiv
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="model-select__menu app-surface-panel"
          >
            <div className="model-select__list nowheel">
              <button
                type="button"
                onClick={() => {
                  setSelectedModel('');
                  setIsOpen(false);
                }}
                className={`model-select__option ${!selectedModel ? 'is-selected' : ''}`}
              >
                <span>Auto Select (Free Models)</span>
                {!selectedModel && <Check size={14} />}
              </button>

              {models.map((model) => {
                const isSelected = selectedModel === model.id;
                const isFailed = failedModels.has(model.id);

                return (
                  <button
                    type="button"
                    key={model.id}
                    disabled={isFailed}
                    onClick={() => {
                      if (!isFailed) {
                        setSelectedModel(model.id);
                        setIsOpen(false);
                      }
                    }}
                    className={`model-select__option ${isSelected ? 'is-selected' : ''}`}
                  >
                    <span>{model.name || model.id}</span>
                    <span className="model-select__option-trailing">
                      {isFailed && <span className="model-select__option-note">Unavailable</span>}
                      {isSelected && <Check size={14} />}
                    </span>
                  </button>
                );
              })}
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
}
