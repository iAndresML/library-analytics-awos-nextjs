import { z } from 'zod';

// REFACTOR: Schema Base de factor común para cumplir principio (DRY)
const BasePaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const OverdueReportSchema = BasePaginationSchema.extend({
  search: z.string().optional(),
  min_days_overdue: z.coerce.number().int().min(0).optional(),
});
export type OverdueReportFilters = z.infer<typeof OverdueReportSchema>;

export const InventoryReportSchema = BasePaginationSchema.extend({
  category: z.string().optional(),
});
export type InventoryReportFilters = z.infer<typeof InventoryReportSchema>;

export const UserActivityReportSchema = BasePaginationSchema.extend({
  search: z.string().optional()
});
export type UserActivityReportFilters = z.infer<typeof UserActivityReportSchema>;

export const MostBorrowedBooksSchema = BasePaginationSchema.extend({});
export type MostBorrowedBooksFilters = z.infer<typeof MostBorrowedBooksSchema>;

export const FinesSummarySchema = BasePaginationSchema.extend({});
export type FinesSummaryFilters = z.infer<typeof FinesSummarySchema>;

export const LoanActivitySchema = BasePaginationSchema.extend({});
export type LoanActivityFilters = z.infer<typeof LoanActivitySchema>;

// ====== DATA TRANSFER OBJECTS (DTOs) ====== //
// Blindan los componentes Server-Side delimitando los datos emitidos por el JSON backend.

export interface OverdueDTO {
  loan_id: string;
  user_id: string;
  user_full_name: string;
  book_title: string;
  checkout_date: string;
  due_date: string;
  days_overdue: number;
  current_fine_amount: number;
}

export interface InventoryDTO {
  book_id: string;
  title: string;
  isbn: string;
  category: string;
  total_copies_owned: number;
  available_copies: number;
  total_historical_checkouts: number;
  loss_rate_percentage: number;
}

export interface UserActivityDTO {
  user_id: string;
  full_name: string;
  email: string;
  user_status: string;
  total_lifetime_loans: number;
  currently_borrowed_items: number;
  total_unpaid_debt: number;
}

export interface MostBorrowedBooksDTO {
  book_id: string;
  title: string;
  author: string;
  total_loans: number;
  ranking: number;
}

export interface FinesSummaryDTO {
  month: string;
  total_multas: number;
  multas_pagadas: number;
  multas_pendientes: number;
  porcentaje_pagadas: number;
}

export interface LoanActivityDTO {
  fecha: string;
  total_loans: number;
  total_returns: number;
  ratio_return: number;
}
