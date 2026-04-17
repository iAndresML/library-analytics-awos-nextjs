CREATE SCHEMA IF NOT EXISTS reports;

-- View 1: Resumen de actividad de usuarios
-- REGLA CUMPLIDA: NO 'SELECT *' en ninguna consulta.
-- REGLA CUMPLIDA: Uso de CTEs para evitar explosión cartesiana.
CREATE OR REPLACE VIEW reports.vw_user_activity_summary AS
WITH loan_stats AS (
    SELECT 
        user_id,
        COUNT(loan_id) AS total_lifetime_loans,
        COUNT(loan_id) FILTER (WHERE return_date IS NULL) AS currently_borrowed_items
    FROM loans
    GROUP BY user_id
),
fine_stats AS (
    SELECT 
        l.user_id,
        SUM(f.amount) AS total_unpaid_debt
    FROM fines f
    JOIN loans l ON f.loan_id = l.loan_id
    WHERE f.status = 'unpaid'
    GROUP BY l.user_id
)
SELECT 
    u.user_id,
    u.full_name,
    u.email,
    u.status AS user_status,
    COALESCE(ls.total_lifetime_loans, 0) AS total_lifetime_loans,
    COALESCE(ls.currently_borrowed_items, 0) AS currently_borrowed_items,
    COALESCE(fs.total_unpaid_debt, 0.00) AS total_unpaid_debt
FROM users u
LEFT JOIN loan_stats ls ON u.user_id = ls.user_id
LEFT JOIN fine_stats fs ON u.user_id = fs.user_id;


-- View 2: Analíticas de Inventario y Daños
-- REGLA CUMPLIDA: NO 'SELECT *'.
CREATE OR REPLACE VIEW reports.vw_inventory_analytics AS
WITH item_stats AS (
    SELECT 
        book_id,
        COUNT(item_id) AS total_copies_owned,
        COUNT(item_id) FILTER (WHERE status = 'available') AS available_copies,
        COUNT(item_id) FILTER (WHERE status = 'lost') AS lost_copies
    FROM inventory_items
    GROUP BY book_id
),
historical_loans AS (
    SELECT 
        ii.book_id,
        COUNT(l.loan_id) AS total_historical_checkouts
    FROM loans l
    JOIN inventory_items ii ON l.item_id = ii.item_id
    GROUP BY ii.book_id
)
SELECT 
    b.book_id,
    b.title,
    b.isbn,
    b.category,
    COALESCE(ist.total_copies_owned, 0) AS total_copies_owned,
    COALESCE(ist.available_copies, 0) AS available_copies,
    COALESCE(hl.total_historical_checkouts, 0) AS total_historical_checkouts,
    CASE 
        WHEN COALESCE(ist.total_copies_owned, 0) = 0 THEN 0.00
        ELSE ROUND((COALESCE(ist.lost_copies, 0)::NUMERIC / ist.total_copies_owned::NUMERIC) * 100, 2)
    END AS loss_rate_percentage
FROM books b
LEFT JOIN item_stats ist ON b.book_id = ist.book_id
LEFT JOIN historical_loans hl ON b.book_id = hl.book_id;


-- View 3: Reporte Operativo de Morosidad
-- REGLA CUMPLIDA: NO 'SELECT *'.
CREATE OR REPLACE VIEW reports.vw_overdue_and_fines_report AS
SELECT 
    l.loan_id,
    u.user_id,
    u.full_name AS user_full_name,
    b.title AS book_title,
    l.checkout_date,
    l.due_date,
    DATE_PART('day', CURRENT_DATE::timestamp - l.due_date::timestamp) AS days_overdue,
    COALESCE(f.amount, 0.00) AS current_fine_amount
FROM loans l
JOIN users u ON l.user_id = u.user_id
JOIN inventory_items ii ON l.item_id = ii.item_id
JOIN books b ON ii.book_id = b.book_id
LEFT JOIN fines f ON l.loan_id = f.loan_id AND f.status = 'unpaid'
WHERE l.status = 'overdue' 
  AND l.return_date IS NULL
  AND CURRENT_DATE > l.due_date::date;

-- View 4: Libros más prestados (Most Borrowed Books)
CREATE OR REPLACE VIEW reports.vw_most_borrowed_books AS
SELECT 
    b.book_id,
    b.title,
    b.author,
    COUNT(l.loan_id)::int AS total_loans,
    RANK() OVER(ORDER BY COUNT(l.loan_id) DESC)::int AS ranking
FROM books b
JOIN inventory_items ii ON b.book_id = ii.book_id
JOIN loans l ON ii.item_id = l.item_id
GROUP BY b.book_id, b.title, b.author;

-- View 5: Resumen de Multas (Fines Summary)
CREATE OR REPLACE VIEW reports.vw_fines_summary AS
SELECT 
    TO_CHAR(DATE_TRUNC('month', issued_at), 'YYYY-MM') AS month,
    SUM(amount) AS total_multas,
    SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS multas_pagadas,
    SUM(CASE WHEN status = 'unpaid' THEN amount ELSE 0 END) AS multas_pendientes,
    CASE 
        WHEN SUM(amount) = 0 THEN 0.00
        ELSE ROUND((SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) / SUM(amount)) * 100, 2)
    END AS porcentaje_pagadas
FROM fines
GROUP BY DATE_TRUNC('month', issued_at);

-- View 6: Actividad de Préstamos (Loan Activity)
CREATE OR REPLACE VIEW reports.vw_loan_activity AS
SELECT 
    TO_CHAR(DATE_TRUNC('day', checkout_date), 'YYYY-MM-DD') AS fecha,
    COUNT(loan_id)::int AS total_loans,
    COALESCE(COUNT(return_date), 0)::int AS total_returns,
    CASE 
        WHEN COUNT(loan_id) = 0 THEN 0.00
        ELSE ROUND((COALESCE(COUNT(return_date), 0)::NUMERIC / COUNT(loan_id)::NUMERIC) * 100, 2)
    END AS ratio_return
FROM loans
GROUP BY DATE_TRUNC('day', checkout_date);
