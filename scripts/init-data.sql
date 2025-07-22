-- Insert initial roles
INSERT INTO "v2_roles" (id, name, "displayName", description, permissions, "isSystemRole", "isActive", "createdAt", "updatedAt") VALUES
('admin-role', 'admin', 'Administrador', 'Acesso total ao sistema', '["*"]', true, true, NOW(), NOW()),
('user-role', 'user', 'Usuário', 'Acesso básico ao sistema', '["clients:read", "bookings:read", "services:read"]', true, true, NOW(), NOW());

-- Insert initial admin user
INSERT INTO "v2_users" (id, email, "firstName", "lastName", role, "isActive", permissions, "createdAt", "updatedAt") VALUES
('admin-user', 'admin@fillgas.com', 'Admin', 'Sistema', 'admin', true, '["*"]', NOW(), NOW());

-- Insert initial payment methods
INSERT INTO "v2_paymentMethods" (id, method, "displayName", "isActive", "fixedFee", "percentageFee", "passFeesToClient", "createdAt", "updatedAt") VALUES
('pix-method', 'PIX', 'PIX', true, 0.00, 0.0099, false, NOW(), NOW()),
('credit-method', 'CREDIT_CARD', 'Cartão de Crédito', true, 0.39, 0.0399, false, NOW(), NOW()),
('boleto-method', 'BOLETO', 'Boleto Bancário', true, 3.49, 0.0000, false, NOW(), NOW()),
('transfer-method', 'BANK_TRANSFER', 'Transferência Bancária', true, 0.00, 0.0000, false, NOW(), NOW());

-- Insert sample services
INSERT INTO "v2_services" (id, name, price, "isActive", "createdAt", "updatedAt") VALUES
('service-1', 'Cilindro CO2 5kg', 45.00, true, NOW(), NOW()),
('service-2', 'Cilindro CO2 10kg', 85.00, true, NOW(), NOW()),
('service-3', 'Cilindro CO2 15kg', 120.00, true, NOW(), NOW()),
('service-4', 'Troca de Cilindro 5kg', 35.00, true, NOW(), NOW()),
('service-5', 'Troca de Cilindro 10kg', 65.00, true, NOW(), NOW());

-- Insert sample coupon
INSERT INTO "v2_coupons" (id, code, name, "discountType", "discountValue", "minimumAmount", "maxUsage", "currentUsage", "maxUsagePerUser", "validFrom", "validUntil", "isActive", "createdAt", "updatedAt") VALUES
('coupon-1', 'PRIMEIRA10', 'Desconto Primeira Compra', 'percentage', 10.00, 50.00, 100, 0, 1, NOW(), NOW() + INTERVAL '30 days', true, NOW(), NOW());

-- Insert sample client
INSERT INTO "v2_clients" (id, name, email, cpf, phone, address, "postalCode", "cylinderType", "isActive", "createdAt", "updatedAt") VALUES
('client-1', 'João Silva', 'joao@email.com', '12345678901', '(11) 99999-9999', 'Rua das Flores, 123', '01234-567', '5kg', true, NOW(), NOW());

-- Insert sample users
INSERT INTO users (id, email, password_hash, name, role) VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@example.com', 'hashed_password_admin', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, email, password_hash, name, role) VALUES
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'user@example.com', 'hashed_password_user', 'Regular User', 'user')
ON CONFLICT (email) DO NOTHING;

-- Insert sample clients
INSERT INTO clients (id, name, email, phone, address) VALUES
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'João Silva', 'joao.silva@example.com', '11987654321', 'Rua A, 123, São Paulo - SP')
ON CONFLICT (email) DO NOTHING;

INSERT INTO clients (id, name, email, phone, address) VALUES
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Maria Souza', 'maria.souza@example.com', '21998765432', 'Av. B, 456, Rio de Janeiro - RJ')
ON CONFLICT (email) DO NOTHING;

-- Insert sample services
INSERT INTO services (id, name, description, price) VALUES
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Cilindro P5', 'Cilindro de gás de 5kg', 85.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, name, description, price) VALUES
    ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Cilindro P13', 'Cilindro de gás de 13kg', 100.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, name, description, price) VALUES
    ('g0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'Cilindro P45', 'Cilindro de gás de 45kg', 250.00)
ON CONFLICT (id) DO NOTHING;

-- Insert sample coupons
INSERT INTO coupons (id, code, discount_type, value, expiration_date, is_active) VALUES
    ('h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'DESCONTO10', 'PERCENTAGE', 10.00, '2025-12-31 23:59:59+00', TRUE)
ON CONFLICT (code) DO NOTHING;

INSERT INTO coupons (id, code, discount_type, value, expiration_date, is_active) VALUES
    ('i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'FRETEGRATIS', 'FIXED_AMOUNT', 15.00, NULL, TRUE)
ON CONFLICT (code) DO NOTHING;

-- Insert sample bookings (assuming client and service IDs exist)
-- You might need to adjust client_id and service_id based on actual UUIDs generated if not using fixed ones.
INSERT INTO bookings (id, client_id, service_id, booking_date, status, notes, coupon_id) VALUES
    ('j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', '2025-08-01 10:00:00+00', 'PENDING', 'Entrega urgente', 'h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18')
ON CONFLICT (id) DO NOTHING;

INSERT INTO bookings (id, client_id, service_id, booking_date, status, notes, coupon_id) VALUES
    ('k0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', '2025-08-05 14:30:00+00', 'CONFIRMED', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Insert sample payments (assuming booking IDs exist)
INSERT INTO payments (id, booking_id, amount, payment_method, status, transaction_id) VALUES
    ('l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 85.00, 'PIX', 'PENDING', 'PIX12345')
ON CONFLICT (id) DO NOTHING;

INSERT INTO payments (id, booking_id, amount, payment_method, status, transaction_id) VALUES
    ('m0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'k0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 100.00, 'CREDIT_CARD', 'COMPLETED', 'CC67890')
ON CONFLICT (id) DO NOTHING;
