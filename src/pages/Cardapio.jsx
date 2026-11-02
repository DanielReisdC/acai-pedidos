import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { moeda } from '../lib/moeda'
import { useCarrinho } from '../context/CarrinhoContext'
import ModalProduto from '../components/ModalProduto'
import PedidoEmAndamento from '../components/PedidoEmAndamento'

export { moeda } // mantém funcionando os imports antigos

// Deixa só seções e opções ativas (e descarta seções sem nenhuma opção)
function limparProduto(p) {
  return {
    ...p,
    produto_grupos: p.produto_grupos
      .filter((pg) => pg.grupos_opcao?.ativo)
      .map((pg) => ({
        ...pg,
        grupos_opcao: {
          ...pg.grupos_opcao,
          opcoes: pg.grupos_opcao.opcoes.filter((o) => o.ativo),
        },
      }))
      .filter((pg) => pg.grupos_opcao.opcoes.length > 0),
  }
}

const temOpcoes = (p) => p.produto_grupos.length > 0

export default function Cardapio() {
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [produtoAberto, setProdutoAberto] = useState(null)
  const { adicionar, total, quantidadeTotal } = useCarrinho()

  useEffect(() => {
    supabase
      .from('produtos')
      .select(`
        *,
        produto_grupos (
          minimo, maximo,
          grupos_opcao (
            id, nome, ordem, ativo,
            opcoes ( id, nome, preco_adicional, ordem, ativo )
          )
        )
      `)
      .eq('ativo', true)
      .order('categoria')
      .order('preco')
      .then(({ data, error }) => {
        if (error) setErro('Não foi possível carregar o cardápio.')
        else setProdutos(data.map(limparProduto))
        setCarregando(false)
      })
  }, [])

  const categorias = [...new Set(produtos.map((p) => p.categoria))]

  return (
    <div className="mx-auto min-h-screen max-w-xl bg-purple-50 pb-28">
      <header className="bg-purple-800 p-6 text-white">
        <h1 className="text-2xl font-bold">Açaí da Casa</h1>
        <p className="text-purple-200">Faça seu pedido e retire na loja</p>
      </header>
      <PedidoEmAndamento />
      <main className="space-y-6 p-4">
        {carregando && <p>Carregando cardápio...</p>}
        {erro && <p className="text-red-600">{erro}</p>}

        {categorias.map((cat) => (
          <section key={cat}>
            <h2 className="mb-2 text-lg font-semibold text-purple-900">{cat}</h2>
            <ul className="space-y-3">
              {produtos
                .filter((p) => p.categoria === cat)
                .map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm"
                  >
                    <div className="pr-3">
                      <p className="font-medium">{p.nome}</p>
                      <p className="text-sm text-gray-500">{p.descricao}</p>
                      <p className="mt-1 font-semibold text-purple-800">{moeda(p.preco)}</p>
                    </div>
                    <button
                      onClick={() => (temOpcoes(p) ? setProdutoAberto(p) : adicionar(p))}
                      className="rounded-lg bg-purple-700 px-4 py-2 text-white active:bg-purple-900"
                    >
                      {temOpcoes(p) ? 'Escolher' : 'Adicionar'}
                    </button>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </main>

      {produtoAberto && (
        <ModalProduto
          produto={produtoAberto}
          onFechar={() => setProdutoAberto(null)}
          onConfirmar={(opcoes) => {
            adicionar(produtoAberto, opcoes)
            setProdutoAberto(null)
          }}
        />
      )}

      {quantidadeTotal > 0 && (
        <Link
          to="/carrinho"
          className="fixed bottom-4 left-1/2 flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 items-center justify-between rounded-xl bg-green-600 px-5 py-4 font-semibold text-white shadow-lg"
        >
          <span>Ver carrinho ({quantidadeTotal})</span>
          <span>{moeda(total)}</span>
        </Link>
      )}
    </div>
  )
}