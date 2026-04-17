import { ReportsService } from '@/services/reports.service';
import { MostBorrowedBooksDTO, MostBorrowedBooksSchema } from '@/models/report.schema';

export const revalidate = 0;

export default async function TopBooksPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const parsedParams = MostBorrowedBooksSchema.safeParse({
    page: searchParams.page,
    limit: searchParams.limit || 10
  });

  const page = parsedParams.success ? parsedParams.data.page : 1;
  const limit = parsedParams.success ? parsedParams.data.limit : 10;

  let reportData: { data: MostBorrowedBooksDTO[]; total: number } = { data: [], total: 0 };
  let fetchError: string | null = null;

  try {
    reportData = await ReportsService.getMostBorrowedBooks({ page, limit });
  } catch (err) {
    fetchError = "No connection to database. Asegúrate de levantar Docker Compose.";
  }

  const { data, total } = reportData;
  const totalPages = Math.ceil(total / limit);
  const globalLoans = data.reduce((acc, row) => acc + Number(row.total_loans), 0);

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ borderBottom: '1px solid #333', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#ffb347' }}>
          Libros más prestados
        </h1>
        <p style={{ color: '#888', marginTop: '0.5rem' }}>Análisis de popularidad del catálogo basado en el historial de préstamos.</p>
      </header>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333', flex: 1 }}>
          <h3 style={{ margin: 0, color: '#aaa', fontSize: '0.9rem', textTransform: 'uppercase' }}>Total Préstamos (Pág Act.)</h3>
          <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', fontWeight: 'bold', color: '#ffb347' }}>{globalLoans}</p>
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
              <th style={{ padding: '1rem', borderBottom: '1px solid #333', width: '80px', textAlign: 'center' }}>Ranking</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>Título</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>Autor</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #333', textAlign: 'right' }}>Préstamos</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.book_id} style={{ transition: 'background 0.2s', borderBottom: '1px solid #222' }}>
                <td style={{ padding: '1rem', fontSize: '1.2rem', fontWeight: 'bold', color: '#ffb347', textAlign: 'center' }}>
                  #{row.ranking}
                </td>
                <td style={{ padding: '1rem', fontWeight: 500, color: '#fff' }}>{row.title}</td>
                <td style={{ padding: '1rem', color: '#aaa' }}>{row.author}</td>
                <td style={{ padding: '1rem', color: '#38ef7d', fontWeight: 'bold', textAlign: 'right' }}>{row.total_loans}</td>
              </tr>
            ))}
            {data.length === 0 && !fetchError && (
              <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#555' }}>No hay registros.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#888' }}>Página {page} de {Math.max(1, totalPages)} (Total: {total} Títulos)</span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {page > 1 && (
            <a href={`/reports/top-books?page=${page - 1}`} style={{ padding: '0.5rem 1rem', background: '#333', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}>
              Anterior
            </a>
          )}
          {page < totalPages && (
            <a href={`/reports/top-books?page=${page + 1}`} style={{ padding: '0.5rem 1rem', background: '#ffb347', color: '#000', fontWeight: 'bold', textDecoration: 'none', borderRadius: '4px' }}>
              Siguiente
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
