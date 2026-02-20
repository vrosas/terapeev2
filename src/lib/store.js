import { create } from 'zustand'

export const useAppStore = create((set, get) => ({
  // ─── Navigation ───
  currentPage: 'dashboard',
  sidebarCollapsed: false,
  navHistory: ['dashboard'],
  searchOpen: false,
  notifOpen: false,

  navigate: (page) => {
    const { navHistory } = get()
    set({
      currentPage: page,
      navHistory: [...navHistory.slice(-9), page],
      notifOpen: false,
    })
  },
  goBack: () => {
    const { navHistory } = get()
    const prev = navHistory[navHistory.length - 2] || 'dashboard'
    set({
      currentPage: prev,
      navHistory: navHistory.slice(0, -1),
    })
  },
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSearchOpen: (v) => set({ searchOpen: v }),
  setNotifOpen: (v) => set({ notifOpen: v }),

  // ─── Clinic Config ───
  clinic: null,
  clinicPlan: 'max', // 'standard' | 'max'

  setClinic: (clinic) => set({ clinic, clinicPlan: clinic?.plan || 'max' }),
  setClinicPlan: (plan) => set({ clinicPlan: plan }),

  // ─── Loading States ───
  loading: {},
  setLoading: (key, value) =>
    set((s) => ({ loading: { ...s.loading, [key]: value } })),
}))
