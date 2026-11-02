
import logo from "../assets/Lumari.png";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-purple-50 px-5 py-10 sm:px-8">

      {/* Conteúdo principal */}
      <main className="flex w-full max-w-xl flex-col items-center text-center">

        {/* Logo */}
        <img
          src={logo}
          alt="Lumari"
          className="mb-8 w-44 object-contain sm:mb-10 sm:w-56 md:w-64"
        />

        {/* Boas-vindas */}
        <h1 className="mb-4 text-2xl font-bold leading-tight text-purple-900 sm:text-3xl md:text-4xl">
          Seja bem-vindo à Lumari!
        </h1>

        <p className="mb-8 max-w-md text-base leading-relaxed text-purple-700 sm:text-lg">
          
          Faça o seu pedido aqui
        </p>

        {/* Botão */}
        <a
          href="/cardapio"
          className="w-full max-w-xs rounded-xl bg-purple-700 px-8 py-4 text-center text-base font-semibold text-white shadow-lg transition duration-300 hover:scale-105 hover:bg-purple-800 active:scale-95 sm:text-lg"
        >
          Ver cardápio
        </a>

      </main>

    </div>
  );
}
