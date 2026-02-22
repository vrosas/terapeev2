import { useSupabaseTable, useDashboardStats } from './useSupabaseTable'
import { DEMO } from './demoData'

// ═══ Re-export dashboard stats ═══
export { useDashboardStats }

// ═══ PATIENTS ═══
export function usePatients(options = {}) {
  return useSupabaseTable('patients', {
    select: '*, assigned_professional:professionals(id, full_name, color)',
    orderBy: { column: 'full_name', ascending: true },
    demoData: DEMO.patients,
    ...options,
  })
}

// ═══ PROFESSIONALS ═══
export function useProfessionals(options = {}) {
  return useSupabaseTable('professionals', {
    select: '*',
    orderBy: { column: 'full_name', ascending: true },
    demoData: DEMO.professionals,
    ...options,
  })
}

// ═══ APPOINTMENTS ═══
export function useAppointments(options = {}) {
  return useSupabaseTable('appointments', {
    select: `
      *,
      patient:patients(id, full_name, phone, avatar_url),
      professional:professionals(id, full_name, color, session_duration)
    `,
    orderBy: { column: 'start_time', ascending: true },
    demoData: DEMO.appointments,
    realtime: true,
    ...options,
  })
}

// ═══ MEDICAL RECORDS (Prontuários) ═══
export function useMedicalRecords(options = {}) {
  return useSupabaseTable('medical_records', {
    select: `
      *,
      patient:patients(id, full_name),
      professional:professionals(id, full_name)
    `,
    orderBy: { column: 'date', ascending: false },
    demoData: DEMO.medicalRecords,
    ...options,
  })
}

// ═══ CHARGES (Cobranças) ═══
export function useCharges(options = {}) {
  return useSupabaseTable('charges', {
    select: `
      *,
      patient:patients(id, full_name, phone),
      professional:professionals(id, full_name)
    `,
    orderBy: { column: 'due_date', ascending: false },
    demoData: DEMO.charges,
    ...options,
  })
}

// ═══ EXPENSES ═══
export function useExpenses(options = {}) {
  return useSupabaseTable('expenses', {
    select: '*, category:expense_categories(id, name, icon, color)',
    orderBy: { column: 'date', ascending: false },
    demoData: DEMO.expenses,
    ...options,
  })
}

// ═══ EXPENSE CATEGORIES ═══
export function useExpenseCategories(options = {}) {
  return useSupabaseTable('expense_categories', {
    orderBy: { column: 'name', ascending: true },
    demoData: DEMO.expenseCategories,
    ...options,
  })
}

// ═══ CONVERSATIONS ═══
export function useConversations(options = {}) {
  return useSupabaseTable('conversations', {
    select: `
      *,
      patient:patients(id, full_name, avatar_url, assigned_professional_id)
    `,
    orderBy: { column: 'last_message_at', ascending: false },
    demoData: DEMO.conversations,
    realtime: true,
    ...options,
  })
}

// ═══ MESSAGES ═══
export function useMessages(conversationId, options = {}) {
  return useSupabaseTable('messages', {
    select: '*',
    orderBy: { column: 'created_at', ascending: true },
    filters: conversationId ? [{ column: 'conversation_id', value: conversationId }] : [],
    enabled: Boolean(conversationId),
    demoData: conversationId ? DEMO.messages[conversationId] || [] : [],
    realtime: true,
    ...options,
  })
}

// ═══ MESSAGE TEMPLATES ═══
export function useMessageTemplates(options = {}) {
  return useSupabaseTable('message_templates', {
    orderBy: { column: 'name', ascending: true },
    demoData: DEMO.templates,
    ...options,
  })
}

// ═══ NOTIFICATIONS ═══
export function useNotifications(options = {}) {
  return useSupabaseTable('notifications', {
    orderBy: { column: 'created_at', ascending: false },
    pageSize: 20,
    demoData: DEMO.notifications,
    realtime: true,
    ...options,
  })
}

// ═══ SERVICES (Catálogo) ═══
export function useServices(options = {}) {
  return useSupabaseTable('services', {
    select: `
      *,
      service_professionals(
        professional:professionals(id, full_name, color)
      )
    `,
    orderBy: { column: 'name', ascending: true },
    demoData: DEMO.services,
    ...options,
  })
}

// ═══ SUPPLIERS (Fornecedores) ═══
export function useSuppliers(options = {}) {
  return useSupabaseTable('suppliers', {
    select: '*, category:expense_categories(id, name, icon, color)',
    orderBy: { column: 'name', ascending: true },
    demoData: DEMO.suppliers,
    ...options,
  })
}
