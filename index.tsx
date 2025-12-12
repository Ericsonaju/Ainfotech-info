
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// --- SISTEMA DE CAPTURA DE ERRO GLOBAL (DEBUG) ---
// Isso garante que se o app quebrar antes de carregar, o erro aparece na tela.
window.onerror = function (message, source, lineno, colno, error) {
  const errorDiv = document.getElementById('global-error-display') || document.createElement('div');
  errorDiv.id = 'global-error-display';
  errorDiv.style.position = 'fixed';
  errorDiv.style.top = '0';
  errorDiv.style.left = '0';
  errorDiv.style.width = '100%';
  errorDiv.style.backgroundColor = '#450a0a'; // Dark Red
  errorDiv.style.color = '#fecaca'; // Light Red
  errorDiv.style.padding = '20px';
  errorDiv.style.zIndex = '999999';
  errorDiv.style.fontFamily = 'monospace';
  errorDiv.style.whiteSpace = 'pre-wrap';
  errorDiv.innerHTML = `<strong>CRITICAL ERROR:</strong>\n${message}\nAt: ${source}:${lineno}:${colno}\n\nStack:\n${error?.stack || 'No stack trace'}`;
  document.body.appendChild(errorDiv);
  return false;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

try {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
} catch (e: any) {
    console.error("React Mount Error:", e);
    document.body.innerHTML = `<div style="color:red; padding:20px;"><h1>Falha na Montagem do React</h1><pre>${e.message}\n${e.stack}</pre></div>`;
}
