import React from 'react';
import { Play, Save, Clock, Loader2, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserButton, SignInButton } from '@clerk/clerk-react';
import CustomModelSelector from './CustomModelSelector';

const MotionButton = motion.button;

export default function FlowToolbar({
  models,
  isModelsLoading,
  selectedModel,
  setSelectedModel,
  failedModels,
  fetchModels,
  handleRunFlow,
  handleSave,
  setIsHistoryOpen,
  isLoading,
  canSave,
  isSignedIn,
}) {

  return (
    <header className="app-header">
      <div className="app-brand">
        <img className="app-brand__logo" src="/logo.png" alt="FlowAI logo" />
        <div>
          <h1 className="app-brand__title">FlowAI</h1>
          <p className="app-brand__subtitle">Visual AI workflow studio</p>
        </div>
      </div>

      <div className="app-toolbar">
        <CustomModelSelector
          models={models}
          isModelsLoading={isModelsLoading || isLoading}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          failedModels={failedModels}
          onRefreshModels={fetchModels}
        />

        <div className="app-toolbar-divider" />

        <div className="app-toolbar-group">
          <MotionButton
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
            onClick={handleRunFlow}
            disabled={isLoading}
            className="app-control app-button app-button--primary"
            type="button"
          >
            {isLoading ? <Loader2 size={16} className="spin" /> : <Play size={16} />}
            {isLoading ? 'Executing...' : 'Run Flow'}
          </MotionButton>

          {isSignedIn ? (
            <>
              <MotionButton
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
                onClick={handleSave}
                disabled={!canSave}
                className="app-control app-button app-button--secondary"
                type="button"
              >
                <Save size={16} />
                Save
              </MotionButton>

              <div className="app-toolbar-divider" />

              <MotionButton
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsHistoryOpen(true)}
                className="app-control app-button app-button--secondary"
                type="button"
              >
                <Clock size={16} />
                History
              </MotionButton>

              <div className="app-toolbar-divider" />

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <UserButton afterSignOutUrl="/" />
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <SignInButton mode="modal">
                <button className="app-control app-button app-button--primary">
                  <LogIn size={16} />
                  Sign In
                </button>
              </SignInButton>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
