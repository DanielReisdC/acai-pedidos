export default function Campo({
  valor,
  onSalvar,
  tipo = 'text',
  permiteVazio = false,
  className = '',
  ...resto
}) {
  return (
    <input
      key={String(valor)}
      type={tipo}
      defaultValue={valor}
      onBlur={(e) => {
        const novo = e.target.value.trim()
        if (novo === String(valor)) return
        if (novo === '' && !permiteVazio) return
        onSalvar(novo)
      }}
      className={`rounded border border-gray-200 p-1 ${className}`}
      {...resto}
    />
  )
}