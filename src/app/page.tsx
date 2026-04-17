import Link from 'next/link';
import { ReportsService } from '@/services/reports.service';
import { MostBorrowedBooksDTO, LoanActivityDTO } from '@/models/report.schema';

export const revalidate = 0; // SSR dinámico — datos siempre frescos

// ─────────────────────────────────────────────
// Tipos de datos para el dashboard
// ─────────────────────────────────────────────
interface DashboardKPIs {
  activeLoans: number;
  overdueUsers: number;
  totalDebt: number;
  availableBooks: number;
}

// ─────────────────────────────────────────────
// Helpers de estilo reutilizables
// ─────────────────────────────────────────────
const card = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  background: '#111',
  border: '1px solid #222',
  borderRadius: '12px',
  padding: '1.5rem',
  ...extra,
});

// ─────────────────────────────────────────────
// Server Component principal
// ─────────────────────────────────────────────
export default async function DashboardPage() {
  // ── Fetch en paralelo de las tres fuentes necesarias ──────────────
  let kpis: DashboardKPIs = { activeLoans: 0, overdueUsers: 0, totalDebt: 0, availableBooks: 0 };
  let topBooks: MostBorrowedBooksDTO[] = [];
  let recentActivity: LoanActivityDTO[] = [];
  let fetchError: string | null = null;

  try {
    const [overdueResult, inventoryResult, usersResult, topBooksResult, activityResult] =
      await Promise.all([
        ReportsService.getOverdueAndFines({ page: 1, limit: 100 }),
        ReportsService.getInventoryAnalytics({ page: 1, limit: 200 }),
        ReportsService.getUserActivity({ page: 1, limit: 200 }),
        ReportsService.getMostBorrowedBooks({ page: 1, limit: 5 }),
        ReportsService.getLoanActivity({ page: 1, limit: 7 }),
      ]);

    // KPI: usuarios morosos = total de registros con deuda activa
    kpis.overdueUsers = overdueResult.total;

    // KPI: deuda acumulada total sumada desde todos los registros
    kpis.totalDebt = overdueResult.data.reduce(
      (acc, row) => acc + Number(row.current_fine_amount),
      0
    );

    // KPI: libros disponibles = suma de available_copies de toda la colección
    kpis.availableBooks = inventoryResult.data.reduce(
      (acc, row) => acc + Number(row.available_copies),
      0
    );

    // KPI: préstamos activos = suma de currently_borrowed_items de todos los usuarios
    kpis.activeLoans = usersResult.data.reduce(
      (acc, row) => acc + Number(row.currently_borrowed_items),
      0
    );

    topBooks = topBooksResult.data;
    recentActivity = activityResult.data;
  } catch {
    fetchError = 'Sin conexión a la base de datos. Asegúrate de levantar Docker Compose.';
  }

  // ── Accesos rápidos ───────────────────────────────────────────────
  const quickLinks = [
    {
      label: 'Morosidad',
      href: '/reports/overdue',
      icon: '⚠️',
      desc: 'Préstamos vencidos y multas',
      color: '#ff4d4d',
    },
    {
      label: 'Inventario',
      href: '/reports/inventory',
      icon: '📚',
      desc: 'Catálogo y disponibilidad',
      color: '#00c6ff',
    },
    {
      label: 'Usuarios',
      href: '/reports/users',
      icon: '👤',
      desc: 'Actividad y deudas por usuario',
      color: '#a78bfa',
    },
    {
      label: 'Top Libros',
      href: '/reports/top-books',
      icon: '🏆',
      desc: 'Libros más prestados',
      color: '#ff8a00',
    },
    {
      label: 'Multas Mensuales',
      href: '/reports/fines-summary',
      icon: '💰',
      desc: 'Resumen mensual de multas',
      color: '#34d399',
    },
    {
      label: 'Act. Préstamos',
      href: '/reports/loan-activity',
      icon: '📊',
      desc: 'Movimiento diario de préstamos',
      color: '#f472b6',
    },
  ];

  // ── Tarjetas KPI ──────────────────────────────────────────────────
  const kpiCards = [
    {
      label: 'Préstamos Activos',
      value: kpis.activeLoans.toLocaleString('es-MX'),
      icon: '📖',
      accent: '#00c6ff',
      sub: 'Items actualmente en circulación',
    },
    {
      label: 'Usuarios Morosos',
      value: kpis.overdueUsers.toLocaleString('es-MX'),
      icon: '⚠️',
      accent: '#ff4d4d',
      sub: 'Con préstamos vencidos',
    },
    {
      label: 'Deuda Acumulada',
      value: `$${kpis.totalDebt.toFixed(2)}`,
      icon: '💸',
      accent: '#ff8a00',
      sub: 'Total de multas pendientes',
    },
    {
      label: 'Libros Disponibles',
      value: kpis.availableBooks.toLocaleString('es-MX'),
      icon: '✅',
      accent: '#34d399',
      sub: 'Copias listas para préstamo',
    },
  ];

  return (
    <main style={{ padding: '2rem', maxWidth: '1300px', margin: '0 auto' }}>

      {/* ── HEADER ───────────────────────────────────────────── */}
      <header style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' }}>
          <h1 style={{
            margin: 0,
            fontSize: '2.4rem',
            fontWeight: 800,
            background: 'linear-gradient(90deg, #00c6ff, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.1,
          }}>
            Dashboard Ejecutivo
          </h1>
          <span style={{
            background: '#1a1a2e',
            border: '1px solid #333',
            color: '#a78bfa',
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '0.2rem 0.6rem',
            borderRadius: '20px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            verticalAlign: 'middle',
          }}>
            AWOS System
          </span>
        </div>
        <p style={{ color: '#555', marginTop: '0.5rem', fontSize: '0.95rem' }}>
          Resumen general del sistema de biblioteca en tiempo real
        </p>
      </header>

      {/* ── ERROR BANNER ─────────────────────────────────────── */}
      {fetchError && (
        <div style={{
          padding: '1rem 1.25rem',
          background: 'rgba(255,77,77,0.1)',
          color: '#ffaaaa',
          border: '1px solid #ff4d4d44',
          borderRadius: '10px',
          marginBottom: '2rem',
          fontSize: '0.9rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '1.2rem' }}>🔌</span>
          {fetchError}
        </div>
      )}

      {/* ── KPIs ─────────────────────────────────────────────── */}
      <section aria-label="KPIs principales" style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#555', marginBottom: '1rem', fontWeight: 600 }}>
          Indicadores Clave
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}>
          {kpiCards.map((kpi) => (
            <div key={kpi.label} style={{
              ...card(),
              borderLeft: `3px solid ${kpi.accent}`,
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* fondo decorativo sutil */}
              <div style={{
                position: 'absolute',
                right: '-10px',
                top: '-10px',
                fontSize: '4rem',
                opacity: 0.05,
                userSelect: 'none',
                pointerEvents: 'none',
              }}>
                {kpi.icon}
              </div>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{kpi.icon}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: kpi.accent, lineHeight: 1 }}>
                {kpi.value}
              </div>
              <div style={{ color: '#ccc', fontSize: '0.9rem', marginTop: '0.4rem', fontWeight: 600 }}>
                {kpi.label}
              </div>
              <div style={{ color: '#555', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                {kpi.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTENIDO PRINCIPAL (2 columnas) ─────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem',
      }}>

        {/* TOP 5 LIBROS */}
        <section aria-label="Top libros más prestados" style={card()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#eaeaea' }}>
              🏆 Top 5 Libros Más Prestados
            </h2>
            <Link href="/reports/top-books" style={{
              fontSize: '0.75rem',
              color: '#ff8a00',
              textDecoration: 'none',
              border: '1px solid #ff8a0033',
              padding: '0.25rem 0.6rem',
              borderRadius: '20px',
            }}>
              Ver todos →
            </Link>
          </div>

          {topBooks.length === 0 && !fetchError ? (
            <p style={{ color: '#555', fontSize: '0.9rem', textAlign: 'center', padding: '1rem 0' }}>
              Sin datos disponibles
            </p>
          ) : (
            <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {topBooks.map((book, idx) => (
                <li key={book.book_id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.6rem 0.75rem',
                  background: '#181818',
                  borderRadius: '8px',
                  border: '1px solid #222',
                }}>
                  <span style={{
                    minWidth: '1.8rem',
                    height: '1.8rem',
                    background: idx === 0 ? '#ff8a00' : idx === 1 ? '#888' : idx === 2 ? '#cd7f32' : '#222',
                    color: idx < 3 ? '#fff' : '#555',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    flexShrink: 0,
                  }}>
                    {book.ranking}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      color: '#eee',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {book.title}
                    </div>
                    <div style={{ color: '#666', fontSize: '0.78rem' }}>{book.author}</div>
                  </div>
                  <div style={{
                    background: '#ff8a0015',
                    color: '#ff8a00',
                    border: '1px solid #ff8a0033',
                    borderRadius: '20px',
                    padding: '0.2rem 0.6rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}>
                    {Number(book.total_loans).toLocaleString('es-MX')} préstamos
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* ACTIVIDAD RECIENTE */}
        <section aria-label="Actividad reciente de préstamos" style={card()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#eaeaea' }}>
              📊 Actividad Reciente de Préstamos
            </h2>
            <Link href="/reports/loan-activity" style={{
              fontSize: '0.75rem',
              color: '#f472b6',
              textDecoration: 'none',
              border: '1px solid #f472b633',
              padding: '0.25rem 0.6rem',
              borderRadius: '20px',
            }}>
              Ver detalle →
            </Link>
          </div>

          {recentActivity.length === 0 && !fetchError ? (
            <p style={{ color: '#555', fontSize: '0.9rem', textAlign: 'center', padding: '1rem 0' }}>
              Sin datos disponibles
            </p>
          ) : (
            <>
              {/* Encabezado de tabla */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto auto',
                gap: '0.5rem',
                padding: '0.4rem 0.75rem',
                color: '#555',
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                borderBottom: '1px solid #222',
                marginBottom: '0.5rem',
              }}>
                <span>Fecha</span>
                <span style={{ textAlign: 'right' }}>Salidas</span>
                <span style={{ textAlign: 'right' }}>Devoluciones</span>
                <span style={{ textAlign: 'right' }}>Ratio</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {recentActivity.map((row) => {
                  const ratio = Number(row.ratio_return);
                  const ratioColor = ratio >= 1 ? '#34d399' : ratio >= 0.5 ? '#ff8a00' : '#ff4d4d';
                  return (
                    <div key={row.fecha} style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto auto auto',
                      gap: '0.5rem',
                      padding: '0.55rem 0.75rem',
                      background: '#181818',
                      borderRadius: '6px',
                      alignItems: 'center',
                      fontSize: '0.85rem',
                    }}>
                      <span style={{ color: '#aaa' }}>
                        {new Date(row.fecha).toLocaleDateString('es-MX', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span style={{ textAlign: 'right', color: '#00c6ff', fontWeight: 700 }}>
                        {Number(row.total_loans)}
                      </span>
                      <span style={{ textAlign: 'right', color: '#a78bfa', fontWeight: 700 }}>
                        {Number(row.total_returns)}
                      </span>
                      <span style={{
                        textAlign: 'right',
                        color: ratioColor,
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        background: `${ratioColor}15`,
                        border: `1px solid ${ratioColor}33`,
                        padding: '0.1rem 0.4rem',
                        borderRadius: '10px',
                      }}>
                        {ratio.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </div>

      {/* ── ACCESOS RÁPIDOS ───────────────────────────────────── */}
      <section aria-label="Accesos rápidos a reportes" style={{ marginBottom: '2rem' }}>
        <h2 style={{
          fontSize: '0.75rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#555',
          marginBottom: '1rem',
          fontWeight: 600,
        }}>
          Accesos Rápidos
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '0.75rem',
        }}>
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
              <div style={{
                ...card({ padding: '1.1rem 1.25rem' }),
                borderTop: `2px solid ${link.color}`,
                transition: 'background 0.15s, transform 0.15s',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}>
                <span style={{ fontSize: '1.5rem' }}>{link.icon}</span>
                <span style={{ color: '#eee', fontWeight: 700, fontSize: '0.9rem' }}>
                  {link.label}
                </span>
                <span style={{ color: '#555', fontSize: '0.75rem', lineHeight: 1.3 }}>
                  {link.desc}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid #1a1a1a',
        paddingTop: '1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        <span style={{ color: '#333', fontSize: '0.78rem' }}>
          AWOS Library Analytics — Server Component · SSR dinámico
        </span>
        <span style={{ color: '#333', fontSize: '0.78rem' }}>
          Datos en tiempo real desde PostgreSQL
        </span>
      </footer>
    </main>
  );
}