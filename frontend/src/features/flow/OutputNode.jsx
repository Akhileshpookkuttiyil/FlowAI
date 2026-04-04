import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import BrainIcon from './BrainIcon';

const OutputNode = memo(({ data, selected }) => {
  const MotionDiv = motion.div;
  const isEmpty = !data.isLoading && !data.value;
  const isVertical = data.orientation === 'vertical';
  const handlePosition = isVertical ? Position.Top : Position.Left;
  const handleStyle = isVertical
    ? { top: -8, left: '50%', transform: 'translateX(-50%)' }
    : { left: -8 };

  return (
    <MotionDiv
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flow-node flow-node--output ${selected ? 'is-selected' : ''}`}
    >
      <Handle
        type="target"
        position={handlePosition}
        className="flow-node__handle flow-node__handle--output"
        style={handleStyle}
      />
      <Handle
        type="source"
        position={isVertical ? Position.Bottom : Position.Right}
        className="flow-node__handle flow-node__handle--output"
        style={isVertical ? { bottom: -8, left: '50%', transform: 'translateX(-50%)' } : { right: -8 }}
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
            <BrainIcon size={14} duration={1.05} isAnimated className="flow-node__status-icon" />
            Thinking...
          </div>
        )}
      </div>

      <div className={`nowheel nodrag flow-node__output ${isEmpty ? 'is-empty' : ''} ${data.error ? 'is-error' : ''}`}>
        {data.isLoading ? (
          <div className="flow-node__loading">
            <div className="flow-node__skeleton" style={{ width: '82%' }} />
            <div className="flow-node__skeleton" style={{ width: '64%' }} />
            <div className="flow-node__skeleton" style={{ width: '72%' }} />
          </div>
        ) : data.error ? (
          <div className="flow-node__error-msg">{data.error}</div>
        ) : (
          data.value || 'Awaiting execution...'
        )}
      </div>
    </MotionDiv>
  );
});

export default OutputNode;
