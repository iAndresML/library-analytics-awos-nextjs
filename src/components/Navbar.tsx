'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Inicio', path: '/' },
    { name: 'Morosidad', path: '/reports/overdue' },
    { name: 'Inventario', path: '/reports/inventory' },
    { name: 'Usuarios', path: '/reports/users' },
    { name: 'Top Libros', path: '/reports/top-books' },
    { name: 'Multas Mensuales', path: '/reports/fines-summary' },
    { name: 'Act. Préstamos', path: '/reports/loan-activity' },
  ];

  return (
    <nav style={{ 
      background: '#0d0d0d', 
      padding: '1rem 2rem', 
      display: 'flex', 
      gap: '2rem', 
      borderBottom: '1px solid #333',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      alignItems: 'center'
    }}>
      <div style={{ color: '#fff', fontWeight: 'bold', marginRight: 'auto', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        AWOS System
      </div>
      {navItems.map(item => {
        const isActive = pathname === item.path;
        return (
          <Link key={item.path} href={item.path} style={{
            color: isActive ? '#00c6ff' : '#888',
            textDecoration: 'none',
            fontWeight: isActive ? '600' : 'normal',
            borderBottom: isActive ? '2px solid #00c6ff' : '2px solid transparent',
            paddingBottom: '0.4rem',
            transition: 'all 0.2s ease'
          }}>
            {item.name}
          </Link>
        )
      })}
    </nav>
  );
}
