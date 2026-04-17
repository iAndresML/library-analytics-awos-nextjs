import { ReportsService } from '@/services/reports.service';
import { FinesSummaryDTO, FinesSummarySchema } from '@/models/report.schema';

export const revalidate = 0;

export default async function FinesSummaryPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const parsedParams = FinesSummarySchema.safeParse({
    page: searchParams.page,
    limit: searchParams.limit || 5
  });

  const page = parsedParams.success ? parsedParams.data.page : 1;
  const limit = parsedParams.success ? parsedParams.data.limit : 5;

  let reportData: { data: FinesSummaryDTO[]; total: number } = { data: [], total: 0 };
  let fetchError: string | null = null;

  try {
    reportData = await ReportsService.getFinesSummary({ page, limit });
  } catch (err) {
    fetchError = "No connection to database. Asegúrate de levantar Docker Compose.";
  }

  const { data, total } = reportData;
  const totalPages = Math.ceil(total / limit);
  
  const globalTotalMultas = data.reduce((acc, row) => acc + Number(row.total_multas), 0);
  const globalPagadas = data.reduce((acc, row) => acc + Number(row.multas_pagadas), 0);
  const globalPendientes = data.reduce((acc, row) => acc + Number(row.multas_pendientes), 0);

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ borderBottom: '1px solid #333', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#ff4d4d' }}>
          Resumen de Multas
        </h1>
        <p style={{ color: '#888', marginTop: '0.5rem' }}>Evolución mensual de la emisión y pago de deudas.</p>
      </header>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333', flex: 1 }}>
          <h3 style={{ margin: 0, color: '#aaa', fontSize: '0.9rem', textTransform: 'uppercase' }}>Emitido (Pág Act.)</h3>
          <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>${globalTotalMultas.toFixed(2)}</p>
        </div>
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333', flex: 1 }}>
          <h3 style={{ margin: 0, color: '#aaa', fontSize: '0.9rem', textTransform: 'uppercase' }}>Recuperado (Pág Act.)</h3>
          <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', fontWeight: 'bold', color: '#38ef7d' }}>${globalPagadas.toFixed(2)}</p>
        </div>
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333', flex: 1 }}>
          <h3 style={{ margin: 0, color: '#aaa', fontSize: '0.9rem', textTransform: 'uppercase' }}>Pendiente (Pág Act.)</h3>
          <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', fontWeight: 'bold', color: '#ff4d4d' }}>${globalPendientes.toFixed(2)}</p>
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
              <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>Mes</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #333', textAlign: 'right' }}>Total Emitido</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #333', textAlign: 'right' }}>Pagado</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #333', textAlign: 'right' }}>Pendiente</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #333', textAlign: 'right' }}>% Éxito</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.month} style={{ transition: 'background 0.2s', borderBottom: '1px solid #222' }}>
                <td style={{ padding: '1rem', fontWeight: 500, color: '#fff', fontSize: '1.1rem' }}>{row.month}</td>
                <td style={{ padding: '1rem', color: '#aaa', textAlign: 'right' }}>${Number(row.total_multas).toFixed(2)}</td>
                <td style={{ padding: '1rem', color: '#38ef7d', fontWeight: 'bold', textAlign: 'right' }}>${Number(row.multas_pagadas).toFixed(2)}</td>
                <td style={{ padding: '1rem', color: '#ff4d4d', fontWeight: 'bold', textAlign: 'right' }}>${Number(row.multas_pendientes).toFixed(2)}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <span style={{ 
                    padding: '0.2rem 0.6rem', 
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    background: Number(row.porcentaje_pagadas) >= 50 ? '#113311' : '#331111',
                    color: Number(row.porcentaje_pagadas) >= 50 ? '#38ef7d' : '#ff4d4d'
                  }}>
                    {Number(row.porcentaje_pagadas).toFixed(2)}%
                  </span>
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
        <span style={{ color: '#888' }}>Página {page} de {Math.max(1, totalPages)} (Total: {total} Meses)</span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {page > 1 && (
            <a href={`/reports/fines-summary?page=${page - 1}`} style={{ padding: '0.5rem 1rem', background: '#333', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}>
              Anterior
            </a>
          )}
          {page < totalPages && (
            <a href={`/reports/fines-summary?page=${page + 1}`} style={{ padding: '0.5rem 1rem', background: '#ff4d4d', color: '#fff', fontWeight: 'bold', textDecoration: 'none', borderRadius: '4px' }}>
              Siguiente
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
