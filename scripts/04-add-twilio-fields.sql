-- Add Twilio-specific fields to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS twilio_message_id VARCHAR(255);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Add index for Twilio message ID lookups
CREATE INDEX IF NOT EXISTS idx_messages_twilio_id ON messages(twilio_message_id);

-- Update existing messages to have proper status
UPDATE messages SET status = 'Delivered' WHERE status = 'Pending' AND delivered_at IS NOT NULL;
