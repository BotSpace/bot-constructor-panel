# Loyiha Tahlili Hisoboti

Sana: 11/9/2025, 6:09:20 PM

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
├── components.json
├── config
├── docs
│   ├── ARCHITECTURE.md
│   ├── MESSAGE_EDIT_FEATURE.md
│   ├── MVP_READINESS.md
│   ├── javascript-snippets.md
│   ├── project-analysis.md
│   └── typescript-snippets.md
├── next-env.d.ts
├── next-intl.config.js
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── scripts
│   ├── analyze-project.js
│   └── install.sh
├── src
│   ├── app
│   │   ├── AuthProvider.tsx
│   │   ├── ReactQueryProvider.tsx
│   │   ├── [id]
│   │   │   ├── collection
│   │   │   │   ├── components
│   │   │   │   │   ├── add-collection-modal.tsx
│   │   │   │   │   ├── collection-modal.tsx
│   │   │   │   │   ├── content-table.tsx
│   │   │   │   │   ├── data-rows.tsx
│   │   │   │   │   ├── empty-state.tsx
│   │   │   │   │   ├── new-item-row.tsx
│   │   │   │   │   ├── sidebar.tsx
│   │   │   │   │   ├── table-header.tsx
│   │   │   │   │   └── utils.ts
│   │   │   │   └── page.tsx
│   │   │   ├── page.tsx
│   │   │   └── send-message
│   │   ├── api
│   │   │   └── auth
│   │   │       ├── [...nextauth]
│   │   │       │   ├── option.ts
│   │   │       │   └── route.ts
│   │   │       └── next-auth.d.ts
│   │   ├── auth
│   │   │   └── page.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components
│   │   ├── common
│   │   │   ├── i18nLink.tsx
│   │   │   ├── log-viewer.tsx
│   │   │   ├── theme-provider.tsx
│   │   │   └── toggle-button.tsx
│   │   ├── forms
│   │   ├── index.ts
│   │   ├── layout
│   │   │   ├── components
│   │   │   │   ├── add-env-dialog.tsx
│   │   │   │   ├── add-env.tsx
│   │   │   │   ├── ai-chat
│   │   │   │   │   └── prompt-interface.tsx
│   │   │   │   ├── debug
│   │   │   │   │   ├── debug.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── debug-panel.tsx
│   │   │   │   ├── index.ts
│   │   │   │   └── relas
│   │   │   │       └── relas.tsx
│   │   │   └── header.tsx
│   │   └── ui
│   │       ├── alert-dialog.tsx
│   │       ├── alert.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── checkbox.tsx
│   │       ├── combobox.tsx
│   │       ├── command.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── hover-border-gradient.tsx
│   │       ├── input-otp.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── popover.tsx
│   │       ├── progress.tsx
│   │       ├── radio-group.tsx
│   │       ├── resizable.tsx
│   │       ├── scroll-area.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── skeleton.tsx
│   │       ├── slider.tsx
│   │       ├── spinner.tsx
│   │       ├── switch.tsx
│   │       ├── tabs.tsx
│   │       ├── textarea.tsx
│   │       ├── toggle-group.tsx
│   │       ├── toggle.tsx
│   │       └── tooltip.tsx
│   ├── features
│   │   ├── auth
│   │   ├── bot-constructor
│   │   │   ├── components
│   │   │   │   ├── ButtonGenerator
│   │   │   │   │   ├── ButtonGenerator.tsx
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── ButtonRow.tsx
│   │   │   │   │   │   ├── ControlPanel.tsx
│   │   │   │   │   │   ├── InlineForm.tsx
│   │   │   │   │   │   ├── KeyboardPreview.tsx
│   │   │   │   │   │   ├── LoginUrlForm.tsx
│   │   │   │   │   │   ├── PreviewButton.tsx
│   │   │   │   │   │   ├── ReplyForm.tsx
│   │   │   │   │   │   └── WebAppForm.tsx
│   │   │   │   │   ├── hook
│   │   │   │   │   │   └── useButtonGeneratorState.ts
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── types.ts
│   │   │   │   │   └── utils.tsx
│   │   │   │   ├── QuickAddPalette
│   │   │   │   │   ├── QuickAddPalette.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── index.ts
│   │   │   │   └── save-status-badge.tsx
│   │   │   ├── constructor.tsx
│   │   │   ├── data
│   │   │   │   ├── elements.ts
│   │   │   │   ├── filters.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── messages.ts
│   │   │   │   └── themes.ts
│   │   │   ├── edges
│   │   │   │   ├── SmartEdge.tsx
│   │   │   │   ├── components
│   │   │   │   │   └── EdgeContextMenu.tsx
│   │   │   │   └── index.ts
│   │   │   ├── editor
│   │   │   │   ├── index.tsx
│   │   │   │   ├── settings
│   │   │   │   │   └── index.tsx
│   │   │   │   ├── setup
│   │   │   │   │   ├── aiogram
│   │   │   │   │   │   ├── bot
│   │   │   │   │   │   │   ├── edit.ts
│   │   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   │   └── send.ts
│   │   │   │   │   │   ├── buttons
│   │   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   │   ├── inline.ts
│   │   │   │   │   │   │   └── reply.ts
│   │   │   │   │   │   ├── callback
│   │   │   │   │   │   │   ├── context.ts
│   │   │   │   │   │   │   ├── edit.ts
│   │   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   │   └── send.ts
│   │   │   │   │   │   ├── globals.ts
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   ├── message
│   │   │   │   │   │   │   ├── context.ts
│   │   │   │   │   │   │   ├── edit.ts
│   │   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   │   └── send.ts
│   │   │   │   │   │   └── types
│   │   │   │   │   │       └── user.ts
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── python
│   │   │   │   │       └── keywords.ts
│   │   │   │   ├── store
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── settings.ts
│   │   │   │   └── themes
│   │   │   │       ├── ayu-mirage.ts
│   │   │   │       └── botfather.ts
│   │   │   ├── hooks
│   │   │   │   ├── useFlowKeyboardShortcuts.ts
│   │   │   │   └── useMousePosition.ts
│   │   │   ├── lib
│   │   │   │   └── geometry.ts
│   │   │   ├── nodes
│   │   │   │   ├── actions
│   │   │   │   │   ├── AudioMessageNode
│   │   │   │   │   │   ├── AudioMessageNode.tsx
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── EditMessageNode
│   │   │   │   │   │   ├── EditMessageNode.tsx
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── FileMessageNode
│   │   │   │   │   │   ├── FileMessageNode.tsx
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── PhotoMessageNode
│   │   │   │   │   │   ├── PhotoMessageNode.tsx
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── TextMessageNode
│   │   │   │   │   │   ├── TextMessageNode.tsx
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── VideoMessageNode
│   │   │   │   │   │   ├── VideoMessageNode.tsx
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── shared
│   │   │   │   │       ├── NodeFooter.tsx
│   │   │   │   │       ├── NodeHeader.tsx
│   │   │   │   │       └── RecipientSelector.tsx
│   │   │   │   ├── components
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── shared
│   │   │   │   │       ├── ReactFlowHandlers
│   │   │   │   │       │   ├── SourceHandler.tsx
│   │   │   │   │       │   ├── TargetHandler.tsx
│   │   │   │   │       │   └── index.ts
│   │   │   │   │       └── index.ts
│   │   │   │   ├── custom
│   │   │   │   │   ├── CollectionNode
│   │   │   │   │   │   ├── CollectionNode.tsx
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── CustomCodeNode
│   │   │   │   │   │   ├── CustomCodeNode.tsx
│   │   │   │   │   │   ├── components
│   │   │   │   │   │   │   └── CodeEditorDialog.tsx
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── StateNode
│   │   │   │   │   │   ├── StateNode.tsx
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── index.ts
│   │   │   │   └── triggers
│   │   │   │       ├── CallbackQueryTrigger
│   │   │   │       │   ├── CallbackQueryTrigger.tsx
│   │   │   │       │   ├── index.ts
│   │   │   │       │   └── types.ts
│   │   │   │       ├── CommandTrigger
│   │   │   │       │   ├── CommandTriggerNode.tsx
│   │   │   │       │   ├── index.ts
│   │   │   │       │   └── types.ts
│   │   │   │       ├── MessageTrigger
│   │   │   │       │   ├── MessageTrigger.tsx
│   │   │   │       │   ├── components
│   │   │   │       │   │   ├── FilterSelector.tsx
│   │   │   │       │   │   ├── ParameterInput
│   │   │   │       │   │   │   ├── RadiusInput.tsx
│   │   │   │       │   │   │   ├── SizeInput.tsx
│   │   │   │       │   │   │   ├── ValueInput.tsx
│   │   │   │       │   │   │   └── index.tsx
│   │   │   │       │   │   ├── TriggerHeader.tsx
│   │   │   │       │   │   └── TypeSelector.tsx
│   │   │   │       │   ├── index.ts
│   │   │   │       │   ├── types.ts
│   │   │   │       │   └── utils.ts
│   │   │   │       ├── ReplyButtonTrigger
│   │   │   │       │   ├── ReplyButtonTrigger.tsx
│   │   │   │       │   ├── index.ts
│   │   │   │       │   └── types.ts
│   │   │   │       └── index.ts
│   │   │   └── store
│   │   │       ├── actions.ts
│   │   │       ├── clipboardSlice.ts
│   │   │       ├── flowSlice.ts
│   │   │       ├── index.ts
│   │   │       ├── project.ts
│   │   │       └── types.ts
│   │   ├── collections
│   │   │   └── store
│   │   │       ├── collection-list.ts
│   │   │       └── index.ts
│   │   ├── index.ts
│   │   └── projects
│   ├── hooks
│   │   ├── use-debounces.tsx
│   │   └── use-keyboard-shortcut.tsx
│   ├── i18n
│   │   ├── request.ts
│   │   └── routing.ts
│   ├── index.ts
│   ├── lib
│   │   ├── constants.ts
│   │   ├── env.ts
│   │   ├── error-handler.ts
│   │   ├── input-validators.ts
│   │   ├── query-generator.ts
│   │   └── utils.ts
│   ├── messages
│   │   ├── en.json
│   │   ├── jp.json
│   │   ├── ru.json
│   │   └── uz.json
│   ├── services
│   │   ├── instance.ts
│   │   ├── react-query
│   │   │   ├── index.ts
│   │   │   ├── use-react-query-action.ts
│   │   │   └── use-scroll-query-action.ts
│   │   └── requests
│   │       ├── auth.ts
│   │       └── bot.ts
│   ├── styles
│   └── types
│       ├── auth
│       │   ├── get-me.ts
│       │   └── login.tsx
│       ├── element-types.ts
│       └── http
│           ├── collection.ts
│           ├── env.ts
│           ├── error.ts
│           ├── flow.ts
│           ├── project.ts
│           └── response.ts
└── tsconfig.json
```

## 📄 Muhim Fayllar Tarkibi (içidan: constructor)

*Belgilangan `constructor` papkasidan o'qiladigan fayllar topilmadi.*
