import { Handle, Position } from '@xyflow/react';
import { Sparkles, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OutputNode({ data, selected }) {
  const MotionDiv = motion.div;

  return (
    <MotionDiv
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
      style={{
        background: '#fff',
        border: selected ? '2px solid #10b981' : '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '16px',
        width: '340px',
        boxShadow: selected ? '0 0 0 4px rgba(16, 185, 129, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        fontFamily: 'Inter, system-ui, sans-serif',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          left: -8,
          width: '12px',
          height: '12px',
          borderRadius: '4px',
          border: '3px solid #fff',
          background: '#10b981',
          boxShadow: '0 0 0 1px #10b981'
        }}
      />

      <div style={{ marginBottom: '16px', fontSize: '13px', fontWeight: '600', color: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: '#ecfdf5', padding: '6px', borderRadius: '6px' }}>
            <Sparkles size={16} strokeWidth={2.5} style={{ color: '#10b981' }} />
          </div>
          AI Response
        </div>
        {data.isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#3b82f6', fontSize: '11px', fontWeight: '500' }}>
             <Clock size={12} style={{ animation: 'spin 2s linear infinite' }} />
             Thinking...
          </div>
        )}
      </div>

      <div
        className="nowheel nodrag"
        style={{
          background: '#f9fafb',
          fontSize: '14px',
          minHeight: '100px',
          maxHeight: '350px',
          overflowY: 'auto',
          padding: '16px',
          borderRadius: '10px',
          border: '1px solid #e5e7eb',
          whiteSpace: 'pre-wrap',
          color: data.value ? '#374151' : '#9ca3af',
          lineHeight: '1.6',
          position: 'relative',
          transition: 'all 0.3s ease'
        }}
      >
        {data.isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '120px', gap: '12px' }}>
            <div className="skeleton-line" style={{ width: '80%', height: '8px', background: '#eceff1', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
            <div className="skeleton-line" style={{ width: '60%', height: '8px', background: '#eceff1', borderRadius: '4px', animation: 'pulse 1.5s infinite 0.2s' }} />
            <div className="skeleton-line" style={{ width: '70%', height: '8px', background: '#eceff1', borderRadius: '4px', animation: 'pulse 1.5s infinite 0.4s' }} />
          </div>
        ) : (
          data.value || "Awaiting execution..."
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
        .nowheel::-webkit-scrollbar {
          width: 5px;
        }
        .nowheel::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .nowheel::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </MotionDiv>
  );
}
