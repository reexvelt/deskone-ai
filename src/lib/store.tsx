import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export type MissionStatus = "planning" | "awaiting_approval" | "running" | "completed" | "cancelled" | "failed";
export type ProjectStatus = "active" | "paused" | "archived" | "completed";
export type NotificationCategory = "mission_completed" | "mission_failed" | "approval_required" | "integration_error" | "system_update";
export type ProviderId = "openai" | "gemini" | "claude" | "openrouter";

export interface ExecutionStep {
  id: string;
  title: string;
  description: string;
  app?: string;
  status: "pending" | "running" | "done" | "failed";
  completedAt?: number;
}

export interface MissionLog {
  ts: number;
  level: "info" | "success" | "warn" | "error";
  message: string;
}

export interface MissionFile {
  id: string;
  name: string;
  size: string;
  kind: string;
}

export interface Mission {
  id: string;
  title: string;
  objective: string;
  status: MissionStatus;
  progress: number;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  estimatedMinutes: number;
  apps: string[];
  steps: ExecutionStep[];
  logs: MissionLog[];
  outputs: string[];
  files: MissionFile[];
  projectId?: string;
  cost?: number;
}

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "editor" | "viewer";
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  color: string;
  cover: string;
  createdAt: number;
  updatedAt: number;
  missionCount: number;
  apps: string[];
  ownerId: string;
  members: ProjectMember[];
  notes?: string;
}

export interface Integration {
  id: string;
  name: string;
  category: string;
  connected: boolean;
  description: string;
  permissions?: string[];
  lastSync?: number;
  authStatus?: "healthy" | "reauth_required" | "revoked" | "pending";
  health?: number; // 0-100
  supportedActions?: string[];
  accent?: string;
}

export interface AIModelInfo {
  id: string;
  name: string;
  provider: string;
  description: string;
  enabled: boolean;
  tag: "reasoning" | "fast" | "creative" | "vision";
}

export interface AIProvider {
  id: ProviderId;
  name: string;
  description: string;
  defaultModel: string;
  enabled: boolean;
  isDefault: boolean;
  apiKeyId?: string;
  status: "connected" | "disconnected" | "error";
  lastTestedAt?: number;
}

export interface ApiKey {
  id: string;
  providerId: ProviderId;
  label: string;
  maskedKey: string;
  createdAt: number;
  lastTestedAt?: number;
  status: "valid" | "invalid" | "untested";
}

export interface NotificationItem {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  ts: number;
  read: boolean;
  archived: boolean;
  missionId?: string;
}

export interface KnowledgeFile {
  id: string;
  name: string;
  type: "pdf" | "doc" | "sheet" | "image" | "text";
  size: string;
  uploadedAt: number;
  missionUsage: number;
  tag?: string;
}

export type AssetKind = "script" | "title" | "description" | "caption" | "hashtag" | "cta" | "media";
export type AssetStatus = "draft" | "approved";
export type PublishState = "idle" | "draft" | "scheduled" | "published";

export interface AssetPublish {
  platform: string;
  state: PublishState;
  scheduledAt?: number;
  publishedAt?: number;
}

export interface ProjectAsset {
  id: string;
  projectId: string;
  missionId?: string;
  kind: AssetKind;
  title: string;
  body: string;
  status: AssetStatus;
  createdAt: number;
  updatedAt: number;
  mediaName?: string;
  mediaKind?: "video" | "audio" | "image" | "document";
  publish?: AssetPublish;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: number;
  time?: string;
  type: "mission" | "publish" | "deadline" | "reminder";
  color: string;
}

export interface WorkspaceMemory {
  workspaceName: string;
  brandName: string;
  brandColors: string[];
  writingTone: string;
  preferredModel: string;
  favoriteTemplates: string[];
  workingHoursStart: string;
  workingHoursEnd: string;
  timeZone: string;
  language: string;
  socialAccounts: { platform: string; handle: string }[];
  businessInfo: string;
}


interface StoreState {
  missions: Mission[];
  projects: Project[];
  integrations: Integration[];
  models: AIModelInfo[];
  providers: AIProvider[];
  apiKeys: ApiKey[];
  notifications: NotificationItem[];
  knowledge: KnowledgeFile[];
  events: CalendarEvent[];
  workspace: WorkspaceMemory;
  assets: ProjectAsset[];
  credits: { used: number; total: number };
  createMissionDraft: (title: string, projectId?: string) => Mission;
  approveMission: (id: string) => void;
  cancelMission: (id: string) => void;
  retryMission: (id: string) => void;
  duplicateMission: (id: string) => Mission | null;
  deleteMission: (id: string) => void;
  updateMission: (id: string, patch: Partial<Mission>) => void;
  assignMissionToProject: (missionId: string, projectId: string | undefined) => void;
  createProject: (input: { name: string; description?: string; color?: string; cover?: string }) => Project;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  toggleIntegration: (id: string) => void;
  syncIntegration: (id: string) => void;
  reconnectIntegration: (id: string) => void;
  toggleModel: (id: string) => void;
  updateProvider: (id: ProviderId, patch: Partial<AIProvider>) => void;
  setDefaultProvider: (id: ProviderId) => void;
  testProvider: (id: ProviderId) => Promise<boolean>;
  addApiKey: (input: { providerId: ProviderId; label: string; rawKey: string }) => ApiKey;
  removeApiKey: (id: string) => void;
  testApiKey: (id: string) => Promise<boolean>;
  updateWorkspace: (patch: Partial<WorkspaceMemory>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  archiveNotification: (id: string) => void;
  addKnowledgeFile: (f: Omit<KnowledgeFile, "id" | "uploadedAt" | "missionUsage">) => void;
  removeKnowledgeFile: (id: string) => void;
  addAsset: (input: Omit<ProjectAsset, "id" | "createdAt" | "updatedAt" | "status"> & { status?: AssetStatus }) => ProjectAsset;
  updateAsset: (id: string, patch: Partial<ProjectAsset>) => void;
  approveAsset: (id: string) => void;
  deleteAsset: (id: string) => void;
  regenerateAsset: (id: string) => void;
  setAssetPublish: (id: string, publish: AssetPublish | undefined) => void;
}


const StoreCtx = createContext<StoreState | null>(null);

const APPS = ["Gmail", "Google Drive", "Notion", "YouTube", "Slack", "Figma", "GitHub", "Linear", "Stripe", "X"];

const COVERS = [
  "linear-gradient(135deg, #3B82F6 0%, #7C5CFF 100%)",
  "linear-gradient(135deg, #7C5CFF 0%, #EC4899 100%)",
  "linear-gradient(135deg, #22C55E 0%, #3B82F6 100%)",
  "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",
  "linear-gradient(135deg, #06B6D4 0%, #7C5CFF 100%)",
  "linear-gradient(135deg, #0F172A 0%, #3B82F6 100%)",
];

export const PROJECT_COVERS = COVERS;

function planFor(title: string, workspace?: WorkspaceMemory): { objective: string; steps: ExecutionStep[]; apps: string[]; minutes: number } {
  const t = title.toLowerCase();
  const pick = (arr: string[], n: number) => arr.slice(0, n);
  let apps: string[] = ["Notion", "Google Drive"];
  let minutes = 8;
  let steps: Omit<ExecutionStep, "id" | "status">[] = [];

  if (t.includes("ebook") || t.includes("launch")) {
    apps = ["Notion", "Gmail", "Stripe", "X"];
    minutes = 22;
    steps = [
      { title: "Draft launch narrative", description: "Craft positioning, hook, and audience angles.", app: "Notion" },
      { title: "Generate landing copy", description: "Hero, features, testimonials, CTA blocks.", app: "Notion" },
      { title: "Prepare Stripe checkout", description: "Create product, price, and payment link.", app: "Stripe" },
      { title: "Compose announcement email", description: "Segment list and prepare send.", app: "Gmail" },
      { title: "Schedule social thread", description: "5-tweet launch thread.", app: "X" },
    ];
  } else if (t.includes("youtube") || t.includes("video")) {
    apps = ["YouTube", "Google Drive", "Notion"];
    minutes = 18;
    steps = [
      { title: "Research topic angles", description: "Trending queries and competitor scan.", app: "YouTube" },
      { title: "Write script", description: "Full narration with hooks and B-roll cues.", app: "Notion" },
      { title: "Generate thumbnail concepts", description: "3 variants with A/B copy.", app: "Google Drive" },
      { title: "Draft title & description", description: "SEO-optimized with chapters.", app: "YouTube" },
    ];
  } else if (t.includes("landing") || t.includes("page") || t.includes("site")) {
    apps = ["Figma", "GitHub", "Notion"];
    minutes = 14;
    steps = [
      { title: "Define information architecture", description: "Sections, hierarchy, primary CTA.", app: "Notion" },
      { title: "Generate wireframe", description: "Low-fidelity blocks in Figma.", app: "Figma" },
      { title: "Produce copy", description: "Hero, value props, social proof, FAQ.", app: "Notion" },
      { title: "Scaffold repository", description: "Initial commit and CI setup.", app: "GitHub" },
    ];
  } else if (t.includes("newsletter") || t.includes("email") || t.includes("campaign")) {
    apps = ["Gmail", "Notion"];
    minutes = 10;
    steps = [
      { title: "Outline campaign arc", description: "3-email sequence with goal per email.", app: "Notion" },
      { title: "Write email 1 · hook", description: "Curiosity-led opener.", app: "Gmail" },
      { title: "Write email 2 · value", description: "Case study or deep insight.", app: "Gmail" },
      { title: "Write email 3 · offer", description: "Clear CTA and urgency.", app: "Gmail" },
    ];
  } else if (t.includes("drive") || t.includes("organize") || t.includes("clean")) {
    apps = ["Google Drive"];
    minutes = 6;
    steps = [
      { title: "Audit current structure", description: "Map folders and detect duplicates.", app: "Google Drive" },
      { title: "Propose new taxonomy", description: "Client / Project / Year hierarchy.", app: "Google Drive" },
      { title: "Move & rename files", description: "Batch operation with rollback plan.", app: "Google Drive" },
    ];
  } else if (t.includes("social") || t.includes("content") || t.includes("weekly")) {
    apps = ["X", "Notion", "Slack"];
    minutes = 12;
    steps = [
      { title: "Pick weekly themes", description: "5 content pillars tuned to audience.", app: "Notion" },
      { title: "Draft 7 posts", description: "One per day, tone matched.", app: "X" },
      { title: "Schedule and notify team", description: "Queue posts and ping Slack.", app: "Slack" },
    ];
  } else {
    apps = pick(APPS, 3);
    minutes = 10;
    steps = [
      { title: "Understand the objective", description: "Clarify success criteria and constraints.", app: "Notion" },
      { title: "Draft execution strategy", description: "Break work into concrete deliverables." },
      { title: "Produce first draft", description: "Generate initial artifacts across apps." },
      { title: "Review & finalize", description: "Polish outputs and prepare handoff." },
    ];
  }

  const brand = workspace?.brandName ? ` for ${workspace.brandName}` : "";
  return {
    objective: `Autonomously ${title.trim().replace(/\.$/, "")}${brand} using connected apps, with human approval at key checkpoints.`,
    apps,
    minutes,
    steps: steps.map((s) => ({ ...s, id: crypto.randomUUID(), status: "pending" })),
  };
}

const OWNER: ProjectMember = { id: "u1", name: "You", email: "", role: "owner" };

/**
 * Integration catalogue. This is a static list of *available* services, not
 * user data — nothing is pre-connected. Users connect what they actually use.
 */
const availableIntegrations = (): Integration[] => {
  const mk = (
    id: string, name: string, category: string,
    description: string, accent: string,
    opts: { perms?: string[]; actions?: string[] } = {},
  ): Integration => ({
    id, name, category, connected: false, description, accent,
    permissions: opts.perms,
    supportedActions: opts.actions,
  });
  return [
    // AI
    mk("openai", "OpenAI", "AI", "GPT reasoning & multimodal models.", "#10A37F", { perms: ["chat.completions", "embeddings", "images"], actions: ["Generate text", "Embed", "Image gen"] }),
    mk("gemini", "Google Gemini", "AI", "Multimodal Gemini 2.5 family.", "#4285F4", { perms: ["generate", "embed"], actions: ["Generate", "Vision"] }),
    mk("claude", "Anthropic Claude", "AI", "Long-context reasoning.", "#D97757", { perms: ["messages"], actions: ["Generate", "Analyze"] }),
    mk("elevenlabs", "ElevenLabs", "AI", "Text-to-speech voices.", "#111111", { perms: ["voices", "generate"], actions: ["TTS", "Voice clone"] }),

    // Storage
    mk("gdrive", "Google Drive", "Storage", "Read and write files.", "#1FA463", { perms: ["drive.file", "drive.metadata"], actions: ["Upload", "Search", "Share"] }),
    mk("gdocs", "Google Docs", "Storage", "Create and edit documents.", "#4285F4", { perms: ["docs.readwrite"], actions: ["Create", "Edit"] }),
    mk("gsheets", "Google Sheets", "Storage", "Structured data workflows.", "#0F9D58", { perms: ["sheets.readwrite"], actions: ["Read rows", "Append", "Update"] }),
    mk("dropbox", "Dropbox", "Storage", "Cloud file storage.", "#0061FF", { perms: ["files.content.write"], actions: ["Upload", "Share"] }),
    mk("onedrive", "OneDrive", "Storage", "Microsoft cloud storage.", "#0078D4", { perms: ["files.readwrite"], actions: ["Upload", "Sync"] }),
    mk("notion", "Notion", "Storage", "Docs and databases.", "#000000", { perms: ["read_content", "update_content"], actions: ["Create page", "Update DB"] }),

    // Communication
    mk("gmail", "Gmail", "Communication", "Send and manage email.", "#EA4335", { perms: ["gmail.send", "gmail.compose"], actions: ["Send", "Draft", "Search"] }),
    mk("slack", "Slack", "Communication", "Post and read messages.", "#4A154B", { perms: ["chat:write", "channels:read"], actions: ["Post", "Notify"] }),
    mk("discord", "Discord", "Communication", "Server automations.", "#5865F2", { perms: ["messages.send"], actions: ["Post", "Webhook"] }),

    // Publishing
    mk("youtube", "YouTube", "Publishing", "Upload and manage videos.", "#FF0000", { perms: ["youtube.upload"], actions: ["Upload", "Schedule", "Update meta"] }),
    mk("instagram", "Instagram", "Publishing", "Publish reels, posts, stories.", "#E1306C", { perms: ["publish_content"], actions: ["Post", "Reel", "Story"] }),
    mk("tiktok", "TikTok", "Publishing", "Upload and schedule videos.", "#010101", { perms: ["video.publish"], actions: ["Upload", "Schedule"] }),
    mk("linkedin", "LinkedIn", "Publishing", "Publish posts and articles.", "#0A66C2", { perms: ["w_member_social"], actions: ["Post", "Article"] }),
    mk("x", "X", "Publishing", "Post and schedule threads.", "#000000", { perms: ["tweet.write"], actions: ["Post", "Thread", "Schedule"] }),
    mk("facebook", "Facebook", "Publishing", "Pages and posts.", "#1877F2", { perms: ["pages_manage_posts"], actions: ["Post", "Schedule"] }),
    mk("wordpress", "WordPress", "Publishing", "Publish blog posts.", "#21759B", { perms: ["posts.publish"], actions: ["Draft", "Publish"] }),

    // Content tools
    mk("gcal", "Google Calendar", "Content", "Schedule and reminders.", "#4285F4", { perms: ["calendar.events"], actions: ["Create event", "Reminder"] }),
    mk("figma", "Figma", "Content", "Frames and design assets.", "#F24E1E", { perms: ["files:read"], actions: ["Read frames", "Export"] }),
    mk("canva", "Canva", "Content", "Design and templates.", "#00C4CC", { perms: ["designs.read"], actions: ["Export", "Duplicate"] }),

    // Productivity
    mk("github", "GitHub", "Productivity", "Repos, PRs, issues.", "#24292F", { perms: ["repo", "workflow"], actions: ["Create PR", "Issue", "Release"] }),
    mk("linear", "Linear", "Productivity", "Issues and cycles.", "#5E6AD2", { perms: ["issues.write"], actions: ["Create issue", "Update"] }),
    mk("stripe", "Stripe", "Productivity", "Products and checkout.", "#635BFF", { perms: ["products.write"], actions: ["Product", "Payment link"] }),
  ];
};

/** Model catalogue — availability, not usage data. */
const availableModels = (): AIModelInfo[] => [
  { id: "orion", name: "Orion 1", provider: "AnchorSpace", description: "Balanced reasoning model.", enabled: true, tag: "reasoning" },
  { id: "orion-pro", name: "Orion Pro", provider: "AnchorSpace", description: "Deep planning and long context.", enabled: true, tag: "reasoning" },
  { id: "quartz", name: "Quartz", provider: "AnchorSpace", description: "Ultra-fast utility model.", enabled: true, tag: "fast" },
  { id: "muse", name: "Muse", provider: "AnchorSpace", description: "Creative writing and copy.", enabled: false, tag: "creative" },
  { id: "lens", name: "Lens", provider: "AnchorSpace", description: "Vision and screenshots.", enabled: false, tag: "vision" },
];

/** Provider catalogue — all start disconnected until the user adds a key. */
const availableProviders = (): AIProvider[] => [
  { id: "openai", name: "OpenAI", description: "GPT-class reasoning and multimodal models.", defaultModel: "gpt-5", enabled: false, isDefault: false, status: "disconnected" },
  { id: "gemini", name: "Google Gemini", description: "Multimodal Gemini 2.5 family.", defaultModel: "gemini-2.5-pro", enabled: false, isDefault: false, status: "disconnected" },
  { id: "claude", name: "Anthropic Claude", description: "Long-context reasoning and writing.", defaultModel: "claude-sonnet-4", enabled: false, isDefault: false, status: "disconnected" },
  { id: "elevenlabs", name: "ElevenLabs", description: "Voice synthesis and narration.", defaultModel: "eleven_multilingual_v2", enabled: false, isDefault: false, status: "disconnected" },
  { id: "openrouter", name: "OpenRouter", description: "Unified router across many providers.", defaultModel: "auto", enabled: false, isDefault: false, status: "disconnected" },
];

/** A brand-new workspace starts empty — the user fills this in. */
const emptyWorkspace = (): WorkspaceMemory => ({
  workspaceName: "",
  brandName: "",
  brandColors: [],
  writingTone: "",
  preferredModel: "Orion Pro",
  favoriteTemplates: [],
  workingHoursStart: "09:00",
  workingHoursEnd: "18:00",
  timeZone: typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC",
  language: "English",
  socialAccounts: [],
  businessInfo: "",
});

const KEY = "anchorspace.store.v6";


const HASHTAG_POOLS: Record<string, string[]> = {
  default: ["#AItools", "#Productivity", "#ContentCreator", "#BuildInPublic", "#SaaS", "#Automation", "#Founders", "#Marketing"],
};

export function generateAssetBody(kind: AssetKind, subject: string, workspace?: WorkspaceMemory): string {
  const brand = workspace?.brandName ?? "AnchorSpace";
  const s = subject.trim() || "your content";
  switch (kind) {
    case "script":
      return `HOOK\nStop scrolling — here's how ${s} actually ships in one afternoon with ${brand}.\n\nBODY\n1. The one belief holding creators back.\n2. What execution looks like when AI runs your stack.\n3. Live walk-through: from prompt to published.\n\nCTA\nSave this. Try ${brand} free. Tell a friend who's still chatting instead of shipping.`;
    case "title":
      return `1. The end of chatting with AI\n2. I let ${brand} run my ${s} — here's what happened\n3. From prompt to production in 22 minutes\n4. This is what execution actually looks like\n5. Stop chatting. Start shipping.`;
    case "description":
      return `${brand} is an AI execution platform. Instead of chatting, you set missions and watch them ship — connected to the tools you already use. In this ${s} I run a full workflow from a single prompt, end to end.`;
    case "caption":
      return `Not another AI tool. An execution engine.\n\nWatch how ${s} went from idea to shipped in one afternoon. Save this if you're building.`;
    case "hashtag":
      return HASHTAG_POOLS.default.join(" ");
    case "cta":
      return `Ready to stop chatting and start shipping? Try ${brand} free — set your first mission in under a minute. Link in bio.`;
    case "media":
      return s;
  }
}

function regenerateBody(kind: AssetKind, current: string, workspace?: WorkspaceMemory): string {
  const seed = current.split("\n")[0] ?? "";
  return generateAssetBody(kind, seed.replace(/[^a-zA-Z0-9 ]+/g, "").slice(0, 40) || "your content", workspace);
}


function maskKey(raw: string) {
  const trimmed = raw.trim();
  if (trimmed.length <= 8) return "•".repeat(Math.max(trimmed.length, 4));
  return `${trimmed.slice(0, 3)}${"•".repeat(Math.max(trimmed.length - 7, 6))}${trimmed.slice(-4)}`;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [models, setModels] = useState<AIModelInfo[]>([]);
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeFile[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [workspace, setWorkspace] = useState<WorkspaceMemory>(emptyWorkspace());
  const [assets, setAssets] = useState<ProjectAsset[]>([]);
  const [credits] = useState({ used: 0, total: 10000 });
  const hydrated = useRef(false);

  useEffect(() => {
    // Fresh workspaces start completely empty — only the service catalogues
    // (integrations, models, providers) are pre-populated.
    let data: Record<string, unknown> = {};
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) data = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      /* corrupt cache — start clean */
    }
    setMissions((data.missions as Mission[]) ?? []);
    setProjects((data.projects as Project[]) ?? []);
    setIntegrations((data.integrations as Integration[]) ?? availableIntegrations());
    setModels((data.models as AIModelInfo[]) ?? availableModels());
    setProviders((data.providers as AIProvider[]) ?? availableProviders());
    setApiKeys((data.apiKeys as ApiKey[]) ?? []);
    setNotifications((data.notifications as NotificationItem[]) ?? []);
    setKnowledge((data.knowledge as KnowledgeFile[]) ?? []);
    setEvents((data.events as CalendarEvent[]) ?? []);
    setWorkspace((data.workspace as WorkspaceMemory) ?? emptyWorkspace());
    setAssets((data.assets as ProjectAsset[]) ?? []);
    hydrated.current = true;
  }, []);

  useEffect(() => {
    // Persist only after hydration, so an empty workspace (or a user who just
    // deleted everything) is saved correctly instead of being re-seeded.
    if (!hydrated.current) return;
    localStorage.setItem(KEY, JSON.stringify({ missions, projects, integrations, models, providers, apiKeys, notifications, knowledge, events, workspace, assets }));
  }, [missions, projects, integrations, models, providers, apiKeys, notifications, knowledge, events, workspace, assets]);



  // === Mission Execution Engine ===
  // Advances running missions step-by-step in near-real-time, producing outputs,
  // files, logs, and a completion notification.
  const engineRef = useRef<number | null>(null);
  useEffect(() => {
    if (engineRef.current) window.clearInterval(engineRef.current);
    engineRef.current = window.setInterval(() => {
      setMissions((ms) => {
        let changed = false;
        const next = ms.map((m) => {
          if (m.status !== "running") return m;
          const steps = [...m.steps];
          const runningIdx = steps.findIndex((s) => s.status === "running");
          const idx = runningIdx === -1 ? steps.findIndex((s) => s.status === "pending") : runningIdx;
          if (idx === -1) return m;

          // Promote pending -> running
          if (steps[idx].status === "pending") {
            steps[idx] = { ...steps[idx], status: "running" };
            changed = true;
            return {
              ...m,
              steps,
              logs: [...m.logs, { ts: Date.now(), level: "info" as const, message: `Starting: ${steps[idx].title}` }],
            };
          }

          // Complete current running step
          const completed: ExecutionStep = { ...steps[idx], status: "done", completedAt: Date.now() };
          steps[idx] = completed;
          const doneCount = steps.filter((s) => s.status === "done").length;
          const progress = Math.round((doneCount / steps.length) * 100);
          const newOutputs = [...m.outputs, completed.title];
          const newFiles: MissionFile[] = [
            ...m.files,
            {
              id: crypto.randomUUID(),
              name: `${completed.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}.md`,
              size: `${8 + Math.floor(Math.random() * 40)} KB`,
              kind: "doc",
            },
          ];
          const cost = Number(((m.cost ?? 0) + 0.12 + Math.random() * 0.18).toFixed(2));
          const logs = [...m.logs, { ts: Date.now(), level: "success" as const, message: `${completed.title} — done` }];

          const allDone = doneCount === steps.length;
          changed = true;
          if (allDone) {
            return {
              ...m,
              steps,
              progress: 100,
              status: "completed" as MissionStatus,
              completedAt: Date.now(),
              outputs: newOutputs,
              files: newFiles,
              cost,
              logs: [...logs, { ts: Date.now(), level: "success" as const, message: "Mission completed." }],
            };
          }
          // Promote next pending to running immediately
          const nextIdx = steps.findIndex((s) => s.status === "pending");
          if (nextIdx !== -1) steps[nextIdx] = { ...steps[nextIdx], status: "running" };

          return { ...m, steps, progress, outputs: newOutputs, files: newFiles, cost, logs };
        });

        // Emit completion notifications for missions that just completed
        const justCompleted = next.filter(
          (m, i) => m.status === "completed" && ms[i]?.status === "running",
        );
        if (justCompleted.length) {
          setNotifications((cur) => [
            ...justCompleted.map<NotificationItem>((m) => ({
              id: crypto.randomUUID(),
              category: "mission_completed",
              title: "Mission completed",
              body: `${m.title} finished with ${m.outputs.length} outputs.`,
              ts: Date.now(),
              read: false,
              archived: false,
              missionId: m.id,
            })),
            ...cur,
          ]);
        }
        return changed ? next : ms;
      });
    }, 2500);
    return () => {
      if (engineRef.current) window.clearInterval(engineRef.current);
    };
  }, []);

  const value: StoreState = useMemo(
    () => ({
      missions, projects, integrations, models, providers, apiKeys, notifications, knowledge, events, workspace, assets, credits,
      createMissionDraft(title, projectId) {
        const plan = planFor(title, workspace);
        const mission: Mission = {
          id: crypto.randomUUID(),
          title: title.trim(),
          objective: plan.objective,
          status: "awaiting_approval",
          progress: 0,
          createdAt: Date.now(),
          estimatedMinutes: plan.minutes,
          apps: plan.apps,
          steps: plan.steps,
          logs: [
            { ts: Date.now(), level: "info" as const, message: "Understanding request." },
            { ts: Date.now() + 1, level: "info" as const, message: "Execution plan generated. Awaiting approval." },
          ],
          outputs: [],
          files: [],
          projectId,
          cost: 0,
        };
        setMissions((m) => [mission, ...m]);
        if (projectId) {
          setProjects((ps) => ps.map((p) => (p.id === projectId ? { ...p, missionCount: p.missionCount + 1, updatedAt: Date.now() } : p)));
        }
        return mission;
      },
      approveMission(id) {
        setMissions((ms) =>
          ms.map((m) =>
            m.id === id
              ? {
                  ...m,
                  status: "running",
                  startedAt: Date.now(),
                  progress: 5,
                  logs: [...m.logs, { ts: Date.now(), level: "success", message: "Mission approved. Execution started." }],
                  steps: m.steps.map((s, i) => (i === 0 ? { ...s, status: "running" } : s)),
                }
              : m,
          ),
        );
      },
      cancelMission(id) {
        setMissions((ms) =>
          ms.map((m) =>
            m.id === id
              ? { ...m, status: "cancelled", logs: [...m.logs, { ts: Date.now(), level: "warn", message: "Mission cancelled." }] }
              : m,
          ),
        );
      },
      retryMission(id) {
        setMissions((ms) =>
          ms.map((m) =>
            m.id === id
              ? {
                  ...m,
                  status: "running",
                  progress: 5,
                  startedAt: Date.now(),
                  completedAt: undefined,
                  steps: m.steps.map((s, i) => ({ ...s, status: i === 0 ? "running" : "pending", completedAt: undefined })),
                  logs: [...m.logs, { ts: Date.now(), level: "info", message: "Mission retried." }],
                }
              : m,
          ),
        );
      },
      duplicateMission(id) {
        const src = missions.find((m) => m.id === id);
        if (!src) return null;
        const copy: Mission = {
          ...src,
          id: crypto.randomUUID(),
          title: `${src.title} (copy)`,
          status: "awaiting_approval",
          progress: 0,
          createdAt: Date.now(),
          startedAt: undefined,
          completedAt: undefined,
          steps: src.steps.map((s) => ({ ...s, id: crypto.randomUUID(), status: "pending", completedAt: undefined })),
          logs: [{ ts: Date.now(), level: "info", message: "Duplicated from mission." }],
          outputs: [],
          files: [],
          cost: 0,
        };
        setMissions((m) => [copy, ...m]);
        return copy;
      },
      deleteMission(id) {
        setMissions((ms) => ms.filter((m) => m.id !== id));
      },
      updateMission(id, patch) {
        setMissions((ms) => ms.map((m) => (m.id === id ? { ...m, ...patch } : m)));
      },
      createProject(input) {
        const p: Project = {
          id: crypto.randomUUID(),
          name: input.name.trim(),
          description: input.description?.trim() ?? "",
          status: "active",
          color: input.color ?? "#3B82F6",
          cover: input.cover ?? COVERS[Math.floor(Math.random() * COVERS.length)],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          missionCount: 0,
          apps: [],
          ownerId: "u1",
          members: [OWNER],
        };
        setProjects((ps) => [p, ...ps]);
        return p;
      },
      updateProject(id, patch) {
        setProjects((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p)));
      },
      deleteProject(id) {
        setProjects((ps) => ps.filter((p) => p.id !== id));
        setMissions((ms) => ms.map((m) => (m.projectId === id ? { ...m, projectId: undefined } : m)));
      },
      toggleIntegration(id) {
        setIntegrations((xs) => xs.map((i) => (i.id === id
          ? { ...i, connected: !i.connected, lastSync: !i.connected ? Date.now() : i.lastSync, authStatus: !i.connected ? "healthy" : undefined, health: !i.connected ? 98 : undefined }
          : i)));
      },
      syncIntegration(id) {
        setIntegrations((xs) => xs.map((i) => (i.id === id && i.connected
          ? { ...i, lastSync: Date.now(), health: Math.min(100, (i.health ?? 90) + 4) }
          : i)));
      },
      reconnectIntegration(id) {
        setIntegrations((xs) => xs.map((i) => (i.id === id
          ? { ...i, connected: true, authStatus: "healthy", health: 99, lastSync: Date.now() }
          : i)));
      },
      toggleModel(id) {
        setModels((xs) => xs.map((i) => (i.id === id ? { ...i, enabled: !i.enabled } : i)));
      },
      updateProvider(id, patch) {
        setProviders((xs) => xs.map((p) => (p.id === id ? { ...p, ...patch } : p)));
      },
      setDefaultProvider(id) {
        setProviders((xs) => xs.map((p) => ({ ...p, isDefault: p.id === id })));
      },
      async testProvider(id) {
        const key = apiKeys.find((k) => k.providerId === id);
        await new Promise((r) => setTimeout(r, 900));
        const ok = !!key;
        setProviders((xs) =>
          xs.map((p) =>
            p.id === id
              ? { ...p, status: ok ? "connected" : "error", lastTestedAt: Date.now(), apiKeyId: key?.id }
              : p,
          ),
        );
        return ok;
      },
      addApiKey({ providerId, label, rawKey }) {
        const key: ApiKey = {
          id: crypto.randomUUID(),
          providerId,
          label: label.trim() || `${providerId} key`,
          maskedKey: maskKey(rawKey),
          createdAt: Date.now(),
          status: "untested",
        };
        setApiKeys((ks) => [key, ...ks]);
        setProviders((xs) => xs.map((p) => (p.id === providerId ? { ...p, apiKeyId: key.id, status: "connected", enabled: true } : p)));
        return key;
      },
      removeApiKey(id) {
        const target = apiKeys.find((k) => k.id === id);
        setApiKeys((ks) => ks.filter((k) => k.id !== id));
        if (target) {
          setProviders((xs) =>
            xs.map((p) =>
              p.apiKeyId === id ? { ...p, apiKeyId: undefined, status: "disconnected", enabled: false } : p,
            ),
          );
        }
      },
      async testApiKey(id) {
        await new Promise((r) => setTimeout(r, 900));
        const ok = Math.random() > 0.15;
        setApiKeys((ks) => ks.map((k) => (k.id === id ? { ...k, status: ok ? "valid" : "invalid", lastTestedAt: Date.now() } : k)));
        return ok;
      },
      updateWorkspace(patch) {
        setWorkspace((w) => ({ ...w, ...patch }));
      },
      markNotificationRead(id) {
        setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n)));
      },
      markAllNotificationsRead() {
        setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
      },
      archiveNotification(id) {
        setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, archived: true, read: true } : n)));
      },
      addKnowledgeFile(f) {
        setKnowledge((ks) => [{ ...f, id: crypto.randomUUID(), uploadedAt: Date.now(), missionUsage: 0 }, ...ks]);
      },
      removeKnowledgeFile(id) {
        setKnowledge((ks) => ks.filter((k) => k.id !== id));
      },
      assignMissionToProject(missionId, projectId) {
        setMissions((ms) => ms.map((m) => (m.id === missionId ? { ...m, projectId } : m)));
        setProjects((ps) => ps.map((p) => (p.id === projectId ? { ...p, missionCount: p.missionCount + 1, updatedAt: Date.now() } : p)));
      },
      addAsset(input) {
        const a: ProjectAsset = {
          id: crypto.randomUUID(),
          projectId: input.projectId,
          missionId: input.missionId,
          kind: input.kind,
          title: input.title,
          body: input.body,
          status: input.status ?? "draft",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          mediaName: input.mediaName,
          mediaKind: input.mediaKind,
          publish: input.publish,
        };
        setAssets((xs) => [a, ...xs]);
        setProjects((ps) => ps.map((p) => (p.id === a.projectId ? { ...p, updatedAt: Date.now() } : p)));
        return a;
      },
      updateAsset(id, patch) {
        setAssets((xs) => xs.map((a) => (a.id === id ? { ...a, ...patch, updatedAt: Date.now() } : a)));
      },
      approveAsset(id) {
        setAssets((xs) => xs.map((a) => (a.id === id ? { ...a, status: "approved", updatedAt: Date.now() } : a)));
      },
      deleteAsset(id) {
        setAssets((xs) => xs.filter((a) => a.id !== id));
      },
      regenerateAsset(id) {
        setAssets((xs) =>
          xs.map((a) =>
            a.id === id
              ? {
                  ...a,
                  body: regenerateBody(a.kind, a.body, workspace),
                  status: "draft",
                  updatedAt: Date.now(),
                }
              : a,
          ),
        );
      },
      setAssetPublish(id, publish) {
        setAssets((xs) => xs.map((a) => (a.id === id ? { ...a, publish, updatedAt: Date.now() } : a)));
      },
    }),
    [missions, projects, integrations, models, providers, apiKeys, notifications, knowledge, events, workspace, assets, credits],
  );


  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
