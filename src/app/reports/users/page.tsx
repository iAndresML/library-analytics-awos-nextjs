import { ReportsService } from '@/services/reports.service';
import { UserActivityDTO, UserActivityReportSchema } from '@/models/report.schema';

export const revalidate = 0;

export default async function UsersPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const parsedParams = UserActivityReportSchema.safeParse({
    page: searchParams.page,
    limit: searchParams.limit || 5,
    search: searchParams.search
  });

  const page = parsedParams.success ? parsedParams.data.page : 1;
  const limit = parsedParams.success ? parsedParams.data.limit : 5;
  const search = parsedParams.success ? parsedParams.data.search : undefined;

  let reportData: { data: UserActivityDTO[]; total: number } = { data: [], total: 0 };
  let fetchError: string | null = null;

  try {
    reportData = await ReportsService.getUserActivity({ page, limit, search });
  } catch (err) {
    fetchError = "No connection to database. Asegúrate de levantar Docker Compose.";
  }

  const { data, total } = reportData;
  const totalPages = Math.ceil(total / limit);

  const totalDebt = data.reduce((acc, row) => acc + Number(row.total_unpaid_debt), 0);
  const totalActiveLoans = data.reduce((acc, row) => acc + Number(row.currently_borrowed_items), 0);

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ borderBottom: '1px solid #333', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#38ef7d' }}>
          Actividad de Usuarios
        </h1>
        <p style={{ color: '#888', marginTop: '0.5rem' }}>Análisis de la base de usuarios y reputación de pagos.</p>
      </header>

      <form method="GET" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: '#111', padding: '1rem', borderRadius: '8px', border: '1px solid #333', flexWrap: 'wrap' }}>
        <input type="hidden" name="page" value="1" />
        <div style={{ flex: '1 1 250px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '0.5rem' }}>Búsqueda por Nombre</label>
          <input 
            type="text" 
            name="search" 
            defaultValue={search || ''} 
            placeholder="Ej: Ana, Juan"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button type="submit" style={{ padding: '0.75rem 1.5rem', background: '#38ef7d', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Filtrar
          </button>
        </div>
      </form>

      {search && (
        <div style={{ marginBottom: '2rem', color: '#aaa', background: '#1a1a1a', padding: '0.75rem', borderRadius: '4px', borderLeft: '4px solid #38ef7d' }}>
          Resultados para: <strong>"{search}"</strong>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333', flex: 1 }}>
          <h3 style={{ margin: 0, color: '#aaa', fontSize: '0.9rem', textTransform: 'uppercase' }}>Préstamos Activos (Pág Act.)</h3>
          <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', fontWeight: 'bold', color: '#38ef7d' }}>{totalActiveLoans}</p>
        </div>
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333', flex: 1 }}>
          <h3 style={{ margin: 0, color: '#aaa', fontSize: '0.9rem', textTransform: 'uppercase' }}>Deuda Total (Pág Act.)</h3>
          <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', fontWeight: 'bold', color: '#ff8a00' }}>${totalDebt.toFixed(2)}</p>
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
              <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>Usuario</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>Estado</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>Préstamos Históricos</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>Libros Retenidos</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>Deuda Viva</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.user_id} style={{ transition: 'background 0.2s', borderBottom: '1px solid #222' }}>
                <td style={{ padding: '1rem', color: '#fff' }}>
                  <div style={{ fontWeight: 500 }}>{row.full_name}</div>
                  <div style={{ fontSize: '0.8em', color: '#888' }}>{row.email}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.2rem 0.6rem', 
                    borderRadius: '4px', 
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    background: row.user_status === 'active' ? '#113311' : '#331111',
                    color: row.user_status === 'active' ? '#38ef7d' : '#ff4d4d' 
                  }}>
                    {row.user_status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: '#aaa', fontWeight: 'bold' }}>{row.total_lifetime_loans}</td>
                <td style={{ padding: '1rem', color: Number(row.currently_borrowed_items) > 0 ? '#ff8a00' : '#888' }}>
                  {row.currently_borrowed_items}
                </td>
                <td style={{ padding: '1rem', color: Number(row.total_unpaid_debt) > 0 ? '#ff4d4d' : '#888', fontWeight: 'bold' }}>
                  ${Number(row.total_unpaid_debt).toFixed(2)}
                </td>
              </tr>
            ))}
            {data.length === 0 && !fetchError && (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#555' }}>No hay actividad de usuarios.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#888' }}>Mostrando página {page} de {Math.max(1, totalPages)} (Total: {total})</span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {page > 1 && (
            <a href={`/reports/users?page=${page - 1}${search ? `&search=${encodeURIComponent(search)}` : ''}`} style={{ padding: '0.5rem 1rem', background: '#333', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}>
              Anterior
            </a>
          )}
          {page < totalPages && (
            <a href={`/reports/users?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ''}`} style={{ padding: '0.5rem 1rem', background: '#11998e', color: '#fff', fontWeight: 'bold', textDecoration: 'none', borderRadius: '4px' }}>
              Siguiente
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
