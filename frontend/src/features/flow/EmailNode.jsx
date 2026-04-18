import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Mail, Send, Loader2, CheckCircle2, AlertCircle, User, MessageSquareText, Heading, Text } from 'lucide-react';
import { motion } from 'framer-motion';

const EmailNode = memo(({ data, selected }) => {
  const MotionDiv = motion.div;
  
  const isVertical = data.orientation === 'vertical';
  const handlePosition = isVertical ? Position.Top : Position.Left;
  const handleStyle = isVertical
    ? { top: -8, left: '50%', transform: 'translateX(-50%)' }
    : { left: -8 };

  const handleSend = (e) => {
    e.stopPropagation();
    if (data.onSend) data.onSend();
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flow-node flow-node--email ${selected ? 'is-selected' : ''} ${!data.isConnected ? 'is-disconnected' : ''}`}
    >
      <Handle
        type="target"
        position={handlePosition}
        className="flow-node__handle flow-node__handle--email"
        style={handleStyle}
      />

      <div className="flow-node__header">
        <div className="flow-node__title">
          <span className="flow-node__badge flow-node__badge--email">
            <Mail size={16} strokeWidth={2.25} />
          </span>
          <div className="flow-node__header-text">
             <span className="flow-node__main-title">Email Dispatch</span>
             <span className="flow-node__sub-title">Automation Action</span>
          </div>
        </div>
        
        <div className="flow-node__status-bubble">
          {data.isConnected ? (
             <CheckCircle2 size={16} className="text-success" />
          ) : (
             <AlertCircle size={16} className="text-muted" />
          )}
        </div>
      </div>

      <div className="flow-node__content">
        <div className="flow-node__field-group" style={{ padding: '8px 12px', background: 'var(--color-bg-subtle, #f1f5f9)', borderRadius: '8px', marginBottom: '16px', maxHeight: '120px', overflowY: 'auto' }}>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted, #64748b)', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
            {data.isConnected ? (data.value || "Awaiting Flow Content...") : "Connect Source Node to view content"}
          </p>
        </div>

        <div className="flow-node__actions">
          <button 
            className={`flow-node__action-btn flow-node__action-btn--email ${data.isSending ? 'is-loading' : ''}`}
            onClick={handleSend}
            disabled={data.isSending || !data.isConnected || !data.isSignedIn}
          >
            {data.isSending ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
            <span>{data.isSending ? 'Sending...' : 'Send to my email'}</span>
          </button>
        </div>
        
        {!data.isSignedIn ? (
          <p className="flow-node__footer-hint text-danger">● Authentication required</p>
        ) : !data.isConnected && (
            <p className="flow-node__footer-hint text-muted">● Waiting for Flow connection</p>
        )}
      </div>
    </MotionDiv>
  );
});

export default EmailNode;
