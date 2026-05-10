import { useEffect, useState } from 'react';
import { Users, BookOpen, GraduationCap, Plus, Check, AlertCircle, ChevronDown, RefreshCw, School } from 'lucide-react';
import { api, User, Subject, ClassItem } from '../../lib/api';

type AdminTab = 'students' | 'teachers' | 'classes' | 'register';

const ROLE_LABELS: Record<number, string> = { 0: 'Ученик', 1: 'Учитель', 2: 'Администратор' };

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('students');
  const [students, setStudents] = useState<User[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Register form
  const [regFullName, setRegFullName] = useState('');
  const [regCode, setRegCode] = useState('');
  const [regRole, setRegRole] = useState<0 | 1 | 2>(0);
  const [regClassId, setRegClassId] = useState<number | ''>('');
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState('');

  // New class form
  const [newClassName, setNewClassName] = useState('');
  const [classLoading, setClassLoading] = useState(false);
  const [classSuccess, setClassSuccess] = useState(false);

  // Teacher assign form
  const [assignTeacherId, setAssignTeacherId] = useState<number | ''>('');
  const [assignSubjectId, setAssignSubjectId] = useState<number | ''>('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState(false);
  const [assignError, setAssignError] = useState('');

  async function loadAll() {
    setLoading(true);
    setError('');
    try {
      const [s, t, c, sub] = await Promise.all([
        api.users.students(),
        api.users.teachers(),
        api.classes.all(),
        api.subjects.all(),
      ]);
      setStudents(s);
      setTeachers(t);
      setClasses(c);
      setSubjects(sub);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!regFullName.trim() || !regCode.trim()) {
      setRegError('Заполните имя и код доступа');
      return;
    }
    setRegLoading(true);
    setRegError('');
    try {
      await api.users.register({
        fullName: regFullName.trim(),
        accessCode: regCode.trim(),
        role: regRole,
        classId: regRole === 0 && regClassId ? Number(regClassId) : undefined,
      });
      setRegSuccess(true);
      setRegFullName('');
      setRegCode('');
      setRegClassId('');
      setTimeout(() => setRegSuccess(false), 2500);
      loadAll();
    } catch (err) {
      setRegError(err instanceof Error ? err.message : 'Ошибка регистрации');
    } finally {
      setRegLoading(false);
    }
  }

  async function handleCreateClass(e: React.FormEvent) {
    e.preventDefault();
    if (!newClassName.trim()) return;
    setClassLoading(true);
    try {
      await api.classes.create(newClassName.trim());
      setClassSuccess(true);
      setNewClassName('');
      setTimeout(() => setClassSuccess(false), 2000);
      loadAll();
    } catch {} finally {
      setClassLoading(false);
    }
  }

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!assignTeacherId || !assignSubjectId) {
      setAssignError('Выберите учителя и предмет');
      return;
    }
    setAssignLoading(true);
    setAssignError('');
    try {
      await api.teachers.assign(Number(assignTeacherId), Number(assignSubjectId));
      setAssignSuccess(true);
      setTimeout(() => setAssignSuccess(false), 2000);
    } catch (err) {
      setAssignError(err instanceof Error ? err.message : 'Ошибка назначения');
    } finally {
      setAssignLoading(false);
    }
  }

  const tabs = [
    { id: 'students' as AdminTab, label: 'Ученики', icon: <GraduationCap className="w-4 h-4" />, count: students.length },
    { id: 'teachers' as AdminTab, label: 'Учителя', icon: <Users className="w-4 h-4" />, count: teachers.length },
    { id: 'classes' as AdminTab, label: 'Классы', icon: <School className="w-4 h-4" />, count: classes.length },
    { id: 'register' as AdminTab, label: 'Регистрация', icon: <Plus className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Администрирование</h2>
          <p className="text-slate-500 text-sm mt-0.5">Управление пользователями и классами</p>
        </div>
        <button onClick={loadAll} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-lg hover:border-slate-300 transition-all text-sm">
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:block">Обновить</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm text-center">
          <div className="text-3xl font-bold text-blue-600">{students.length}</div>
          <div className="text-sm text-slate-500 mt-1">Учеников</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm text-center">
          <div className="text-3xl font-bold text-teal-600">{teachers.length}</div>
          <div className="text-sm text-slate-500 mt-1">Учителей</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm text-center">
          <div className="text-3xl font-bold text-slate-700">{classes.length}</div>
          <div className="text-sm text-slate-500 mt-1">Классов</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                tab === t.id ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.icon}
              {t.label}
              {'count' in t && t.count !== undefined && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 ${tab === t.id ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Students */}
          {tab === 'students' && (
            <UserTable users={students} loading={loading} emptyText="Нет учеников" classes={classes} />
          )}

          {/* Teachers */}
          {tab === 'teachers' && (
            <>
              <UserTable users={teachers} loading={loading} emptyText="Нет учителей" classes={classes} />
              {/* Assign subject */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h4 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-teal-600" />
                  Назначить предмет учителю
                </h4>
                <form onSubmit={handleAssign} className="grid sm:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Учитель</label>
                    <div className="relative">
                      <select value={assignTeacherId} onChange={e => setAssignTeacherId(e.target.value ? Number(e.target.value) : '')}
                        className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10">
                        <option value="">— Учитель —</option>
                        {teachers.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Предмет</label>
                    <div className="relative">
                      <select value={assignSubjectId} onChange={e => setAssignSubjectId(e.target.value ? Number(e.target.value) : '')}
                        className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10">
                        <option value="">— Предмет —</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <button type="submit" disabled={assignLoading || assignSuccess}
                    className={`flex items-center gap-2 justify-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${assignSuccess ? 'bg-emerald-500 text-white' : 'bg-teal-600 hover:bg-teal-700 text-white'}`}>
                    {assignSuccess ? <><Check className="w-4 h-4" /> Назначено!</> : 'Назначить'}
                  </button>
                </form>
                {assignError && <p className="text-red-500 text-xs mt-2">{assignError}</p>}
              </div>
            </>
          )}

          {/* Classes */}
          {tab === 'classes' && (
            <div>
              <form onSubmit={handleCreateClass} className="flex gap-3 mb-6">
                <input
                  type="text"
                  value={newClassName}
                  onChange={e => setNewClassName(e.target.value)}
                  placeholder="Название класса (напр. 9А)"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="submit" disabled={classLoading || classSuccess}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${classSuccess ? 'bg-emerald-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                  {classSuccess ? <><Check className="w-4 h-4" /> Создан!</> : <><Plus className="w-4 h-4" /> Создать</>}
                </button>
              </form>
              {loading ? (
                <div className="h-16 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                </div>
              ) : classes.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">Нет классов</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {classes.map(c => (
                    <div key={c.id} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <School className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-slate-700">{c.name}</span>
                      <span className="ml-auto text-xs text-slate-400">#{c.id}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Register */}
          {tab === 'register' && (
            <div>
              <h3 className="font-semibold text-slate-700 mb-5">Зарегистрировать пользователя</h3>
              <form onSubmit={handleRegister} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Полное имя</label>
                  <input type="text" value={regFullName} onChange={e => setRegFullName(e.target.value)}
                    placeholder="Иванов Иван Иванович"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Код доступа</label>
                  <input type="text" value={regCode} onChange={e => setRegCode(e.target.value)}
                    placeholder="Уникальный код"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Роль</label>
                  <div className="flex gap-3">
                    {([0, 1, 2] as const).map(r => (
                      <button key={r} type="button" onClick={() => setRegRole(r)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                          regRole === r ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}>
                        {ROLE_LABELS[r]}
                      </button>
                    ))}
                  </div>
                </div>
                {regRole === 0 && (
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Класс (необязательно)</label>
                    <div className="relative">
                      <select value={regClassId} onChange={e => setRegClassId(e.target.value ? Number(e.target.value) : '')}
                        className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10">
                        <option value="">— Без класса —</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                )}

                {regError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />{regError}
                  </div>
                )}

                <button type="submit" disabled={regLoading || regSuccess}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    regSuccess ? 'bg-emerald-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                  } disabled:opacity-70`}>
                  {regLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : regSuccess ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {regSuccess ? 'Зарегистрирован!' : regLoading ? 'Создание...' : 'Зарегистрировать'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UserTable({ users, loading, emptyText, classes }: {
  users: User[];
  loading: boolean;
  emptyText: string;
  classes: ClassItem[];
}) {
  if (loading) return (
    <div className="h-16 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );
  if (users.length === 0) return <p className="text-slate-400 text-sm text-center py-4">{emptyText}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 text-left">
            <th className="px-4 py-3 font-semibold text-slate-500">Имя</th>
            <th className="px-4 py-3 font-semibold text-slate-500 text-center">ID</th>
            <th className="px-4 py-3 font-semibold text-slate-500">Класс</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map(u => (
            <tr key={u.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-medium text-slate-700">{u.fullName}</td>
              <td className="px-4 py-3 text-center text-slate-400">#{u.id}</td>
              <td className="px-4 py-3 text-slate-500">
                {u.classId ? classes.find(c => c.id === u.classId)?.name ?? `#${u.classId}` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
