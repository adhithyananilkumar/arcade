/**
 * Semantic icon registry for BadgeIconObject. `iconId` in the document is one of
 * these keys — never rasterized, resolved to an actual vector icon at render
 * time (see useBadgeIconImage below), so a future renderer (SVG export, a
 * different icon set) can resolve the same id differently without touching
 * BadgeDocument. Icons come from lucide-react, already a project dependency —
 * this registry is the only place that imports individual icon components, so
 * swapping the underlying icon set later means editing this one file.
 */
import { createElement, useEffect, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { LucideIcon } from "lucide-react";
import {
  // Achievement & Reward
  Trophy, Medal, Award, Star, Target, Flame, Rocket, Crown, Gem, BadgeCheck, Ribbon,
  ThumbsUp, ThumbsDown, PartyPopper, Sparkles, Zap, Swords, Shield, ShieldCheck, ShieldAlert,
  // Education & Learning
  GraduationCap, BookOpen, FileBadge, BookMarked, Library, PenTool, Microscope, FlaskConical,
  Compass, Pencil, Eraser, Ruler, Calculator, ClipboardList, NotebookPen, Newspaper,
  BookCopy, FileText, FileQuestion, TestTube2,
  // Code & Development
  Code2, TerminalSquare, GitBranch, GitCommit, GitMerge, GitPullRequest, GitFork,
  Braces, Brackets, FileCode2, FolderCode, PackageOpen, Package, Blocks,
  Variable, Hash, Binary, RefreshCw, Play, Square, Pause, SkipForward,
  Bug, BugOff, Webhook, Link, Link2, Unlink,
  // Infrastructure & Cloud
  Cpu, Database, Cloud, CloudUpload, CloudDownload, CloudLightning, Server, ServerCrash,
  HardDrive, HardDriveUpload, HardDriveDownload, Wifi, WifiOff, Network, Globe, Globe2,
  Layers, MonitorSmartphone, Monitor, Laptop, Tablet, Smartphone, Printer, Router,
  // Security & Privacy
  Lock, LockOpen, Key, KeyRound, ShieldOff, Eye, EyeOff, Scan, ScanLine,
  Fingerprint, UserCheck, UserX, Ban, AlertTriangle, AlertCircle, Info,
  // Data & Analytics
  BarChart2, BarChart3, BarChart4, LineChart, PieChart, TrendingUp, TrendingDown,
  Activity, Sigma, Gauge, Sliders, SlidersHorizontal, Table2, DatabaseZap, Filter,
  // Design & Creative
  Palette, Brush, Wand2, Aperture, Pen, Pipette, Layers2, Crop, Scissors, Blend,
  PenLine, Highlighter, Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic,
  // Science & Research
  Atom, Dna, Brain, HeartPulse, Stethoscope, Pill, Syringe, Beaker, Radiation, Magnet,
  Telescope, Satellite, SatelliteDish, Waves,
  // People & Community
  Users, Users2, Heart, Handshake, UserPlus, MessageCircle,
  MessageSquare, MessagesSquare, Send, Bell, BellRing, Mail, MailOpen,
  // Nature & Environment
  Leaf, Sun, Moon, Snowflake, Mountain, TreePine, Wind, CloudRain, Droplets,
  Sprout, Recycle, Battery, BatteryCharging,
  // Business & Work
  Briefcase, Building, Building2, Store, Landmark, Coins, DollarSign,
  Kanban, Calendar, Clock, Timer, AlarmClock,
  // General & Misc
  CheckCircle2, Diamond, Infinity, LayoutGrid, Crosshair, Box, Boxes, Layers3,
  Music, Film, Gamepad2, Headphones, Camera, Video, Radio, Tv,
} from "lucide-react";

export interface BadgeIconCategory {
  label: string;
  icons: Array<{ id: string; label: string }>;
}

const ICON_COMPONENTS: Record<string, LucideIcon> = {
  // Achievement & Reward
  trophy: Trophy, medal: Medal, award: Award, star: Star, target: Target, flame: Flame,
  rocket: Rocket, crown: Crown, gem: Gem, "badge-check": BadgeCheck, ribbon: Ribbon,
  "thumbs-up": ThumbsUp, "party-popper": PartyPopper, spark: Sparkles, lightning: Zap,
  swords: Swords, shield: Shield, "shield-check": ShieldCheck,
  // Education & Learning
  "graduation-cap": GraduationCap, book: BookOpen, certificate: FileBadge,
  "book-marked": BookMarked, library: Library, "pen-tool": PenTool, microscope: Microscope,
  flask: FlaskConical, compass: Compass, pencil: Pencil, eraser: Eraser, ruler: Ruler,
  calculator: Calculator, clipboard: ClipboardList, notebook: NotebookPen,
  newspaper: Newspaper, "book-copy": BookCopy, "file-text": FileText,
  "file-question": FileQuestion, "test-tube": TestTube2,
  // Code & Development
  code: Code2, terminal: TerminalSquare, "git-branch": GitBranch, "git-commit": GitCommit,
  "git-merge": GitMerge, "git-pr": GitPullRequest, "git-fork": GitFork, braces: Braces,
  brackets: Brackets, "file-code": FileCode2, "folder-code": FolderCode,
  package: Package, "package-open": PackageOpen, blocks: Blocks, variable: Variable,
  hash: Hash, binary: Binary, refresh: RefreshCw,
  play: Play, pause: Pause, bug: Bug, "bug-off": BugOff, webhook: Webhook,
  link: Link, "link-2": Link2, unlink: Unlink,
  // Infrastructure & Cloud
  cpu: Cpu, database: Database, cloud: Cloud, "cloud-up": CloudUpload,
  "cloud-down": CloudDownload, "cloud-lightning": CloudLightning, server: Server,
  "server-crash": ServerCrash, "hard-drive": HardDrive, wifi: Wifi, "wifi-off": WifiOff,
  network: Network, globe: Globe, "globe-2": Globe2, layers: Layers,
  monitor: Monitor, laptop: Laptop, tablet: Tablet, smartphone: Smartphone,
  printer: Printer, router: Router,
  // Security & Privacy
  lock: Lock, "lock-open": LockOpen, key: Key, "key-round": KeyRound,
  eye: Eye, "eye-off": EyeOff, scan: Scan, "scan-line": ScanLine,
  fingerprint: Fingerprint, "user-check": UserCheck, "user-x": UserX,
  ban: Ban, "alert-triangle": AlertTriangle, "alert-circle": AlertCircle, info: Info,
  // Data & Analytics
  "bar-chart": BarChart2, "bar-chart-3": BarChart3, "bar-chart-4": BarChart4,
  "line-chart": LineChart, "pie-chart": PieChart, "trend-up": TrendingUp,
  "trend-down": TrendingDown, activity: Activity, sigma: Sigma, gauge: Gauge,
  sliders: Sliders, table: Table2, "db-zap": DatabaseZap, filter: Filter,
  // Design & Creative
  palette: Palette, brush: Brush, wand: Wand2, aperture: Aperture, pen: Pen,
  pipette: Pipette, crop: Crop, scissors: Scissors, "pen-line": PenLine,
  highlighter: Highlighter, type: Type, bold: Bold, italic: Italic,
  music: Music, film: Film, gamepad: Gamepad2, headphones: Headphones,
  camera: Camera, video: Video, radio: Radio, tv: Tv,
  // Science & Research
  atom: Atom, dna: Dna, brain: Brain, "heart-pulse": HeartPulse,
  stethoscope: Stethoscope, pill: Pill, syringe: Syringe, beaker: Beaker,
  radiation: Radiation, magnet: Magnet, telescope: Telescope,
  satellite: Satellite, "satellite-dish": SatelliteDish, waves: Waves,
  // People & Community
  users: Users, "users-2": Users2, heart: Heart, handshake: Handshake,
  "user-plus": UserPlus, "message-circle": MessageCircle, "message-square": MessageSquare,
  send: Send, bell: Bell, "bell-ring": BellRing, mail: Mail, "mail-open": MailOpen,
  // Nature & Environment
  leaf: Leaf, sun: Sun, moon: Moon, snowflake: Snowflake, mountain: Mountain,
  tree: TreePine, wind: Wind, "cloud-rain": CloudRain, droplets: Droplets,
  sprout: Sprout, recycle: Recycle, battery: Battery, "battery-charging": BatteryCharging,
  // Business & Work
  briefcase: Briefcase, building: Building, "building-2": Building2, store: Store,
  landmark: Landmark, coins: Coins, dollar: DollarSign, kanban: Kanban,
  calendar: Calendar, clock: Clock, timer: Timer, "alarm-clock": AlarmClock,
  // General
  check: CheckCircle2, diamond: Diamond, infinity: Infinity, grid: LayoutGrid,
  crosshair: Crosshair, box: Box, boxes: Boxes,
};

export const BADGE_ICON_CATEGORIES: BadgeIconCategory[] = [
  {
    label: "Achievement",
    icons: [
      { id: "trophy", label: "Trophy" }, { id: "medal", label: "Medal" },
      { id: "award", label: "Award" }, { id: "star", label: "Star" },
      { id: "target", label: "Target" }, { id: "flame", label: "Flame" },
      { id: "rocket", label: "Rocket" }, { id: "crown", label: "Crown" },
      { id: "gem", label: "Gem" }, { id: "badge-check", label: "Badge Check" },
      { id: "ribbon", label: "Ribbon" }, { id: "thumbs-up", label: "Thumbs Up" },
      { id: "party-popper", label: "Party" }, { id: "spark", label: "Sparkles" },
      { id: "lightning", label: "Lightning" }, { id: "swords", label: "Swords" },
      { id: "shield", label: "Shield" }, { id: "shield-check", label: "Shield ✓" },
    ],
  },
  {
    label: "Education",
    icons: [
      { id: "graduation-cap", label: "Graduation Cap" }, { id: "book", label: "Book" },
      { id: "certificate", label: "Certificate" }, { id: "book-marked", label: "Bookmark" },
      { id: "library", label: "Library" }, { id: "pen-tool", label: "Pen Tool" },
      { id: "microscope", label: "Microscope" }, { id: "flask", label: "Flask" },
      { id: "compass", label: "Compass" }, { id: "pencil", label: "Pencil" },
      { id: "eraser", label: "Eraser" }, { id: "ruler", label: "Ruler" },
      { id: "calculator", label: "Calculator" }, { id: "clipboard", label: "Clipboard" },
      { id: "notebook", label: "Notebook" }, { id: "newspaper", label: "Newspaper" },
      { id: "book-copy", label: "Book Copy" }, { id: "file-text", label: "File Text" },
      { id: "file-question", label: "Quiz" }, { id: "test-tube", label: "Test Tube" },
    ],
  },
  {
    label: "Code",
    icons: [
      { id: "code", label: "Code" }, { id: "terminal", label: "Terminal" },
      { id: "git-branch", label: "Git Branch" }, { id: "git-commit", label: "Git Commit" },
      { id: "git-merge", label: "Git Merge" }, { id: "git-pr", label: "Pull Request" },
      { id: "git-fork", label: "Git Fork" }, { id: "braces", label: "Braces" },
      { id: "brackets", label: "Brackets" }, { id: "file-code", label: "File Code" },
      { id: "folder-code", label: "Folder Code" }, { id: "package", label: "Package" },
      { id: "package-open", label: "Package Open" }, { id: "blocks", label: "Blocks" },
      { id: "variable", label: "Variable" }, { id: "hash", label: "Hash" },
      { id: "binary", label: "Binary" }, { id: "refresh", label: "Refresh" },
      { id: "play", label: "Run" }, { id: "bug", label: "Bug" },
      { id: "bug-off", label: "Bug Fixed" }, { id: "webhook", label: "Webhook" },
      { id: "link", label: "Link" },
    ],
  },
  {
    label: "Infrastructure",
    icons: [
      { id: "cpu", label: "CPU" }, { id: "database", label: "Database" },
      { id: "cloud", label: "Cloud" }, { id: "cloud-up", label: "Cloud Upload" },
      { id: "cloud-down", label: "Cloud Download" }, { id: "cloud-lightning", label: "Cloud ⚡" },
      { id: "server", label: "Server" }, { id: "server-crash", label: "Server Crash" },
      { id: "hard-drive", label: "Hard Drive" }, { id: "wifi", label: "WiFi" },
      { id: "wifi-off", label: "WiFi Off" }, { id: "network", label: "Network" },
      { id: "globe", label: "Globe" }, { id: "layers", label: "Layers" },
      { id: "monitor", label: "Monitor" }, { id: "laptop", label: "Laptop" },
      { id: "tablet", label: "Tablet" }, { id: "smartphone", label: "Smartphone" },
      { id: "printer", label: "Printer" }, { id: "router", label: "Router" },
    ],
  },
  {
    label: "Security",
    icons: [
      { id: "lock", label: "Lock" }, { id: "lock-open", label: "Unlock" },
      { id: "key", label: "Key" }, { id: "key-round", label: "Key Round" },
      { id: "eye", label: "Eye" }, { id: "eye-off", label: "Eye Off" },
      { id: "scan", label: "Scan" }, { id: "scan-line", label: "Scan Line" },
      { id: "fingerprint", label: "Fingerprint" }, { id: "user-check", label: "User ✓" },
      { id: "ban", label: "Ban" }, { id: "alert-triangle", label: "Warning" },
      { id: "alert-circle", label: "Alert" }, { id: "info", label: "Info" },
    ],
  },
  {
    label: "Data",
    icons: [
      { id: "bar-chart", label: "Bar Chart" }, { id: "bar-chart-3", label: "Bar Chart 3" },
      { id: "line-chart", label: "Line Chart" }, { id: "pie-chart", label: "Pie Chart" },
      { id: "trend-up", label: "Trend Up" }, { id: "trend-down", label: "Trend Down" },
      { id: "activity", label: "Activity" }, { id: "sigma", label: "Sigma" },
      { id: "gauge", label: "Gauge" }, { id: "sliders", label: "Sliders" },
      { id: "table", label: "Table" }, { id: "db-zap", label: "DB Zap" },
      { id: "filter", label: "Filter" },
    ],
  },
  {
    label: "Science",
    icons: [
      { id: "atom", label: "Atom" }, { id: "dna", label: "DNA" },
      { id: "brain", label: "Brain" }, { id: "heart-pulse", label: "Heart Pulse" },
      { id: "stethoscope", label: "Stethoscope" }, { id: "pill", label: "Pill" },
      { id: "syringe", label: "Syringe" }, { id: "beaker", label: "Beaker" },
      { id: "radiation", label: "Radiation" }, { id: "magnet", label: "Magnet" },
      { id: "telescope", label: "Telescope" }, { id: "satellite", label: "Satellite" },
      { id: "waves", label: "Waves" },
    ],
  },
  {
    label: "Design",
    icons: [
      { id: "palette", label: "Palette" }, { id: "brush", label: "Brush" },
      { id: "wand", label: "Wand" }, { id: "aperture", label: "Aperture" },
      { id: "pen", label: "Pen" }, { id: "pipette", label: "Pipette" },
      { id: "crop", label: "Crop" }, { id: "scissors", label: "Scissors" },
      { id: "pen-line", label: "Pen Line" }, { id: "highlighter", label: "Highlighter" },
      { id: "type", label: "Type" }, { id: "bold", label: "Bold" },
      { id: "italic", label: "Italic" }, { id: "music", label: "Music" },
      { id: "film", label: "Film" }, { id: "camera", label: "Camera" },
      { id: "video", label: "Video" }, { id: "headphones", label: "Headphones" },
    ],
  },
  {
    label: "People",
    icons: [
      { id: "users", label: "Users" }, { id: "users-2", label: "Team" },
      { id: "heart", label: "Heart" }, { id: "handshake", label: "Handshake" },
      { id: "user-plus", label: "User Add" }, { id: "message-circle", label: "Message" },
      { id: "message-square", label: "Chat" }, { id: "send", label: "Send" },
      { id: "bell", label: "Bell" }, { id: "bell-ring", label: "Bell Ring" },
      { id: "mail", label: "Mail" }, { id: "mail-open", label: "Mail Open" },
    ],
  },
  {
    label: "Nature",
    icons: [
      { id: "leaf", label: "Leaf" }, { id: "sun", label: "Sun" },
      { id: "moon", label: "Moon" }, { id: "snowflake", label: "Snowflake" },
      { id: "mountain", label: "Mountain" }, { id: "tree", label: "Tree" },
      { id: "wind", label: "Wind" }, { id: "cloud-rain", label: "Rain" },
      { id: "droplets", label: "Droplets" }, { id: "sprout", label: "Sprout" },
      { id: "recycle", label: "Recycle" }, { id: "battery", label: "Battery" },
    ],
  },
  {
    label: "Business",
    icons: [
      { id: "briefcase", label: "Briefcase" }, { id: "building", label: "Building" },
      { id: "building-2", label: "Office" }, { id: "landmark", label: "Landmark" },
      { id: "coins", label: "Coins" }, { id: "dollar", label: "Dollar" },
      { id: "kanban", label: "Kanban" }, { id: "calendar", label: "Calendar" },
      { id: "clock", label: "Clock" }, { id: "timer", label: "Timer" },
      { id: "alarm-clock", label: "Alarm" },
    ],
  },
  {
    label: "General",
    icons: [
      { id: "check", label: "Check" }, { id: "diamond", label: "Diamond" },
      { id: "infinity", label: "Infinity" }, { id: "grid", label: "Grid" },
      { id: "crosshair", label: "Crosshair" }, { id: "box", label: "Box" },
      { id: "boxes", label: "Boxes" }, { id: "gamepad", label: "Gamepad" },
      { id: "radio", label: "Radio" }, { id: "tv", label: "TV" },
    ],
  },
];




export function getBadgeIconComponent(iconId: string): LucideIcon {
  return ICON_COMPONENTS[iconId] ?? ShieldCheck;
}

const dataUrlCache = new Map<string, string>();

function buildIconDataUrl(iconId: string, color: string, strokeWidth: number): string {
  const key = `${iconId}:${color}:${strokeWidth}`;
  const cached = dataUrlCache.get(key);
  if (cached) return cached;

  const Icon = getBadgeIconComponent(iconId);
  // 100x100 at a generous strokeWidth headroom — Konva scales the resulting image
  // to the object's actual width/height, so the source resolution just needs to
  // stay crisp at typical on-canvas sizes (badges render up to 4096px).
  const markup = renderToStaticMarkup(createElement(Icon, { size: 100, color, strokeWidth, absoluteStrokeWidth: true }));
  const url = `data:image/svg+xml;base64,${typeof window !== "undefined" ? window.btoa(markup) : ""}`;
  dataUrlCache.set(key, url);
  return url;
}

/** Loads a badge icon as an HTMLImageElement for use as a Konva <Image>'s `image` prop. */
export function useBadgeIconImage(iconId: string, color: string, strokeWidth = 2): HTMLImageElement | null {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const img = new window.Image();
    img.onload = () => setImage(img);
    img.src = buildIconDataUrl(iconId, color, strokeWidth);
    return () => {
      img.onload = null;
    };
  }, [iconId, color, strokeWidth]);

  return image;
}
