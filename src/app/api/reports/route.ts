import { NextRequest, NextResponse } from 'next/server';
import { ReportsService } from '@/services/reports.service';
import { OverdueReportSchema, InventoryReportSchema, UserActivityReportSchema } from '@/models/report.schema';

export async function GET(req: NextRequest) {
  try {
    const searchParams = Object.fromEntries(req.nextUrl.searchParams);
    
    // PATRÓN ABSTRACCIÓN - FALLBACK: 
    // Evaluamos 'type' pero fallamos pasivamente hacia 'overdue'. 
    // Al hacer esto, garantizamos que el Front-End Antiguo NO SE ROMPA y retenga el endpoint
    const reportType = searchParams.type || 'overdue';

    if (reportType === 'inventory') {
      const parsedFilters = InventoryReportSchema.safeParse(searchParams);
      if (!parsedFilters.success) return NextResponse.json({ error: 'Inv. params' }, { status: 400 });
      const result = await ReportsService.getInventoryAnalytics(parsedFilters.data);
      return NextResponse.json(result, { status: 200 });
    }

    if (reportType === 'users') {
      const parsedFilters = UserActivityReportSchema.safeParse(searchParams);
      if (!parsedFilters.success) return NextResponse.json({ error: 'Inv. params' }, { status: 400 });
      const result = await ReportsService.getUserActivity(parsedFilters.data);
      return NextResponse.json(result, { status: 200 });
    }

    // Default: 'overdue' - Endpoint original respetado sin alteraciones.
    const parsedFilters = OverdueReportSchema.safeParse(searchParams);
    if (!parsedFilters.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parsedFilters.error.errors },
        { status: 400 }
      );
    }
    const result = await ReportsService.getOverdueAndFines(parsedFilters.data);
    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
