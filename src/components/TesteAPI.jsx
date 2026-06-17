import { useState } from 'react'
import { useAPI } from '../hooks/useAPI'

export function TesteAPI() {
  const { carregando, erro, dados, testarConexao, gerarRoteiro, analisarPerfil } = useAPI()
  const [prompt, setPrompt] = useState('Criar roteiro de vídeo sobre nutrição')
  const [username, setUsername] = useState('clinicabellavita')

  return (
    <div style={{
      padding: '20px',
      maxWidth: '500px',
      margin: '20px auto',
      border: '2px solid #007bff',
      borderRadius: '8px',
      backgroundColor: '#f8f9fa'
    }}>
      <h2>🧪 Teste de Conexão Frontend ↔ Backend</h2>

      <button
        onClick={testarConexao}
        disabled={carregando}
        style={{
          padding: '10px 20px',
          marginBottom: '10px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        {carregando ? '⏳ Testando...' : '✅ Testar Conexão'}
      </button>

      {erro && (
        <div style={{
          padding: '10px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px',
          marginBottom: '10px'
        }}>
          ❌ Erro: {erro}
        </div>
      )}

      {dados && (
        <div style={{
          padding: '10px',
          backgroundColor: '#d4edda',
          color: '#155724',
          borderRadius: '4px',
          marginBottom: '10px'
        }}>
          ✅ Conectado!<br />
          <small>{JSON.stringify(dados)}</small>
        </div>
      )}

      <hr />

      <h3>💎 Analisar Perfil (Gemini)</h3>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Digite @ do Instagram"
        style={{
          width: '100%',
          padding: '8px',
          marginBottom: '10px',
          fontFamily: 'monospace',
          fontSize: '12px',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}
      />

      <button
        onClick={() => analisarPerfil(username)}
        disabled={carregando}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4285f4',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          width: '100%',
          marginBottom: '10px'
        }}
      >
        {carregando ? '⏳ Analisando...' : '💎 Analisar com Gemini'}
      </button>

      {dados?.analise && (
        <div style={{
          padding: '10px',
          marginBottom: '10px',
          backgroundColor: '#e8f5e9',
          border: '1px solid #81c784',
          borderRadius: '4px',
          fontSize: '12px',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          {dados.analise}
        </div>
      )}

      <hr />

      <h3>🎬 Gerar Roteiro (Claude)</h3>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        style={{
          width: '100%',
          minHeight: '80px',
          padding: '8px',
          marginBottom: '10px',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}
      />

      <button
        onClick={() => gerarRoteiro(prompt, 'video')}
        disabled={carregando}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        {carregando ? '⏳ Gerando...' : '🎬 Gerar Roteiro'}
      </button>

      {dados?.roteiro && (
        <div style={{
          padding: '10px',
          marginTop: '10px',
          backgroundColor: '#e7f3ff',
          border: '1px solid #b3d9ff',
          borderRadius: '4px',
          fontSize: '12px',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          {dados.roteiro}
        </div>
      )}
    </div>
  )
}
