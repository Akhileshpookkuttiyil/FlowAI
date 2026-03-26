import { Handle, Position } from '@xyflow/react';
import { Type } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InputNode({ data, selected }) {
  const MotionDiv = motion.div;
  const isVertical = data.orientation === 'vertical';
  const handlePosition = isVertical ? Position.Bottom : Position.Right;
  const handleStyle = isVertical
    ? { bottom: -8, left: '50%', transform: 'translateX(-50%)' }
    : { right: -8 };

  const onChange = (event) => {
    if (data.onChange) {
      data.onChange(event.target.value);
    }
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flow-node flow-node--input ${selected ? 'is-selected' : ''}`}
    >
      <div className="flow-node__header">
        <div className="flow-node__title">
          <span className="flow-node__badge flow-node__badge--input">
            <Type size={16} strokeWidth={2.25} />
          </span>
          Input Prompt
        </div>
      </div>

      <textarea
        className="nodrag nowheel flow-node__field"
        placeholder="Type your prompt here..."
        value={data.value}
        onChange={onChange}
      />

      <Handle
        type="source"
        position={handlePosition}
        className="flow-node__handle flow-node__handle--input"
        style={handleStyle}
      />
    </MotionDiv>
  );
}
