import { Handle, Position } from '@xyflow/react';
import { Sparkles } from 'lucide-react';

export default function OutputNode({ data }) {
  return (
    <div style={{ background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '16px', width: '340px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Handle type="target" position={Position.Left} style={{ left: -4, width: '8px', height: '8px', borderRadius: '50%', border: '2px solid #fff', background: '#9ca3af' }} />
      <div style={{ marginBottom: '12px', fontSize: '13px', fontWeight: '500', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} strokeWidth={2.5} style={{ color: '#10b981' }} />
          AI Response
        </div>
        {data.isLoading && (
          <div className="spinner" style={{ width: '14px', height: '14px', border: '2px solid #e5e7eb', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        )}
      </div>
      <div 
        className="nowheel nodrag"
        style={{ 
          background: '#fff', 
          fontSize: '14px', 
          minHeight: '100px', 
          maxHeight: '300px',
          overflowY: 'auto',
          padding: '12px', 
          borderRadius: '4px', 
          border: '1px solid #e5e7eb', 
          whiteSpace: 'pre-wrap', 
          color: data.value ? '#1f2937' : '#9ca3af', 
          lineHeight: '1.5', 
          position: 'relative' 
        }}
      >
        {data.isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80px', color: '#6b7280', fontSize: '13px' }}>
            Processing request...
          </div>
        ) : (
          data.value || "Awaiting execution..."
        )}
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
