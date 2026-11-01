import { useState } from 'react'
import { Link } from 'react-router-dom'
import AdminProdutos from './AdminProdutos'
import AdminOpcoes from './AdminOpcoes'

export default function CardapioAdmin() {
  const [aba, setAba] = useState('produtos')

  return (
    <div className="mx-auto min-h-screen max-w-3xl bg-purple-50 p-4">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-purple-900">Cardápio</h1>
        <Link to="/painel" className="text-sm text-purple-800 underline">← Pedidos</Link>
      </header>

      <div className="mb-4 flex gap-2">
        {[['produtos', 'Produtos'], ['opcoes', 'Seções e opções']].map(([id, rotulo]) => (
          <button
            key={id}
            onClick={() => setAba(id)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              aba === id ? 'bg-purple-700 text-white' : 'bg-white text-purple-900'
            }`}
          >
            {rotulo}
          </button>
        ))}
      </div>

      {aba === 'produtos' ? <AdminProdutos /> : <AdminOpcoes />}
    </div>
  )
}