-- Create initial roles
INSERT INTO v2_roles (id, name, display_name, description, permissions, is_system_role, is_active) VALUES
('admin-role', 'admin', 'Administrador', 'Acesso total ao sistema', '["*"]', true, true),
('user-role', 'user', 'Usuário', 'Acesso básico ao sistema', '["clients:read", "bookings:read", "services:read"]', true, true);

-- Create initial admin user (password should be hashed in production)
INSERT INTO v2_users (id, email, first_name, last_name, role, is_active, permissions) VALUES
('admin-user', 'admin@fillgas.com', 'Admin', 'Sistema', 'admin', true, '["*"]');

-- Create initial payment methods
INSERT INTO v2_payment_methods (method, display_name, is_active, fixed_fee, percentage_fee, pass_fees_to_client) VALUES
('PIX', 'PIX', true, 0.00, 0.0099, false),
('CREDIT_CARD', 'Cartão de Crédito', true, 0.39, 0.0399, false),
('BOLETO', 'Boleto Bancário', true, 3.49, 0.0000, false),
('BANK_TRANSFER', 'Transferência Bancária', true, 0.00, 0.0000, false);

-- Create sample services
INSERT INTO v2_services (name, price, is_active) VALUES
('Cilindro CO2 5kg', 45.00, true),
('Cilindro CO2 10kg', 85.00, true),
('Cilindro CO2 15kg', 120.00, true),
('Troca de Cilindro 5kg', 35.00, true),
('Troca de Cilindro 10kg', 65.00, true);

-- Create sample coupon
INSERT INTO v2_coupons (code, name, discount_type, discount_value, minimum_amount, max_usage, current_usage, max_usage_per_user, valid_from, valid_until, is_active) VALUES
('PRIMEIRA10', 'Desconto Primeira Compra', 'percentage', 10.00, 50.00, 100, 0, 1, NOW(), NOW() + INTERVAL '30 days', true);
