import { ReportsService } from '@/services/reports.service';
import { InventoryDTO, InventoryReportSchema } from '@/models/report.schema';

export const revalidate = 0;

export default async function InventoryPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const parsedParams = InventoryReportSchema.safeParse({
    page: searchParams.page,
    limit: searchParams.limit || 5,
    category: searchParams.category
  });

  const page = parsedParams.success ? parsedParams.data.page : 1;
  const limit = parsedParams.success ? parsedParams.data.limit : 5;
  const category = parsedParams.success ? parsedParams.data.category : undefined;

  let reportData: { data: InventoryDTO[]; total: number } = { data: [], total: 0 };
  let fetchError: string | null = null;

  try {
    reportData = await ReportsService.getInventoryAnalytics({ page, limit, category });
  } catch (err) {
    fetchError = "No connection to database. Asegúrate de levantar Docker Compose.";
  }

  const { data, total } = reportData;
  const totalPages = Math.ceil(total / limit);

  const globalCopies = data.reduce((acc, row) => acc + Number(row.total_copies_owned), 0);
  const globalAvailable = data.reduce((acc, row) => acc + Number(row.available_copies), 0);

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ borderBottom: '1px solid #333', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#00c6ff' }}>
          Inventario Analítico
        </h1>
        <p style={{ color: '#888', marginTop: '0.5rem' }}>Análisis de circulación y estatus físico del catálogo.</p>
      </header>

      <form method="GET" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: '#111', padding: '1rem', borderRadius: '8px', border: '1px solid #333', flexWrap: 'wrap' }}>
        <input type="hidden" name="page" value="1" />
        <div style={{ flex: '1 1 250px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '0.5rem' }}>Categoría (Coincidencia exacta)</label>
          <input 
            type="text" 
            name="category" 
            defaultValue={category || ''} 
            placeholder="Ej: Ficción, Tecnología, Ciencias"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button type="submit" style={{ padding: '0.75rem 1.5rem', background: '#00c6ff', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Filtrar
          </button>
        </div>
      </form>

      {category && (
        <div style={{ marginBottom: '2rem', color: '#aaa', background: '#1a1a1a', padding: '0.75rem', borderRadius: '4px', borderLeft: '4px solid #00c6ff' }}>
          Resultados para categoría: <strong>"{category}"</strong>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333', flex: 1 }}>
          <h3 style={{ margin: 0, color: '#aaa', fontSize: '0.9rem', textTransform: 'uppercase' }}>Títulos Únicos</h3>
          <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', fontWeight: 'bold', color: '#00c6ff' }}>{total}</p>
        </div>
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333', flex: 1 }}>
          <h3 style={{ margin: 0, color: '#aaa', fontSize: '0.9rem', textTransform: 'uppercase' }}>Copias Visibles (Pág)</h3>
          <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>{globalCopies} ({globalAvailable} stock)</p>
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
              <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>Título</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>ISBN / Categoría</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>Copias Propias</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>Disponibles</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>Pérdida</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.book_id} style={{ transition: 'background 0.2s', borderBottom: '1px solid #222' }}>
                <td style={{ padding: '1rem', fontWeight: 500, color: '#fff' }}>{row.title}</td>
                <td style={{ padding: '1rem', color: '#aaa', fontSize: '0.85em' }}>{row.isbn}<br />{row.category}</td>
                <td style={{ padding: '1rem', color: '#00c6ff', fontWeight: 'bold' }}>{row.total_copies_owned}</td>
                <td style={{ padding: '1rem', color: '#00ff88' }}>{row.available_copies}</td>
                <td style={{ padding: '1rem', color: Number(row.loss_rate_percentage) > 0 ? '#ff4d4d' : '#888' }}>
                  {row.loss_rate_percentage}%
                </td>
              </tr>
            ))}
            {data.length === 0 && !fetchError && (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#555' }}>No hay registros.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#888' }}>Página {page} de {Math.max(1, totalPages)} (Total: {total})</span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {page > 1 && (
            <a href={`/reports/inventory?page=${page - 1}${category ? `&category=${encodeURIComponent(category)}` : ''}`} style={{ padding: '0.5rem 1rem', background: '#333', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}>
              Anterior
            </a>
          )}
          {page < totalPages && (
            <a href={`/reports/inventory?page=${page + 1}${category ? `&category=${encodeURIComponent(category)}` : ''}`} style={{ padding: '0.5rem 1rem', background: '#00c6ff', color: '#000', fontWeight: 'bold', textDecoration: 'none', borderRadius: '4px' }}>
              Siguiente
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
