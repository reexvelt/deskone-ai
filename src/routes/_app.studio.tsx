import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  CloudUpload,
  Edit3,
  FileText,
  FolderKanban,
  Hash,
  Layers3,
  Play,
  Plus,
  Save,
  Send,
  Sparkles,
  WandSparkles,
} from "lucide-react";

export const Route = createFileRoute("/_app/studio")({
  head: () => ({
    meta: [
      { title: "Content Studio · AnchorSpace" },
      { name: "description", content: "Turn raw media into captions, scripts and scheduled posts with the AnchorSpace Content Studio." },
      { property: "og:title", content: "Content Studio · AnchorSpace" },
      { property: "og:description", content: "Turn raw media into captions, scripts and scheduled posts with the AnchorSpace Content Studio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StudioPage,
});

type OutputTab = "script" | "caption" | "hashtags" | "headline";

const demoProjects = [
  "Food Creator Workspace",
  "Personal Brand Campaign",
  "Client Content Sprint",
];

const demoMissions = [
  "Create YouTube video",
  "Launch Instagram reel",
  "Build content pack",
  "Food review campaign",
];

function StudioPage() {
  const [project, setProject] = useState(demoProjects[0]);
  const [mission, setMission] = useState(demoMissions[0]);
  const [files, setFiles] = useState<File[]>([]);
  const [outputTab, setOutputTab] = useState<OutputTab>("script");
  const [isGenerating, setIsGenerating] = useState(false);
  const [approved, setApproved] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("Friday, 6:00 PM");
  const [publishMessage, setPublishMessage] = useState("");
  const [outputs, setOutputs] = useState({
    script:
      "Hook: In this video, I am showing you how to make a quick and satisfying meal prep in under 10 minutes.\n\nIntro: Today I am breaking down a simple, creator-friendly workflow for cooking, filming, and posting faster...\n\nOutro: If you want more content like this, follow for practical food creator tips.",
    caption:
      "Cooking made simple. Filming made faster. Posting made easier. 🍲✨\n\nThis is the kind of workflow creators need when they want to stay consistent without wasting time.\n\n#FoodCreator #MealPrep #ContentCreation #CreatorWorkflow #AnchorSpace",
    hashtags:
      "#FoodCreator #MealPrep #ContentCreator #CookingVideo #RecipeCreator #CreatorTools #AIWorkspace #AnchorSpace",
    headline: "How to create food content faster without losing quality",
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedFileNames = useMemo(
    () => files.map((file) => `${file.name} • ${(file.size / 1024 / 1024).toFixed(1)} MB`),
    [files],
  );

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    setFiles((current) => [...current, ...Array.from(incoming)]);
    setApproved(false);
    setPublishMessage("");
  };

  const generateOutputs = async () => {
    setIsGenerating(true);
    setApproved(false);
    setPublishMessage("");

    await new Promise((resolve) => setTimeout(resolve, 1200));

    setOutputs({
      script:
        "Hook: What if your next food video was planned, written, and organized in one workspace?\n\nIntro: In this mission, AnchorSpace helps you turn raw content into a clean creator workflow.\n\nMain: Upload your clip, organize your project, generate your copy, and keep every asset in one place.\n\nOutro: One space for planning, creating, and publishing.",
      caption:
        "Every good creator needs a better workflow.\n\nAnchorSpace helps you organize your video, generate captions, and prepare your next post in one place.\n\nCreate faster. Stay organized. Publish with confidence.",
      hashtags:
        "#AnchorSpace #FoodCreator #ContentCreators #CreatorEconomy #VideoEditing #InstagramReel #YouTubeShorts #CreatorWorkflow",
      headline: "One workspace for creators who want to move faster",
    });

    setIsGenerating(false);
  };

  const approveOutputs = () => {
    setApproved(true);
    setPublishMessage("Outputs approved and ready for publishing.");
  };

  const schedulePublish = () => {
    if (!approved) {
      setPublishMessage("Approve the content first before scheduling.");
      return;
    }

    setPublishMessage(`Scheduled for ${scheduledDate}.`);
  };

  const publishNow = () => {
    if (!approved) {
      setPublishMessage("Approve the content first before publishing.");
      return;
    }

    setPublishMessage("Publishing flow prepared. Connect the platform account to complete publishing.");
  };

  return (
    <div className="space-y-6 pb-10">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
              <WandSparkles className="h-4 w-4 text-[#7C5CFF]" />
              Content Studio
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Create, organize, approve, and prepare content from one studio.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
              Upload your media, generate creator assets, keep every output attached to a project, and prepare
              the workflow for publishing.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[420px]">
            {[
              ["Uploads", files.length.toString().padStart(2, "0")],
              ["Project", project],
              ["Status", approved ? "Approved" : "Draft"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-[#0B0D12] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-white/35">{label}</p>
                <p className="mt-2 text-sm font-semibold text-white/80">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        {/* Left panel */}
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C5CFF]/20 to-[#3AA7FF]/20">
                <CloudUpload className="h-5 w-5 text-white/80" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Upload content</h2>
                <p className="text-sm text-white/50">Drag, drop, or browse your files.</p>
              </div>
            </div>

            <div
              className="mt-5 rounded-[1.75rem] border border-dashed border-white/15 bg-[#0B0D12] p-6 transition hover:border-white/25"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFiles(e.dataTransfer.files);
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />

              <div className="flex flex-col items-center justify-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C5CFF]/15 to-[#3AA7FF]/15">
                  <CloudUpload className="h-6 w-6 text-white/80" />
                </div>
                <div>
                  <p className="text-sm font-medium">Drop your video, audio, images, or document here</p>
                  <p className="mt-1 text-xs text-white/45">Supported formats for the first V1 workflow</p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7C5CFF] to-[#3AA7FF] px-5 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px]"
                >
                  Browse files
                </button>
              </div>
            </div>

            {selectedFileNames.length > 0 && (
              <div className="mt-4 space-y-2">
                {selectedFileNames.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-[#0B0D12] px-4 py-3 text-sm text-white/75">
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C5CFF]/20 to-[#3AA7FF]/20">
                <FolderKanban className="h-5 w-5 text-white/80" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Attach to project</h2>
                <p className="text-sm text-white/50">Choose where this studio work belongs.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.25em] text-white/35">Project</span>
                <select
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0B0D12] px-4 py-3 text-sm text-white outline-none"
                >
                  {demoProjects.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.25em] text-white/35">Mission</span>
                <select
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0B0D12] px-4 py-3 text-sm text-white outline-none"
                >
                  {demoMissions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/65">
                Attached to: {project}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/65">
                Mission: {mission}
              </span>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#7C5CFF]/12 to-[#3AA7FF]/10 p-5 backdrop-blur-xl sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5">
                <Clock3 className="h-5 w-5 text-white/80" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Publishing</h2>
                <p className="text-sm text-white/50">Prepare the content for publishing or schedule it.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.25em] text-white/35">Schedule label</span>
                <input
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0B0D12] px-4 py-3 text-sm text-white outline-none"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={schedulePublish}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/10"
                >
                  <Clock3 className="h-4 w-4" />
                  Schedule
                </button>
                <button
                  type="button"
                  onClick={publishNow}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7C5CFF] to-[#3AA7FF] px-4 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px]"
                >
                  <Send className="h-4 w-4" />
                  Publish
                </button>
              </div>

              {publishMessage && (
                <div className="rounded-2xl border border-white/10 bg-[#0B0D12] px-4 py-3 text-sm text-white/75">
                  {publishMessage}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/35">Generate</p>
              <h2 className="mt-2 text-2xl font-bold">AI content outputs</h2>
              <p className="mt-1 text-sm text-white/50">Generate and approve outputs before publishing.</p>
            </div>

            <button
              type="button"
              onClick={generateOutputs}
              disabled={isGenerating}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7C5CFF] to-[#3AA7FF] px-5 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate assets
                </>
              )}
            </button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {[
              ["script", "Script", FileText],
              ["caption", "Captions", Edit3],
              ["hashtags", "Hashtags", Hash],
              ["headline", "Headline", Layers3],
            ].map(([key, label, Icon]) => (
              <button
                key={key as string}
                type="button"
                onClick={() => setOutputTab(key as OutputTab)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  outputTab === key
                    ? "bg-white text-[#090B10]"
                    : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label as string}
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-[1.75rem] border border-white/10 bg-[#0B0D12] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white/55">
                {outputTab === "script"
                  ? "Generated script"
                  : outputTab === "caption"
                    ? "Generated captions"
                    : outputTab === "hashtags"
                      ? "Generated hashtags"
                      : "Generated headline"}
              </p>
              {approved && (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Approved
                </span>
              )}
            </div>

            <div className="mt-4 whitespace-pre-wrap rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-white/80">
              {outputTab === "script" && outputs.script}
              {outputTab === "caption" && outputs.caption}
              {outputTab === "hashtags" && outputs.hashtags}
              {outputTab === "headline" && outputs.headline}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => setOutputs((current) => ({ ...current }))}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
              >
                <Edit3 className="h-4 w-4" />
                Edit
              </button>
              <button
                type="button"
                onClick={approveOutputs}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/15"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-[#11141B] p-4">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Play className="h-4 w-4 text-[#7C5CFF]" />
                Approval workflow
              </div>
              <p className="mt-2 text-sm leading-7 text-white/50">
                Approve outputs before they are saved into the project and prepared for publishing.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#0B0D12] p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-white/35">Project</p>
              <p className="mt-2 text-sm font-semibold">{project}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0B0D12] p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-white/35">Mission</p>
              <p className="mt-2 text-sm font-semibold">{mission}</p>
            </div>
          </div>

          {files.length > 0 && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-[#0B0D12] p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-white/35">Uploaded files</p>
              <div className="mt-3 space-y-2">
                {selectedFileNames.map((item) => (
                  <div key={item} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/75">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
