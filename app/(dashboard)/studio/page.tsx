"use client";

import { useState, useMemo } from "react";
import { lintCaption, type CaptionAnalysis } from "@/lib/ai/caption-linter";
import { humanize, humanizeText } from "@/lib/ai/humanizer";
import { scoreHook, type HookScoreResult } from "@/lib/ai/hookscore";
import { analyzeBeats, formatTimecode, type BeatAnalysisResult } from "@/lib/ai/beats";

const DEFAULT_CAPTION =
  "Descubre el secreto que nadie te cuenta sobre cómo ajustar tu cuadro de BMX sin romper las vainas. La mayoría de riders cometen el error de apretar sin verificar la alineación primero.\n\nComenta CUADRO y te enviamos la guía técnica completa al DM con las medidas exactas 🚲⚡\n\n#bmx #bmxstreet #hardriders #bmxlife #ridebmx";

const DEFAULT_SCRIPT =
  "Deja de comprar piezas baratas de BMX ahora mismo.\n" +
  "Esto es lo que 5 años de street riding me enseñaron sobre roturas de cuadros.\n" +
  "La mayoría pierde 200 dólares en horquillas de imitación que se parten al caer de un gap.\n" +
  "Revisa siempre las marcas de soldadura antes de salir a la calle.\n" +
  "Deja de comprar piezas baratas de BMX.";

export default function StudioPage() {
  const [activeTab, setActiveTab] = useState<"caption" | "reels">("caption");

  // --- Panel A State (Caption & Humanizer) ---
  const [captionText, setCaptionText] = useState(DEFAULT_CAPTION);
  const [slopPurgeNotification, setSlopPurgeNotification] = useState<string | null>(null);

  const captionLint: CaptionAnalysis = useMemo(() => {
    return lintCaption(captionText);
  }, [captionText]);

  const handlePurgeSlop = () => {
    const { text: cleaned, report } = humanize(captionText);
    const totalRemoved =
      report.invisibleCount + report.typographicCount + report.lexicalCount;
    setCaptionText(cleaned);

    if (totalRemoved > 0) {
      setSlopPurgeNotification(
        `¡Texto saneado! Se eliminaron ${totalRemoved} artefactos corporativos/invisibles.`
      );
    } else {
      setSlopPurgeNotification("El texto ya está limpio y sin huellas mecánicas.");
    }

    setTimeout(() => {
      setSlopPurgeNotification(null);
    }, 4500);
  };

  // --- Panel B State (Reels Script & Beats) ---
  const [scriptText, setScriptText] = useState(DEFAULT_SCRIPT);
  const [wpmRate, setWpmRate] = useState<number>(165);
  const [targetLength, setTargetLength] = useState<number>(30);

  const firstLine = useMemo(() => {
    const lines = scriptText.split("\n").map((l) => l.trim()).filter(Boolean);
    return lines[0] || "";
  }, [scriptText]);

  const hookScoreResult: HookScoreResult | null = useMemo(() => {
    if (!firstLine) return null;
    return scoreHook(firstLine);
  }, [firstLine]);

  const beatsResult: BeatAnalysisResult | null = useMemo(() => {
    if (!scriptText.trim()) return null;
    return analyzeBeats(scriptText, {
      wpm: wpmRate,
      targetSeconds: targetLength > 0 ? targetLength : undefined,
    });
  }, [scriptText, wpmRate, targetLength]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            AI Creator Studio
          </h1>
          <p className="text-sm text-muted mt-1">
            Auditoría de ganchos virales, simulación de corte de feed de Instagram y cronometraje de retención.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex rounded-lg border border-border bg-surface p-1 shrink-0">
          <button
            onClick={() => setActiveTab("caption")}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
              activeTab === "caption"
                ? "bg-foreground text-background shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            Panel A: Caption & Humanizer
          </button>
          <button
            onClick={() => setActiveTab("reels")}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
              activeTab === "reels"
                ? "bg-foreground text-background shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            Panel B: Reel Script & Beats
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PANEL A: CAPTION LINTER & HUMANIZER                                       */}
      {/* ========================================================================= */}
      {activeTab === "caption" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Editor & Controls */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <span>Texto de la Publicación / Caption</span>
                  <span className="text-xs font-normal text-muted">
                    ({captionText.length}/2200 caracteres)
                  </span>
                </label>

                {/* Hashtag Counter & Badge */}
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      captionLint.hashtags.length > 5
                        ? "bg-red-500/10 text-red-600 border border-red-500/20"
                        : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    }`}
                  >
                    {captionLint.hashtags.length} / 5 hashtags
                  </span>
                </div>
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  value={captionText}
                  onChange={(e) => setCaptionText(e.target.value)}
                  rows={9}
                  placeholder="Escribe o pega aquí la descripción de tu Reel o post..."
                  className="w-full rounded-lg border border-border bg-background p-3.5 text-sm text-foreground placeholder:text-muted focus:border-foreground focus:ring-1 focus:ring-foreground transition-all resize-y leading-relaxed"
                />
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={handlePurgeSlop}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-medium shadow-xs transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Purgar Lenguaje Corporativo (Humanizer)</span>
                </button>

                <div className="flex items-center gap-2 text-xs text-muted">
                  <span>Emoji: {captionLint.emojiCount}</span>
                  <span>•</span>
                  <span>Enlaces: {captionLint.links.length}</span>
                </div>
              </div>

              {/* Slop Notification Toast */}
              {slopPurgeNotification && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-800 flex items-center gap-2 animate-fade-in">
                  <svg className="w-4 h-4 shrink-0 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{slopPurgeNotification}</span>
                </div>
              )}

              {/* Hashtag Cap Alert */}
              {captionLint.hashtags.length > 5 && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-700 flex items-start gap-2.5">
                  <svg className="w-5 h-5 shrink-0 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <span className="font-semibold block text-red-800">
                      Tope oficial superado ({captionLint.hashtags.length} hashtags)
                    </span>
                    Instagram penaliza o ignora más de 5 etiquetas por publicación desde diciembre de 2025. Elimina {captionLint.hashtags.length - 5} hashtags para maximizar el alcance del algoritmo.
                  </div>
                </div>
              )}
            </div>

            {/* Checklist Results */}
            <div className="rounded-xl border border-border bg-surface p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-sm font-semibold text-foreground">Diagnóstico del Linter</span>
                <span
                  className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                    captionLint.verdict === "READY"
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                      : captionLint.verdict === "REVIEW"
                      ? "bg-amber-500/10 text-amber-600 border border-amber-500/30"
                      : "bg-red-500/10 text-red-600 border border-red-500/30"
                  }`}
                >
                  VEREDICTO: {captionLint.verdict}
                </span>
              </div>

              <div className="space-y-2">
                {captionLint.checks.map((chk, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-background border border-border text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          chk.status === "PASS"
                            ? "bg-emerald-500"
                            : chk.status === "WARN"
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                      />
                      <span className="font-semibold text-foreground">{chk.check}</span>
                    </div>
                    <span className="text-muted text-right max-w-[65%]">{chk.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Visual 125-Char Feed Simulator */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>Simulador de Feed de Instagram (~125 chars)</span>
                </h2>
                <span className="text-xs text-muted">Vista previa de usuario</span>
              </div>

              {/* Instagram Card Mockup */}
              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm text-zinc-900 font-sans space-y-3">
                {/* Profile Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5">
                      <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-xs font-bold text-zinc-800">
                        HR
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-semibold block leading-tight">hardridersbmx</span>
                      <span className="text-[10px] text-zinc-500 leading-tight">Audio original</span>
                    </div>
                  </div>
                  <span className="text-zinc-400 font-bold text-sm">•••</span>
                </div>

                {/* Simulated Post Image Area */}
                <div className="w-full aspect-square bg-zinc-900 rounded-lg flex flex-col items-center justify-center text-zinc-500 text-xs p-4 text-center border border-zinc-100">
                  <svg className="w-10 h-10 mb-2 opacity-50 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Previsualización del Reel</span>
                </div>

                {/* Simulated Caption Area with Cut Box */}
                <div className="text-xs leading-relaxed space-y-1.5 pt-1">
                  <p>
                    <span className="font-semibold mr-1.5">hardridersbmx</span>
                    <span className="bg-amber-50 text-zinc-900 font-medium px-1 py-0.5 rounded border border-amber-200">
                      {captionLint.visible}
                    </span>
                    {captionLint.truncated && (
                      <span className="text-zinc-400 font-semibold cursor-pointer hover:underline ml-1">
                        ... más
                      </span>
                    )}
                  </p>

                  {captionLint.truncated && (
                    <div className="mt-2 p-2.5 bg-zinc-50 rounded border border-dashed border-zinc-300 text-[11px] text-zinc-500 space-y-1">
                      <span className="font-semibold block text-zinc-700">
                        Oculto bajo el corte ({captionText.length - captionLint.visible.length} caracteres restantes):
                      </span>
                      <p className="line-clamp-3 italic text-zinc-600">
                        {captionText.slice(captionLint.visible.length)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Explanatory note */}
              <div className="text-xs text-muted leading-normal bg-background p-3 rounded-lg border border-border">
                <span className="font-semibold text-foreground block mb-0.5">
                  Regla de los 125 caracteres:
                </span>
                El usuario decide si continúa viendo en el primer renglón. Todo lo que esté fuera de la ventana resaltada requiere un toque activo en "... más".
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PANEL B: REEL SCRIPT & RETENTION BEATS                                    */}
      {/* ========================================================================= */}
      {activeTab === "reels" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Script Editor & Controls */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">
                  Guion del Reel (un beat o frase por línea)
                </label>
                <span className="text-xs text-muted">
                  {beatsResult ? `${beatsResult.totalWords} palabras` : ""}
                </span>
              </div>

              <textarea
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                rows={9}
                placeholder="Escribe el guion de tu Reel línea por línea..."
                className="w-full rounded-lg border border-border bg-background p-3.5 text-sm text-foreground font-mono placeholder:text-muted focus:border-foreground focus:ring-1 focus:ring-foreground transition-all resize-y leading-relaxed"
              />

              {/* Controls: WPM & Target */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/60">
                <div>
                  <label className="text-xs font-medium text-muted block mb-1">
                    Velocidad de locución (WPM):
                  </label>
                  <select
                    value={wpmRate}
                    onChange={(e) => setWpmRate(Number(e.target.value))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-foreground"
                  >
                    <option value={150}>150 WPM (Pausado / Énfasis)</option>
                    <option value={165}>165 WPM (Estándar recomendado)</option>
                    <option value={185}>185 WPM (Dinámico / Rápido)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted block mb-1">
                    Duración objetivo (segundos):
                  </label>
                  <select
                    value={targetLength}
                    onChange={(e) => setTargetLength(Number(e.target.value))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-foreground"
                  >
                    <option value={15}>15 segundos (Micro)</option>
                    <option value={30}>30 segundos (Recomendado)</option>
                    <option value={45}>45 segundos (Tutorial)</option>
                    <option value={60}>60 segundos (Explicativo)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Hook Analysis Card (First Line Evaluation) */}
            {hookScoreResult && (
              <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div>
                    <span className="text-xs text-muted block font-mono">LÍNEA 1 / GANCHO</span>
                    <h3 className="text-sm font-semibold text-foreground truncate max-w-xs sm:max-w-md">
                      "{hookScoreResult.hook}"
                    </h3>
                  </div>

                  <div className="text-right">
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full ${
                        hookScoreResult.verdict === "STRONG"
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                          : hookScoreResult.verdict === "OK"
                          ? "bg-amber-500/10 text-amber-600 border border-amber-500/30"
                          : "bg-red-500/10 text-red-600 border border-red-500/30"
                      }`}
                    >
                      {hookScoreResult.overallScore.toFixed(1)} / 100 ({hookScoreResult.verdict})
                    </span>
                    <span className="text-[11px] text-muted block mt-1">
                      Fórmula: <span className="font-medium text-foreground">{hookScoreResult.formula.name}</span>
                    </span>
                  </div>
                </div>

                {/* 5 Dimensions Meters */}
                <div className="space-y-3">
                  {Object.entries(hookScoreResult.dimensions).map(([dim, data]) => (
                    <div key={dim} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-foreground">{dim}</span>
                        <span className="text-muted font-mono">{data.score.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-border/60 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            data.score >= 70
                              ? "bg-emerald-500"
                              : data.score >= 45
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${data.score}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-muted block">{data.detail}</span>
                    </div>
                  ))}
                </div>

                {/* Dealbreakers */}
                {hookScoreResult.flags.length > 0 && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-700 space-y-1">
                    <span className="font-semibold block text-red-800">Dealbreakers detectados:</span>
                    {hookScoreResult.flags.map((flg, i) => (
                      <p key={i}>• {flg}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Timeline Beats Sheet & Retention Alerts */}
          <div className="lg:col-span-6 space-y-4">
            {beatsResult && (
              <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">
                      Línea de Tiempo de Retención (Beat Sheet)
                    </h2>
                    <span className="text-xs text-muted">
                      Duración estimada: ~{beatsResult.totalSeconds.toFixed(1)}s ({formatTimecode(beatsResult.totalSeconds)})
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                      beatsResult.hasStaticShotAlert
                        ? "bg-red-500/10 text-red-600 border border-red-500/30"
                        : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                    }`}
                  >
                    {beatsResult.hasStaticShotAlert ? "⚠️ Planos Críticos (>4s)" : "Ritmo Óptimo"}
                  </span>
                </div>

                {/* Static Shot Alert Banner */}
                {beatsResult.hasStaticShotAlert && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl space-y-1.5 animate-pulse-slow">
                    <div className="flex items-center gap-2 text-red-800 font-bold text-xs uppercase tracking-wider">
                      <svg className="w-5 h-5 text-red-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>Alerta de Retención: Plano Estático Mayor a 4 Segundos</span>
                    </div>
                    <p className="text-xs text-red-700 leading-relaxed">
                      Los beats marcados en rojo superan los 4.0 segundos sin cambio de encuadre. La audiencia abandona los Reels en planos estáticos largos; corta la frase o inserta cortes de cámara B-roll.
                    </p>
                  </div>
                )}

                {/* Beats Timeline List */}
                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {beatsResult.beats.map((b) => {
                    const isTooLong = b.duration > 4.0;
                    return (
                      <div
                        key={b.index}
                        className={`p-3 rounded-lg border transition-all text-xs space-y-1.5 ${
                          isTooLong
                            ? "bg-red-500/5 border-red-500/40 shadow-xs"
                            : "bg-background border-border hover:border-border-hover"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-muted font-bold">
                              {formatTimecode(b.start)}
                            </span>
                            {b.label && (
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  b.label === "HOOK"
                                    ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                    : b.label === "CTA"
                                    ? "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                                    : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                                }`}
                              >
                                {b.label}
                              </span>
                            )}
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-full font-mono text-[11px] font-bold ${
                              isTooLong
                                ? "bg-red-500 text-white animate-bounce-subtle"
                                : "bg-surface text-muted border border-border"
                            }`}
                          >
                            {b.duration.toFixed(1)}s {isTooLong ? "(> 4s)" : ""}
                          </span>
                        </div>

                        <p className="text-foreground font-medium leading-relaxed">
                          {b.text}
                        </p>

                        {b.flags.length > 0 && (
                          <div className="pt-1 text-[11px] text-red-600 font-semibold">
                            {b.flags.join(" • ")}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Notes & Recommendations */}
                <div className="p-3 bg-background border border-border rounded-lg space-y-1 text-xs">
                  <span className="font-semibold text-foreground block">Notas del Analizador:</span>
                  {beatsResult.notes.map((note, idx) => (
                    <p key={idx} className="text-muted leading-relaxed">
                      • {note}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
