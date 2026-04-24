'use client';

import { useState, useRef } from 'react';
import { useQuestions } from '@/hooks/useQuestions';
import { useStore } from '@/store/useStore';
import {
  computeGlobalStats,
  computeTopicStats,
  getMostFailed,
  buildTimeline,
  formatSeconds,
} from '@/lib/statistics';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Modal } from '@/components/ui/Modal';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';
import {
  BarChart3, Trophy, Clock, BookOpen, Target, RotateCcw,
  Download, Upload, AlertTriangle, TrendingUp, Star, Flame,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { keyToDisplayName } from '@/lib/questions';

export default function StatsPage() {
  const { questions, loading } = useQuestions();
  const { progress, sessions, exportData, importData, resetAll, resetTopic } = useStore();

  const [confirmReset, setConfirmReset] = useState(false);
  const [importError,  setImportError]  = useState('');
  const [importOk,     setImportOk]     = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const global    = computeGlobalStats(questions, progress, sessions);
  const byTopic   = computeTopicStats(questions, progress);
  const mostFailed = getMostFailed(questions, progress, 8);
  const timeline  = buildTimeline(sessions);
  const favorites  = Object.entries(progress).filter(([, p]) => p.favorita);

  // Export / import
  function handleExport() {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `fal-progress-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const ok = importData(ev.target?.result as string);
      if (ok) { setImportOk(true); setImportError(''); }
      else    { setImportError('Archivo inválido'); setImportOk(false); }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary-500" />
            Estadísticas
          </h1>
          <p className="text-slate-500 text-sm mt-1">{sessions.length} sesiones registradas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4" /> Exportar
          </Button>
          <Button variant="secondary" size="sm" onClick={() => importRef.current?.click()}>
            <Upload className="w-4 h-4" /> Importar
          </Button>
          <input ref={importRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <Button variant="danger" size="sm" onClick={() => setConfirmReset(true)}>
            <RotateCcw className="w-4 h-4" /> Reset
          </Button>
        </div>
      </div>

      {importOk    && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2">Datos importados correctamente.</div>}
      {importError && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{importError}</div>}

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon={<Target   className="w-5 h-5 text-primary-600" />} label="Precisión global"    value={`${global.globalAccuracy}%`}   color={global.globalAccuracy >= 70 ? 'green' : 'orange'} />
        <KpiCard icon={<BookOpen className="w-5 h-5 text-violet-600"  />} label="Preguntas vistas"   value={`${global.questionsAttempted} / ${global.totalQuestions}`} color="blue" />
        <KpiCard icon={<Clock    className="w-5 h-5 text-rose-600"    />} label="Tiempo total"       value={formatSeconds(global.totalTimeSeconds)} color="orange" />
        <KpiCard icon={<Trophy   className="w-5 h-5 text-amber-500"   />} label="Sesiones"           value={String(global.totalSessions)}           color="blue" />
      </div>

      {/* Timeline chart */}
      {timeline.length > 1 && (
        <Card>
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Evolución de aciertos
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip formatter={(v: number) => [`${v}%`, 'Acierto']} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3, fill: '#3b82f6' }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* By topic */}
      <Card>
        <h2 className="font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> Aciertos por tema
        </h2>
        <div className="space-y-4">
          {byTopic.map(t => (
            <div key={t.topicKey}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[60%]">{t.displayName}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {t.attempted > 0 && (
                    <>
                      <span className="text-emerald-600 text-xs">{t.aciertos}✓</span>
                      <span className="text-red-500 text-xs">{t.fallos}✗</span>
                      <Badge variant={t.accuracy >= 70 ? 'success' : t.accuracy >= 40 ? 'warning' : 'error'}>
                        {t.accuracy}%
                      </Badge>
                    </>
                  )}
                  {t.attempted === 0 && <Badge variant="default">Sin intentar</Badge>}
                </div>
              </div>
              {t.attempted > 0 && (
                <ProgressBar
                  value={t.accuracy}
                  color={t.accuracy >= 70 ? 'green' : t.accuracy >= 40 ? 'orange' : 'red'}
                />
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most failed */}
        {mostFailed.length > 0 && (
          <Card>
            <h2 className="font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500" /> Más difíciles
            </h2>
            <div className="space-y-2">
              {mostFailed.map(({ question, fallos, aciertos }) => (
                <div key={question.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                    <span className="text-xs font-bold text-red-600">{fallos}✗</span>
                    <span className="text-xs text-emerald-600">{aciertos}✓</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {question.pregunta}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{question.tema}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Favorites */}
        <Card>
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" /> Favoritas ({favorites.length})
          </h2>
          {favorites.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">
              Marca preguntas con ★ durante el estudio
            </p>
          ) : (
            <div className="space-y-2">
              {favorites.map(([id, p]) => {
                const q = questions.find(q => q.id === id);
                if (!q) return null;
                return (
                  <div key={id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <Star className="w-4 h-4 text-amber-400 flex-shrink-0 fill-current mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{q.pregunta}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{q.tema} · {p.aciertos}✓ {p.fallos}✗</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Recent sessions */}
      {sessions.length > 0 && (
        <Card>
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Sesiones recientes</h2>
          <div className="space-y-2">
            {[...sessions].reverse().slice(0, 10).map(s => {
              const pct = s.totalPreguntas > 0 ? Math.round((s.aciertos / s.totalPreguntas) * 100) : 0;
              return (
                <div key={s.id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge variant={s.modo === 'exam' ? 'info' : s.modo === 'training' ? 'default' : s.modo === 'smart-review' ? 'success' : 'error'}>
                        {s.modo === 'exam' ? 'Examen' : s.modo === 'training' ? 'Entrenamiento' : s.modo === 'smart-review' ? 'Inteligente' : 'Falladas'}
                      </Badge>
                      <span className="text-xs text-slate-500">{new Date(s.fecha).toLocaleString('es-ES', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {s.temas.map(k => keyToDisplayName(k)).join(', ')}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={cn('text-sm font-bold', pct >= 70 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-500' : 'text-red-500')}>{pct}%</span>
                    <p className="text-xs text-slate-400">{s.aciertos}/{s.totalPreguntas} · {formatSeconds(s.tiempoSegundos)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Reset confirmation modal */}
      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Resetear todo el progreso">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">
              Esto eliminará <strong>todo el progreso</strong>, historial de sesiones y estadísticas.
              Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setConfirmReset(false)}>
              Cancelar
            </Button>
            <Button variant="danger" className="flex-1" onClick={() => { resetAll(); setConfirmReset(false); }}>
              Sí, borrar todo
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function KpiCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: 'green'|'orange'|'blue' }) {
  const textColor = { green: 'text-emerald-600', orange: 'text-orange-500', blue: 'text-primary-600' }[color];
  return (
    <Card padding="md">
      <div className="flex items-center gap-2 mb-3">{icon}</div>
      <div className={cn('text-2xl font-bold', textColor)}>{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </Card>
  );
}
