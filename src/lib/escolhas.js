import { moeda } from './moeda'

// Itens do pedido na ordem em que foram adicionados
export const itensOrdenados = (itens = []) =>
  [...itens].sort((a, b) => (a.posicao ?? 0) - (b.posicao ?? 0))

const extraDe = (escolha) => Number(escolha.preco_adicional) || 0

// preco_unitario guarda produto + adicionais; aqui sai só o preço original do produto
export const precoBase = (item) =>
  Number(item.preco_unitario) -
  (item.itens_pedido_opcoes ?? []).reduce((soma, e) => soma + extraDe(e), 0)

// Agrupa as escolhas de um item por seção.
// Retorna [{ grupo: 'Adicionais', itens: [...], texto: 'Nutella (+ R$ 5,00)' }]
export function agruparEscolhas(escolhas = [], quantidade = 1) {
  const sufixo = quantidade > 1 ? ' cada' : ''

  const ordenadas = [...escolhas].sort(
    (a, b) =>
      (a.ordem_grupo ?? 999) - (b.ordem_grupo ?? 999) ||
      (a.ordem_opcao ?? 999) - (b.ordem_opcao ?? 999)
  )

  const grupos = new Map()
  ordenadas.forEach((e) => {
    const nome = e.nome_grupo ?? 'Outros'
    if (!grupos.has(nome)) grupos.set(nome, [])
    grupos.get(nome).push({ nome: e.nome_opcao, extra: extraDe(e) })
  })

  return [...grupos].map(([grupo, itens]) => ({
    grupo,
    itens,
    texto: itens
      .map((o) => (o.extra > 0 ? `${o.nome} (+ ${moeda(o.extra)}${sufixo})` : o.nome))
      .join(', '),
  }))
}