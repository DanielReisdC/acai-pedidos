import { Routes, Route } from 'react-router-dom'
import Cardapio from './pages/Cardapio'
import Carrinho from './pages/Carrinho'
import Pedido from './pages/Pedido'
import LoginPainel from './pages/painel/Login'
import PedidosPainel from './pages/painel/Pedidos'
import CardapioAdmin from './pages/painel/CardapioAdmin'
import RotaProtegida from './components/RotaProtegida'
import Home from './pages/Home'


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/carrinho" element={<Carrinho />} />
      <Route path="/pedido/:id" element={<Pedido />} />
      <Route path="/painel/login" element={<LoginPainel />} />
      <Route path="/cardapio" element={<Cardapio />} />
      <Route path="/home" element={<Home />} />
      
      <Route
        path="/painel"
        element={
          <RotaProtegida>
            <PedidosPainel />
          </RotaProtegida>
        }
      />
       <Route
        path="/painel/pedidos"
        element={
          <RotaProtegida>
            <PedidosPainel />
          </RotaProtegida>
        }
      />
      <Route
        path="/painel/cardapio"
        element={
          <RotaProtegida>
            <CardapioAdmin />
          </RotaProtegida>
        }
      />
    </Routes>
  )
}