'use client'

import { Card, CardContent } from '@/components/ui/card'
import React from 'react'
import { BottomPanelButton } from './components/button'
import { Database, Plus, Search } from 'lucide-react'
import { debugConsoleStore } from '@/components/layout/components/debug-console/store'
import { cn } from '@/lib/utils'
import { SquareCommandIcon } from '@/components/icons/terminal'
import { PlayIcon } from '@/components/icons/play'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon } from '@/components/icons/arrow-back'
import { Separator } from '@/components/ui/separator'
import { useSearchStore } from '../../search/search-store'
import { useLinkToParent } from '@/components/common/link-to-parrent'
import { useParams } from 'next/navigation'
import { ReleasePanel } from '@/components/layout/components/relas/relas'
import DebugingButtons from '@/components/layout/components/debug/debug'
import BottomButtonGroup from './components/button-group'

type Props = {}

function BottomPanel({ }: Props) {

    const { isOpen, height, toggle } = debugConsoleStore();
    const { toggleSearchPanel } = useSearchStore();

    const { id } = useParams();

    const { handleClick: backToCollection } = useLinkToParent({
        href: `/bot/${id}/collection`,
    });

    const { handleClick: backToHome } = useLinkToParent({
        href: `/bot/${id}`,
    });

    return (
        <div
            style={isOpen ? { bottom: `${height + 20}px` } : {}}
            className={cn(`sticky bottom-[15px] gap-2 flex items-center justify-center pointer-events-none`)}>
            <Card className='p-2 pointer-events-auto rounded-2xl'>
                <CardContent className='p-2 flex items-center justify-center gap-2'>

                    {/* Home button */}
                    <BottomPanelButton onClick={backToHome}>
                        <ArrowLeftIcon />
                    </BottomPanelButton>

                    {/* terminal button */}
                    <BottomPanelButton onClick={toggle}>
                        <SquareCommandIcon />
                    </BottomPanelButton>


                    <BottomPanelButton onClick={toggleSearchPanel}>
                        <Search size={20} />
                    </BottomPanelButton>

                    <BottomPanelButton>
                        <Plus size={20} />
                    </BottomPanelButton>

                    <BottomPanelButton onClick={(e) => backToCollection(e)}>
                        <Database size={20} />
                    </BottomPanelButton>

                    <DebugingButtons />
                    {/* <BottomPanelButton>
                        <PlayIcon />
                    </BottomPanelButton> */}

                    <Separator className='!h-[2px] !h-[40px]' orientation="vertical" />

                    <ReleasePanel />
                </CardContent>
            </Card>
        </div>

    )
}

export default BottomPanel