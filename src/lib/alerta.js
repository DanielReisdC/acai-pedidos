let ctx = null

// Chamar dentro de um clique: o navegador só libera o som depois de uma ação da pessoa
export function ativarSom() {
  try {
    const Contexto = window.AudioContext || window.webkitAudioContext
    if (!ctx) ctx = new Contexto()
    if (ctx.state === 'suspended') ctx.resume()
    tocarAviso() // toca uma vez para confirmar que está funcionando
  } catch {
    // aparelho sem suporte a áudio
  }
}

export function tocarAviso() {
  if (!ctx) return
  try {
    if (ctx.state === 'suspended') ctx.resume()
    const agora = ctx.currentTime
    const toques = [
      [0, 880],
      [0.4, 880],
      [0.8, 1175],
    ]
    toques.forEach(([inicio, frequencia]) => {
      const oscilador = ctx.createOscillator()
      const ganho = ctx.createGain()
      oscilador.frequency.value = frequencia
      oscilador.connect(ganho)
      ganho.connect(ctx.destination)
      ganho.gain.setValueAtTime(0.0001, agora + inicio)
      ganho.gain.exponentialRampToValueAtTime(0.4, agora + inicio + 0.03)
      ganho.gain.exponentialRampToValueAtTime(0.0001, agora + inicio + 0.35)
      oscilador.start(agora + inicio)
      oscilador.stop(agora + inicio + 0.4)
    })
  } catch {
    // ignora falhas de áudio
  }
}

export async function pedirPermissaoNotificacao() {
  if (!('Notification' in window)) return 'indisponivel'
  if (Notification.permission === 'default') return Notification.requestPermission()
  return Notification.permission
}

export function notificar(titulo, corpo) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  try {
    new Notification(titulo, { body: corpo })
  } catch {
    // alguns celulares não aceitam esse tipo de notificação
  }
}