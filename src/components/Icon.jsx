import {
  Zap, BarChart3, TrendingUp, MessageCircle, Settings, Lock, Lightbulb,
  Pencil, FileText, Clock, Target, Clipboard, Sparkles, Share2, Upload,
  ThumbsUp, ThumbsDown, Flame, AlertTriangle, ArrowDown, CheckSquare,
  Hash, Calendar, X, Bell, Bot, Trash2, Eye, Check, ListChecks, Save,
  Loader2, HelpCircle,
} from 'lucide-react';

// Mapa explícito (no `import *`) para que Rollup pueda hacer tree-shaking
// del resto del set de Lucide. Agrega aquí cualquier ícono nuevo que uses.
const ICONS = {
  zap: Zap,
  chart: BarChart3,
  trend: TrendingUp,
  'trending-up': TrendingUp,
  message: MessageCircle,
  settings: Settings,
  lock: Lock,
  lightbulb: Lightbulb,
  pencil: Pencil,
  note: FileText,
  clock: Clock,
  target: Target,
  clipboard: Clipboard,
  sparkles: Sparkles,
  'share-2': Share2,
  upload: Upload,
  'thumbs-up': ThumbsUp,
  'thumbs-down': ThumbsDown,
  flame: Flame,
  'alert-triangle': AlertTriangle,
  'arrow-down': ArrowDown,
  'check-square': CheckSquare,
  'list-checks': ListChecks,
  hash: Hash,
  calendar: Calendar,
  x: X,
  bell: Bell,
  bot: Bot,
  trash: Trash2,
  eye: Eye,
  check: Check,
  save: Save,
  loader: Loader2,
  'help-circle': HelpCircle,
};

// Brand-standard Lucide line icon: stroke 2, round caps, currentColor.
// <Icon name="shopping-cart" size={20} /> — same contract as el design-system Icon.
export default function Icon({ name, size = 20, strokeWidth = 2, color, className, style }) {
  const LucideIcon = ICONS[name];
  if (!LucideIcon) return null;
  return (
    <LucideIcon
      size={size}
      strokeWidth={strokeWidth}
      color={color}
      className={className}
      style={style}
      aria-hidden="true"
    />
  );
}
