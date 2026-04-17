import { pool } from '@/lib/db';
import { 
  OverdueReportFilters, OverdueDTO,
  InventoryReportFilters, InventoryDTO,
  UserActivityReportFilters, UserActivityDTO,
  MostBorrowedBooksFilters, MostBorrowedBooksDTO,
  FinesSummaryFilters, FinesSummaryDTO,
  LoanActivityFilters, LoanActivityDTO
} from '@/models/report.schema';

export class ReportsService {
  /**
   * Data fetching original MANTENIDO para no romper el front-end
   */
  static async getOverdueAndFines(filters: OverdueReportFilters): Promise<{ data: OverdueDTO[], total: number }> {
    const { page, limit, search, min_days_overdue } = filters;
    const offset = (page - 1) * limit;

    let baseQuery = `FROM reports.vw_overdue_and_fines_report WHERE 1=1`;
    const queryParams: any[] = [];

    if (search) {
      queryParams.push(`%${search}%`);
      const paramIndex = queryParams.length;
      baseQuery += ` AND (user_full_name ILIKE $${paramIndex} OR book_title ILIKE $${paramIndex})`;
    }

    if (min_days_overdue !== undefined && min_days_overdue !== null) {
      queryParams.push(min_days_overdue);
      const paramIndex = queryParams.length;
      baseQuery += ` AND days_overdue >= $${paramIndex}`;
    }

    const countQuery = `SELECT COUNT(*)::int AS total ${baseQuery}`;
    
    const dataQuery = `
      SELECT 
        loan_id, user_id, user_full_name, book_title, 
        checkout_date, due_date, days_overdue, current_fine_amount
      ${baseQuery}
      ORDER BY days_overdue DESC, current_fine_amount DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery, queryParams),
      pool.query(dataQuery, [...queryParams, limit, offset]) 
    ]);

    return {
      // MEJORA: Transforma explícitamente el BigInt de pg a tipado escalar de JavaScript
      total: Number(countResult.rows[0].total), 
      data: dataResult.rows
    };
  }

  /**
   * [EXTENSIÓN] Función despachadora para Inventario
   */
  static async getInventoryAnalytics(filters: InventoryReportFilters): Promise<{ data: InventoryDTO[], total: number }> {
    const { page, limit, category } = filters;
    const offset = (page - 1) * limit;

    let baseQuery = `FROM reports.vw_inventory_analytics WHERE 1=1`;
    const queryParams: any[] = [];

    if (category) {
      queryParams.push(category);
      const paramIndex = queryParams.length;
      baseQuery += ` AND category = $${paramIndex}`;
    }

    const countQuery = `SELECT COUNT(*)::int AS total ${baseQuery}`;
    const dataQuery = `
      SELECT 
        book_id, title, isbn, category, total_copies_owned, 
        available_copies, total_historical_checkouts, loss_rate_percentage
      ${baseQuery}
      ORDER BY title ASC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery, queryParams),
      pool.query(dataQuery, [...queryParams, limit, offset]) 
    ]);

    return {
      total: Number(countResult.rows[0].total),
      data: dataResult.rows
    };
  }

  /**
   * [EXTENSIÓN] Función despachadora de Comportamiento Estudiantil / Usuario
   */
  static async getUserActivity(filters: UserActivityReportFilters): Promise<{ data: UserActivityDTO[], total: number }> {
    const { page, limit, search } = filters;
    const offset = (page - 1) * limit;

    let baseQuery = `FROM reports.vw_user_activity_summary WHERE 1=1`;
    const queryParams: any[] = [];

    if (search) {
      queryParams.push(`%${search}%`);
      const paramIndex = queryParams.length;
      baseQuery += ` AND full_name ILIKE $${paramIndex}`;
    }

    const countQuery = `SELECT COUNT(*)::int AS total ${baseQuery}`;
    const dataQuery = `
      SELECT 
        user_id, full_name, email, user_status, 
        total_lifetime_loans, currently_borrowed_items, total_unpaid_debt
      ${baseQuery}
      ORDER BY total_unpaid_debt DESC, full_name ASC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery, queryParams),
      pool.query(dataQuery, [...queryParams, limit, offset]) 
    ]);

    return {
      total: Number(countResult.rows[0].total),
      data: dataResult.rows
    };
  }

  /**
   * [NUEVA VISTA] Libros Más Prestados
   */
  static async getMostBorrowedBooks(filters: MostBorrowedBooksFilters): Promise<{ data: MostBorrowedBooksDTO[], total: number }> {
    const { page, limit } = filters;
    const offset = (page - 1) * limit;

    const countQuery = `SELECT COUNT(*)::int AS total FROM reports.vw_most_borrowed_books`;
    const dataQuery = `
      SELECT 
        book_id, title, author, total_loans, ranking
      FROM reports.vw_most_borrowed_books
      ORDER BY ranking ASC, title ASC
      LIMIT $1 OFFSET $2
    `;

    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery),
      pool.query(dataQuery, [limit, offset]) 
    ]);

    return {
      total: Number(countResult.rows[0].total),
      data: dataResult.rows
    };
  }

  /**
   * [NUEVA VISTA] Resumen de Multas
   */
  static async getFinesSummary(filters: FinesSummaryFilters): Promise<{ data: FinesSummaryDTO[], total: number }> {
    const { page, limit } = filters;
    const offset = (page - 1) * limit;

    const countQuery = `SELECT COUNT(*)::int AS total FROM reports.vw_fines_summary`;
    const dataQuery = `
      SELECT 
        month, total_multas, multas_pagadas, multas_pendientes, porcentaje_pagadas
      FROM reports.vw_fines_summary
      ORDER BY month DESC
      LIMIT $1 OFFSET $2
    `;

    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery),
      pool.query(dataQuery, [limit, offset]) 
    ]);

    return {
      total: Number(countResult.rows[0].total),
      data: dataResult.rows
    };
  }

  /**
   * [NUEVA VISTA] Actividad de Préstamos
   */
  static async getLoanActivity(filters: LoanActivityFilters): Promise<{ data: LoanActivityDTO[], total: number }> {
    const { page, limit } = filters;
    const offset = (page - 1) * limit;

    const countQuery = `SELECT COUNT(*)::int AS total FROM reports.vw_loan_activity`;
    const dataQuery = `
      SELECT 
        fecha, total_loans, total_returns, ratio_return
      FROM reports.vw_loan_activity
      ORDER BY fecha DESC
      LIMIT $1 OFFSET $2
    `;

    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery),
      pool.query(dataQuery, [limit, offset]) 
    ]);

    return {
      total: Number(countResult.rows[0].total),
      data: dataResult.rows
    };
  }
}
