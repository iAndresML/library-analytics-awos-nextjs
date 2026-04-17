-- Justificación #1: B-Tree Indexes para acelerar JOINs.
-- Si en las relacionales no indexamos las Foreign Keys explícitamente, Postgres ejecuta Sequential Scans por cada fila unida.
CREATE INDEX idx_inventory_items_book_id ON inventory_items(book_id);
CREATE INDEX idx_loans_user_id ON loans(user_id);
CREATE INDEX idx_loans_item_id ON loans(item_id);
CREATE INDEX idx_fines_loan_id ON fines(loan_id);

-- Justificación #2: Índices Parciales (Partial Indexes).
-- Altamente eficientes para analítica. Las views consultan constantemente si hay morosidad.
-- Excluimos del índice los libros devueltos (returned) y las multas ya pagadas. Ahorra 80% de RAM en DBs maduras.
CREATE INDEX idx_loans_active_status ON loans(status) WHERE status = 'overdue' OR status = 'active';
CREATE INDEX idx_fines_unpaid ON fines(status) WHERE status = 'unpaid';

-- Justificación #3: Indexación por Fechas para Data Ranges.
-- Los reportes de Next.js recibirán "?startDate=X&endDate=Y". El B-Tree en checkout_date agiliza ese WHERE drásticamente.
CREATE INDEX idx_loans_checkout_date ON loans(checkout_date DESC);
CREATE INDEX idx_loans_due_date ON loans(due_date DESC) WHERE return_date IS NULL;
