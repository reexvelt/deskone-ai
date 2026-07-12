import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type MissionStatus = "planning" | "awaiting_approval" | "running" | "completed" | "cancelled" | "failed";
export type ProjectStatus = "active" | "paused" | "archived" | "completed";
export type NotificationCategory = "mission_completed" | "mission_failed" | "approval_required" | "integration_error" | "system_update";

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
}

export interface AIModelInfo {
  id: string;
  name: string;
  provider: string;
  description: string;
  enabled: boolean;
  tag: "reasoning" | "fast" | "creative" | "vision";
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

export interface CalendarEvent {
  id: string;
  title: string;
  date: number;
  time?: string;
  type: "mission" | "publish" | "deadline" | "reminder";
  color: string;
}

interface StoreState {
  missions: Mission[];
  projects: Project[];
  integrations: Integration[];
  models: AIModelInfo[];
  notifications: NotificationItem[];
  knowledge: KnowledgeFile[];
  events: CalendarEvent[];
  credits: { used: number; total: number };
  createMissionDraft: (title: string, projectId?: string) => Mission;
  approveMission: (id: string) => void;
  cancelMission: (id: string) => void;
  retryMission: (id: string) => void;
  duplicateMission: (id: string) => Mission | null;
  deleteMission: (id: string) => void;
  updateMission: (id: string, patch: Partial<Mission>) => void;
  createProject: (input: { name: string; description?: string; color?: string; cover?: string }) => Project;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  toggleIntegration: (id: string) => void;
  toggleModel: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  archiveNotification: (id: string) => void;
  addKnowledgeFile: (f: Omit<KnowledgeFile, "id" | "uploadedAt" | "missionUsage">) => void;
  removeKnowledgeFile: (id: string) => void;
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

function planFor(title: string): { objective: string; steps: ExecutionStep[]; apps: string[]; minutes: number } {
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

  return {
    objective: `Autonomously ${title.trim().replace(/\.$/, "")} using connected apps, with human approval at key checkpoints.`,
    apps,
    minutes,
    steps: steps.map((s) => ({ ...s, id: crypto.randomUUID(), status: "pending" })),
  };
}

const OWNER: ProjectMember = { id: "u1", name: "You", email: "you@deskone.app", role: "owner" };

const seedProjects = (): Project[] => [
  {
    id: "p1", name: "Ebook Launch", description: "AI Execution Playbook — full go-to-market",
    status: "active", color: "#3B82F6", cover: COVERS[0],
    createdAt: Date.now() - 86400000 * 12, updatedAt: Date.now() - 86400000,
    missionCount: 4, apps: ["Notion", "Gmail", "Stripe", "X"],
    ownerId: "u1", members: [OWNER],
    notes: "Focus on developer audience. Position around execution, not chat.",
  },
  {
    id: "p2", name: "Content Engine", description: "YouTube + newsletter weekly cadence",
    status: "active", color: "#7C5CFF", cover: COVERS[1],
    createdAt: Date.now() - 86400000 * 30, updatedAt: Date.now() - 3600000 * 5,
    missionCount: 7, apps: ["YouTube", "Notion", "Gmail"],
    ownerId: "u1", members: [OWNER],
  },
  {
    id: "p3", name: "Growth Ops", description: "Outbound sequences and paid campaigns",
    status: "paused", color: "#22C55E", cover: COVERS[2],
    createdAt: Date.now() - 86400000 * 20, updatedAt: Date.now() - 3600000 * 30,
    missionCount: 3, apps: ["Gmail", "Slack", "Linear"],
    ownerId: "u1", members: [OWNER],
  },
];

const seedIntegrations = (): Integration[] => [
  { id: "gmail", name: "Gmail", category: "Communication", connected: true, description: "Send and manage email." },
  { id: "gdrive", name: "Google Drive", category: "Storage", connected: true, description: "Read and write files." },
  { id: "notion", name: "Notion", category: "Productivity", connected: true, description: "Docs and databases." },
  { id: "youtube", name: "YouTube", category: "Media", connected: false, description: "Upload and manage videos." },
  { id: "slack", name: "Slack", category: "Communication", connected: false, description: "Post and read messages." },
  { id: "figma", name: "Figma", category: "Design", connected: false, description: "Frames and assets." },
  { id: "github", name: "GitHub", category: "Engineering", connected: true, description: "Repos, PRs, issues." },
  { id: "linear", name: "Linear", category: "Engineering", connected: false, description: "Issues and cycles." },
  { id: "stripe", name: "Stripe", category: "Payments", connected: false, description: "Products and checkout." },
  { id: "x", name: "X", category: "Social", connected: false, description: "Post and schedule." },
];

const seedModels = (): AIModelInfo[] => [
  { id: "orion", name: "Orion 1", provider: "DeskOne", description: "Balanced reasoning model.", enabled: true, tag: "reasoning" },
  { id: "orion-pro", name: "Orion Pro", provider: "DeskOne", description: "Deep planning and long context.", enabled: true, tag: "reasoning" },
  { id: "quartz", name: "Quartz", provider: "DeskOne", description: "Ultra-fast utility model.", enabled: true, tag: "fast" },
  { id: "muse", name: "Muse", provider: "DeskOne", description: "Creative writing and copy.", enabled: false, tag: "creative" },
  { id: "lens", name: "Lens", provider: "DeskOne", description: "Vision and screenshots.", enabled: false, tag: "vision" },
];

const seedMissions = (): Mission[] => {
  const m1 = planFor("Launch my ebook");
  const m2 = planFor("Create YouTube content");
  return [
    {
      id: "m1", title: "Launch my ebook", objective: m1.objective, status: "running", progress: 42,
      createdAt: Date.now() - 3600000 * 6, startedAt: Date.now() - 3600000 * 5,
      estimatedMinutes: m1.minutes, apps: m1.apps,
      steps: m1.steps.map((s, i) => ({ ...s, status: i < 2 ? "done" : i === 2 ? "running" : "pending", completedAt: i < 2 ? Date.now() - 3600000 * (5 - i) : undefined })),
      logs: [
        { ts: Date.now() - 3600000 * 5, level: "info", message: "Mission approved. Execution started." },
        { ts: Date.now() - 3600000 * 4, level: "success", message: "Launch narrative drafted." },
        { ts: Date.now() - 3600000 * 3, level: "success", message: "Landing copy generated." },
        { ts: Date.now() - 1800000, level: "info", message: "Preparing Stripe checkout." },
      ],
      outputs: ["Launch narrative", "Landing copy v1"],
      files: [
        { id: "f1", name: "launch-narrative.md", size: "12 KB", kind: "doc" },
        { id: "f2", name: "landing-copy.md", size: "8 KB", kind: "doc" },
      ],
      projectId: "p1", cost: 1.24,
    },
    {
      id: "m2", title: "Create YouTube content", objective: m2.objective, status: "completed", progress: 100,
      createdAt: Date.now() - 86400000 * 2, startedAt: Date.now() - 86400000 * 2, completedAt: Date.now() - 86400000,
      estimatedMinutes: m2.minutes, apps: m2.apps,
      steps: m2.steps.map((s, i) => ({ ...s, status: "done", completedAt: Date.now() - 86400000 - i * 60000 })),
      logs: [{ ts: Date.now() - 86400000, level: "success", message: "Mission completed." }],
      outputs: ["Full script", "Thumbnail concepts"],
      files: [{ id: "f3", name: "script.md", size: "22 KB", kind: "doc" }],
      projectId: "p2", cost: 0.86,
    },
  ];
};

const seedNotifications = (): NotificationItem[] => [
  { id: "n1", category: "mission_completed", title: "Mission completed", body: "Create YouTube content finished with 4 outputs.", ts: Date.now() - 120000, read: false, archived: false, missionId: "m2" },
  { id: "n2", category: "approval_required", title: "Approval required", body: "Draft social thread is ready for review.", ts: Date.now() - 3600000, read: false, archived: false },
  { id: "n3", category: "system_update", title: "Orion Pro is faster", body: "Latency improved 32% on planning workloads.", ts: Date.now() - 3600000 * 5, read: true, archived: false },
  { id: "n4", category: "integration_error", title: "Slack disconnected", body: "Reconnect to resume scheduled posts.", ts: Date.now() - 86400000, read: true, archived: false },
  { id: "n5", category: "mission_failed", title: "Mission failed", body: "Weekly digest — retry available.", ts: Date.now() - 86400000 * 2, read: true, archived: false },
];

const seedKnowledge = (): KnowledgeFile[] => [
  { id: "k1", name: "Brand voice guidelines.pdf", type: "pdf", size: "48 KB", uploadedAt: Date.now() - 86400000 * 2, missionUsage: 12, tag: "Brand" },
  { id: "k2", name: "Product spec.docx", type: "doc", size: "112 KB", uploadedAt: Date.now() - 86400000 * 4, missionUsage: 8, tag: "Product" },
  { id: "k3", name: "Q4 forecast.xlsx", type: "sheet", size: "68 KB", uploadedAt: Date.now() - 86400000 * 7, missionUsage: 3, tag: "Finance" },
  { id: "k4", name: "Hero screenshot.png", type: "image", size: "1.2 MB", uploadedAt: Date.now() - 86400000, missionUsage: 5, tag: "Assets" },
  { id: "k5", name: "Sales scripts.txt", type: "text", size: "22 KB", uploadedAt: Date.now() - 86400000 * 3, missionUsage: 6, tag: "Sales" },
];

const seedEvents = (): CalendarEvent[] => {
  const today = new Date();
  const mk = (d: number, title: string, time: string, type: CalendarEvent["type"], color: string): CalendarEvent => ({
    id: crypto.randomUUID(),
    title, time, type, color,
    date: new Date(today.getFullYear(), today.getMonth(), d).getTime(),
  });
  return [
    mk(today.getDate(), "Ebook launch email", "14:00", "publish", "#3B82F6"),
    mk(today.getDate() + 1, "Weekly content sync", "09:00", "mission", "#7C5CFF"),
    mk(today.getDate() + 2, "Draft newsletter", "11:00", "mission", "#22C55E"),
    mk(today.getDate() + 4, "Newsletter drop", "10:00", "publish", "#22C55E"),
    mk(today.getDate() + 6, "Q4 review deadline", "17:00", "deadline", "#F59E0B"),
    mk(today.getDate() + 8, "Product update reminder", "10:00", "reminder", "#7C5CFF"),
  ];
};

const KEY = "deskone.store.v2";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [models, setModels] = useState<AIModelInfo[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeFile[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [credits] = useState({ used: 4210, total: 10000 });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setMissions(data.missions ?? seedMissions());
        setProjects(data.projects ?? seedProjects());
        setIntegrations(data.integrations ?? seedIntegrations());
        setModels(data.models ?? seedModels());
        setNotifications(data.notifications ?? seedNotifications());
        setKnowledge(data.knowledge ?? seedKnowledge());
        setEvents(data.events ?? seedEvents());
        return;
      }
    } catch {}
    setMissions(seedMissions());
    setProjects(seedProjects());
    setIntegrations(seedIntegrations());
    setModels(seedModels());
    setNotifications(seedNotifications());
    setKnowledge(seedKnowledge());
    setEvents(seedEvents());
  }, []);

  useEffect(() => {
    if (!missions.length && !projects.length) return;
    localStorage.setItem(KEY, JSON.stringify({ missions, projects, integrations, models, notifications, knowledge, events }));
  }, [missions, projects, integrations, models, notifications, knowledge, events]);

  const value: StoreState = useMemo(
    () => ({
      missions, projects, integrations, models, notifications, knowledge, events, credits,
      createMissionDraft(title, projectId) {
        const plan = planFor(title);
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
          logs: [{ ts: Date.now(), level: "info", message: "Execution plan generated. Awaiting approval." }],
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
        setIntegrations((xs) => xs.map((i) => (i.id === id ? { ...i, connected: !i.connected } : i)));
      },
      toggleModel(id) {
        setModels((xs) => xs.map((i) => (i.id === id ? { ...i, enabled: !i.enabled } : i)));
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
    }),
    [missions, projects, integrations, models, notifications, knowledge, events, credits],
  );

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
