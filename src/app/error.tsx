'use client'; 

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Audit logging seguro sin ensuciar la vista SSR UI.
    console.error("AWOS Runtime Guard Caught:", error);
  }, [error]);

  return (
    <div style={{ 
      padding: '3rem', 
      maxWidth: '600px', 
      margin: '4rem auto', 
      background: '#1a0000', 
      border: '1px solid #4a0000', 
      borderRadius: '8px',
      textAlign: 'center'
    }}>
      <h2 style={{ color: '#ff4d4d', margin: '0 0 1rem', fontSize: '1.8rem' }}>
        Conexión Interrumpida
      </h2>
      <p style={{ color: '#aaa', marginBottom: '2rem', lineHeight: '1.5' }}>
        El servicio analítico no pudo resolver la petición en los clústers operacionales. 
        Este error suele desencadenarse por saturación de red o caídas de instancia en la base de datos PostgreSQL.
      </p>
      <button
        onClick={() => reset()}
        style={{
          background: '#ff4d4d',
          color: '#fff',
          border: 'none',
          padding: '0.8rem 1.5rem',
          borderRadius: '4px',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
      >
        Reintentar Conexión
      </button>
    </div>
  );
}
