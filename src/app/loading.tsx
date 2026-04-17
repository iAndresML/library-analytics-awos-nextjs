export default function Loading() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '60vh', 
      flexDirection: 'column', 
      gap: '1.5rem',
      color: '#fff'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '4px solid #222',
        borderTop: '4px solid #00c6ff',
        borderRadius: '50%',
        animation: 'spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite'
      }} />
      <p style={{ color: '#888', fontWeight: '500', letterSpacing: '1px' }}>ACCEDIENDO A DATA MARTS...</p>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
