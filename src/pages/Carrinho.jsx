import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCarrinho } from '../context/CarrinhoContext'
import { moeda } from './Cardapio'

export default function Carrinho() {
  const { itens, alterarQuantidade, limpar, total } = useCarrinho()
  const [nome, setNome] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)
  const navigate = useNavigate()

  async function finalizar() {
    setErro(null)
    if (!nome.trim()) {
      setErro('Informe seu nome.')
      return
    }

    setEnviando(true)
    const { data, error } = await supabase.rpc('criar_pedido', {
      p_nome: nome,
      p_itens: itens.map((i) => ({ produto_id: i.id, quantidade: i.quantidade })),
    })
    setEnviando(false)

    if (error) {
      setErro('Não foi possível enviar o pedido. Tente novamente.')
      return
    }

    limpar()
    navigate(`/pedido/${data}`)
  }

  return (
    <div className="mx-auto min-h-screen max-w-xl bg-purple-50 p-4">
      <Link to="/" className="text-purple-800">← Voltar ao cardápio</Link>
      <h1 className="mb-4 mt-2 text-2xl font-bold">Seu pedido</h1>

      {itens.length === 0 ? (
        <p>Seu carrinho está vazio.</p>
      ) : (
        <>
          <ul className="space-y-3">
            {itens.map((i) => (
              <li key={i.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
                <div>
                  <p className="font-medium">{i.nome}</p>
                  <p className="text-sm text-gray-500">{moeda(i.preco)} cada</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => alterarQuantidade(i.id, -1)} className="h-8 w-8 rounded-full bg-purple-100 text-lg">−</button>
                  <span className="w-4 text-center">{i.quantidade}</span>
                  <button onClick={() => alterarQuantidade(i.id, 1)} className="h-8 w-8 rounded-full bg-purple-100 text-lg">+</button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{moeda(total)}</span>
          </div>

          <label className="mt-6 block">
            <span className="text-sm font-medium">Seu nome</span>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              maxLength={60}
              placeholder="Como devemos te chamar?"
              className="mt-1 w-full rounded-lg border border-purple-200 bg-white p-3"
            />
          </label>

          {erro && <p className="mt-3 text-red-600">{erro}</p>}

          <button
            onClick={finalizar}
            disabled={enviando}
            className="mt-4 w-full rounded-xl bg-green-600 py-3 font-semibold text-white disabled:bg-gray-300"
          >
            {enviando ? 'Enviando...' : 'Finalizar pedido'}
          </button>
        </>
      )}
    </div>
  )
}