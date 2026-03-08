import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link } from '@/i18n/routing'
import { Clipboard, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import React, { useRef, useState } from 'react'

type Props = {
    updateForm: (key: string, value: string) => void
    header: React.ReactNode
}

function GetProductionBotToken({ updateForm, header }: Props) {
    const [value, setValue] = useState('')
    const hasPasted = useRef(false)

    const handleFocus = async () => {
        if (hasPasted.current || value) return
        try {
            const text = await navigator.clipboard.readText()
            if (text.trim()) {
                setValue(text.trim())
                updateForm('token', text.trim())
                hasPasted.current = true
            }
        } catch {
            // clipboard permission denied — user can type manually
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value)
        updateForm('token', e.target.value)
    }

    return (
        <>
            {header}

            <div className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="bot-token">Bot Token</Label>
                    <div className="relative">
                        <Input
                            id="bot-token"
                            type="text"
                            placeholder="1234567890:AAHHDDSSJJLL"
                            value={value}
                            onFocus={handleFocus}
                            onChange={handleChange}
                        />
                        {!value && (
                            <Clipboard className="text-muted-foreground pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2" />
                        )}
                    </div>
                    <p className="text-muted-foreground text-xs">
                        Tokenni @BotFather orqali olishingiz mumkin
                    </p>
                </div>

                <div className="space-y-2">
                    <Label>Qanday olish mumkin?</Label>
                    <div className="aspect-video w-full overflow-hidden rounded-lg border">
                        <iframe
                            className="h-full w-full"
                            src="https://www.youtube.com/embed/0fxJJTvcdMo?si=ksWZMnoMtwTtqYLd"
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        />
                    </div>
                </div>

                <Button variant="outline" className="w-full cursor-pointer" asChild>
                    <Link href="https://t.me/botfather?startapp" target="_blank">
                        <Image
                            className="rounded-full"
                            src="/logo/botfather.png"
                            alt="BotFather"
                            width={24}
                            height={24}
                        />
                        <span>BotFather orqali token olish</span>
                        <ExternalLink className="ml-auto size-4 opacity-50" />
                    </Link>
                </Button>
            </div>
        </>
    )
}

export default GetProductionBotToken