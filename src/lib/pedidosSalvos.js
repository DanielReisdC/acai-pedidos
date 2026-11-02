const CHAVE = 'pedidos_recentes'
const VALIDADE_MS = 24 * 60 * 60 * 1000

export function lerPedidosSalvos() {
  try {
    const lista = JSON.parse(localStorage.getItem(CHAVE) ?? '[]')
    const agora = Date.now()
    return lista.filter((p) => p?.id && agora - p.criadoEm < VALIDADE_MS)
  } catch {
    return []
  }
}

export function salvarPedido(id) {
  try {
    const lista = lerPedidosSalvos().filter((p) => p.id !== id)
    const nova = [{ id, criadoEm: Date.now() }, ...lista].slice(0, 5)
    localStorage.setItem(CHAVE, JSON.stringify(nova))
  } catch {
    // armazenamento indisponível (aba anônima, por exemplo): segue sem salvar
  }
}