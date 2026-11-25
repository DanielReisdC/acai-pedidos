import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Campo from '../../components/Campo'
import { decimal, inteiro } from '../../lib/numeros'
import { enviarFoto, fotoOtimizada } from '../../lib/fotos'

function VincularGrupo({ disponiveis, aoVincular }) {
  const [grupoId, setGrupoId] = useState('')
  if (disponiveis.length === 0) return null

  return (
    <div className="mt-3 flex gap-2">
      <select
        value={grupoId}
        onChange={(e) => setGrupoId(e.target.value)}
        className="flex-1 rounded border border-gray-200 p-2 text-sm"
      >
        <option value="">Adicionar seção de escolhas...</option>
        {disponiveis.map((g) => (
          <option key={g.id} value={g.id}>{g.nome}</option>
        ))}
      </select>
      <button
        disabled={!grupoId}
        onClick={() => {
          aoVincular(grupoId)
          setGrupoId('')
        }}
        className="rounded bg-purple-700 px-3 text-sm text-white disabled:bg-gray-300"
      >
        Adicionar
      </button>
    </div>
  )
}

function NovoProduto({ categorias, aoCriar }) {
  const [nome, setNome] = useState('')
  const [preco, setPreco] = useState('')
  const [categoria, setCategoria] = useState('Açaí')

  async function enviar(e) {
    e.preventDefault()
    const valor = decimal(preco)
    if (!nome.trim() || preco === '' || valor === null || !categoria.trim()) return
    await aoCriar({ nome: nome.trim(), preco: valor, categoria: categoria.trim() })
    setNome('')
    setPreco('')
  }

  return (
    <form onSubmit={enviar} className="rounded-xl border-2 border-dashed border-purple-200 p-4">
      <p className="mb-2 font-semibold text-purple-900">Novo produto</p>
      <div className="flex flex-wrap gap-2">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome (ex.: Açaí 1 litro)"
          className="min-w-40 flex-1 rounded border border-gray-200 p-2"
        />
        <input
          type="number"
          step="0.01"
          min="0"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          placeholder="Preço"
          className="w-28 rounded border border-gray-200 p-2"
        />
        <input
          list="categorias"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="w-32 rounded border border-gray-200 p-2"
        />
        <datalist id="categorias">
          {categorias.map((c) => <option key={c} value={c} />)}
        </datalist>
        <button className="cursor-pointer rounded bg-purple-700 px-4 text-white">Criar</button>
      </div>
    </form>
  )
}
function FotoProduto({ produto, aoMudar, aoErro }) {
  const [enviando, setEnviando] = useState(false)
  const miniatura = fotoOtimizada(produto.foto_url, 160)

  async function escolher(e) {
    const arquivo = e.target.files?.[0]
    e.target.value = '' // permite escolher o mesmo arquivo de novo
    if (!arquivo) return

    setEnviando(true)
    try {
      const url = await enviarFoto(arquivo)
      const { error } = await supabase
        .from('produtos')
        .update({ foto_url: url })
        .eq('id', produto.id)
      if (error) throw error
      aoErro(null)
    } catch (erro) {
  console.error('Erro ao enviar foto:', erro)
  aoErro(`Não foi possível enviar a foto: ${erro.message ?? 'erro desconhecido'}`)
}
    setEnviando(false)
    aoMudar()
  }

  async function remover() {
    setEnviando(true)
    const { error } = await supabase
      .from('produtos')
      .update({ foto_url: null })
      .eq('id', produto.id)
    if (error) aoErro('Não foi possível remover a foto.')
    setEnviando(false)
    aoMudar()
  }

  return (
    <div className="flex items-center gap-3">
      {miniatura ? (
        <img src={miniatura} alt="" className="h-16 w-16 rounded-lg object-cover" />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
          sem foto
        </div>
      )}
      <div className="flex flex-col gap-1 text-sm">
        <label className="cursor-pointer font-medium text-purple-800 underline">
          {enviando ? 'Enviando...' : miniatura ? 'Trocar foto' : 'Adicionar foto'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={enviando}
            onChange={escolher}
          />
        </label>
        {miniatura && !enviando && (
          <button onClick={remover} className="text-left text-red-600">
            Remover foto
          </button>
        )}
      </div>
    </div>
  )
}

export default function AdminProdutos() {
  const [produtos, setProdutos] = useState([])
  const [grupos, setGrupos] = useState([])
  const [erro, setErro] = useState(null)

  const carregar = useCallback(async () => {
    const [p, g] = await Promise.all([
      supabase
        .from('produtos')
        .select('*, produto_grupos(grupo_id, minimo, maximo)')
        .order('categoria')
        .order('nome'),
      supabase.from('grupos_opcao').select('id, nome, ordem, ativo').order('ordem'),
    ])
    if (p.error || g.error) {
      setErro('Erro ao carregar.')
    } else {
      setProdutos(p.data)
      setGrupos(g.data)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  async function executar(consulta, mensagem = 'Não foi possível salvar.') {
    const { error } = await consulta
    setErro(error ? mensagem : null)
    await carregar()
  }

  const atualizarProduto = (id, campos) =>
    executar(supabase.from('produtos').update(campos).eq('id', id))

  const salvarLimite = (produtoId, grupoId, campos) =>
    executar(
      supabase
        .from('produto_grupos')
        .update(campos)
        .eq('produto_id', produtoId)
        .eq('grupo_id', grupoId),
      'Confira os limites: o mínimo não pode passar do máximo, e o máximo deve ser pelo menos 1.'
    )

  const vincular = (produtoId, grupoId) =>
    executar(
      supabase
        .from('produto_grupos')
        .insert({ produto_id: produtoId, grupo_id: grupoId, minimo: 0, maximo: 1 })
    )

  const desvincular = (produtoId, grupoId) =>
    executar(
      supabase
        .from('produto_grupos')
        .delete()
        .eq('produto_id', produtoId)
        .eq('grupo_id', grupoId)
    )

  const achar = (id) => grupos.find((g) => g.id === id)
  const categorias = [...new Set(produtos.map((p) => p.categoria))]

  return (
    <div className="space-y-4">
      {erro && <p className="text-red-600">{erro}</p>}

      
<ul className="space-y-4">
  {produtos.map((p) => {
    const vinculos = [...p.produto_grupos].sort(
      (a, b) => (achar(a.grupo_id)?.ordem ?? 0) - (achar(b.grupo_id)?.ordem ?? 0)
    )

    const disponiveis = grupos.filter(
      (g) => g.ativo && !p.produto_grupos.some((pg) => pg.grupo_id === g.id)
    )

    return (
      <li
        key={p.id}
        className={`rounded-xl bg-white p-4 shadow-sm ${p.ativo ? '' : 'opacity-60'}`}
      >
      
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

          {/* Nome */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">
              Nome do produto
            </label>
            <Campo
              valor={p.nome}
              onSalvar={(v) => atualizarProduto(p.id, { nome: v })}
              className="w-full font-semibold"
            />
          </div>
          

          {/* Preço */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">
              Preço (R$)
            </label>
            <Campo
              tipo="number"
              step="0.01"
              min="0"
              valor={Number(p.preco).toFixed(2)}
              onSalvar={(v) => {
                const n = decimal(v)
                if (n !== null) atualizarProduto(p.id, { preco: n })
              }}
              className="w-full"
            />
          </div>

          {/* Descrição */}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-gray-500">
              Descrição do produto
            </label>
            <Campo
              valor={p.descricao ?? ''}
              permiteVazio
              onSalvar={(v) => atualizarProduto(p.id, { descricao: v || null })}
              placeholder="Ex.: Açaí cremoso com acompanhamentos à escolha"
              className="w-full"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">
              Categoria
            </label>
            <Campo
              valor={p.categoria}
              onSalvar={(v) => atualizarProduto(p.id, { categoria: v })}
              className="w-full"
            />
          </div>

          {/* Status */}
          <div>
            <span className="mb-1 block text-xs font-semibold text-gray-500">
              Disponibilidade
            </span>
            <label className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm">
              <input
                type="checkbox"
                checked={p.ativo}
                onChange={(e) =>
                  atualizarProduto(p.id, { ativo: e.target.checked })
                }
                className="accent-purple-700"
              />
              {p.ativo ? 'Produto ativo' : 'Produto inativo'}
            </label>
          </div>
            <div className="mt-3">
  <FotoProduto produto={p} aoMudar={carregar} aoErro={setErro} />
</div>
        </div>


        {/* Escolhas do cliente */}
        <details className="mt-4 border-t pt-3">
          <summary className="cursor-pointer text-sm font-semibold text-purple-800">
            Escolhas do cliente ({vinculos.length})
          </summary>

          <ul className="mt-3 space-y-3">
            {vinculos.map((pg) => (
              <li
                key={pg.grupo_id}
                className="flex flex-wrap items-end gap-3 rounded-lg bg-purple-50 p-3 text-sm"
              >
                <div className="min-w-32 flex-1">
                  <span className="mb-1 block text-xs font-semibold text-gray-500">
                    Grupo de opções
                  </span>
                  <p className="font-medium text-purple-900">
                    {achar(pg.grupo_id)?.nome}
                    {achar(pg.grupo_id)?.ativo === false && ' (inativa)'}
                  </p>
                </div>

                <label>
                  <span className="mb-1 block text-xs font-semibold text-gray-500">
                    Mínimo
                  </span>
                  <Campo
                    tipo="number"
                    min="0"
                    valor={pg.minimo}
                    onSalvar={(v) => {
                      const n = inteiro(v)
                      if (n !== null && n >= 0)
                        salvarLimite(p.id, pg.grupo_id, { minimo: n })
                    }}
                    className="w-16"
                  />
                </label>

                <label>
                  <span className="mb-1 block text-xs font-semibold text-gray-500">
                    Máximo
                  </span>
                  <Campo
                    tipo="number"
                    min="1"
                    valor={pg.maximo}
                    onSalvar={(v) => {
                      const n = inteiro(v)
                      if (n !== null && n >= 1)
                        salvarLimite(p.id, pg.grupo_id, { maximo: n })
                    }}
                    className="w-16"
                  />
                </label>

                <button
                  onClick={() => desvincular(p.id, pg.grupo_id)}
                  className="pb-2 text-red-600 hover:underline"
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>

          <VincularGrupo
            disponiveis={disponiveis}
            aoVincular={(grupoId) => vincular(p.id, grupoId)}
          />
        </details>
      </li>
    )
  })}
</ul>


      <NovoProduto
        categorias={categorias}
        aoCriar={(novo) => executar(supabase.from('produtos').insert(novo))}
      />
    </div>
  )
}