-- 0003_permissions.sql
-- Initial configuration and default shop data for Algeria

INSERT OR IGNORE INTO repair_shops (id, name, address, wilaya, phone, created_at)
VALUES 
    ('shop-algiers-central', 'PhoneTech Alger Centre', '12 Didouche Mourad, Alger-Centre', 'Algiers', '+213 21 63 45 80', datetime('now')),
    ('shop-oran-centre', 'PhoneTech Oran Es-Senia', '45 Boulevard Front de Mer, Oran', 'Oran', '+213 41 42 18 90', datetime('now')),
    ('shop-constantine', 'PhoneTech Constantine Bellevue', '18 Rue Larbi Ben M''hidi, Constantine', 'Constantine', '+213 31 88 12 34', datetime('now'));
