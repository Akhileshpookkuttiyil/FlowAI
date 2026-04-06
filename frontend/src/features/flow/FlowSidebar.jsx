import React from 'react';
import { Mail } from 'lucide-react';

export default function FlowSidebar({ isSignedIn, onAddEmailNode }) {
  if (!isSignedIn) return null;

  return (
    <aside className="app-sidebar">
      <div className="sidebar-section">
        <button
          className="sidebar-button"
          onClick={onAddEmailNode}
          title="Add Email Action"
          style={{ '--btn-color': '#3b82f6' }}
        >
          <Mail size={22} strokeWidth={2.5} />
        </button>
      </div>
    </aside>
  );
}
