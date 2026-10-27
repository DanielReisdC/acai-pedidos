import { Routes, Route } from 'react-router-dom'
import Cardapio from './pages/Cardapio'
import Carrinho from './pages/Carrinho'
import Pedido from './pages/Pedido'
import LoginPainel from './pages/painel/Login'
import PedidosPainel from './pages/painel/Pedidos'
import RotaProtegida from './components/RotaProtegida'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Cardapio />} />
      <Route path="/carrinho" element={<Carrinho />} />
      <Route path="/pedido/:id" element={<Pedido />} />
      <Route path="/painel/login" element={<LoginPainel />} />
      <Route
        path="/painel"
        element={
          <RotaProtegida>
            <PedidosPainel />
          </RotaProtegida>
        }
      />
    </Routes>
  )
}