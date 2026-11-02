import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { moeda } from '../lib/moeda'
import { rotuloStatus } from '../lib/status'

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
        <p className="text-sm text-gray-500">
          Pedido • {pedido.tipo_entrega === 'entrega' ? 'Entrega' : 'Retirada no local'}
        </p>
        <p className="text-5xl font-bold text-purple-800">#{pedido.numero}</p>
        <p className="mt-2">{pedido.nome_cliente}</p>
        <p className="mt-4 inline-block rounded-full bg-purple-100 px-4 py-2 font-semibold text-purple-900">
          {rotuloStatus(pedido.status, pedido.tipo_entrega)}
        </p>
      </div>

      {pedido.status === 'aguardando_pagamento' && (
        <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Falta o pagamento</p>
          <p className="mt-1">
            A loja vai te chamar no WhatsApp, no número que você informou, para enviar a
            chave Pix. Depois de pagar, mande o comprovante na conversa. Seu pedido começa a
            ser preparado após a confirmação.
          </p>
        </div>
      )}

      <ul className="mt-4 space-y-2">
        {pedido.itens.map((i, idx) => (
          <li key={idx} className="rounded-lg bg-white p-3">
            <div className="flex justify-between">
              <span>{i.quantidade}x {i.nome_produto}</span>
              <span>{moeda(i.quantidade * i.preco_unitario)}</span>
            </div>
            {i.opcoes.length > 0 && (
              <p className="text-sm text-gray-500">{i.opcoes.join(', ')}</p>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-between text-lg font-bold">
        <span>Total</span>
        <span>{moeda(pedido.total)}</span>
      </div>

      <Link to="/cardapio" className="mt-6 block text-center text-purple-800">Fazer outro pedido</Link>
    </div>
  )
}