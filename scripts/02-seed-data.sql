-- Clear existing data first (optional - remove if you want to keep existing data)
-- DELETE FROM messages;
-- DELETE FROM call_logs;
-- DELETE FROM campaigns;
-- DELETE FROM contacts;

-- Insert sample contacts
INSERT INTO contacts (name, phone, email, location, status, tags, last_contacted, notes) VALUES
('John Smith', '+1-555-123-4567', 'john.smith@email.com', 'New York, NY', 'Lead', ARRAY['High Priority', 'Warm Lead'], NOW() - INTERVAL '2 days', 'Interested in premium package'),
('Sarah Johnson', '+1-555-987-6543', 'sarah.j@email.com', 'Los Angeles, CA', 'Customer', ARRAY['VIP', 'Repeat Customer'], NOW() - INTERVAL '1 week', 'Long-term customer, very satisfied'),
('Mike Davis', '+1-555-456-7890', 'mike.davis@email.com', 'Chicago, IL', 'Prospect', ARRAY['Cold Lead'], NOW() - INTERVAL '3 days', 'Needs follow-up call'),
('Emily Wilson', '+1-555-321-9876', 'emily.w@email.com', 'Houston, TX', 'Lead', ARRAY['Qualified Lead'], NOW() - INTERVAL '5 days', 'Requested product demo'),
('David Brown', '+1-555-654-3210', 'david.brown@email.com', 'Phoenix, AZ', 'Customer', ARRAY['Active'], NOW() - INTERVAL '1 day', 'Recent purchase, very happy'),
('Lisa Garcia', '+1-555-789-0123', 'lisa.garcia@email.com', 'Philadelphia, PA', 'Prospect', ARRAY['Referral'], NOW() - INTERVAL '4 days', 'Referred by existing customer'),
('Robert Taylor', '+1-555-234-5678', 'robert.t@email.com', 'San Antonio, TX', 'Lead', ARRAY['Hot Lead'], NOW() - INTERVAL '6 hours', 'Ready to make decision'),
('Jennifer Martinez', '+1-555-876-5432', 'jennifer.m@email.com', 'San Diego, CA', 'Customer', ARRAY['Premium'], NOW() - INTERVAL '2 weeks', 'Premium plan subscriber');

-- Insert sample campaigns
INSERT INTO campaigns (name, description, status, message_template, send_time, total_contacts, messages_sent, responses_received, next_send_date) VALUES
('Holiday Promotion', 'Special holiday offers for all customers', 'Active', 'Hi {{name}}, we have a special holiday offer just for you! Get 25% off all services this month. Reply YES to learn more!', '09:00:00', 1250, 3200, 245, NOW() + INTERVAL '1 day'),
('Product Launch Sequence', 'Introducing our new product line', 'Paused', 'Hello {{name}}, exciting news! We just launched our new product line. Would you like to be among the first to try it?', '14:00:00', 890, 1800, 156, NULL),
('Follow-up Campaign', 'Follow up with recent inquiries', 'Active', 'Hi {{name}}, thanks for your interest in our services. Our team is ready to answer any questions you might have!', '10:30:00', 650, 2100, 189, NOW() + INTERVAL '6 hours'),
('Welcome Series', 'Welcome new contacts to our system', 'Draft', 'Welcome {{name}}! Thanks for joining us. Here''s everything you need to know to get started with our services.', '11:00:00', 0, 0, 0, NULL);

-- Insert sample messages using specific contact IDs
DO $$
DECLARE
    john_id UUID;
    sarah_id UUID;
    mike_id UUID;
    holiday_campaign_id UUID;
    followup_campaign_id UUID;
    product_campaign_id UUID;
BEGIN
    -- Get contact IDs
    SELECT id INTO john_id FROM contacts WHERE phone = '+1-555-123-4567' LIMIT 1;
    SELECT id INTO sarah_id FROM contacts WHERE phone = '+1-555-987-6543' LIMIT 1;
    SELECT id INTO mike_id FROM contacts WHERE phone = '+1-555-456-7890' LIMIT 1;
    
    -- Get campaign IDs
    SELECT id INTO holiday_campaign_id FROM campaigns WHERE name = 'Holiday Promotion' LIMIT 1;
    SELECT id INTO followup_campaign_id FROM campaigns WHERE name = 'Follow-up Campaign' LIMIT 1;
    SELECT id INTO product_campaign_id FROM campaigns WHERE name = 'Product Launch Sequence' LIMIT 1;
    
    -- Insert messages only if we found the contacts and campaigns
    IF john_id IS NOT NULL AND holiday_campaign_id IS NOT NULL THEN
        INSERT INTO messages (contact_id, campaign_id, content, status, sent_at, delivered_at, response_received, response_content, response_at) 
        VALUES (john_id, holiday_campaign_id, 'Hi John, we have a special holiday offer just for you! Get 25% off all services this month. Reply YES to learn more!', 'Delivered', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours', TRUE, 'YES, tell me more!', NOW() - INTERVAL '1 hour');
    END IF;
    
    IF sarah_id IS NOT NULL AND followup_campaign_id IS NOT NULL THEN
        INSERT INTO messages (contact_id, campaign_id, content, status, sent_at, delivered_at, response_received, response_content, response_at) 
        VALUES (sarah_id, followup_campaign_id, 'Hi Sarah, thanks for your interest in our services. Our team is ready to answer any questions you might have!', 'Delivered', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', FALSE, NULL, NULL);
    END IF;
    
    IF mike_id IS NOT NULL AND product_campaign_id IS NOT NULL THEN
        INSERT INTO messages (contact_id, campaign_id, content, status, sent_at, delivered_at, response_received, response_content, response_at) 
        VALUES (mike_id, product_campaign_id, 'Hello Mike, exciting news! We just launched our new product line. Would you like to be among the first to try it?', 'Delivered', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', TRUE, 'Sounds interesting!', NOW() - INTERVAL '2 days');
    END IF;
END $$;

-- Insert sample call logs using specific contact IDs
DO $$
DECLARE
    john_id UUID;
    sarah_id UUID;
    mike_id UUID;
    emily_id UUID;
    robert_id UUID;
BEGIN
    -- Get contact IDs
    SELECT id INTO john_id FROM contacts WHERE phone = '+1-555-123-4567' LIMIT 1;
    SELECT id INTO sarah_id FROM contacts WHERE phone = '+1-555-987-6543' LIMIT 1;
    SELECT id INTO mike_id FROM contacts WHERE phone = '+1-555-456-7890' LIMIT 1;
    SELECT id INTO emily_id FROM contacts WHERE phone = '+1-555-321-9876' LIMIT 1;
    SELECT id INTO robert_id FROM contacts WHERE phone = '+1-555-234-5678' LIMIT 1;
    
    -- Insert call logs
    IF john_id IS NOT NULL THEN
        INSERT INTO call_logs (contact_id, duration, status, notes) 
        VALUES (john_id, 225, 'Completed', 'Great conversation, very interested in our premium package');
    END IF;
    
    IF sarah_id IS NOT NULL THEN
        INSERT INTO call_logs (contact_id, duration, status, notes) 
        VALUES (sarah_id, 80, 'No Answer', 'Left voicemail, will try again later');
    END IF;
    
    IF mike_id IS NOT NULL THEN
        INSERT INTO call_logs (contact_id, duration, status, notes) 
        VALUES (mike_id, 312, 'Completed', 'Discussed product features, sending follow-up email');
    END IF;
    
    IF emily_id IS NOT NULL THEN
        INSERT INTO call_logs (contact_id, duration, status, notes) 
        VALUES (emily_id, 0, 'No Answer', 'Phone went straight to voicemail');
    END IF;
    
    IF robert_id IS NOT NULL THEN
        INSERT INTO call_logs (contact_id, duration, status, notes) 
        VALUES (robert_id, 156, 'Completed', 'Scheduled demo for next week');
    END IF;
END $$;
