import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { lerPedidosSalvos } from '../lib/pedidosSalvos'
import { rotuloStatus } from '../lib/status'

const ENCERRADOS = ['retirado', 'cancelado']

export default function PedidoEmAndamento() {
  const [pedidos, setPedidos] = useState([])

  useEffect(() => {
    let ativo = true

    async function carregar() {
      const salvos = lerPedidosSalvos()
      const resultados = await Promise.all(
        salvos.map(async ({ id }) => {
          const { data } = await supabase.rpc('buscar_pedido', { p_id: id })
          return data ? { id, ...data } : null
        })
      )
      if (ativo) {
        setPedidos(resultados.filter((p) => p && !ENCERRADOS.includes(p.status)))
      }
    }

    carregar()
    return () => {
      ativo = false
    }
  }, [])

  if (pedidos.length === 0) return null

  return (
    <div className="space-y-2 p-4 pb-0">
      {pedidos.map((p) => (
        <Link
          key={p.id}
          to={`/pedido/${p.id}`}
          className="flex items-center justify-between rounded-xl border-2 border-purple-300 bg-white p-3 shadow-sm"
        >
          <span>
            <span className="block text-sm text-gray-500">Pedido em andamento</span>
            <span className="font-semibold text-purple-900">
              #{p.numero} • {rotuloStatus(p.status, p.tipo_entrega)}
            </span>
          </span>
          <span className="text-sm font-medium text-purple-800">Acompanhar →</span>
        </Link>
      ))}
    </div>
  )
}