-- 0002_indexes.sql
-- Performance and Search Indexes for Phone Repair Platform

-- Users & Profiles
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_user ON customer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_technician_profiles_user ON technician_profiles(user_id);

-- Devices
CREATE INDEX IF NOT EXISTS idx_devices_brand ON devices(brand);
CREATE INDEX IF NOT EXISTS idx_devices_model ON devices(model);

-- Repair Requests
CREATE INDEX IF NOT EXISTS idx_repairs_ref ON repair_requests(reference_number);
CREATE INDEX IF NOT EXISTS idx_repairs_tracking_token ON repair_requests(public_tracking_token);
CREATE INDEX IF NOT EXISTS idx_repairs_customer ON repair_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_repairs_technician ON repair_requests(assigned_technician_id);
CREATE INDEX IF NOT EXISTS idx_repairs_status ON repair_requests(current_status);
CREATE INDEX IF NOT EXISTS idx_repairs_created ON repair_requests(created_at);

-- Attachments
CREATE INDEX IF NOT EXISTS idx_attachments_repair ON repair_attachments(repair_id);
CREATE INDEX IF NOT EXISTS idx_attachments_file_key ON repair_attachments(file_key);

-- Diagnostics & Quotes
CREATE INDEX IF NOT EXISTS idx_diagnostics_repair ON diagnostics(repair_id);
CREATE INDEX IF NOT EXISTS idx_quotes_repair ON repair_quotes(repair_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON repair_quotes(status);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote ON quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_approvals_quote ON customer_approvals(quote_id);
CREATE INDEX IF NOT EXISTS idx_approvals_repair ON customer_approvals(repair_id);

-- Status history & Audit
CREATE INDEX IF NOT EXISTS idx_status_history_repair ON repair_status_history(repair_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
