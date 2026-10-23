-- seed.sql: Synthetic sample data for local development (Algeria)

-- Seed users intentionally have disabled passwords. Set unique passwords securely for local accounts.
INSERT OR REPLACE INTO users (id, email, phone, password_hash, role, full_name, is_active, created_at, updated_at)
VALUES
  ('usr-admin-01', 'admin@example.invalid', '+213' || printf('%09d', abs(random()) % 1000000000), 'disabled:seed-user:password-not-set', 'ADMIN', 'Sample Administrator', 1, datetime('now', '-30 days'), datetime('now')),
  ('usr-tech-01', 'technician@example.invalid', '+213' || printf('%09d', abs(random()) % 1000000000), 'disabled:seed-user:password-not-set', 'TECHNICIAN', 'Sample Technician', 1, datetime('now', '-30 days'), datetime('now')),
  ('usr-cust-01', 'customer1@example.invalid', '+213' || printf('%09d', abs(random()) % 1000000000), 'disabled:seed-user:password-not-set', 'CUSTOMER', 'Sample Customer One', 1, datetime('now', '-20 days'), datetime('now')),
  ('usr-cust-02', 'customer2@example.invalid', '+213' || printf('%09d', abs(random()) % 1000000000), 'disabled:seed-user:password-not-set', 'CUSTOMER', 'Sample Customer Two', 1, datetime('now', '-15 days'), datetime('now'));

-- 2. Profiles
INSERT OR REPLACE INTO technician_profiles (id, user_id, specialization, is_active, created_at, updated_at)
VALUES
  ('tp-01', 'usr-tech-01', 'Micro-soldering, Screen & Motherboard Diagnostics', 1, datetime('now', '-30 days'), datetime('now'));

INSERT OR REPLACE INTO customer_profiles (id, user_id, preferred_communication, wilaya, address, created_at, updated_at)
VALUES
  ('cp-01', 'usr-cust-01', 'WHATSAPP', 'Algiers', 'Sample address, Algiers', datetime('now', '-20 days'), datetime('now')),
  ('cp-02', 'usr-cust-02', 'PHONE', 'Oran', 'Sample address, Oran', datetime('now', '-15 days'), datetime('now'));

-- 3. Devices
INSERT OR REPLACE INTO devices (id, brand, model, color, imei_serial, is_powering_on, device_condition, warranty_status, created_at)
VALUES
  ('dev-01', 'Samsung', 'Galaxy S23 Ultra', 'Phantom Black', NULL, 1, 'FAIR', 'Out of Warranty', datetime('now', '-2 days')),
  ('dev-02', 'Apple', 'iPhone 14 Pro Max', 'Deep Purple', NULL, 1, 'GOOD', 'Under Warranty', datetime('now', '-3 days')),
  ('dev-03', 'Xiaomi', 'Redmi Note 12 Pro', 'Sky Blue', NULL, 1, 'FAIR', 'Out of Warranty', datetime('now', '-5 days')),
  ('dev-04', 'Oppo', 'Reno 8 5G', 'Shimmer Gold', NULL, 1, 'DAMAGED', 'Out of Warranty', datetime('now', '-6 days')),
  ('dev-05', 'Samsung', 'Galaxy A54 5G', 'Awesome Lime', NULL, 0, 'POOR', 'Out of Warranty', datetime('now', '-8 days')),
  ('dev-06', 'Apple', 'iPhone 13', 'Midnight', NULL, 1, 'GOOD', 'Out of Warranty', datetime('now', '-10 days')),
  ('dev-07', 'Huawei', 'P30 Pro', 'Breathing Crystal', NULL, 0, 'DAMAGED', 'Out of Warranty', datetime('now', '-12 days')),
  ('dev-08', 'Infinix', 'Note 30 VIP', 'Glacier White', NULL, 1, 'FAIR', 'Out of Warranty', datetime('now', '-14 days'));

-- 4. Repair Requests
INSERT OR REPLACE INTO repair_requests (
  id, reference_number, public_tracking_token, customer_id, device_id, assigned_technician_id,
  main_issue_category, symptom_description, problem_started, was_dropped, liquid_exposure,
  previous_repair_history, is_intermittent, current_status, created_at, updated_at
)
VALUES
  ('rep-01', 'DZ-REP-100201', lower(hex(randomblob(32))), 'usr-cust-01', 'dev-01', NULL,
   'Broken screen', 'Dropped on tile floor at work. Glass shattered completely, AMOLED has black bleeding lines in the upper right corner.', '2 days ago', 1, 0, 'Never repaired before', 0, 'NEW', datetime('now', '-2 days'), datetime('now', '-2 days')),

  ('rep-02', 'DZ-REP-100202', lower(hex(randomblob(32))), 'usr-cust-02', 'dev-02', 'usr-tech-01',
   'Battery problems', 'Battery drains from 100% to 20% within 3 hours. Phone overheats around the camera module when charging.', '1 week ago', 0, 0, 'Factory original', 1, 'UNDER_DIAGNOSIS', datetime('now', '-3 days'), datetime('now', '-1 day')),

  ('rep-03', 'DZ-REP-100203', lower(hex(randomblob(32))), 'usr-cust-01', 'dev-03', 'usr-tech-01',
   'Charging port', 'Type-C charging cable does not click into place. Must hold cable at an angle to charge.', '3 weeks ago', 0, 0, 'None', 1, 'QUOTE_PENDING', datetime('now', '-5 days'), datetime('now', '-1 day')),

  ('rep-04', 'DZ-REP-100204', lower(hex(randomblob(32))), 'usr-cust-02', 'dev-04', 'usr-tech-01',
   'Touchscreen malfunction', 'Screen touch is unresponsive on the lower third after a fall. Display image is visible.', '4 days ago', 1, 0, 'None', 0, 'QUOTE_ACCEPTED', datetime('now', '-6 days'), datetime('now', '-1 day')),

  ('rep-05', 'DZ-REP-100205', lower(hex(randomblob(32))), 'usr-cust-01', 'dev-05', 'usr-tech-01',
   'Water damage', 'Device fell into sea water during vacation. Immediately turned off and placed in dry towel. Will not turn on.', '1 week ago', 0, 1, 'None', 0, 'IN_REPAIR', datetime('now', '-8 days'), datetime('now', '-2 days')),

  ('rep-06', 'DZ-REP-100206', lower(hex(randomblob(32))), 'usr-cust-02', 'dev-06', 'usr-tech-01',
   'Speaker or microphone', 'In-call earpiece volume is extremely quiet even at max volume. Loudspeaker works fine.', '2 weeks ago', 0, 0, 'None', 0, 'READY_FOR_PICKUP', datetime('now', '-10 days'), datetime('now', '-1 day')),

  ('rep-07', 'DZ-REP-100207', lower(hex(randomblob(32))), 'usr-cust-01', 'dev-07', 'usr-tech-01',
   'Motherboard or electrical issue', 'Severe liquid immersion and oxidation. Short circuit on PMIC power rails. Multiple burnt capacitors.', '3 weeks ago', 0, 1, 'Attempted repair at local shop', 0, 'UNREPAIRABLE', datetime('now', '-12 days'), datetime('now', '-4 days')),

  ('rep-08', 'DZ-REP-100208', lower(hex(randomblob(32))), 'usr-cust-02', 'dev-08', 'usr-tech-01',
   'Broken screen', 'Back glass and camera glass replacement completed and delivered.', '2 weeks ago', 1, 0, 'None', 0, 'DELIVERED', datetime('now', '-14 days'), datetime('now', '-5 days'));

-- 5. Diagnostics
INSERT OR REPLACE INTO diagnostics (
  id, repair_id, technician_id, reported_symptoms, inspection_findings, suspected_fault,
  confirmed_fault, repairability_decision, decision_explanation, recommended_solution,
  labor_estimate, parts_estimate, additional_costs, estimated_repair_duration_hours,
  estimated_completion_date, created_at, updated_at
)
VALUES
  ('diag-03', 'rep-03', 'usr-tech-01', 'Type-C cable loose', 'Type-C connector tongue is bent and internal pins 4 & 5 are cracked.', 'Damaged sub-board / charging port', 'Damaged Type-C charging port sub-board module', 'REPAIRABLE', 'Device chassis and mainboard are in pristine condition. Replacement of the lower charging PCB will restore fast charging capability.', 'Replace genuine Redmi Note 12 Pro sub-board module', 1500, 3000, 0, 24, '2026-10-25', datetime('now', '-2 days'), datetime('now', '-1 day')),
  ('diag-04', 'rep-04', 'usr-tech-01', 'Touch digitizer failure', 'AMOLED flex cable cracked at bend zone.', 'Digitizer controller / flex cable fracture', 'Internal digitizer IC ribbon separation', 'REPAIRABLE', 'Original Service Pack AMOLED replacement will completely resolve touch and display issues.', 'Install Original AMOLED Display Assembly', 2500, 13500, 0, 48, '2026-10-26', datetime('now', '-3 days'), datetime('now', '-2 days')),
  ('diag-05', 'rep-05', 'usr-tech-01', 'Sea water damage, no power', 'Severe saline oxidation on VDD_MAIN line. Power management IC shorted to ground.', 'Short circuit on power rail', 'Saline corrosion on PMIC and charging IC', 'REPAIRABLE', 'Ultrasonic bath cleaning followed by reballing the PMIC and micro-soldering damaged passives.', 'Ultrasonic de-oxidation & PMIC micro-soldering', 6000, 4000, 0, 72, '2026-10-28', datetime('now', '-5 days'), datetime('now', '-3 days')),
  ('diag-07', 'rep-07', 'usr-tech-01', 'No power, previous failed attempt', 'Extensive multi-layer PCB burn through near CPU and NAND flash. Several traces destroyed due to prior heatgun misuse.', 'Internal PCB delamination and CPU short', 'Severe thermal and chemical destruction of multi-layer logic board', 'UNREPAIRABLE', 'The motherboard has internal layer shorts that cannot be bridged. Repair is technically impossible without whole board replacement, which exceeds the residual value of the device.', 'Data recovery attempt not recommended due to damaged NAND controller.', 0, 0, 0, 0, NULL, datetime('now', '-8 days'), datetime('now', '-4 days'));

-- 6. Quotations
INSERT OR REPLACE INTO repair_quotes (
  id, repair_id, quotation_number, version, total_price_dzd, estimated_completion_date,
  technician_notes, expiration_date, status, created_by, created_at, updated_at
)
VALUES
  ('qte-03', 'rep-03', 'Q-100203-V1', 1, 4500, '2026-10-25', 'Includes genuine Xiaomi fast-charge sub-board and 3 months warranty.', datetime('now', '+14 days'), 'PENDING', 'usr-tech-01', datetime('now', '-1 day'), datetime('now', '-1 day')),
  ('qte-04', 'rep-04', 'Q-100204-V1', 1, 16000, '2026-10-26', 'Original AMOLED Service Pack with frame and fingerprint sensor calibration included.', datetime('now', '+14 days'), 'ACCEPTED', 'usr-tech-01', datetime('now', '-2 days'), datetime('now', '-1 day')),
  ('qte-05', 'rep-05', 'Q-100205-V1', 1, 10000, '2026-10-28', 'Full ultrasonic de-oxidation treatment and PMIC micro-soldering with 6-month warranty.', datetime('now', '+14 days'), 'ACCEPTED', 'usr-tech-01', datetime('now', '-3 days'), datetime('now', '-2 days')),
  ('qte-06', 'rep-06', 'Q-100206-V1', 1, 8000, '2026-10-22', 'Genuine Apple earpiece and proximity sensor flex assembly replacement.', datetime('now', '+14 days'), 'ACCEPTED', 'usr-tech-01', datetime('now', '-7 days'), datetime('now', '-6 days')),
  ('qte-08', 'rep-08', 'Q-100208-V1', 1, 6500, '2026-10-18', 'Back glass housing and sapphire camera lens replacement.', datetime('now', '+14 days'), 'ACCEPTED', 'usr-tech-01', datetime('now', '-12 days'), datetime('now', '-10 days'));

-- 7. Quote Items
INSERT OR REPLACE INTO quote_items (id, quote_id, item_type, description, unit_price_dzd, quantity, total_price_dzd)
VALUES
  ('qi-31', 'qte-03', 'PART', 'Genuine Xiaomi Type-C Sub-board', 3000, 1, 3000),
  ('qi-32', 'qte-03', 'LABOR', 'Disassembly, solder inspection & testing', 1500, 1, 1500),
  ('qi-41', 'qte-04', 'PART', 'Original Oppo Reno 8 AMOLED Screen Assembly', 13500, 1, 13500),
  ('qi-42', 'qte-04', 'LABOR', 'Screen installation & optical sensor calibration', 2500, 1, 2500),
  ('qi-51', 'qte-05', 'LABOR', 'Ultrasonic de-oxidation & cleaning procedure', 4000, 1, 4000),
  ('qi-52', 'qte-05', 'PART', 'Power Management IC (PMIC)', 4000, 1, 4000),
  ('qi-53', 'qte-05', 'LABOR', 'BGA Reballing & Micro-soldering work', 2000, 1, 2000);

-- 8. Customer Approvals
INSERT OR REPLACE INTO customer_approvals (id, quote_id, repair_id, customer_id, decision, rejection_reason, ip_address, user_agent, decision_timestamp)
VALUES
  ('appr-04', 'qte-04', 'rep-04', 'usr-cust-02', 'APPROVED', NULL, '105.101.45.22', 'Mozilla/5.0 Mobile Safari', datetime('now', '-1 day')),
  ('appr-05', 'qte-05', 'rep-05', 'usr-cust-01', 'APPROVED', NULL, '41.107.12.80', 'Mozilla/5.0 Chrome Windows', datetime('now', '-2 days'));

-- 9. Status History
INSERT OR REPLACE INTO repair_status_history (id, repair_id, from_status, to_status, changed_by, notes, created_at)
VALUES
  ('h-01', 'rep-01', NULL, 'NEW', 'usr-cust-01', 'Request submitted by customer via portal', datetime('now', '-2 days')),
  ('h-02', 'rep-02', NULL, 'NEW', 'usr-cust-02', 'Request submitted by customer via portal', datetime('now', '-3 days')),
  ('h-03', 'rep-02', 'NEW', 'UNDER_DIAGNOSIS', 'usr-tech-01', 'Technician started battery load test', datetime('now', '-1 day')),
  ('h-04', 'rep-03', 'NEW', 'UNDER_DIAGNOSIS', 'usr-tech-01', 'Device physical inspection conducted', datetime('now', '-2 days')),
  ('h-05', 'rep-03', 'UNDER_DIAGNOSIS', 'REPAIRABLE', 'usr-tech-01', 'Confirmed charging port fault', datetime('now', '-1 day')),
  ('h-06', 'rep-03', 'REPAIRABLE', 'QUOTE_PENDING', 'usr-tech-01', 'Quotation Q-100203-V1 sent to customer (4,500 DZD)', datetime('now', '-1 day')),
  ('h-07', 'rep-04', 'QUOTE_PENDING', 'QUOTE_ACCEPTED', 'usr-cust-02', 'Customer approved quotation (16,000 DZD)', datetime('now', '-1 day')),
  ('h-08', 'rep-05', 'QUOTE_ACCEPTED', 'IN_REPAIR', 'usr-tech-01', 'Micro-soldering and de-oxidation under microscope in progress', datetime('now', '-2 days')),
  ('h-09', 'rep-07', 'UNDER_DIAGNOSIS', 'UNREPAIRABLE', 'usr-tech-01', 'Declared unrepairable due to multi-layer logic board delamination', datetime('now', '-4 days'));

-- 10. Notifications
INSERT OR REPLACE INTO notifications (id, user_id, repair_id, title, message, type, is_read, created_at)
VALUES
  ('not-01', 'usr-cust-01', 'rep-03', 'Quotation Ready', 'A repair quotation for your Redmi Note 12 Pro is ready for your review (4,500 DZD).', 'QUOTE', 0, datetime('now', '-1 day')),
  ('not-02', 'usr-cust-02', 'rep-04', 'Repair Approved', 'Thank you! We received your approval. Repair of your Oppo Reno 8 is now scheduled.', 'STATUS_UPDATE', 1, datetime('now', '-1 day')),
  ('not-03', 'usr-cust-01', 'rep-07', 'Diagnosis Complete', 'Your Huawei P30 Pro has been diagnosed as unrepairable due to internal motherboard damage.', 'DIAGNOSIS', 0, datetime('now', '-4 days'));
