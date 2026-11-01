import { createContext, useContext, useState } from 'react'

const CarrinhoContext = createContext()

export function CarrinhoProvider({ children }) {
  const [itens, setItens] = useState([])

  function adicionar(produto, opcoes = []) {
    const chave = `${produto.id}|${opcoes.map((o) => o.id).sort().join(',')}`
    const extra = opcoes.reduce((soma, o) => soma + Number(o.preco_adicional), 0)

    setItens((atual) => {
      const existe = atual.find((i) => i.chave === chave)
      if (existe) {
        return atual.map((i) =>
          i.chave === chave ? { ...i, quantidade: i.quantidade + 1 } : i
        )
      }
      return [
        ...atual,
        {
          chave,
          produto_id: produto.id,
          nome: produto.nome,
          opcoes,
          preco: Number(produto.preco) + extra,
          quantidade: 1,
        },
      ]
    })
  }

  function alterarQuantidade(chave, delta) {
    setItens((atual) =>
      atual
        .map((i) => (i.chave === chave ? { ...i, quantidade: i.quantidade + delta } : i))
        .filter((i) => i.quantidade > 0)
    )
  }

  function limpar() {
    setItens([])
  }

  const total = itens.reduce((soma, i) => soma + i.preco * i.quantidade, 0)
  const quantidadeTotal = itens.reduce((soma, i) => soma + i.quantidade, 0)

  return (
    <CarrinhoContext.Provider
      value={{ itens, adicionar, alterarQuantidade, limpar, total, quantidadeTotal }}
    >
      {children}
    </CarrinhoContext.Provider>
  )
}

export const useCarrinho = () => useContext(CarrinhoContext)