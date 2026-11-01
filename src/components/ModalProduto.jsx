import { useState } from 'react'
import { moeda } from '../lib/moeda'

function dica(min, max, total) {
  if (min === 0 && max >= total) return 'Opcional'
  if (min === max) return `Escolha ${max}`
  if (min === 0) return `Escolha até ${max}`
  return `Escolha de ${min} a ${max}`
}

export default function ModalProduto({ produto, onFechar, onConfirmar }) {
  const grupos = [...produto.produto_grupos].sort(
    (a, b) => a.grupos_opcao.ordem - b.grupos_opcao.ordem
  )

  const [escolhas, setEscolhas] = useState({}) // { grupoId: [opcao, ...] }

  function alternar(grupoId, opcao, maximo) {
    setEscolhas((atual) => {
      const lista = atual[grupoId] ?? []
      if (lista.some((o) => o.id === opcao.id)) {
        return { ...atual, [grupoId]: lista.filter((o) => o.id !== opcao.id) }
      }
      if (maximo === 1) return { ...atual, [grupoId]: [opcao] } // troca a escolha
      if (lista.length >= maximo) return atual // limite atingido
      return { ...atual, [grupoId]: [...lista, opcao] }
    })
  }

  const selecionadas = Object.values(escolhas).flat()
  const extra = selecionadas.reduce((soma, o) => soma + Number(o.preco_adicional), 0)
  const valido = grupos.every(
    (pg) => (escolhas[pg.grupos_opcao.id]?.length ?? 0) >= pg.minimo
  )

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50" onClick={onFechar}>
      <div
        className="mx-auto max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-white p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">{produto.nome}</h2>
            <p className="text-sm text-gray-500">{produto.descricao}</p>
          </div>
          <button onClick={onFechar} className="text-2xl leading-none text-gray-400">×</button>
        </div>

        {grupos.map((pg) => {
          const grupo = pg.grupos_opcao
          const lista = escolhas[grupo.id] ?? []
          const opcoes = [...grupo.opcoes].sort((a, b) => a.ordem - b.ordem)

          return (
            <section key={grupo.id} className="mt-5">
              <div className="flex items-baseline justify-between">
                <h3 className="font-semibold text-purple-900">{grupo.nome}</h3>
                <span className="text-xs text-gray-500">
                  {dica(pg.minimo, pg.maximo, opcoes.length)}
                  {pg.minimo > 0 && ' • obrigatório'}
                </span>
              </div>

              <ul className="mt-2 space-y-2">
                {opcoes.map((o) => {
                  const marcada = lista.some((x) => x.id === o.id)
                  const bloqueada = !marcada && pg.maximo > 1 && lista.length >= pg.maximo
                  return (
                    <li key={o.id}>
                      <label
                        className={`flex items-center justify-between rounded-lg border p-3 ${
                          marcada ? 'border-purple-600 bg-purple-50' : 'border-gray-200'
                        } ${bloqueada ? 'opacity-40' : ''}`}
                      >
                        <span className="flex items-center gap-3">
                          <input
                            type={pg.maximo === 1 ? 'radio' : 'checkbox'}
                            name={grupo.id}
                            checked={marcada}
                            disabled={bloqueada}
                            onChange={() => alternar(grupo.id, o, pg.maximo)}
                          />
                          {o.nome}
                        </span>
                        {Number(o.preco_adicional) > 0 && (
                          <span className="text-sm text-gray-600">
                            + {moeda(o.preco_adicional)}
                          </span>
                        )}
                      </label>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}

        <button
          disabled={!valido}
          onClick={() => onConfirmar(selecionadas)}
          className="mt-6 w-full rounded-xl bg-green-600 py-3 font-semibold text-white disabled:bg-gray-300"
        >
          Adicionar • {moeda(Number(produto.preco) + extra)}
        </button>
      </div>
    </div>
  )
}