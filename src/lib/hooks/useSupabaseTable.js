import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

/**
 * Generic CRUD hook for Supabase tables.
 * Provides: data, loading, error, fetch, create, update, remove, count
 *
 * Usage:
 *   const patients = useSupabaseTable('patients', {
 *     select: '*, assigned_professional:professionals(full_name)',
 *     orderBy: { column: 'full_name', ascending: true },
 *     filters: [{ column: 'status', value: 'active' }],
 *   })
 */
export function useSupabaseTable(tableName, options = {}) {
  const { clinicId, isDemo } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [count, setCount] = useState(0)
  const mountedRef = useRef(true)

  const {
    select = '*',
    orderBy = { column: 'created_at', ascending: false },
    filters = [],
    pageSize = 50,
    page = 0,
    enabled = true,
    demoData = [],
    realtime = false,
  } = options

  // Fetch data
  const fetch = useCallback(async (extraFilters = []) => {
    if (!enabled) return

    // Demo mode
    if (isDemo || !supabase) {
      setData(demoData)
      setCount(demoData.length)
      setLoading(false)
      return
    }

    if (!clinicId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from(tableName)
        .select(select, { count: 'exact' })
        .eq('clinic_id', clinicId)

      // Apply filters
      ;[...filters, ...extraFilters].forEach((f) => {
        if (f.op === 'ilike') {
          query = query.ilike(f.column, `%${f.value}%`)
        } else if (f.op === 'in') {
          query = query.in(f.column, f.value)
        } else if (f.op === 'gte') {
          query = query.gte(f.column, f.value)
        } else if (f.op === 'lte') {
          query = query.lte(f.column, f.value)
        } else if (f.op === 'is') {
          query = query.is(f.column, f.value)
        } else if (f.op === 'neq') {
          query = query.neq(f.column, f.value)
        } else if (f.op === 'contains') {
          query = query.contains(f.column, f.value)
        } else {
          query = query.eq(f.column, f.value)
        }
      })

      // Order
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending })
      }

      // Pagination
      if (pageSize) {
        const from = page * pageSize
        query = query.range(from, from + pageSize - 1)
      }

      const { data: result, error: err, count: total } = await query

      if (!mountedRef.current) return

      if (err) {
        setError(err.message)
        toast.error(`Erro ao carregar ${tableName}: ${err.message}`)
      } else {
        setData(result || [])
        if (total !== null) setCount(total)
      }
    } catch (e) {
      if (mountedRef.current) {
        setError(e.message)
      }
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [tableName, select, clinicId, isDemo, enabled, page, pageSize, JSON.stringify(filters), JSON.stringify(orderBy)])

  // Create record
  const create = useCallback(async (record) => {
    if (isDemo || !supabase) {
      const newRecord = { id: crypto.randomUUID(), ...record, created_at: new Date().toISOString() }
      setData((prev) => [newRecord, ...prev])
      setCount((c) => c + 1)
      toast.success('Registro criado')
      return { data: newRecord, error: null }
    }

    const { data: result, error: err } = await supabase
      .from(tableName)
      .insert({ ...record, clinic_id: clinicId })
      .select(select)
      .single()

    if (err) {
      toast.error(`Erro ao criar: ${err.message}`)
      return { data: null, error: err }
    }

    setData((prev) => [result, ...prev])
    setCount((c) => c + 1)
    toast.success('Registro criado')
    return { data: result, error: null }
  }, [tableName, select, clinicId, isDemo])

  // Update record
  const update = useCallback(async (id, updates) => {
    if (isDemo || !supabase) {
      setData((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)))
      toast.success('Registro atualizado')
      return { data: { id, ...updates }, error: null }
    }

    const { data: result, error: err } = await supabase
      .from(tableName)
      .update(updates)
      .eq('id', id)
      .eq('clinic_id', clinicId)
      .select(select)
      .single()

    if (err) {
      toast.error(`Erro ao atualizar: ${err.message}`)
      return { data: null, error: err }
    }

    setData((prev) => prev.map((r) => (r.id === id ? result : r)))
    toast.success('Registro atualizado')
    return { data: result, error: null }
  }, [tableName, select, clinicId, isDemo])

  // Delete record
  const remove = useCallback(async (id) => {
    if (isDemo || !supabase) {
      setData((prev) => prev.filter((r) => r.id !== id))
      setCount((c) => c - 1)
      toast.success('Registro excluído')
      return { error: null }
    }

    const { error: err } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id)
      .eq('clinic_id', clinicId)

    if (err) {
      toast.error(`Erro ao excluir: ${err.message}`)
      return { error: err }
    }

    setData((prev) => prev.filter((r) => r.id !== id))
    setCount((c) => c - 1)
    toast.success('Registro excluído')
    return { error: null }
  }, [tableName, clinicId, isDemo])

  // Get single record
  const getById = useCallback(async (id) => {
    if (isDemo || !supabase) {
      return { data: data.find((r) => r.id === id) || null, error: null }
    }

    const { data: result, error: err } = await supabase
      .from(tableName)
      .select(select)
      .eq('id', id)
      .eq('clinic_id', clinicId)
      .single()

    return { data: result, error: err }
  }, [tableName, select, clinicId, isDemo, data])

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true
    fetch()
    return () => { mountedRef.current = false }
  }, [fetch])

  // Realtime subscription
  useEffect(() => {
    if (!realtime || isDemo || !supabase || !clinicId) return

    const channel = supabase
      .channel(`${tableName}-changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tableName, filter: `clinic_id=eq.${clinicId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setData((prev) => [payload.new, ...prev])
            setCount((c) => c + 1)
          } else if (payload.eventType === 'UPDATE') {
            setData((prev) => prev.map((r) => (r.id === payload.new.id ? payload.new : r)))
          } else if (payload.eventType === 'DELETE') {
            setData((prev) => prev.filter((r) => r.id !== payload.old.id))
            setCount((c) => c - 1)
          }
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [tableName, clinicId, realtime, isDemo])

  return {
    data,
    loading,
    error,
    count,
    fetch,
    create,
    update,
    remove,
    getById,
    setData,
  }
}

/**
 * Hook for fetching dashboard stats from the view
 */
export function useDashboardStats() {
  const { clinicId, isDemo } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemo || !supabase) {
      setStats({
        active_patients: 6,
        today_appointments: 4,
        month_completed: 18,
        month_revenue: 8420,
        month_expenses: 6187,
        overdue_charges: 1,
        unread_conversations: 2,
      })
      setLoading(false)
      return
    }

    if (!clinicId) return

    const fetchStats = async () => {
      const { data, error } = await supabase
        .from('dashboard_stats')
        .select('*')
        .eq('clinic_id', clinicId)
        .single()

      if (!error && data) setStats(data)
      setLoading(false)
    }

    fetchStats()
  }, [clinicId, isDemo])

  return { stats, loading }
}
