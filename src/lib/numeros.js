export const decimal = (v) => {
  const n = Number(v)
  return Number.isNaN(n) || n < 0 ? null : n
}

export const inteiro = (v) => {
  const n = parseInt(v, 10)
  return Number.isNaN(n) ? null : n
}