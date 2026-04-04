import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Mail, Send, Loader2, CheckCircle2, AlertCircle, User, MessageSquareText, Heading, Text } from 'lucide-react';
import { motion } from 'framer-motion';

const GmailNode = memo(({ data, selected }) => {
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

  const isComplete = data.isConnected && data.to && data.value && data.subject;

  return (
    <MotionDiv
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flow-node flow-node--gmail ${selected ? 'is-selected' : ''} ${!data.isConnected ? 'is-disconnected' : ''}`}
    >
      <Handle
        type="target"
        position={handlePosition}
        className="flow-node__handle flow-node__handle--gmail"
        style={handleStyle}
      />

      <div className="flow-node__header">
        <div className="flow-node__title">
          <span className="flow-node__badge flow-node__badge--gmail">
            <Mail size={16} strokeWidth={2.25} />
          </span>
          <div className="flow-node__header-text">
             <span className="flow-node__main-title">Gmail Action</span>
             <span className="flow-node__sub-title">Email Integration</span>
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
        <div className="flow-node__field-group">
          <div className="flow-node__field-header">
            <User size={12} className="flow-node__field-icon" />
            <label className="flow-node__label">Recipient</label>
          </div>
          <input
            type="email"
            className="nodrag nowheel flow-node__input-premium"
            placeholder="recipient@example.com"
            value={data.to || ''}
            onChange={(e) => data.onEmailDataChange?.('to', e.target.value)}
            disabled={data.isSending || !data.isConnected}
          />
        </div>

        <div className="flow-node__field-group">
          <div className="flow-node__field-header">
            <Text cursor="pointer" size={13} strokeWidth={2.5} className="flow-node__field-icon" />
            <label className="flow-node__label">Subject</label>
          </div>
          <input
            type="text"
            className="nodrag nowheel flow-node__input-premium"
            placeholder="Subject Line"
            value={data.subject || ''}
            onChange={(e) => data.onEmailDataChange?.('subject', e.target.value)}
            disabled={data.isSending || !data.isConnected}
          />
        </div>

        <div className="flow-node__field-group">
          <div className="flow-node__field-header">
            <MessageSquareText size={12} className="flow-node__field-icon" />
            <label className="flow-node__label">Message</label>
          </div>
          <textarea
            className="nodrag nowheel flow-node__textarea-premium"
            placeholder={data.isConnected ? "Awaiting AI Response Content..." : "Connect Source Node to Compose"}
            value={data.value || ''}
            onChange={(e) => data.onEmailDataChange?.('value', e.target.value)}
            disabled={data.isSending || !data.isConnected}
          />
        </div>

        <div className="flow-node__actions">
          <button 
            className={`flow-node__action-btn flow-node__action-btn--gmail ${data.isSending ? 'is-loading' : ''}`}
            onClick={handleSend}
            disabled={data.isSending || !data.isConnected || !data.isSignedIn}
          >
            {data.isSending ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
            <span>{data.isSending ? 'Sending...' : 'Dispatch Email'}</span>
          </button>
        </div>
        
        {!data.isSignedIn ? (
          <p className="flow-node__footer-hint text-danger">● Authentication required</p>
        ) : !data.isConnected && (
            <p className="flow-node__footer-hint text-muted">● Waiting for AI connection</p>
        )}
      </div>
    </MotionDiv>
  );
});

export default GmailNode;
