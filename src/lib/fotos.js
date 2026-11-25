const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const PRESET = import.meta.env.VITE_CLOUDINARY_PRESET
console.log(
  'Variáveis VITE no site:',
  Object.keys(import.meta.env).filter((k) => k.startsWith('VITE_'))
)

// Reduz a foto no navegador antes de enviar (fotos de celular têm vários MB)
export function redimensionar(arquivo, maxLado = 1200) {
  return new Promise((resolve, reject) => {
    const imagem = new Image()
    const url = URL.createObjectURL(arquivo)

    imagem.onload = () => {
      const escala = Math.min(1, maxLado / Math.max(imagem.width, imagem.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(imagem.width * escala)
      canvas.height = Math.round(imagem.height * escala)

      const contexto = canvas.getContext('2d')
      contexto.fillStyle = '#ffffff' // fundo branco para PNG com transparência
      contexto.fillRect(0, 0, canvas.width, canvas.height)
      contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height)

      URL.revokeObjectURL(url)
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Falha ao processar a imagem'))),
        'image/jpeg',
        0.85
      )
    }

    imagem.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Imagem inválida'))
    }

    imagem.src = url
  })
}

// Envia para o Cloudinary e devolve o endereço da imagem
export async function enviarFoto(arquivo) {
  if (!CLOUD || !PRESET) {
    throw new Error('as variáveis do Cloudinary não estão configuradas neste site')
  }

  const blob = await redimensionar(arquivo)
  const dados = new FormData()
  dados.append('file', blob)
  dados.append('upload_preset', PRESET)

  const resposta = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
    method: 'POST',
    body: dados,
  })
  const resultado = await resposta.json().catch(() => ({}))

  if (!resposta.ok) {
    throw new Error(resultado?.error?.message ?? `falha no envio (${resposta.status})`)
  }
  return resultado.secure_url
}
// Pede ao Cloudinary a imagem já recortada e em formato leve
export function fotoOtimizada(url, largura = 240, altura = largura) {
  if (!url || !url.includes('/upload/')) return url
  return url.replace(
    '/upload/',
    `/upload/f_auto,q_auto,c_fill,g_auto,w_${largura},h_${altura}/`
  )
}