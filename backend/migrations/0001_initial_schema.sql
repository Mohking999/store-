-- 0001_initial_schema.sql
-- Cloudflare D1 (SQLite) Schema for Phone Repair Platform (Algeria)

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('CUSTOMER', 'TECHNICIAN', 'ADMIN')),
    full_name TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Customer profiles
CREATE TABLE IF NOT EXISTS customer_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    preferred_communication TEXT NOT NULL DEFAULT 'PHONE' CHECK (preferred_communication IN ('PHONE', 'SMS', 'WHATSAPP', 'EMAIL')),
    wilaya TEXT NOT NULL DEFAULT 'Algiers',
    address TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Technician profiles
CREATE TABLE IF NOT EXISTS technician_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    specialization TEXT NOT NULL DEFAULT 'General Hardware & Software',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Repair shops
CREATE TABLE IF NOT EXISTS repair_shops (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    wilaya TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Devices table
CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    color TEXT,
    imei_serial TEXT,
    is_powering_on INTEGER NOT NULL DEFAULT 1,
    device_condition TEXT NOT NULL DEFAULT 'FAIR',
    warranty_status TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Repair requests table
CREATE TABLE IF NOT EXISTS repair_requests (
    id TEXT PRIMARY KEY,
    reference_number TEXT NOT NULL UNIQUE,
    public_tracking_token TEXT NOT NULL UNIQUE,
    customer_id TEXT NOT NULL REFERENCES users(id),
    device_id TEXT NOT NULL REFERENCES devices(id),
    assigned_technician_id TEXT REFERENCES users(id),
    main_issue_category TEXT NOT NULL,
    symptom_description TEXT NOT NULL,
    problem_started TEXT,
    was_dropped INTEGER NOT NULL DEFAULT 0,
    liquid_exposure INTEGER NOT NULL DEFAULT 0,
    previous_repair_history TEXT,
    is_intermittent INTEGER NOT NULL DEFAULT 0,
    current_status TEXT NOT NULL DEFAULT 'NEW' CHECK (current_status IN (
        'NEW', 'UNDER_DIAGNOSIS', 'REPAIRABLE', 'UNREPAIRABLE',
        'REPAIR_NOT_ECONOMICAL', 'WAITING_FOR_PARTS', 'QUOTE_PENDING',
        'QUOTE_ACCEPTED', 'QUOTE_REJECTED', 'IN_REPAIR',
        'REPAIR_COMPLETED', 'READY_FOR_PICKUP', 'DELIVERED', 'CANCELLED'
    )),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Repair attachments (images stored in R2)
CREATE TABLE IF NOT EXISTS repair_attachments (
    id TEXT PRIMARY KEY,
    repair_id TEXT NOT NULL REFERENCES repair_requests(id) ON DELETE CASCADE,
    file_key TEXT NOT NULL UNIQUE,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    content_type TEXT NOT NULL,
    uploaded_by TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Diagnostics table
CREATE TABLE IF NOT EXISTS diagnostics (
    id TEXT PRIMARY KEY,
    repair_id TEXT NOT NULL UNIQUE REFERENCES repair_requests(id) ON DELETE CASCADE,
    technician_id TEXT NOT NULL REFERENCES users(id),
    reported_symptoms TEXT NOT NULL,
    inspection_findings TEXT NOT NULL,
    suspected_fault TEXT NOT NULL,
    confirmed_fault TEXT NOT NULL,
    repairability_decision TEXT NOT NULL CHECK (repairability_decision IN ('REPAIRABLE', 'UNREPAIRABLE', 'REPAIR_NOT_ECONOMICAL')),
    decision_explanation TEXT NOT NULL,
    recommended_solution TEXT NOT NULL,
    labor_estimate INTEGER NOT NULL DEFAULT 0,
    parts_estimate INTEGER NOT NULL DEFAULT 0,
    additional_costs INTEGER NOT NULL DEFAULT 0,
    estimated_repair_duration_hours INTEGER NOT NULL DEFAULT 24,
    estimated_completion_date TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Repair quotes table
CREATE TABLE IF NOT EXISTS repair_quotes (
    id TEXT PRIMARY KEY,
    repair_id TEXT NOT NULL REFERENCES repair_requests(id) ON DELETE CASCADE,
    quotation_number TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    total_price_dzd INTEGER NOT NULL,
    estimated_completion_date TEXT,
    technician_notes TEXT,
    expiration_date TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'SUPERSEDED')),
    created_by TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Quote items table (itemized parts and labor)
CREATE TABLE IF NOT EXISTS quote_items (
    id TEXT PRIMARY KEY,
    quote_id TEXT NOT NULL REFERENCES repair_quotes(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('PART', 'LABOR', 'OTHER')),
    description TEXT NOT NULL,
    unit_price_dzd INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price_dzd INTEGER NOT NULL
);

-- Customer approvals table
CREATE TABLE IF NOT EXISTS customer_approvals (
    id TEXT PRIMARY KEY,
    quote_id TEXT NOT NULL REFERENCES repair_quotes(id) ON DELETE CASCADE,
    repair_id TEXT NOT NULL REFERENCES repair_requests(id) ON DELETE CASCADE,
    customer_id TEXT NOT NULL REFERENCES users(id),
    decision TEXT NOT NULL CHECK (decision IN ('APPROVED', 'REJECTED')),
    rejection_reason TEXT,
    ip_address TEXT,
    user_agent TEXT,
    decision_timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Repair status history table (full audit trail of transitions)
CREATE TABLE IF NOT EXISTS repair_status_history (
    id TEXT PRIMARY KEY,
    repair_id TEXT NOT NULL REFERENCES repair_requests(id) ON DELETE CASCADE,
    from_status TEXT,
    to_status TEXT NOT NULL,
    changed_by TEXT REFERENCES users(id),
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    repair_id TEXT REFERENCES repair_requests(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'INFO',
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details TEXT,
    ip_address TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
