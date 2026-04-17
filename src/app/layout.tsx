import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Library Analytics AWOS',
  description: 'Sistema web orientado a servicios - Reportes de Biblioteca',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#0a0a0a', color: '#fff' }}>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
