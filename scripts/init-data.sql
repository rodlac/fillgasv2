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
