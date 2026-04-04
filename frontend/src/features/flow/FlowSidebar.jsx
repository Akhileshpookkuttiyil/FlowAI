import React from 'react';
import { Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const SidebarButton = ({ icon: Icon, onClick, title, color }) => (
  <motion.button
    whileHover={{ scale: 1.1, x: 4 }}
    whileTap={{ scale: 0.9 }}
    className="sidebar-button"
    onClick={onClick}
    title={title}
    style={{ '--btn-color': color }}
  >
    <Icon size={22} strokeWidth={2.5} />
  </motion.button>
);

export default function FlowSidebar({ isSignedIn, onAddGmailNode }) {
  if (!isSignedIn) return null;

  return (
    <aside className="app-sidebar">
      <div className="sidebar-section">
        <SidebarButton 
          icon={Mail} 
          onClick={onAddGmailNode} 
          title="Add Gmail Action" 
          color="#dc2626"
        />
      </div>
    </aside>
  );
}
