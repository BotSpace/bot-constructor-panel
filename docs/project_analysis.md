# Loyiha Tahlili Hisoboti

Sana: 2/24/2026, 9:16:34 PM

## 📁 Fayl Strukturasi

```
bot-constructor-panel
├── .env
├── .env.example
├── .eslintrc.json
├── .github
│   └── workflows
│       └── deploy.yaml
├── .gitignore
├── .husky
│   ├── _
│   │   ├── .gitignore
│   │   ├── applypatch-msg
│   │   ├── commit-msg
│   │   ├── h
│   │   ├── husky.sh
│   │   ├── post-applypatch
│   │   ├── post-checkout
│   │   ├── post-commit
│   │   ├── post-merge
│   │   ├── post-rewrite
│   │   ├── pre-applypatch
│   │   ├── pre-auto-gc
│   │   ├── pre-commit
│   │   ├── pre-merge-commit
│   │   ├── pre-push
│   │   ├── pre-rebase
│   │   └── prepare-commit-msg
│   └── pre-push
├── Dockerfile
├── IMPLEMENTATION_COMPLETE.md
├── IMPLEMENTATION_SUMMARY.md
├── README.md
├── Telegram bot API
│   └── telegrm-bot-apis.md
├── components.json
├── docs
│   ├── ARCHITECTURE.md
│   ├── node_types.md
│   └── project_analysis.md
├── next-env.d.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── scripts
│   ├── analyze-project.js
│   └── install.sh
├── src
│   ├── app
│   │   ├── [lang]
│   │   │   ├── AuthProvider.tsx
│   │   │   ├── ReactQueryProvider.tsx
│   │   │   ├── [id]
│   │   │   │   └── page.tsx
│   │   │   ├── auth
│   │   │   │   └── page.tsx
│   │   │   ├── globals.css
│   │   │   └── layout.tsx
│   │   ├── api
│   │   │   ├── ai
│   │   │   │   └── chat
│   │   │   │       └── route.ts
│   │   │   └── auth
│   │   │       ├── [...nextauth]
│   │   │       │   ├── option.ts
│   │   │       │   └── route.ts
│   │   │       └── next-auth.d.ts
│   │   └── favicon.ico
│   ├── assets
│   │   └── notification.mp3
│   ├── components
│   │   ├── common
│   │   │   ├── OrientationGuard.tsx
│   │   │   ├── analitics.tsx
│   │   │   ├── count-down-button.tsx
│   │   │   ├── i18nLink.tsx
│   │   │   ├── link-to-parrent.tsx
│   │   │   ├── notification-alert.tsx
│   │   │   ├── notification-provider.tsx
│   │   │   ├── separetor.tsx
│   │   │   ├── status-badge.tsx
│   │   │   ├── theme-provider.tsx
│   │   │   └── toggle-button.tsx
│   │   ├── layout
│   │   │   ├── components
│   │   │   │   ├── add-env-dialog.tsx
│   │   │   │   ├── add-env.tsx
│   │   │   │   ├── ai-chat
│   │   │   │   │   ├── chat-widget.tsx
│   │   │   │   │   └── prompt-interface.tsx
│   │   │   │   ├── debug
│   │   │   │   │   ├── debug.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── debug-console.tsx
│   │   │   │   ├── index.ts
│   │   │   │   └── relas
│   │   │   │       └── relas.tsx
│   │   │   └── header.tsx
│   │   ├── login-form
│   │   │   ├── google-auth-widget.tsx
│   │   │   ├── index.tsx
│   │   │   └── telegram-auth-widget.tsx
│   │   └── ui
│   │       ├── accordion.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── alert.tsx
│   │       ├── badge.tsx
│   │       ├── button-group.tsx
│   │       ├── button.tsx
│   │       ├── calendar.tsx
│   │       ├── card.tsx
│   │       ├── checkbox.tsx
│   │       ├── combobox.tsx
│   │       ├── command.tsx
│   │       ├── context-menu.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── field.tsx
│   │       ├── input-group.tsx
│   │       ├── input-otp.tsx
│   │       ├── input.tsx
│   │       ├── kbd.tsx
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
│   │   ├── bot-constructor
│   │   │   ├── components
│   │   │   │   ├── ButtonGenerator
│   │   │   │   │   ├── ButtonGenerator.tsx
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── ButtonRow.tsx
│   │   │   │   │   │   ├── CollectionButtonForm.tsx
│   │   │   │   │   │   ├── CollectionLayoutPreview.tsx
│   │   │   │   │   │   ├── ControlPanel.tsx
│   │   │   │   │   │   ├── EditButtonDialog.tsx
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
│   │   │   │   ├── index.ts
│   │   │   │   └── save-status-badge.tsx
│   │   │   ├── constructor.tsx
│   │   │   ├── data
│   │   │   │   ├── filters.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── messages.ts
│   │   │   │   ├── themes.ts
│   │   │   │   ├── useElements.ts
│   │   │   │   └── useMessageTypes.ts
│   │   │   ├── edges
│   │   │   │   ├── SelectableEdge.tsx
│   │   │   │   ├── components
│   │   │   │   │   └── EdgeContextMenu.tsx
│   │   │   │   └── index.ts
│   │   │   ├── guide-tour
│   │   │   │   ├── index.ts
│   │   │   │   └── tour-welcome.tsx
│   │   │   ├── hooks
│   │   │   │   ├── useFlowKeyboardShortcuts.ts
│   │   │   │   └── useMousePosition.ts
│   │   │   ├── lib
│   │   │   │   ├── edge-utils.ts
│   │   │   │   ├── findNearestParentAction.ts
│   │   │   │   ├── format-flow.ts
│   │   │   │   └── geometry.ts
│   │   │   ├── nodes
│   │   │   │   ├── actions
│   │   │   │   │   ├── AnimationNode
│   │   │   │   │   │   ├── AnimationNode.tsx
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── AudioMessageNode
│   │   │   │   │   │   ├── AudioMessageNode.tsx
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── ChatActionNode
│   │   │   │   │   │   ├── ChatActionNode.tsx
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── ContactNode
│   │   │   │   │   │   ├── ContactNode.tsx
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── CopyMessageNode
│   │   │   │   │   │   ├── CopyMessageNode.tsx
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── DeleteMessageNode
│   │   │   │   │   │   ├── DeleteMessageNode.tsx
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── DiceNode
│   │   │   │   │   │   ├── DiceNode.tsx
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── DownloadFileNode
│   │   │   │   │   │   ├── DownloadFileNode.tsx
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── EditMessageNode
│   │   │   │   │   │   ├── EditMessageNode.tsx
│   │   │   │   │   │   ├── components
│   │   │   │   │   │   │   ├── ForTextMessageNode.tsx
│   │   │   │   │   │   │   └── ForVideoPhotoDocumentAudio.tsx
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── FileMessageNode
│   │   │   │   │   │   ├── FileMessageNode.tsx
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── ForwardMessageNode
│   │   │   │   │   │   ├── ForwardMessageNode.tsx
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── LocationNode
│   │   │   │   │   │   ├── LocationNode.tsx
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── MediaGroupNode
│   │   │   │   │   │   ├── MediaGroupNode.tsx
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── PhotoMessageNode
│   │   │   │   │   │   ├── PhotoMessageNode.tsx
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── PinMessageNode
│   │   │   │   │   │   ├── PinMessageNode.tsx
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── PollNode
│   │   │   │   │   │   ├── PollNode.tsx
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── SendToAdminNode
│   │   │   │   │   │   ├── SendToAdminNode.tsx
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── StickerNode
│   │   │   │   │   │   ├── StickerNode.tsx
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── TextMessageNode
│   │   │   │   │   │   ├── TextMessageNode.tsx
│   │   │   │   │   │   ├── components
│   │   │   │   │   │   │   ├── accordion-item-wrapper.tsx
│   │   │   │   │   │   │   └── dynamic-message-constructor-modal.tsx
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── UnpinMessageNode
│   │   │   │   │   │   ├── UnpinMessageNode.tsx
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── VideoMessageNode
│   │   │   │   │   │   ├── VideoMessageNode.tsx
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── VideoNoteNode
│   │   │   │   │   │   ├── VideoNoteNode.tsx
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── VoiceNode
│   │   │   │   │   │   ├── VoiceNode.tsx
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── shared
│   │   │   │   │       ├── ActionNodeSettings.tsx
│   │   │   │   │       ├── ComingSoonNodeContent.tsx
│   │   │   │   │       ├── NodeHeader.tsx
│   │   │   │   │       ├── RecipientSelector.tsx
│   │   │   │   │       ├── filter
│   │   │   │   │       │   ├── filter-row.tsx
│   │   │   │   │       │   ├── filter.tsx
│   │   │   │   │       │   └── types.ts
│   │   │   │   │       ├── text-area.tsx
│   │   │   │   │       └── types.ts
│   │   │   │   ├── components
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── shared
│   │   │   │   │       ├── ReactFlowHandles
│   │   │   │   │       │   ├── DeleteMessageSource.tsx
│   │   │   │   │       │   ├── EditMessageSource.tsx
│   │   │   │   │       │   ├── ElseMessageSource.tsx
│   │   │   │   │       │   ├── SelectedMessageTarget.tsx
│   │   │   │   │       │   ├── SourceHandles.tsx
│   │   │   │   │       │   ├── TargetHandles.tsx
│   │   │   │   │       │   └── index.ts
│   │   │   │   │       └── index.ts
│   │   │   │   ├── custom
│   │   │   │   │   ├── CallbackAnswerNode
│   │   │   │   │   │   ├── CallbackAnswerNode.tsx
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── CheckMembershipNode
│   │   │   │   │   │   ├── CheckMembershipNode.tsx
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── CollectionNode
│   │   │   │   │   │   ├── CollectionNode.tsx
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── ConditionNode
│   │   │   │   │   │   ├── ConditionNode.tsx
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── CustomCodeNode
│   │   │   │   │   │   ├── CustomCodeNode.tsx
│   │   │   │   │   │   ├── components
│   │   │   │   │   │   │   └── CodeEditorDialog.tsx
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── DelayNode
│   │   │   │   │   │   ├── DelayNode.tsx
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── ElseIfNode
│   │   │   │   │   │   ├── ElseIfNode.tsx
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── ElseNode
│   │   │   │   │   │   ├── ElseNode.tsx
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── FormNode
│   │   │   │   │   │   ├── FormNode.tsx
│   │   │   │   │   │   ├── components
│   │   │   │   │   │   │   ├── add-item-modal.tsx
│   │   │   │   │   │   │   └── form-item.tsx
│   │   │   │   │   │   ├── components
│   │   │   │   │   │   │   ├── add-item-modal.tsx
│   │   │   │   │   │   │   └── form-item.tsx
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── HTTPRequestNode
│   │   │   │   │   │   ├── HTTPRequestNode.tsx
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── LoadCollectionItemNode
│   │   │   │   │   │   ├── LoadCollectionItemNode.tsx
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── RandomNode
│   │   │   │   │   │   ├── RandomNode.tsx
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── StateNode
│   │   │   │   │   │   ├── StateNode.tsx
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── VariableNode
│   │   │   │   │   │   ├── VariableNode.tsx
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
│   │   │   │       ├── CronTriggerNode
│   │   │   │       │   ├── CronTriggerNode.tsx
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
│   │   │   │       │   │   └── TypeSelector.tsx
│   │   │   │       │   ├── index.ts
│   │   │   │       │   ├── types.ts
│   │   │   │       │   └── utils.ts
│   │   │   │       ├── ReplyButtonTrigger
│   │   │   │       │   ├── ReplyButtonTrigger.tsx
│   │   │   │       │   ├── index.ts
│   │   │   │       │   └── types.ts
│   │   │   │       ├── index.ts
│   │   │   │       └── shared
│   │   │   │           ├── StateConfigUI.tsx
│   │   │   │           ├── TriggerHeader.tsx
│   │   │   │           ├── index.ts
│   │   │   │           ├── state-config-helpers.ts
│   │   │   │           └── state-config-types.ts
│   │   │   ├── panel
│   │   │   │   ├── elements
│   │   │   │   │   └── elements.tsx
│   │   │   │   └── pane.tsx
│   │   │   ├── search
│   │   │   │   ├── search-panel.tsx
│   │   │   │   └── search-store.ts
│   │   │   ├── store
│   │   │   │   ├── actions.ts
│   │   │   │   ├── clipboardSlice.ts
│   │   │   │   ├── flowSlice.ts
│   │   │   │   ├── historySlice.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── project.ts
│   │   │   │   └── types.ts
│   │   │   └── utils
│   │   │       ├── get-state-keys.ts
│   │   │       └── index.ts
│   │   ├── collections
│   │   │   └── store
│   │   │       ├── collection-list.ts
│   │   │       └── index.ts
│   │   └── index.ts
│   ├── hooks
│   │   ├── use-ai-chat.ts
│   │   ├── use-debounces.tsx
│   │   ├── use-is-mobile.tsx
│   │   ├── use-keyboard-shortcut.tsx
│   │   └── use-notification.ts
│   ├── i18n
│   │   ├── request.ts
│   │   └── routing.ts
│   ├── lib
│   │   ├── ai-agents.ts
│   │   ├── chat-history-storage.ts
│   │   ├── chech-bot-token.ts
│   │   ├── constants.ts
│   │   ├── env.ts
│   │   ├── error-handler.ts
│   │   ├── file-utils.ts
│   │   ├── input-validators.ts
│   │   ├── landscape-screen.ts
│   │   ├── notification-utils.ts
│   │   ├── query-generator.ts
│   │   ├── tour-steps.ts
│   │   └── utils.ts
│   ├── messages
│   │   ├── en.json
│   │   ├── jp.json
│   │   ├── ru.json
│   │   └── uz.json
│   ├── middleware.ts
│   ├── services
│   │   ├── instance.ts
│   │   ├── react-query
│   │   │   ├── index.ts
│   │   │   ├── use-react-query-action.ts
│   │   │   └── use-scroll-query-action.ts
│   │   └── requests
│   │       ├── ai.ts
│   │       ├── auth.ts
│   │       ├── bot.ts
│   │       └── file.ts
│   ├── types
│   │   ├── auth
│   │   │   ├── get-me.ts
│   │   │   └── login.tsx
│   │   ├── editorjs.d.ts
│   │   ├── element-types.ts
│   │   └── http
│   │       ├── collection.ts
│   │       ├── env.ts
│   │       ├── error.ts
│   │       ├── file.ts
│   │       ├── flow.ts
│   │       ├── project.ts
│   │       └── response.ts
│   └── wss
│       └── web-socket-provider.tsx
├── stack.yaml
└── tsconfig.json
```

## 📄 Muhim Fayllar Tarkibi (içidan: constructor)

*Belgilangan `constructor` papkasidan o'qiladigan fayllar topilmadi.*
