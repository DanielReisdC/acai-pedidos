export function rotuloStatus(status, tipo) {
  const entrega = tipo === 'entrega'
  const mapa = {
    aguardando_pagamento: 'Aguardando pagamento',
    pago: 'Pagamento confirmado',
    em_preparo: 'Em preparo',
    pronto: entrega ? 'Pronto para entrega' : 'Pronto para retirada',
    retirado: entrega ? 'Entregue' : 'Retirado',
    cancelado: 'Cancelado',
  }
  return mapa[status] ?? status
}