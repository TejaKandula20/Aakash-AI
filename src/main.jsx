import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import 'leaflet/dist/leaflet.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[CRITICAL UI ERROR]', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '32px 24px', maxWidth: '720px', margin: '40px auto', fontFamily: 'system-ui, -apple-system, sans-serif', background: '#ffffff', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)', border: '1px solid #fee2e2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#b91c1c', marginBottom: '16px' }}>
            <span style={{ fontSize: '32px' }}>⚠️</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>Aakash AI Recovery Sentinel</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>An interface error occurred during execution</p>
            </div>
          </div>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#b91c1c', fontSize: '12px', overflowX: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace', lineHeight: 1.5 }}>
            {String(this.state.error?.stack || this.state.error?.message || this.state.error)}
          </div>
          <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              style={{ background: '#059669', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(5,150,105,0.25)' }}
            >
              🔄 Reset Cache &amp; Reload Application
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '12px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
