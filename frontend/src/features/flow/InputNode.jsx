import { Handle, Position } from '@xyflow/react';
import { Type } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InputNode({ data, selected }) {
  const MotionDiv = motion.div;

  const onChange = (e) => {
    if (data.onChange) {
      data.onChange(e.target.value);
    }
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
      style={{
        background: '#fff',
        border: selected ? '2px solid #3b82f6' : '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: selected ? '0 0 0 4px rgba(59, 130, 246, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        width: '340px',
        fontFamily: 'Inter, system-ui, sans-serif',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
      }}
    >
      <div style={{ marginBottom: '16px', fontSize: '13px', fontWeight: '600', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ background: '#eff6ff', padding: '6px', borderRadius: '6px' }}>
          <Type size={16} strokeWidth={2.5} style={{ color: '#3b82f6' }} />
        </div>
        Input Prompt
      </div>

      <div style={{ position: 'relative' }}>
        <textarea
          className="nodrag nowheel"
          placeholder="Type your prompt here..."
          value={data.value}
          onChange={onChange}
          style={{
            width: '100%',
            height: '100px',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '14px',
            resize: 'none',
            outline: 'none',
            color: '#374151',
            lineHeight: '1.5',
            background: '#f9fafb',
            transition: 'all 0.2s ease'
          }}
          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
        />
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{
          right: -8,
          width: '12px',
          height: '12px',
          borderRadius: '4px',
          border: '3px solid #fff',
          background: '#3b82f6',
          boxShadow: '0 0 0 1px #3b82f6'
        }}
      />
    </MotionDiv>
  );
}
