import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function RotaProtegida({ children }) {
  const [sessao, setSessao] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSessao(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_evento, nova) =>
      setSessao(nova)
    )
    return () => listener.subscription.unsubscribe()
  }, [])

  if (sessao === undefined) return <p className="p-6">Carregando...</p>
  if (!sessao) return <Navigate to="/painel/login" replace />
  return children
}