'use client'

import { Card, CardContent } from '@/components/ui/card'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { BottomPanelButton } from '@/features/bot-constructor/panels/bottom-panel/components/button'
import { Activity, Database, Keyboard, Languages, MoreHorizontal, Search, Shield, Braces, AlertTriangle, Puzzle } from 'lucide-react'
import { debugConsoleStore } from '@/components/layout/debug-console/store'
import { cn } from '@/lib/utils'
import { SquareCommandIcon } from '@/components/icons/terminal'
import { ArrowLeftIcon } from '@/components/icons/arrow-back'
import { Separator } from '@/components/ui/separator'
import { useSearchStore } from '@/features/bot-constructor/panels/search/search-store'
import { useLinkToParent } from '@/components/common/link-to-parrent'
import { useParams } from 'next/navigation'
import { ReleasePanel } from '@/components/layout/relas/relas'
import DebugingButtons from '@/components/layout/debug/debug'
import { NodeSelectionDialog } from '@/features/bot-constructor/panels/NodeSelectionDialog'
import { ShortcutsDialog } from '@/features/bot-constructor/panels/ShortcutsDialog'
import { useFlowStore } from '@/features/bot-constructor/store'
import { useReactFlow } from 'reactflow'
import { ElementItemType } from '@/types/element-types'
import { CollectionManageDialog } from '@/features/bot-constructor/panels/CollectionIframe/CollectionManageDialog'
import { EnvManageDialog } from '@/features/bot-constructor/panels/EnvManageDialog/EnvManageDialog'
import { CredentialManageDialog } from '@/features/credentials/components/CredentialManageDialog'
import { ModulePanel } from '@/features/bot-constructor/panels/ModuleManageDialog/ModulePanel'
import { LanguageSettingsDialog } from '@/features/bot-constructor/panels/LanguageSettingsDialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { useTranslations } from 'next-intl'
import { useDebugContextStore } from '@/components/layout/debug-console/debug-context-store'
import { VariableInspectorPanel } from '@/components/layout/debug-console/VariableInspectorPanel'
import useProjectStore from '@/features/bot-constructor/store/project'
import { useDebugErrorsStore } from '@/features/bot-constructor/store/debug-errors'
import { ErrorsPanel } from '@/features/bot-constructor/panels/ErrorsPanel'
import { useBottomPanelStore } from '@/features/bot-constructor/store/bottom-panel-store'
import { useDebugStatusStore } from '@/features/bot-constructor/store/debug-status'

interface Props {
    addNodeOpen?: boolean;
    onAddNodeOpenChange?: (open: boolean) => void;
}

// Card horizontal padding (card p-2 + CardContent p-2, both sides) = 32px
// Fixed items (Home + DebugButtons + Separator + Release) with their gaps ≈ 227px
// Each optional slot (icon button + gap-2) = 48px
// More button = 48px
const FIXED_W = 227
const SLOT = 48
const MORE_W = 48
const ALL_COUNT = 10

function BottomPanel({ addNodeOpen, onAddNodeOpenChange }: Props) {
    const t = useTranslations('editor.toolbar')
    const { isOpen, height, toggle, openExecutions } = debugConsoleStore()
    const { toggleSearchPanel } = useSearchStore()
    const [nodeDialogOpen, setNodeDialogOpen] = useState(false)
    // Sync external open state (from top bar button)
    const effectiveNodeDialogOpen = addNodeOpen ?? nodeDialogOpen
    const setEffectiveNodeDialogOpen = (v: boolean) => {
        setNodeDialogOpen(v)
        onAddNodeOpenChange?.(v)
    }
    const {
        envOpen: envManageOpen, setEnvOpen: setEnvManageOpen,
        collectionOpen, setCollectionOpen,
        credentialOpen, setCredentialOpen,
        moduleOpen, setModuleOpen,
        shortcutsOpen, setShortcutsOpen,
        variablesOpen, setVariablesOpen,
        errorsOpen, setErrorsOpen,
        languagesOpen, setLanguagesOpen,
    } = useBottomPanelStore()
    const { snapshots } = useDebugContextStore()
    const { unreadCount: errorsUnread, markAllRead } = useDebugErrorsStore()
    const executionId = useDebugStatusStore((state) => state.currentExecutionId)
    const activeNodeId = useDebugStatusStore((state) => state.activeNodeId)
    const executionStatus = useDebugStatusStore((state) => state.lastStatus)
    const activeAttempt = useDebugStatusStore((state) =>
        state.activeNodeId ? state.attempts[state.activeNodeId] : undefined
    )
    const { project } = useProjectStore()
    const debugActive = project?.debug?.status === 'running'
    const hasSnapshots = snapshots.size > 0
    const { addNode } = useFlowStore()
    const { getViewport } = useReactFlow()
    const { id } = useParams()

    const { lang } = useParams<{ lang: string }>()
    const { handleClick: backToHome } = useLinkToParent({ href: `/${lang}/app/bots/${id}` })

    const handleAddNode = useCallback((element: ElementItemType) => {
        const { x, y, zoom } = getViewport()
        const centerX = (-x + window.innerWidth / 2) / zoom
        const centerY = (-y + window.innerHeight / 2) / zoom
        addNode(element, { x: centerX, y: centerY })
    }, [getViewport, addNode])

    // ── Overflow / priority+ logic ────────────────────────────────────────────
    const wrapRef = useRef<HTMLDivElement>(null)
    const [visibleCount, setVisibleCount] = useState(ALL_COUNT)

    useEffect(() => {
        const el = wrapRef.current
        if (!el) return
        const observer = new ResizeObserver(([entry]) => {
            const w = entry.contentRect.width
            if (w >= FIXED_W + ALL_COUNT * SLOT) {
                setVisibleCount(ALL_COUNT)
            } else {
                setVisibleCount(Math.max(0, Math.floor((w - FIXED_W - MORE_W) / SLOT)))
            }
        })
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    // Items ordered by priority: index 0 = highest priority (last to overflow),
    // index ALL_COUNT-1 = lowest priority (first to overflow).
    // Visible items = slice(0, visibleCount); overflowed = slice(visibleCount).
    const items = [
        {
            key: 'terminal',
            inline: (
                <BottomPanelButton onClick={toggle} title={t('terminal')} aria-label={t('terminal')}>
                    <SquareCommandIcon />
                </BottomPanelButton>
            ),
            overflow: (
                <DropdownMenuItem key="terminal" onClick={toggle}>
                    <SquareCommandIcon className="mr-2 h-4 w-4" />
                    {t('terminal')}
                </DropdownMenuItem>
            ),
        },
        {
            key: 'executions',
            inline: (
                <BottomPanelButton
                    onClick={openExecutions}
                    title={executionId
                        ? `Execution ${executionId.slice(0, 8)} · ${activeNodeId ?? ''} · ${executionStatus ?? ''}`
                        : 'Executions'}
                    aria-label="Executions"
                    className={cn(
                        executionStatus === 'running' && 'border-orange-500/50 text-orange-400',
                        executionStatus === 'waiting' && 'border-amber-500/50 text-amber-400',
                        executionStatus === 'success' && 'border-emerald-500/50 text-emerald-400',
                        executionStatus === 'error' && 'border-red-500/50 text-red-400',
                    )}
                >
                    <span className="relative">
                        <Activity size={20} />
                        {executionStatus && (
                            <span className={cn(
                                'absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-background',
                                executionStatus === 'running' && 'animate-pulse bg-orange-500',
                                executionStatus === 'waiting' && 'animate-pulse bg-amber-500',
                                executionStatus === 'success' && 'bg-emerald-500',
                                executionStatus === 'error' && 'bg-red-500',
                            )} />
                        )}
                        {activeAttempt && activeAttempt > 1 ? (
                            <span className="absolute -bottom-2 -right-2 rounded bg-background px-1 text-[8px] font-bold leading-3 text-foreground shadow">
                                {activeAttempt}
                            </span>
                        ) : null}
                    </span>
                </BottomPanelButton>
            ),
            overflow: (
                <DropdownMenuItem key="executions" onClick={openExecutions}>
                    <Activity size={16} className="mr-2" />
                    Executions
                    {executionStatus ? (
                        <span className="ml-auto text-xs capitalize">{executionStatus}</span>
                    ) : null}
                </DropdownMenuItem>
            ),
        },
        {
            key: 'search',
            inline: (
                <BottomPanelButton onClick={toggleSearchPanel} title={t('search')} aria-label={t('search')}>
                    <Search size={20} />
                </BottomPanelButton>
            ),
            overflow: (
                <DropdownMenuItem key="search" onClick={toggleSearchPanel}>
                    <Search size={16} className="mr-2" />
                    {t('search')}
                </DropdownMenuItem>
            ),
        },
        {
            key: 'collections',
            inline: (
                <BottomPanelButton onClick={() => setCollectionOpen(true)} title={t('collections')} aria-label={t('collections')}>
                    <Database size={20} />
                </BottomPanelButton>
            ),
            overflow: (
                <DropdownMenuItem key="collections" onClick={() => setCollectionOpen(true)}>
                    <Database size={16} className="mr-2" />
                    {t('collections')}
                </DropdownMenuItem>
            ),
        },
        {
            key: 'credentials',
            inline: (
                <BottomPanelButton onClick={() => setCredentialOpen(true)} title={t('credentials')} aria-label={t('credentials')}>
                    <Shield size={20} />
                </BottomPanelButton>
            ),
            overflow: (
                <DropdownMenuItem key="credentials" onClick={() => setCredentialOpen(true)}>
                    <Shield size={16} className="mr-2" />
                    {t('credentials')}
                </DropdownMenuItem>
            ),
        },
        {
            key: 'modules',
            inline: (
                <BottomPanelButton onClick={() => setModuleOpen(true)} title={t('modules')} aria-label={t('modules')}>
                    <Puzzle size={20} />
                </BottomPanelButton>
            ),
            overflow: (
                <DropdownMenuItem key="modules" onClick={() => setModuleOpen(true)}>
                    <Puzzle size={16} className="mr-2" />
                    {t('modules')}
                </DropdownMenuItem>
            ),
        },
        {
            key: 'shortcuts',
            inline: (
                <BottomPanelButton onClick={() => setShortcutsOpen(true)} title={t('shortcuts')} aria-label={t('shortcuts')}>
                    <Keyboard size={20} />
                </BottomPanelButton>
            ),
            overflow: (
                <DropdownMenuItem key="shortcuts" onClick={() => setShortcutsOpen(true)}>
                    <Keyboard size={16} className="mr-2" />
                    {t('shortcuts')}
                </DropdownMenuItem>
            ),
        },
        {
            key: 'languages',
            inline: (
                <BottomPanelButton onClick={() => setLanguagesOpen(true)} title="Bot tillari" aria-label="Bot tillari">
                    <Languages size={20} />
                </BottomPanelButton>
            ),
            overflow: (
                <DropdownMenuItem key="languages" onClick={() => setLanguagesOpen(true)}>
                    <Languages size={16} className="mr-2" />
                    Bot tillari
                </DropdownMenuItem>
            ),
        },
        {
            key: 'variables',
            inline: (
                <BottomPanelButton
                    onClick={() => setVariablesOpen(true)}
                    title={t('variables')}
                    aria-label={t('variables')}
                    disabled={!debugActive && !hasSnapshots}
                    className={hasSnapshots ? 'text-primary border-primary/40' : ''}
                >
                    <Braces size={20} />
                </BottomPanelButton>
            ),
            overflow: (
                <DropdownMenuItem key="variables" onClick={() => setVariablesOpen(true)} disabled={!debugActive && !hasSnapshots}>
                    <Braces size={16} className="mr-2" />
                    {t('variables')}
                </DropdownMenuItem>
            ),
        },
        {
            key: 'errors',
            inline: (
                <BottomPanelButton
                    onClick={() => { setErrorsOpen(true); markAllRead(); }}
                    title={t('errors')}
                    aria-label={t('errors')}
                    className={errorsUnread > 0 ? 'text-destructive border-destructive/40' : ''}
                >
                    <span className="relative">
                        <AlertTriangle size={20} />
                        {errorsUnread > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground px-0.5 leading-none pointer-events-none select-none">
                                {errorsUnread > 99 ? '99+' : errorsUnread}
                            </span>
                        )}
                    </span>
                </BottomPanelButton>
            ),
            overflow: (
                <DropdownMenuItem key="errors" onClick={() => { setErrorsOpen(true); markAllRead(); }}>
                    <span className="relative mr-2">
                        <AlertTriangle size={16} />
                        {errorsUnread > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[12px] h-[12px] flex items-center justify-center rounded-full bg-destructive text-[8px] font-bold text-destructive-foreground px-0.5 leading-none">
                                {errorsUnread > 9 ? '9+' : errorsUnread}
                            </span>
                        )}
                    </span>
                    {t('errors')}
                    {errorsUnread > 0 && (
                        <span className="ml-auto text-xs font-semibold text-destructive">{errorsUnread}</span>
                    )}
                </DropdownMenuItem>
            ),
        },
    ]

    const visible = items.slice(0, visibleCount)
    const overflowed = items.slice(visibleCount)

    return (
        <>
            <div
                ref={wrapRef}
                style={isOpen ? { bottom: `${height + 20}px` } : {}}
                className={cn('sticky bottom-[15px] gap-2 flex items-center justify-center pointer-events-none')}
            >
                <Card className='p-2 pointer-events-auto rounded-2xl'>
                    <CardContent className='p-2 flex items-center justify-center gap-2'>

                        {/* Home — always visible */}
                        <BottomPanelButton onClick={backToHome} title={t('back')} aria-label={t('back')}>
                            <ArrowLeftIcon />
                        </BottomPanelButton>

                        {/* Visible optional items */}
                        {visible.map(item => (
                            <React.Fragment key={item.key}>{item.inline}</React.Fragment>
                        ))}

                        {/* More — shown when items overflow */}
                        {overflowed.length > 0 && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <BottomPanelButton title={t('more')} aria-label={t('more')}>
                                        <MoreHorizontal size={20} />
                                    </BottomPanelButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="center" side="top">
                                    {overflowed.map(item => item.overflow)}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        <DebugingButtons />

                        <Separator className='!h-[40px]' orientation="vertical" />

                        <ReleasePanel />
                    </CardContent>
                </Card>
            </div>

            <NodeSelectionDialog
                open={effectiveNodeDialogOpen}
                onOpenChange={setEffectiveNodeDialogOpen}
                onSelect={handleAddNode}
            />

            <ShortcutsDialog
                open={shortcutsOpen}
                onOpenChange={setShortcutsOpen}
            />

            <EnvManageDialog
                open={envManageOpen}
                onOpenChange={setEnvManageOpen}
                projectId={id as string}
            />

            <CollectionManageDialog
                open={collectionOpen}
                onOpenChange={setCollectionOpen}
            />

            <CredentialManageDialog
                open={credentialOpen}
                onOpenChange={setCredentialOpen}
            />

            <ModulePanel
                open={moduleOpen}
                onOpenChange={setModuleOpen}
                projectId={id as string}
            />

            <LanguageSettingsDialog
                open={languagesOpen}
                onOpenChange={setLanguagesOpen}
            />

            {/* Variable Inspector — large 3-column dialog */}
            <Dialog open={variablesOpen} onOpenChange={setVariablesOpen}>
                <DialogContent
                    className="w-[92vw] max-w-[1400px] sm:max-w-[1400px] p-0 h-[82vh] flex flex-col overflow-hidden gap-0"
                    showCloseButton
                >
                    <DialogHeader className="flex-row items-center gap-2 px-4 py-3 border-b border-border shrink-0 space-y-0">
                        <Braces className="w-4 h-4 text-muted-foreground shrink-0" />
                        <DialogTitle className="text-sm font-semibold leading-none">
                            {t('variables')}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 min-h-0">
                        <VariableInspectorPanel debugActive={debugActive} />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Errors panel sheet — matches credentials/modules sidebar style */}
            <Sheet
                open={errorsOpen}
                onOpenChange={(v) => { setErrorsOpen(v); if (v) markAllRead(); }}
                modal={false}
            >
                <SheetContent
                    side="right"
                    showOverlay={false}
                    showCloseButton={false}
                    onInteractOutside={() => setErrorsOpen(false)}
                    className="w-full gap-0 overflow-hidden border-l border-white/10 bg-[#141414] p-0 text-white shadow-2xl sm:max-w-[480px]"
                >
                    <SheetHeader className="shrink-0 gap-0 space-y-0 border-b border-white/10 bg-[#171717] px-5 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <SheetTitle className="text-base font-semibold leading-tight">
                                    {t('errors')}
                                </SheetTitle>
                            </div>
                        </div>
                    </SheetHeader>
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <ErrorsPanel />
                    </div>
                </SheetContent>
            </Sheet>
        </>
    )
}

export default BottomPanel
