'use client'

import { Card, CardContent } from '@/components/ui/card'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { BottomPanelButton } from './components/button'
import { Database, Key, Keyboard, MoreHorizontal, Search, Eye, EyeOff } from 'lucide-react'
import { debugConsoleStore } from '@/components/layout/components/debug-console/store'
import { cn } from '@/lib/utils'
import { SquareCommandIcon } from '@/components/icons/terminal'
import { ArrowLeftIcon } from '@/components/icons/arrow-back'
import { Separator } from '@/components/ui/separator'
import { useSearchStore } from '../../search/search-store'
import { useLinkToParent } from '@/components/common/link-to-parrent'
import { useParams } from 'next/navigation'
import { ReleasePanel } from '@/components/layout/components/relas/relas'
import DebugingButtons from '@/components/layout/components/debug/debug'
import { NodeSelectionDialog } from '../NodeSelectionDialog'
import { ShortcutsDialog } from '../ShortcutsDialog'
import { useFlowStore } from '../../store'
import { useReactFlow } from 'reactflow'
import { ElementItemType } from '@/types/element-types'
import { CollectionManageDialog } from '../CollectionIframe/CollectionManageDialog'
import { EnvManageDialog } from '../EnvManageDialog/EnvManageDialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTranslations } from 'next-intl'

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
const ALL_COUNT = 6

function BottomPanel({ addNodeOpen, onAddNodeOpenChange }: Props) {
    const t = useTranslations('editor.toolbar')
    const { isOpen, height, toggle } = debugConsoleStore()
    const { toggleSearchPanel } = useSearchStore()
    const [nodeDialogOpen, setNodeDialogOpen] = useState(false)
    const [shortcutsOpen, setShortcutsOpen] = useState(false)
    // Sync external open state (from top bar button)
    const effectiveNodeDialogOpen = addNodeOpen ?? nodeDialogOpen
    const setEffectiveNodeDialogOpen = (v: boolean) => {
        setNodeDialogOpen(v)
        onAddNodeOpenChange?.(v)
    }
    const [envManageOpen, setEnvManageOpen] = useState(false)
    const [collectionOpen, setCollectionOpen] = useState(false)
    const { addNode, edgesVisible, toggleEdgesVisibility } = useFlowStore()
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
            key: 'edges',
            inline: (
                <BottomPanelButton
                    onClick={toggleEdgesVisibility}
                    title={edgesVisible ? t('hideEdges') : t('showEdges')}
                    aria-label={edgesVisible ? t('hideEdges') : t('showEdges')}
                >
                    {edgesVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                </BottomPanelButton>
            ),
            overflow: (
                <DropdownMenuItem key="edges" onClick={toggleEdgesVisibility}>
                    {edgesVisible ? <Eye size={16} className="mr-2" /> : <EyeOff size={16} className="mr-2" />}
                    {edgesVisible ? t('hideEdges') : t('showEdges')}
                </DropdownMenuItem>
            ),
        },
        {
            key: 'env',
            inline: (
                <BottomPanelButton onClick={() => setEnvManageOpen(true)} title={t('env')} aria-label={t('env')}>
                    <Key size={20} />
                </BottomPanelButton>
            ),
            overflow: (
                <DropdownMenuItem key="env" onClick={() => setEnvManageOpen(true)}>
                    <Key size={16} className="mr-2" />
                    {t('env')}
                </DropdownMenuItem>
            ),
        },
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
        </>
    )
}

export default BottomPanel
