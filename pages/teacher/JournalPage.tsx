import { useEffect, useState } from 'react';
import { BookOpen, Plus, RefreshCw, AlertCircle, Check, ChevronDown } from 'lucide-react';
import { api, Subject, ClassItem, JournalEntry, User } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

function gradeColor(value: number) {
  if (value >= 5) return 'bg-emerald-100 text-emerald-700';
  if (value >= 4) return 'bg-blue-100 text-blue-700';
  if (value >= 3) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
}

export default function JournalPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);

  const [selSubject, setSelSubject] = useState<number | ''>('');
  const [selClass, setSelClass] = useState<number | ''>('');
  const [journalLoading, setJournalLoading] = useState(false);
  const [journalError, setJournalError] = useState('');

  // Add grade form
  const [addStudentId, setAddStudentId] = useState<number | ''>('');
  const [addValue, setAddValue] = useState<number | ''>('');
  const [addLoading, setAddLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [addError, setAddError] = useState('');

  useEffect(() => {
    Promise.all([
      api.subjects.all(),
      api.classes.all(),
      api.users.students(),
    ]).then(([s, c, st]) => {
      setSubjects(s);
      setClasses(c);
      setStudents(st);
    }).catch(() => {});
  }, []);

  async function loadJournal() {
    if (!selSubject || !selClass) return;
    setJournalLoading(true);
    setJournalError('');
    try {
      const data = await api.journal.get(Number(selClass), Number(selSubject));
      setJournal(data);
    } catch (err) {
      setJournalError(err instanceof Error ? err.message : 'Ошибка загрузки журнала');
    } finally {
      setJournalLoading(false);
    }
  }

  useEffect(() => { loadJournal(); }, [selSubject, selClass]);

  async function handleAddGrade(e: React.FormEvent) {
    e.preventDefault();
    if (!addStudentId || !selSubject || !addValue) {
      setAddError('Заполните все поля');
      return;
    }
    setAddLoading(true);
    setAddError('');
    try {
      await api.grades.add({
        userId: Number(addStudentId),
        subjectId: Number(selSubject),
        value: Number(addValue),
      });
      setAddSuccess(true);
      setAddValue('');
      setTimeout(() => setAddSuccess(false), 2000);
      if (selClass) loadJournal();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Ошибка при добавлении');
    } finally {
      setAddLoading(false);
    }
  }

  // Collect all unique dates from journal
  const allDates = Array.from(
    new Set(journal.flatMap(e => e.grades.map(g => g.date)))
  ).sort();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Журнал</h2>
        <p className="text-slate-500 text-sm mt-0.5">Просмотр оценок по классу и предмету</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          Выберите класс и предмет
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Класс</label>
            <div className="relative">
              <select
                value={selClass}
                onChange={e => setSelClass(e.target.value ? Number(e.target.value) : '')}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
              >
                <option value="">— Выберите класс —</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Предмет</label>
            <div className="relative">
              <select
                value={selSubject}
                onChange={e => setSelSubject(e.target.value ? Number(e.target.value) : '')}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
              >
                <option value="">— Выберите предмет —</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Add grade */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-600" />
          Выставить оценку
        </h3>
        <form onSubmit={handleAddGrade}>
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Ученик</label>
              <div className="relative">
                <select
                  value={addStudentId}
                  onChange={e => setAddStudentId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                >
                  <option value="">— Выберите ученика —</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.fullName}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Предмет</label>
              <div className="relative">
                <select
                  value={selSubject}
                  onChange={e => setSelSubject(e.target.value ? Number(e.target.value) : '')}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                >
                  <option value="">— Предмет —</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Оценка (1-5)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAddValue(v)}
                    className={`flex-1 h-10 rounded-xl text-sm font-bold border-2 transition-all ${
                      addValue === v
                        ? 'bg-blue-600 border-blue-600 text-white scale-105'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-blue-300'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {addError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {addError}
            </div>
          )}

          <button
            type="submit"
            disabled={addLoading || addSuccess}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              addSuccess
                ? 'bg-emerald-500 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } disabled:opacity-70`}
          >
            {addLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : addSuccess ? (
              <Check className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {addSuccess ? 'Сохранено!' : addLoading ? 'Сохранение...' : 'Выставить оценку'}
          </button>
        </form>
      </div>

      {/* Journal table */}
      {(selClass && selSubject) && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-700">
              Журнал: {classes.find(c => c.id === Number(selClass))?.name} — {subjects.find(s => s.id === Number(selSubject))?.name}
            </h3>
            <button
              onClick={loadJournal}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {journalLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : journalError ? (
            <div className="p-6 text-center text-red-500 text-sm">{journalError}</div>
          ) : journal.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">Нет данных в журнале</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-6 py-3 font-semibold text-slate-500 whitespace-nowrap">Ученик</th>
                    {allDates.map(d => (
                      <th key={d} className="px-3 py-3 font-semibold text-slate-500 text-center whitespace-nowrap">
                        {new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
                      </th>
                    ))}
                    <th className="px-6 py-3 font-semibold text-slate-500 text-center">Среднее</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {journal.map(entry => {
                    const avg = entry.grades.length > 0
                      ? entry.grades.reduce((s, g) => s + g.value, 0) / entry.grades.length
                      : null;
                    return (
                      <tr key={entry.studentId} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3 font-medium text-slate-700 whitespace-nowrap">{entry.studentName}</td>
                        {allDates.map(d => {
                          const g = entry.grades.find(x => x.date === d);
                          return (
                            <td key={d} className="px-3 py-3 text-center">
                              {g ? (
                                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${gradeColor(g.value)}`}>
                                  {g.value}
                                </span>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="px-6 py-3 text-center">
                          {avg !== null ? (
                            <span className="font-bold text-slate-700">{avg.toFixed(1)}</span>
                          ) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
