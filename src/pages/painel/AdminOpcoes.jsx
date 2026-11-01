import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Campo from '../../components/Campo'
import { decimal, inteiro } from '../../lib/numeros'

function NovaOpcao({ grupo, aoCriar }) {
  const [nome, setNome] = useState('')
  const [preco, setPreco] = useState('0')

  async function enviar(e) {
    e.preventDefault()
    if (!nome.trim()) return
    const ordem = Math.max(0, ...grupo.opcoes.map((o) => o.ordem)) + 1
    await aoCriar({
      grupo_id: grupo.id,
      nome: nome.trim(),
      preco_adicional: decimal(preco) ?? 0,
      ordem,
    })
    setNome('')
    setPreco('0')
  }

  return (
    <form onSubmit={enviar} className="mt-3 flex gap-2 border-t pt-3">
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nova opção"
        className="flex-1 rounded border border-gray-200 p-2"
      />
      <input
        type="number"
        step="0.01"
        min="0"
        value={preco}
        onChange={(e) => setPreco(e.target.value)}
        title="Preço adicional"
        className="w-24 rounded border border-gray-200 p-2"
      />
      <button className="rounded bg-purple-700 px-3 text-white">Adicionar</button>
    </form>
  )
}

export default function AdminOpcoes() {
  const [grupos, setGrupos] = useState([])
  const [novoGrupo, setNovoGrupo] = useState('')
  const [erro, setErro] = useState(null)

  const carregar = useCallback(async () => {
    const { data, error } = await supabase
      .from('grupos_opcao')
      .select('*, opcoes(*)')
      .order('ordem')
    if (error) setErro('Erro ao carregar.')
    else setGrupos(data)
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  async function executar(consulta) {
    const { error } = await consulta
    setErro(error ? 'Não foi possível salvar.' : null)
    await carregar()
  }

  async function criarGrupo(e) {
    e.preventDefault()
    const nome = novoGrupo.trim()
    if (!nome) return
    const ordem = Math.max(0, ...grupos.map((g) => g.ordem)) + 1
    await executar(supabase.from('grupos_opcao').insert({ nome, ordem }))
    setNovoGrupo('')
  }

  const atualizarGrupo = (id, campos) =>
    executar(supabase.from('grupos_opcao').update(campos).eq('id', id))
  const atualizarOpcao = (id, campos) =>
    executar(supabase.from('opcoes').update(campos).eq('id', id))

  return (
    <div className="space-y-4">
      {erro && <p className="text-red-600">{erro}</p>}

      {grupos.map((g) => (
        <section
          key={g.id}
          className={`rounded-xl bg-white p-4 shadow-sm ${g.ativo ? '' : 'opacity-60'}`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Campo
              valor={g.nome}
              onSalvar={(v) => atualizarGrupo(g.id, { nome: v })}
              className="min-w-40 flex-1 font-semibold"
            />
            <label className="flex items-center gap-1 text-xs text-gray-500">
              Ordem
              <Campo
                tipo="number"
                valor={g.ordem}
                onSalvar={(v) => {
                  const n = inteiro(v)
                  if (n !== null) atualizarGrupo(g.id, { ordem: n })
                }}
                className="w-14"
              />
            </label>
            <label className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={g.ativo}
                onChange={(e) => atualizarGrupo(g.id, { ativo: e.target.checked })}
              />
              Ativo
            </label>
          </div>

          <ul className="mt-3 space-y-2">
            {[...g.opcoes]
              .sort((a, b) => a.ordem - b.ordem)
              .map((o) => (
                <li
                  key={o.id}
                  className={`flex flex-wrap items-center gap-2 ${o.ativo ? '' : 'opacity-50'}`}
                >
                  <Campo
                    valor={o.nome}
                    onSalvar={(v) => atualizarOpcao(o.id, { nome: v })}
                    className="min-w-32 flex-1"
                  />
                  <span className="text-sm text-gray-500">R$</span>
                  <Campo
                    tipo="number"
                    step="0.01"
                    min="0"
                    valor={Number(o.preco_adicional).toFixed(2)}
                    onSalvar={(v) => {
                      const n = decimal(v)
                      if (n !== null) atualizarOpcao(o.id, { preco_adicional: n })
                    }}
                    title="Preço adicional"
                    className="w-20"
                  />
                  <Campo
                    tipo="number"
                    valor={o.ordem}
                    onSalvar={(v) => {
                      const n = inteiro(v)
                      if (n !== null) atualizarOpcao(o.id, { ordem: n })
                    }}
                    title="Ordem"
                    className="w-14"
                  />
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={o.ativo}
                      onChange={(e) => atualizarOpcao(o.id, { ativo: e.target.checked })}
                    />
                    Ativo
                  </label>
                </li>
              ))}
          </ul>

          <NovaOpcao
            grupo={g}
            aoCriar={(nova) => executar(supabase.from('opcoes').insert(nova))}
          />
        </section>
      ))}

      <form
        onSubmit={criarGrupo}
        className="flex gap-2 rounded-xl border-2 border-dashed border-purple-200 p-4"
      >
        <input
          value={novoGrupo}
          onChange={(e) => setNovoGrupo(e.target.value)}
          placeholder="Nova seção (ex.: Frutas)"
          className="flex-1 rounded border border-gray-200 p-2"
        />
        <button className="rounded bg-purple-700 px-4 text-white">Criar seção</button>
      </form>
    </div>
  )
}