import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase, isDemo } from './supabase.js'
import { useAuth } from './auth.jsx'
import {
  tasks as sampleTasks,
  competition as sampleCompetition,
  categories as sampleCategories,
  expenses as sampleExpenses,
} from '../data/sample.js'

const CATEGORY_COLORS = ['#7B61FF', '#CC79A7', '#0072B2', '#009E73', '#E69F00', '#D55E00', '#8C8C8C', '#56B4E9']

const demo = {
  tasks: sampleTasks.map((t) => ({
    id: t.id,
    phase: t.phase,
    title: t.title,
    owner: t.owner,
    due: t.due,
    status: t.status,
    is_lesson: !!t.lesson,
    note: '',
  })),
  competition: {
    name: sampleCompetition.name,
    deadline: sampleCompetition.deadline,
    total_budget: sampleCompetition.totalBudget,
  },
  categories: sampleCategories.map((c, i) => ({ id: c.id, name: c.name, planned: c.planned, color: CATEGORY_COLORS[i], position: i })),
  expenses: sampleExpenses.map((e) => ({
    id: e.id,
    item: e.item,
    amount: e.amount,
    category_id: e.category,
    date: e.date,
    paid_by: e.paidBy,
    note: '',
  })),
}

// How each shared list is sorted when loaded.
const ORDER = { tasks: 'id', categories: 'position', expenses: 'date' }

const DataContext = createContext(null)

// Shared competition data. Every change shows on everyone's screen within about a second.
export function DataProvider({ children }) {
  const { signedIn, userId } = useAuth()
  const [rows, setRows] = useState(isDemo ? { tasks: demo.tasks, categories: demo.categories, expenses: demo.expenses } : { tasks: [], categories: [], expenses: [] })
  const [competition, setCompetition] = useState(isDemo ? demo.competition : null)
  const [loading, setLoading] = useState(!isDemo)

  const load = useCallback(async (table) => {
    const { data } = await supabase.from(table).select('*').order(ORDER[table]).order('id')
    if (data) setRows((r) => ({ ...r, [table]: data }))
  }, [])

  const loadCompetition = useCallback(async () => {
    const { data } = await supabase.from('competition').select('*').eq('id', 1).maybeSingle()
    if (data) setCompetition(data)
  }, [])

  useEffect(() => {
    if (isDemo || !signedIn) return
    Promise.all([...Object.keys(ORDER).map(load), loadCompetition()]).then(() => setLoading(false))
    let channel = supabase.channel('data')
    for (const table of Object.keys(ORDER)) {
      channel = channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => load(table))
    }
    channel = channel.on('postgres_changes', { event: '*', schema: 'public', table: 'competition' }, loadCompetition).subscribe()
    return () => supabase.removeChannel(channel)
  }, [signedIn, load, loadCompetition])

  // Add / change / remove a row. The screen updates straight away; if saving fails it reloads and returns the error.
  async function add(table, row) {
    if (isDemo) {
      setRows((r) => ({ ...r, [table]: [...r[table], { ...row, id: Date.now() }] }))
      return null
    }
    const { error } = await supabase.from(table).insert(row)
    if (!error) load(table)
    return error?.message || null
  }

  async function update(table, id, changes) {
    setRows((r) => ({ ...r, [table]: r[table].map((x) => (x.id === id ? { ...x, ...changes } : x)) }))
    if (isDemo) return null
    const { error } = await supabase.from(table).update(changes).eq('id', id)
    if (error) load(table)
    return error?.message || null
  }

  async function remove(table, id) {
    setRows((r) => ({ ...r, [table]: r[table].filter((x) => x.id !== id) }))
    if (isDemo) return null
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) load(table)
    return error?.message || null
  }

  async function updateCompetition(changes) {
    setCompetition((c) => ({ ...c, ...changes }))
    if (isDemo) return null
    const { error } = await supabase.from('competition').update(changes).eq('id', 1)
    if (error) loadCompetition()
    return error?.message || null
  }

  const value = {
    ...rows,
    competition,
    loading,
    updateCompetition,
    addTask: (t) => add('tasks', { ...t, created_by: isDemo ? undefined : userId }),
    updateTask: (id, c) => update('tasks', id, c),
    deleteTask: (id) => remove('tasks', id),
    addExpense: (e) => add('expenses', { ...e, created_by: isDemo ? undefined : userId }),
    updateExpense: (id, c) => update('expenses', id, c),
    deleteExpense: (id) => remove('expenses', id),
    addCategory: (name) =>
      add('categories', { name, planned: 0, color: CATEGORY_COLORS[rows.categories.length % CATEGORY_COLORS.length], position: rows.categories.length + 1 }),
    updateCategory: (id, c) => update('categories', id, c),
    deleteCategory: (id) => remove('categories', id),
  }
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export const useData = () => useContext(DataContext)

// ---------- Checklist helpers ----------
export const STATUSES = ['Not started', 'In progress', 'Done', 'Stuck']
export const isDone = (t) => t.status === 'Done'
export const isOverdue = (t) => !isDone(t) && !!t.due && new Date(t.due + 'T23:59') < new Date()
export const progressOf = (list) => (list.length ? (list.filter(isDone).length / list.length) * 100 : 0)

// Soonest due first; tasks with no date go last.
export const byDue = (a, b) => (a.due || '9999').localeCompare(b.due || '9999') || a.id - b.id

// ---------- Budget helpers ----------
export const sumOf = (list) => list.reduce((s, e) => s + Number(e.amount), 0)
export const todayISO = () => new Date().toLocaleDateString('en-CA') // YYYY-MM-DD in local (NZ) time

// Green under 80%, amber 80–100%, red over.
export const moneyColor = (pct) => (pct > 100 ? 'var(--bad)' : pct >= 80 ? 'var(--warn)' : 'var(--good)')

// Totals for the whole budget and each category.
export function budgetSummary(competition, categories, expenses) {
  const total = Number(competition?.total_budget || 0)
  const spent = sumOf(expenses)
  const byCategory = categories.map((c) => {
    const s = sumOf(expenses.filter((e) => e.category_id === c.id))
    const planned = Number(c.planned)
    return { ...c, planned, spent: s, pct: planned ? (s / planned) * 100 : 0, over: planned > 0 && s > planned }
  })
  const uncategorised = sumOf(expenses.filter((e) => !categories.some((c) => c.id === e.category_id)))
  return {
    total,
    spent,
    left: total - spent,
    pct: total ? (spent / total) * 100 : 0,
    over: total > 0 && spent > total,
    byCategory,
    uncategorised,
    plannedTotal: byCategory.reduce((s, c) => s + c.planned, 0),
  }
}
