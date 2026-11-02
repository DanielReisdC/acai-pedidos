import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { moeda } from '../lib/moeda'
import { formatarTelefone, telefoneValido } from '../lib/telefone'
import { useCarrinho } from '../context/CarrinhoContext'
const ENTREGA_DISPONIVEL = false
function Entrada({ rotulo, obrigatorio = false, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-medium">
        {rotulo}
        {!obrigatorio && <span className="font-normal text-gray-400"> (opcional)</span>}
      </span>
      <input
        {...props}
        className="mt-1 w-full rounded-lg border border-purple-200 bg-white p-3"
      />
    </label>
  )
}

export default function Carrinho() {
  const { itens, alterarQuantidade, remover, limpar, total } = useCarrinho()
  const [tipo, setTipo] = useState('retirada') // 'retirada' | 'entrega'
  const [dados, setDados] = useState({
    nome: '',
    telefone: '',
    rua: '',
    numero: '',
    bairro: '',
    complemento: '',
    referencia: '',
  })
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)
  const navigate = useNavigate()

  const alterar = (campo) => (e) =>
    setDados((atual) => ({ ...atual, [campo]: e.target.value }))

  async function finalizar() {
    setErro(null)

    if (!dados.nome.trim()) {
      setErro('Informe seu nome.')
      return
    }
    if (!telefoneValido(dados.telefone)) {
      setErro('Informe um telefone com DDD, por exemplo (00) 00000-0000.')
      return
    }
    if (
      tipo === 'entrega' &&
      (!dados.rua.trim() || !dados.numero.trim() || !dados.bairro.trim())
    ) {
      setErro('Preencha rua, número e bairro.')
      return
    }

    setEnviando(true)
    const { data, error } = await supabase.rpc('criar_pedido', {
      p_nome: dados.nome,
      p_telefone: dados.telefone,
      p_tipo: tipo,
      p_endereco:
        tipo === 'entrega'
          ? {
              rua: dados.rua,
              numero: dados.numero,
              bairro: dados.bairro,
              complemento: dados.complemento,
              referencia: dados.referencia,
            }
          : {},
      p_itens: itens.map((i) => ({
        produto_id: i.produto_id,
        quantidade: i.quantidade,
        opcoes: i.opcoes.map((o) => o.id),
      })),
    })
    setEnviando(false)

    if (error) {
      setErro('Não foi possível enviar o pedido. Confira os dados e tente novamente.')
      return
    }

    limpar()
    navigate(`/pedido/${data}`)
  }

  return (
    <div className="mx-auto min-h-screen max-w-xl bg-purple-50 p-4 pb-10">
      <Link to="/cardapio" className="text-purple-800">← Voltar ao cardápio</Link>
      <h1 className="mb-4 mt-2 text-2xl font-bold">Seu pedido</h1>

      {itens.length === 0 ? (
        <p>Seu carrinho está vazio.</p>
      ) : (
        <>
          <ul className="space-y-3">
            {itens.map((i) => (
              <li
                key={i.chave}
                className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm"
              >
                <div className="pr-3">
                  <p className="font-medium">{i.nome}</p>
                  {i.opcoes.length > 0 && (
                    <p className="text-sm text-gray-500">
                      {i.opcoes.map((o) => o.nome).join(', ')}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">{moeda(i.preco)} cada</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => alterarQuantidade(i.chave, -1)}
                      disabled={i.quantidade <= 1}
                      className="h-8 w-8 rounded-full bg-purple-100 text-lg disabled:opacity-40"
                    >
                      −
                    </button>
                    <span className="w-4 text-center">{i.quantidade}</span>
                    <button
                      onClick={() => alterarQuantidade(i.chave, 1)}
                      disabled={i.quantidade >= 50}
                      className="h-8 w-8 rounded-full bg-purple-100 text-lg disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  <button onClick={() => remover(i.chave)} className="text-sm text-red-600">
                    Remover
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{moeda(total)}</span>
          </div>

          <h2 className="mb-2 mt-8 text-lg font-semibold text-purple-900">
            Como você quer receber?
          </h2>
          <div className="grid grid-cols-2 gap-3">
  {[
    ['retirada', 'Retirar no local', true],
    ['entrega', 'Entrega', ENTREGA_DISPONIVEL],
  ].map(([valor, rotulo, disponivel]) => (
    <button
      key={valor}
      type="button"
      disabled={!disponivel}
      onClick={() => setTipo(valor)}
      className={`rounded-xl border-2 p-3 font-semibold ${
        !disponivel
          ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
          : tipo === valor
            ? 'border-purple-700 bg-purple-100 text-purple-900'
            : 'border-gray-200 bg-white text-gray-600'
      }`}
    >
      {rotulo}
      {!disponivel && <span className="block text-xs font-medium">Em breve</span>}
    </button>
  ))}
</div>

          <h2 className="mb-2 mt-8 text-lg font-semibold text-purple-900">Seus dados</h2>
          <div className="space-y-3">
            <Entrada
              rotulo="Nome"
              obrigatorio
              value={dados.nome}
              onChange={alterar('nome')}
              maxLength={60}
              autoComplete="name"
              placeholder="Como devemos te chamar?"
            />
            <Entrada
              rotulo="Telefone (com DDD)"
              obrigatorio
              type="tel"
              inputMode="tel"
              value={dados.telefone}
              onChange={(e) =>
                setDados((atual) => ({ ...atual, telefone: formatarTelefone(e.target.value) }))
              }
              autoComplete="tel"
              placeholder="(00) 00000-0000"
            />
          </div>

          {tipo === 'entrega' && (
            <>
              <h2 className="mb-2 mt-8 text-lg font-semibold text-purple-900">
                Endereço de entrega
              </h2>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Entrada
                    rotulo="Rua"
                    obrigatorio
                    className="flex-1"
                    value={dados.rua}
                    onChange={alterar('rua')}
                    maxLength={120}
                    autoComplete="address-line1"
                  />
                  <Entrada
                    rotulo="Número"
                    obrigatorio
                    className="w-24"
                    value={dados.numero}
                    onChange={alterar('numero')}
                    maxLength={20}
                  />
                </div>
                <Entrada
                  rotulo="Bairro"
                  obrigatorio
                  value={dados.bairro}
                  onChange={alterar('bairro')}
                  maxLength={80}
                />
                <Entrada
                  rotulo="Complemento"
                  value={dados.complemento}
                  onChange={alterar('complemento')}
                  maxLength={80}
                  placeholder="Apto, bloco, casa dos fundos..."
                />
                <Entrada
                  rotulo="Ponto de referência"
                  value={dados.referencia}
                  onChange={alterar('referencia')}
                  maxLength={120}
                  placeholder="Perto de..."
                />
              </div>
            </>
          )}

          <p className="mt-3 text-xs text-gray-500">
            {tipo === 'entrega'
              ? 'Usamos seu telefone e endereço apenas para entregar e contatar você sobre este pedido.'
              : 'Usamos seu telefone apenas para contatar você sobre este pedido.'}
          </p>

          {erro && <p className="mt-3 text-red-600">{erro}</p>}
              <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                O pagamento é feito na loja, no momento da retirada.
              </p>
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