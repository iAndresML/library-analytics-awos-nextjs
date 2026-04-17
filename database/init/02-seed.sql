-- Insert Users
INSERT INTO users (user_id, full_name, email, status, registered_at) VALUES 
('a1b2c3d4-1111-1111-1111-111111111111', 'Ana Martinez', 'ana.m@example.com', 'active', NOW() - INTERVAL '1 year'),
('b2c3d4e5-2222-2222-2222-222222222222', 'Carlos Lopez', 'carlos.l@example.com', 'suspended', NOW() - INTERVAL '6 months'),
('c3d4e5f6-3333-3333-3333-333333333333', 'Sofia Reyes', 'sofia.r@example.com', 'active', NOW() - INTERVAL '2 months');

-- Insert Books
INSERT INTO books (book_id, isbn, title, author, category) VALUES
('d4e5f6a1-4444-4444-4444-444444444444', '978-0321714114', 'C++ Primer', 'Stanley Lippman', 'Tecnología'),
('e5f6a1b2-5555-5555-5555-555555555555', '978-0131103627', 'The C Programming Language', 'Brian Kernighan', 'Tecnología'),
('f6a1b2c3-6666-6666-6666-666666666666', '978-0201835953', 'The Mythical Man-Month', 'Frederick P. Brooks', 'Ingeniería');

-- Insert Inventory
INSERT INTO inventory_items (item_id, book_id, status) VALUES
('11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'd4e5f6a1-4444-4444-4444-444444444444', 'available'),
('22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'd4e5f6a1-4444-4444-4444-444444444444', 'borrowed'),
('33333333-cccc-cccc-cccc-cccccccccccc', 'e5f6a1b2-5555-5555-5555-555555555555', 'borrowed'),
('44444444-dddd-dddd-dddd-dddddddddddd', 'f6a1b2c3-6666-6666-6666-666666666666', 'available');

-- Insert Loans
-- Carlos has an overdue loan
INSERT INTO loans (loan_id, user_id, item_id, checkout_date, due_date, status) VALUES
('55555555-eeee-eeee-eeee-eeeeeeeeeeee', 'b2c3d4e5-2222-2222-2222-222222222222', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NOW() - INTERVAL '30 days', NOW() - INTERVAL '15 days', 'overdue');

-- Sofia has an active loan
INSERT INTO loans (loan_id, user_id, item_id, checkout_date, due_date, status) VALUES
('66666666-ffff-ffff-ffff-ffffffffffff', 'c3d4e5f6-3333-3333-3333-333333333333', '33333333-cccc-cccc-cccc-cccccccccccc', NOW() - INTERVAL '5 days', NOW() + INTERVAL '10 days', 'active');

-- Ana returned a book previously
INSERT INTO loans (loan_id, user_id, item_id, checkout_date, due_date, return_date, status) VALUES
('77777777-1111-1111-1111-111111111111', 'a1b2c3d4-1111-1111-1111-111111111111', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() - INTERVAL '60 days', NOW() - INTERVAL '45 days', NOW() - INTERVAL '50 days', 'returned');

-- Insert Fine for Carlos
INSERT INTO fines (fine_id, loan_id, amount, status, issued_at) VALUES
('88888888-2222-2222-2222-222222222222', '55555555-eeee-eeee-eeee-eeeeeeeeeeee', 15.50, 'unpaid', NOW() - INTERVAL '14 days');
