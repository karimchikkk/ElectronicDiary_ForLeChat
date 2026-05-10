import { useEffect, useState } from 'react';
import { TrendingUp, BookOpen, AlertCircle, RefreshCw, Award, Star } from 'lucide-react';
import { api, Grade } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

interface SubjectGroup {
  subjectId: number;
  subject: string;
  grades: Grade[];
  average: number;
}

function gradeColor(value: number): string {
  if (value >= 5) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (value >= 4) return 'bg-blue-100 text-blue-700 border-blue-200';
  if (value >= 3) return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-red-100 text-red-700 border-red-200';
}

function avgColor(avg: number): string {
  if (avg >= 4.5) return 'text-emerald-600';
  if (avg >= 3.5) return 'text-blue-600';
  if (avg >= 2.5) return 'text-amber-600';
  return 'text-red-600';
}

function avgBgColor(avg: number): string {
  if (avg >= 4.5) return 'from-emerald-500 to-green-600';
  if (avg >= 3.5) return 'from-blue-500 to-blue-600';
  if (avg >= 2.5) return 'from-amber-500 to-orange-500';
  return 'from-red-500 to-red-600';
}

export default function GradesPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<SubjectGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadGrades() {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.grades.getByUser(user.userId);
      const map = new Map<number, SubjectGroup>();
      for (const g of data) {
        const key = g.subjectId;
        if (!map.has(key)) {
          map.set(key, {
            subjectId: g.subjectId,
              subject: g.subjectName || g.subject || g.Subject || `Предмет ${g.subjectId}`,
            grades: [],
            average: 0,
          });
        }
        map.get(key)!.grades.push(g);
      }
      const result = Array.from(map.values()).map(group => ({
        ...group,
        average:
          group.grades.reduce((s, g) => s + g.value, 0) / group.grades.length,
      }));
      result.sort((a, b) => a.subject.localeCompare(b.subject));
      setGroups(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить оценки');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadGrades(); }, [user?.userId]);

  const overallAvg =
    groups.length > 0
      ? groups.reduce((s, g) => s + g.average, 0) / groups.length
      : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" style={{ borderWidth: 3 }} />
          <p className="text-slate-500 text-sm">Загрузка оценок...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-slate-700 font-medium mb-1">Ошибка загрузки</p>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <button
            onClick={loadGrades}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mx-auto text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Повторить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Мои оценки</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {user?.fullName} — учебный год
          </p>
        </div>
        <button
          onClick={loadGrades}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-lg hover:border-slate-300 transition-all text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:block">Обновить</span>
        </button>
      </div>

      {/* Summary cards */}
      {overallAvg !== null && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avgBgColor(overallAvg)} flex items-center justify-center`}>
                <Star className="w-5 h-5 text-white" />
              </div>
              <span className="text-slate-500 text-sm">Средний балл</span>
            </div>
            <p className={`text-3xl font-bold ${avgColor(overallAvg)}`}>
              {overallAvg.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-slate-500 text-sm">Предметов</span>
            </div>
            <p className="text-3xl font-bold text-slate-800">{groups.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm col-span-2 sm:col-span-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-slate-500 text-sm">Всего оценок</span>
            </div>
            <p className="text-3xl font-bold text-slate-800">
              {groups.reduce((s, g) => s + g.grades.length, 0)}
            </p>
          </div>
        </div>
      )}

      {groups.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">Оценок пока нет</p>
          <p className="text-slate-400 text-sm mt-1">Здесь появятся ваши оценки</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map(group => (
            <div
              key={group.subjectId}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden"
            >
              {/* Subject header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-semibold text-slate-700 truncate">{group.subject}</span>
                </div>
                <div className={`text-lg font-bold shrink-0 ml-2 ${avgColor(group.average)}`}>
                  {group.average.toFixed(1)}
                </div>
              </div>

              {/* Grades list */}
              <div className="px-5 py-4">
                <div className="flex flex-wrap gap-2">
                  {group.grades.map((g, i) => (
                    <div
                      key={g.id ?? i}
                      className={`inline-flex flex-col items-center w-11 h-11 rounded-xl border font-bold text-base justify-center ${gradeColor(g.value)} transition-transform hover:scale-110`}
                      title={g.date ? new Date(g.date).toLocaleDateString('ru-RU') : undefined}
                    >
                      {g.value}
                      {g.date && (
                        <span className="text-[9px] font-normal opacity-60 leading-none mt-0.5">
                          {new Date(g.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Прогресс</span>
                    <span>{group.grades.length} оц.</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${avgBgColor(group.average)} transition-all duration-700`}
                      style={{ width: `${(group.average / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {groups.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-700">Сводная таблица</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-6 py-3 font-semibold text-slate-500">Предмет</th>
                  <th className="px-6 py-3 font-semibold text-slate-500 text-center">Оценок</th>
                  <th className="px-6 py-3 font-semibold text-slate-500 text-center">Средний</th>
                  <th className="px-6 py-3 font-semibold text-slate-500 text-center">Мин.</th>
                  <th className="px-6 py-3 font-semibold text-slate-500 text-center">Макс.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {groups.map(g => (
                  <tr key={g.subjectId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-700">{g.subject}</td>
                    <td className="px-6 py-3 text-center text-slate-500">{g.grades.length}</td>
                    <td className={`px-6 py-3 text-center font-bold ${avgColor(g.average)}`}>
                      {g.average.toFixed(2)}
                    </td>
                    <td className="px-6 py-3 text-center text-slate-500">
                      {Math.min(...g.grades.map(x => x.value))}
                    </td>
                    <td className="px-6 py-3 text-center text-slate-500">
                      {Math.max(...g.grades.map(x => x.value))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
