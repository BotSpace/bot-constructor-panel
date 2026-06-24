import {
  BadgeCheck,
  Blocks,
  BrainCircuit,
  CalendarClock,
  ChevronRightSquare,
  CircleArrowRight,
  CircleX,
  Clock,
  Code2,
  CodeXml,
  Contact,
  Copy,
  CreditCard,
  Database,
  Dices,
  Download,
  FilePlus2,
  FileText,
  Folder,
  FolderOpen,
  GitBranch,
  Globe,
  Image,
  Images,
  KeyRound,
  LayoutList,
  Link,
  LogOut,
  Megaphone,
  MessageCircle,
  MessageCircleMore,
  MessageSquareDashed,
  Mic,
  Milestone,
  MousePointerClick,
  Music,
  Pencil,
  Pin,
  PinOff,
  Play,
  Plug2,
  RefreshCcw,
  Send,
  Settings2,
  Shuffle,
  Sparkles,
  SplitSquareHorizontal,
  Table2,
  Timer,
  Trash2,
  Truck,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  Variable,
  Video,
  Webhook,
  Wrench,
  Zap,
} from "lucide-react";
import { ReactNode } from "react";

const EMOJI_ICONS: Record<string, string> = {
  sticker: "🎭",
  dice: "🎲",
  poll: "📊",
};

const LUCIDE_ICONS: Record<string, ReactNode> = {
  // ── Triggers ──────────────────────────────────────────────────────────────
  /** CommandTriggerNode: /start /help style command */
  keyboard: <Zap className="text-primary" strokeWidth={2} />,
  /** CronTriggerNode / CronNode / SchedulerNode: scheduled */
  clock: <CalendarClock className="text-primary" strokeWidth={2} />,
  /** MessageTriggerNode: incoming message */
  message: <MessageCircle className="text-primary" strokeWidth={2} />,
  /** CallbackQueryTriggerNode / CallbackButtonTriggerNode: button tap */
  "mouse-pointer": <MousePointerClick className="text-primary" strokeWidth={2} />,
  /** ReplyButtonTriggerNode: reply */
  reply: <MessageSquareDashed className="text-primary" strokeWidth={2} />,
  /** WebhookTriggerNode: webhook */
  globe: <Globe className="text-primary" strokeWidth={2} />,
  /** PreCheckoutTriggerNode */
  "credit-card": <CreditCard className="text-primary" strokeWidth={2} />,
  /** SuccessfulPaymentTriggerNode */
  "badge-check": <BadgeCheck className="text-primary" strokeWidth={2} />,
  /** ChatJoinRequestTriggerNode */
  "user-plus": <UserPlus className="text-primary" strokeWidth={2} />,

  // ── Send / media actions ──────────────────────────────────────────────────
  /** SendTextMessageNode / AnswerInlineQueryNode */
  "arrow-right": <Send className="text-primary" strokeWidth={2} />,
  /** SendPhotoNode */
  photo: <Image className="text-primary" strokeWidth={2} />,
  /** SendVideoNode / SendVideoNoteNode */
  video: <Video className="text-primary" strokeWidth={2} />,
  /** SendAudioNode */
  music: <Music className="text-primary" strokeWidth={2} />,
  /** SendFileNode */
  file: <FileText className="text-primary" strokeWidth={2} />,
  /** SendAnimationNode */
  clapperboard: <Play className="text-primary" strokeWidth={2} />,
  /** SendVoiceNode */
  microphone: <Mic className="text-primary" strokeWidth={2} />,
  /** SendLocationNode / SendVenueNode */
  location: <Milestone className="text-primary" strokeWidth={2} />,
  /** SendContactNode */
  contact: <Contact className="text-primary" strokeWidth={2} />,
  /** SendMediaGroupNode */
  gallery: <Images className="text-primary" strokeWidth={2} />,
  /** SendInvoiceNode / PaymentNode / AIPaymentLinkToolNode */
  "payment": <CreditCard className="text-primary" strokeWidth={2} />,

  // ── Message operations ────────────────────────────────────────────────────
  /** EditMessageNode / EditOrSendMessageNode */
  edit: <Pencil className="text-primary" strokeWidth={2} />,
  /** ForwardMessageNode */
  forward: <CircleArrowRight className="text-primary" strokeWidth={2} />,
  /** SendToAdminNode: megaphone/broadcast */
  admin: <Megaphone className="text-primary" strokeWidth={2} />,
  /** CopyMessageNode */
  copy: <Copy className="text-primary" strokeWidth={2} />,
  /** PinMessageNode */
  pin: <Pin className="text-primary" strokeWidth={2} />,
  /** UnpinMessageNode / UnpinAllMessagesNode */
  unpin: <PinOff className="text-primary" strokeWidth={2} />,
  /** DeleteMessageNode */
  trash: <Trash2 className="text-primary" strokeWidth={2} />,
  /** ChatActionNode: typing indicator */
  typing: <MessageCircleMore className="text-primary" strokeWidth={2} />,
  /** DownloadFileNode / DownloadNode */
  download: <Download className="text-primary" strokeWidth={2} />,
  /** CreateInviteLinkNode */
  link: <Link className="text-primary" strokeWidth={2} />,

  // ── Flow control ──────────────────────────────────────────────────────────
  /** IfConditionNode */
  split: <SplitSquareHorizontal className="text-primary" strokeWidth={2} />,
  /** SwitchNode */
  switch: <GitBranch className="text-primary" strokeWidth={2} />,
  /** ElseIfNode */
  repeat: <RefreshCcw className="text-primary" strokeWidth={2} />,
  /** DelayNode */
  timer: <Timer className="text-primary" strokeWidth={2} />,
  /** RandomNode */
  shuffle: <Shuffle className="text-primary" strokeWidth={2} />,
  /** ForLoopNode */
  loop: <RefreshCcw className="text-primary" strokeWidth={2} />,
  /** ForLoopContinueNode */
  "corner-up-left": <CircleX className="text-primary" strokeWidth={2} />,
  /** FormNode */
  form: <FilePlus2 className="text-primary" strokeWidth={2} />,
  /** CheckMembershipNode */
  users: <Users className="text-primary" strokeWidth={2} />,

  // ── Data / state ──────────────────────────────────────────────────────────
  /** StateNode */
  database: <Database className="text-primary" strokeWidth={2} />,
  /** CollectionNode / LoadCollectionListNode */
  collection: <LayoutList className="text-primary" strokeWidth={2} />,
  /** VariableNode */
  variable: <Variable className="text-primary" strokeWidth={2} />,

  // ── Integration ───────────────────────────────────────────────────────────
  /** HTTPRequestNode / AIHTTPToolNode */
  "http": <Webhook className="text-primary" strokeWidth={2} />,
  /** SubFlowNode */
  plugin: <Blocks className="text-primary" strokeWidth={2} />,
  /** SubFlowExitNode */
  door: <LogOut className="text-primary" strokeWidth={2} />,
  /** CallbackQueryAnswerNode */
  "callback-answer": <ChevronRightSquare className="text-primary" strokeWidth={2} />,
  /** GoogleSheetsNode / AIGoogleSheetsToolNode */
  table: <Table2 className="text-primary" strokeWidth={2} />,
  /** GoogleDriveNode */
  folder: <FolderOpen className="text-primary" strokeWidth={2} />,

  // ── User management ───────────────────────────────────────────────────────
  "user-check": <UserCheck className="text-primary" strokeWidth={2} />,
  "user-x": <UserMinus className="text-primary" strokeWidth={2} />,

  // ── AI ────────────────────────────────────────────────────────────────────
  /** AIAgentNode / AIKnowledgeToolNode */
  "brain-circuit": <BrainCircuit className="text-primary" strokeWidth={2} />,
  /** AIOpenAI / Gemini / Anthropic / Ollama provider — sparkle for AI providers */
  "settings-2": <Sparkles className="text-primary" strokeWidth={2} />,
  /** wrench */
  wrench: <Wrench className="text-primary" strokeWidth={2} />,
  /** AICustomCodeToolNode */
  "code-2": <CodeXml className="text-primary" strokeWidth={2} />,
  /** AIKnowledgeToolNode */
  "knowledge": <BrainCircuit className="text-primary" strokeWidth={2} />,
  /** AICollectionToolNode */
  "ai-collection": <LayoutList className="text-primary" strokeWidth={2} />,
  /** AIDateTimeToolNode */
  "datetime": <Clock className="text-primary" strokeWidth={2} />,

  // ── Custom code ───────────────────────────────────────────────────────────
  /** CustomCodeNode */
  code: <Code2 className="text-primary" strokeWidth={2} />,

  // ── Credentials / security ────────────────────────────────────────────────
  "key": <KeyRound className="text-primary" strokeWidth={2} />,
  "credential": <KeyRound className="text-primary" strokeWidth={2} />,

  // ── Misc ──────────────────────────────────────────────────────────────────
  zap: <Zap className="text-primary" strokeWidth={2} />,
  "plug": <Plug2 className="text-primary" strokeWidth={2} />,
  "truck": <Truck className="text-primary" strokeWidth={2} />,
};

export function resolveNodeIcon(iconName: string): ReactNode | string {
  if (EMOJI_ICONS[iconName]) {
    return EMOJI_ICONS[iconName];
  }

  if (LUCIDE_ICONS[iconName]) {
    return LUCIDE_ICONS[iconName];
  }

  // Graceful fallback — use a neutral icon instead of a placeholder box.
  return <Sparkles className="text-primary" strokeWidth={2} />;
}
