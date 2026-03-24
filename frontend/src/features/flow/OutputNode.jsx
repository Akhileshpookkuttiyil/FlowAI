import { Handle, Position } from '@xyflow/react';
import { Clock3, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OutputNode({ data, selected }) {
  const MotionDiv = motion.div;
  const isEmpty = !data.isLoading && !data.value;

  return (
    <MotionDiv
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flow-node flow-node--output ${selected ? 'is-selected' : ''}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="flow-node__handle flow-node__handle--output"
        style={{ left: -8 }}
      />

      <div className="flow-node__header">
        <div className="flow-node__title">
          <span className="flow-node__badge flow-node__badge--output">
            <Sparkles size={16} strokeWidth={2.25} />
          </span>
          AI Response
        </div>

        {data.isLoading && (
          <div className="flow-node__status">
            <Clock3 size={12} style={{ animation: 'flowSpin 1.8s linear infinite' }} />
            Thinking...
          </div>
        )}
      </div>

      <div className={`nowheel nodrag flow-node__output ${isEmpty ? 'is-empty' : ''}`}>
        {data.isLoading ? (
          <div className="flow-node__loading">
            <div className="flow-node__skeleton" style={{ width: '82%' }} />
            <div className="flow-node__skeleton" style={{ width: '64%' }} />
            <div className="flow-node__skeleton" style={{ width: '72%' }} />
          </div>
        ) : (
          data.value || 'Awaiting execution...'
        )}
      </div>
    </MotionDiv>
  );
}
