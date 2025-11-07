# Loyiha Tahlili Hisoboti

Sana: 10/21/2025, 9:26:40 PM

## 📁 Fayl Strukturasi

```
constructor-next-js
├── .cursor-free-vip
│   ├── config.ini
│   └── language_cache
├── .env
├── .gitignore
├── Dockerfile
├── README.md
├── analis_project.js
├── app
│   ├── AuthProvider.tsx
│   ├── ReactQueryProvider.tsx
│   ├── [id]
│   │   ├── collection
│   │   │   ├── components
│   │   │   │   ├── collection-modal.tsx
│   │   │   │   ├── content-table.tsx
│   │   │   │   ├── item-modal.tsx
│   │   │   │   ├── sidebar.tsx
│   │   │   │   └── top-bar.tsx
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── api
│   │   └── auth
│   │       ├── [...nextauth]
│   │       │   ├── option.ts
│   │       │   └── route.ts
│   │       └── next-auth.d.ts
│   ├── auth
│   │   └── page.tsx
│   ├── favicon.ico
│   ├── globals.css
│   └── layout.tsx
├── components
│   ├── common
│   │   └── i18zoneLInk.tsx
│   ├── header
│   │   ├── components
│   │   │   ├── add-env.tsx
│   │   │   ├── ai-chat
│   │   │   │   └── prompt-interface.tsx
│   │   │   ├── debug
│   │   │   │   ├── debug.tsx
│   │   │   │   └── index.ts
│   │   │   ├── index.ts
│   │   │   └── relas
│   │   │       └── relas.tsx
│   │   ├── header.tsx
│   │   └── index.ts
│   ├── log-viewer
│   │   └── log-viewer.tsx
│   ├── theme
│   │   ├── theme-provider.tsx
│   │   └── toggle-button.tsx
│   └── ui
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── checkbox.tsx
│       ├── command.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── hover-border-gradient.tsx
│       ├── input-otp.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── radio-group.tsx
│       ├── resizable.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── skeleton.tsx
│       ├── slider.tsx
│       ├── spinner.tsx
│       ├── switch.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       ├── toggle-group.tsx
│       ├── toggle.tsx
│       └── tooltip.tsx
├── components.json
├── constructor
│   ├── components
│   │   ├── ButtonGenerator
│   │   │   ├── ButtonGenerator.tsx
│   │   │   ├── components
│   │   │   │   ├── ButtonRow.tsx
│   │   │   │   ├── ControlPanel.tsx
│   │   │   │   ├── InlineForm.tsx
│   │   │   │   ├── KeyboardPreview.tsx
│   │   │   │   ├── LoginUrlForm.tsx
│   │   │   │   ├── PreviewButton.tsx
│   │   │   │   ├── ReplyForm.tsx
│   │   │   │   └── WebAppForm.tsx
│   │   │   ├── hook
│   │   │   │   └── useButtonGeneratorState.ts
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   └── utils.tsx
│   │   ├── QuickAddPalette
│   │   │   ├── QuickAddPalette.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── constructor.tsx
│   ├── data
│   │   ├── elements.ts
│   │   ├── filters.ts
│   │   ├── index.ts
│   │   ├── messages.ts
│   │   └── themes.ts
│   ├── edges
│   │   ├── SmartEdge.tsx
│   │   ├── components
│   │   │   └── EdgeContextMenu.tsx
│   │   └── index.ts
│   ├── hooks
│   │   ├── useFlowKeyboardShortcuts.ts
│   │   └── useMousePosition.ts
│   ├── lib
│   │   └── geometry.ts
│   ├── nodes
│   │   ├── actions
│   │   │   ├── AudioMessageNode
│   │   │   │   ├── AudioMessageNode.tsx
│   │   │   │   ├── index.ts
│   │   │   │   └── types.ts
│   │   │   ├── FileMessageNode
│   │   │   │   ├── FileMessageNode.tsx
│   │   │   │   ├── index.ts
│   │   │   │   └── types.ts
│   │   │   ├── PhotoMessageNode
│   │   │   │   ├── PhotoMessageNode.tsx
│   │   │   │   ├── index.ts
│   │   │   │   └── types.ts
│   │   │   ├── TextMessageNode
│   │   │   │   ├── TextMessageNode.tsx
│   │   │   │   ├── index.ts
│   │   │   │   └── types.ts
│   │   │   ├── VideoMessageNode
│   │   │   │   ├── VideMessageNode.tsx
│   │   │   │   ├── index.ts
│   │   │   │   └── types.ts
│   │   │   ├── index.ts
│   │   │   └── shared
│   │   │       ├── NodeFooter.tsx
│   │   │       ├── NodeHeader.tsx
│   │   │       └── RecipientSelector.tsx
│   │   ├── components
│   │   │   ├── index.ts
│   │   │   └── shared
│   │   │       ├── ReactFlowHandlers
│   │   │       │   ├── SourceHandler.tsx
│   │   │       │   ├── TargetHandler.tsx
│   │   │       │   └── index.ts
│   │   │       └── index.ts
│   │   ├── custom
│   │   │   ├── CustomCodeNode
│   │   │   │   ├── CustomCodeNode.tsx
│   │   │   │   ├── components
│   │   │   │   │   └── CodeEditorDialog.tsx
│   │   │   │   ├── index.ts
│   │   │   │   └── types.ts
│   │   │   └── index.ts
│   │   ├── index.ts
│   │   └── triggers
│   │       ├── CallbackQueryTrigger
│   │       │   ├── CallbackQueryTrigger.tsx
│   │       │   ├── index.ts
│   │       │   └── types.ts
│   │       ├── CommandTrigger
│   │       │   ├── CommandTriggerNode.tsx
│   │       │   ├── index.ts
│   │       │   └── types.ts
│   │       ├── MessageTrigger
│   │       │   ├── MessageTrigger.tsx
│   │       │   ├── components
│   │       │   │   ├── FilterSelector.tsx
│   │       │   │   ├── ParameterInput
│   │       │   │   │   ├── RadiusInput.tsx
│   │       │   │   │   ├── SizeInput.tsx
│   │       │   │   │   ├── ValueInput.tsx
│   │       │   │   │   └── index.tsx
│   │       │   │   ├── TriggerHeader.tsx
│   │       │   │   └── TypeSelector.tsx
│   │       │   ├── index.ts
│   │       │   ├── types.ts
│   │       │   └── utils.ts
│   │       ├── ReplyButtonTrigger
│   │       │   ├── ReplyButtonTrigger.tsx
│   │       │   ├── index.ts
│   │       │   └── types.ts
│   │       └── index.ts
│   └── store
│       ├── actions.ts
│       ├── clipboardSlice.ts
│       ├── flowSlice.ts
│       ├── index.ts
│       ├── project.ts
│       └── types.ts
├── editor
│   ├── index.tsx
│   ├── settings
│   │   └── index.tsx
│   ├── setup
│   │   ├── aiogram
│   │   │   ├── bot
│   │   │   │   ├── edit.ts
│   │   │   │   ├── index.ts
│   │   │   │   └── send.ts
│   │   │   ├── buttons
│   │   │   │   ├── index.ts
│   │   │   │   ├── inline.ts
│   │   │   │   └── reply.ts
│   │   │   ├── callback
│   │   │   │   ├── context.ts
│   │   │   │   ├── edit.ts
│   │   │   │   ├── index.ts
│   │   │   │   └── send.ts
│   │   │   ├── globals.ts
│   │   │   ├── index.ts
│   │   │   ├── message
│   │   │   │   ├── context.ts
│   │   │   │   ├── edit.ts
│   │   │   │   ├── index.ts
│   │   │   │   └── send.ts
│   │   │   └── types
│   │   │       └── user.ts
│   │   ├── index.ts
│   │   └── python
│   │       └── keywords.ts
│   ├── store
│   │   ├── index.ts
│   │   └── settings.ts
│   └── themes
│       ├── ayu-mirage.ts
│       └── botfather.ts
├── hooks
│   ├── use-debounces.tsx
│   └── use-keyboard-shortcut.tsx
├── i18n
│   ├── request.ts
│   └── routing.ts
├── image.png
├── install.sh
├── lib
│   ├── env.ts
│   ├── query-generator.ts
│   └── utils.ts
├── messages
│   ├── en.json
│   ├── jp.json
│   ├── ru.json
│   └── uz.json
├── next-env.d.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── services
│   ├── instance.ts
│   ├── react-query
│   │   ├── index.ts
│   │   ├── use-react-query-action.ts
│   │   └── use-scroll-query-action.ts
│   └── requests
│       ├── auth.ts
│       └── bot.ts
├── tsconfig.json
└── types
    ├── auth
    │   ├── get-me.ts
    │   └── login.tsx
    ├── element-types.ts
    └── http
        ├── env.ts
        ├── error.ts
        ├── flow.ts
        ├── index.ts
        └── project.ts
```
