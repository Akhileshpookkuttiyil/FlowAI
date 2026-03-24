import { Handle, Position } from '@xyflow/react';
import { Type } from 'lucide-react';

export default function InputNode({ data }) {
  const onChange = (e) => {
    if (data.onChange) {
      data.onChange(e.target.value);
    }
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', width: '340px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ marginBottom: '12px', fontSize: '13px', fontWeight: '500', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Type size={16} strokeWidth={2.5} style={{ color: '#3b82f6' }} />
        Input Prompt
      </div>
      <textarea 
        className="nodrag"
        placeholder="Type your prompt here..." 
        value={data.value} 
        onChange={onChange}
        style={{ width: '100%', height: '80px', padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px', resize: 'none', outline: 'none', color: '#1f2937', transition: 'border-color 0.15s ease-in-out' }}
      />
      <Handle type="source" position={Position.Right} style={{ right: -4, width: '8px', height: '8px', borderRadius: '50%', border: '2px solid #fff', background: '#9ca3af' }} />
    </div>
  );
}
