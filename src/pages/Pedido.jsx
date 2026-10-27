import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { moeda } from './Cardapio'

const STATUS = {
  aguardando_pagamento: 'Aguardando pagamento',
  pago: 'Pagamento confirmado',
  em_preparo: 'Em preparo',
  pronto: 'Pronto para retirada!',
  retirado: 'Retirado',
  cancelado: 'Cancelado',
}

export default function Pedido() {
  const { id } = useParams()
  const [pedido, setPedido] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let ativo = true

    async function carregar() {
      const { data } = await supabase.rpc('buscar_pedido', { p_id: id })
      if (ativo) {
        setPedido(data)
        setCarregando(false)
      }
    }

    carregar()
    const timer = setInterval(carregar, 5000) // atualiza a cada 5 segundos
    return () => {
      ativo = false
      clearInterval(timer)
    }
  }, [id])

  if (carregando) return <p className="p-6">Carregando...</p>

  if (!pedido) {
    return (
      <div className="p-6">
        <p>Pedido não encontrado.</p>
        <Link to="/" className="text-purple-800">Voltar ao cardápio</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-screen max-w-xl bg-purple-50 p-4">
      <div className="rounded-xl bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-gray-500">Pedido</p>
        <p className="text-5xl font-bold text-purple-800">#{pedido.numero}</p>
        <p className="mt-2">{pedido.nome_cliente}</p>
        <p className="mt-4 inline-block rounded-full bg-purple-100 px-4 py-2 font-semibold text-purple-900">
          {STATUS[pedido.status] ?? pedido.status}
        </p>
      </div>

      <ul className="mt-4 space-y-2">
        {pedido.itens.map((i, idx) => (
          <li key={idx} className="flex justify-between rounded-lg bg-white p-3">
            <span>{i.quantidade}x {i.nome_produto}</span>
            <span>{moeda(i.quantidade * i.preco_unitario)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-between text-lg font-bold">
        <span>Total</span>
        <span>{moeda(pedido.total)}</span>
      </div>

      <Link to="/" className="mt-6 block text-center text-purple-800">Fazer outro pedido</Link>
    </div>
  )
}