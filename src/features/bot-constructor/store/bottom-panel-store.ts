import { create } from 'zustand'

export type BottomPanelKey =
    | 'env'
    | 'collection'
    | 'credential'
    | 'module'
    | 'shortcuts'
    | 'variables'
    | 'errors'
    | 'languages'

interface BottomPanelStore {
    envOpen: boolean
    collectionOpen: boolean
    credentialOpen: boolean
    moduleOpen: boolean
    shortcutsOpen: boolean
    variablesOpen: boolean
    errorsOpen: boolean
    languagesOpen: boolean

    setEnvOpen: (v: boolean) => void
    setCollectionOpen: (v: boolean) => void
    setCredentialOpen: (v: boolean) => void
    setModuleOpen: (v: boolean) => void
    setShortcutsOpen: (v: boolean) => void
    setVariablesOpen: (v: boolean) => void
    setErrorsOpen: (v: boolean) => void
    setLanguagesOpen: (v: boolean) => void

    /** Open a panel by key — convenience for context menu */
    openPanel: (key: BottomPanelKey) => void
}

export const useBottomPanelStore = create<BottomPanelStore>((set) => ({
    envOpen: false,
    collectionOpen: false,
    credentialOpen: false,
    moduleOpen: false,
    shortcutsOpen: false,
    variablesOpen: false,
    errorsOpen: false,
    languagesOpen: false,

    setEnvOpen: (v) => set({ envOpen: v }),
    setCollectionOpen: (v) => set({ collectionOpen: v }),
    setCredentialOpen: (v) => set({ credentialOpen: v }),
    setModuleOpen: (v) => set({ moduleOpen: v }),
    setShortcutsOpen: (v) => set({ shortcutsOpen: v }),
    setVariablesOpen: (v) => set({ variablesOpen: v }),
    setErrorsOpen: (v) => set({ errorsOpen: v }),
    setLanguagesOpen: (v) => set({ languagesOpen: v }),

    openPanel: (key) => {
        switch (key) {
            case 'env': set({ envOpen: true }); break
            case 'collection': set({ collectionOpen: true }); break
            case 'credential': set({ credentialOpen: true }); break
            case 'module': set({ moduleOpen: true }); break
            case 'shortcuts': set({ shortcutsOpen: true }); break
            case 'variables': set({ variablesOpen: true }); break
            case 'errors': set({ errorsOpen: true }); break
            case 'languages': set({ languagesOpen: true }); break
        }
    },
}))
