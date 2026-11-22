export function rotuloStatus(status, tipo, forma) {
  const entrega = tipo === 'entrega'
  const emDinheiro = forma === 'dinheiro'
  const mapa = {
    aguardando_pagamento: emDinheiro
      ? entrega
        ? 'Pagamento na entrega'
        : 'Pagamento na retirada'
      : 'Aguardando pagamento',
    pago: 'Pagamento confirmado',
    em_preparo: 'Em preparo',
    pronto: entrega ? 'Pronto para entrega' : 'Pronto para retirada',
    retirado: entrega ? 'Entregue' : 'Retirado',
    cancelado: 'Cancelado',
  }
  return mapa[status] ?? status
}