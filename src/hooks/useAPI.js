import { useState, useCallback } from 'react'
import { api } from '../api/client'

export function useAPI() {
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)
  const [dados, setDados] = useState(null)

  const testarConexao = useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      const resposta = await api.health()
      setDados(resposta.data)
      return { sucesso: true, dados: resposta.data }
    } catch (e) {
      setErro(e.message)
      return { sucesso: false, erro: e.message }
    } finally {
      setCarregando(false)
    }
  }, [])

  const gerarRoteiro = useCallback(async (prompt, tipo = 'video') => {
    setCarregando(true)
    setErro(null)
    try {
      const resposta = await api.claude.gerarRoteiro(prompt, tipo)
      setDados(resposta.data)
      return { sucesso: true, dados: resposta.data }
    } catch (e) {
      setErro(e.message)
      return { sucesso: false, erro: e.message }
    } finally {
      setCarregando(false)
    }
  }, [])

  const analisarPerfil = useCallback(async (username) => {
    setCarregando(true)
    setErro(null)
    try {
      const resposta = await api.gemini.analisarPerfil(username)
      setDados(resposta.data)
      return { sucesso: true, dados: resposta.data }
    } catch (e) {
      setErro(e.message)
      return { sucesso: false, erro: e.message }
    } finally {
      setCarregando(false)
    }
  }, [])

  return {
    carregando,
    erro,
    dados,
    testarConexao,
    gerarRoteiro,
    analisarPerfil
  }
}
