import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { moeda } from '../Cardapio'

const ROTULO = {
  aguardando_pagamento: 'Aguardando pagamento',
  pago: 'Pago',
  em_preparo: 'Em preparo',
  pronto: 'Pronto para retirada',
  retirado: 'Retirado',
  cancelado: 'Cancelado',
}

const CANCELAR = { texto: 'Cancelar', para: 'cancelado', perigo: true }

const ACOES = {
  aguardando_pagamento: [{ texto: 'Marcar como pago', para: 'pago' }, CANCELAR],
  pago: [{ texto: 'Iniciar preparo', para: 'em_preparo' }, CANCELAR],
  em_preparo: [{ texto: 'Marcar pronto', para: 'pronto' }],
  pronto: [{ texto: 'Marcar retirado', para: 'retirado' }],
}

const ATIVOS = ['aguardando_pagamento', 'pago', 'em_preparo', 'pronto']
const FINALIZADOS = ['retirado', 'cancelado']

export default function PedidosPainel() {
  const [pedidos, setPedidos] = useState([])
  const [aba, setAba] = useState('ativos')
  const [erro, setErro] = useState(null)
  const navigate = useNavigate()

  const carregar = useCallback(async () => {
    let consulta = supabase.from('pedidos').select('*, itens_pedido(*)')

    if (aba === 'ativos') {
      consulta = consulta.in('status', ATIVOS).order('created_at', { ascending: true })
    } else {
      consulta = consulta
        .in('status', FINALIZADOS)
        .order('created_at', { ascending: false })
        .limit(50)
    }

    const { data, error } = await consulta
    if (error) {
      setErro('Erro ao carregar pedidos.')
    } else {
      setErro(null)
      setPedidos(data)
    }
  }, [aba])

  useEffect(() => {
    carregar()
    const canal = supabase
      .channel('painel-pedidos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () =>
        carregar()
      )
      .subscribe()
    return () => {
      supabase.removeChannel(canal)
    }
  }, [carregar])

  async function mudarStatus(id, status) {
    const { error } = await supabase.from('pedidos').update({ status }).eq('id', id)
    if (error) setErro('Não foi possível atualizar o pedido.')
    else carregar()
  }

  async function sair() {
    await supabase.auth.signOut()
    navigate('/painel/login')
  }

  const hora = (iso) =>
    new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="mx-auto min-h-screen max-w-3xl bg-purple-50 p-4">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-purple-900">Pedidos</h1>
        <button onClick={sair} className="text-sm text-purple-800 underline">Sair</button>
      </header>

      <div className="mb-4 flex gap-2">
        {['ativos', 'finalizados'].map((a) => (
          <button
            key={a}
            onClick={() => setAba(a)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              aba === a ? 'bg-purple-700 text-white' : 'bg-white text-purple-900'
            }`}
          >
            {a === 'ativos' ? 'Em andamento' : 'Finalizados'}
          </button>
        ))}
      </div>

      {erro && <p className="mb-3 text-red-600">{erro}</p>}
      {pedidos.length === 0 && <p className="text-gray-500">Nenhum pedido por aqui.</p>}

      <ul className="space-y-4">
        {pedidos.map((p) => (
          <li key={p.id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xl font-bold text-purple-800">#{p.numero}</p>
                <p>{p.nome_cliente}</p>
                <p className="text-sm text-gray-500">{hora(p.created_at)}</p>
              </div>
              <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-900">
                {ROTULO[p.status]}
              </span>
            </div>

            <ul className="my-3 space-y-1 border-t pt-3">
              {p.itens_pedido.map((i) => (
                <li key={i.id} className="flex justify-between text-sm">
                  <span>{i.quantidade}x {i.nome_produto}</span>
                  <span>{moeda(i.quantidade * i.preco_unitario)}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between">
              <p className="font-bold">{moeda(p.total)}</p>
              <div className="flex gap-2">
                {(ACOES[p.status] ?? []).map((a) => (
                  <button
                    key={a.para}
                    onClick={() => mudarStatus(p.id, a.para)}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                      a.perigo ? 'bg-red-100 text-red-700' : 'bg-green-600 text-white'
                    }`}
                  >
                    {a.texto}
                  </button>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}