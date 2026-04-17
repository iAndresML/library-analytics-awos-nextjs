import { ReportsService } from '@/services/reports.service';
import { OverdueDTO, OverdueReportSchema } from '@/models/report.schema';

export const revalidate = 0; // Dynamic SSR

export default async function OverduePage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Validación de paginación usando Zod para robustez
  const parsedParams = OverdueReportSchema.safeParse({
    page: searchParams.page,
    limit: searchParams.limit || 5,
    search: searchParams.search,
    min_days_overdue: searchParams.min_days_overdue
  });

  const page = parsedParams.success ? parsedParams.data.page : 1;
  const limit = parsedParams.success ? parsedParams.data.limit : 5;
  const search = parsedParams.success ? parsedParams.data.search : undefined;
  const min_days_overdue = parsedParams.success ? parsedParams.data.min_days_overdue : undefined;

  let reportData: { data: OverdueDTO[]; total: number } = { data: [], total: 0 };
  let fetchError: string | null = null;

  try {
    reportData = await ReportsService.getOverdueAndFines({ page, limit, search, min_days_overdue });
  } catch (err) {
    fetchError = "No connection to database. Asegúrate de levantar Docker Compose.";
  }

  const { data, total } = reportData;
  const totalPages = Math.ceil(total / limit);
  const totalDebtPage = data.reduce((acc, row) => acc + Number(row.current_fine_amount), 0);

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ borderBottom: '1px solid #333', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#ff8a00' }}>
          Reporte de Morosidad
        </h1>
        <p style={{ color: '#888', marginTop: '0.5rem' }}>
          Identificación de usuarios con atrasos y cálculo de deuda.
        </p>
      </header>

      <form method="GET" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: '#111', padding: '1rem', borderRadius: '8px', border: '1px solid #333', flexWrap: 'wrap' }}>
        <input type="hidden" name="page" value="1" />
        <div style={{ flex: '1 1 250px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '0.5rem' }}>Búsqueda (Usuario o Libro)</label>
          <input 
            type="text" 
            name="search" 
            defaultValue={search || ''} 
            placeholder="Ej: Carlos o Clean Code"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '0.5rem' }}>Días Atraso (Mínimo)</label>
          <input 
            type="number" 
            name="min_days_overdue" 
            defaultValue={min_days_overdue || ''} 
            placeholder="Ej: 10"
            min="0"
            style={{ width: '150px', padding: '0.75rem', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button type="submit" style={{ padding: '0.75rem 1.5rem', background: '#ff8a00', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Filtrar
          </button>
        </div>
      </form>

      {(search || min_days_overdue !== undefined) && (
        <div style={{ marginBottom: '2rem', color: '#aaa', background: '#1a1a1a', padding: '0.75rem', borderRadius: '4px', borderLeft: '4px solid #ff8a00' }}>
          Resultados para: {search && <strong>"{search}"</strong>} {search && min_days_overdue !== undefined && ' | '}
          {min_days_overdue !== undefined && <span>Mínimo días atraso: <strong>{min_days_overdue}</strong></span>}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333', flex: 1 }}>
          <h3 style={{ margin: 0, color: '#aaa', fontSize: '0.9rem', textTransform: 'uppercase' }}>Préstamos Atrasados Totales</h3>
          <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', fontWeight: 'bold', color: '#ff4d4d' }}>{total}</p>
        </div>
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333', flex: 1 }}>
          <h3 style={{ margin: 0, color: '#aaa', fontSize: '0.9rem', textTransform: 'uppercase' }}>Deuda Visible (Pág)</h3>
          <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', fontWeight: 'bold', color: '#ff8a00' }}>${totalDebtPage.toFixed(2)}</p>
        </div>
      </div>

      {fetchError && (
        <div style={{ padding: '1rem', background: '#3b0000', color: '#ffaaaa', border: '1px solid currentColor', borderRadius: '8px', marginBottom: '2rem' }}>
          {fetchError}
        </div>
      )}

      <div style={{ overflowX: 'auto', background: '#111', borderRadius: '8px', border: '1px solid #333' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#222', color: '#ccc' }}>
              <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>Préstamo</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>Usuario</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>Libro</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>Retraso</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>Multa USD</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.loan_id} style={{ transition: 'background 0.2s', borderBottom: '1px solid #222' }}>
                <td style={{ padding: '1rem', color: '#666', fontSize: '0.85em' }}>{row.loan_id.split('-')[0]}...</td>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{row.user_full_name}</td>
                <td style={{ padding: '1rem', color: '#aaa' }}>{row.book_title}</td>
                <td style={{ padding: '1rem', color: '#ff4d4d', fontWeight: 'bold' }}>{row.days_overdue} días</td>
                <td style={{ padding: '1rem', color: '#ff8a00', fontSize: '1.1em' }}>${Number(row.current_fine_amount).toFixed(2)}</td>
              </tr>
            ))}
            {data.length === 0 && !fetchError && (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#555' }}>No hay usuarios morosos actualmente</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#888' }}>Mostrando página {page} de {Math.max(1, totalPages)} (Total: {total})</span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {page > 1 && (
            <a href={`/reports/overdue?page=${page - 1}${search ? `&search=${encodeURIComponent(search)}` : ''}${min_days_overdue !== undefined ? `&min_days_overdue=${min_days_overdue}` : ''}`} style={{ padding: '0.5rem 1rem', background: '#333', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}>
              Anterior
            </a>
          )}
          {page < totalPages && (
            <a href={`/reports/overdue?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ''}${min_days_overdue !== undefined ? `&min_days_overdue=${min_days_overdue}` : ''}`} style={{ padding: '0.5rem 1rem', background: '#ff8a00', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}>
              Siguiente
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
