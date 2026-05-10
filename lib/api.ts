const BASE_URL = 'http://localhost:5213';

function getToken(): string | null {
    return localStorage.getItem('token');
}

async function request<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

    if (!res.ok) {
        const text = await res.text().catch(() => 'Unknown error');
        throw new Error(text || `HTTP ${res.status}`);
    }

    const text = await res.text();
    return text ? JSON.parse(text) : (null as T);
}

// --- Интерфейсы ---

export interface LoginPayload {
    accessCode: string;
    fullName: string;
}

export interface LoginResponse {
    token?: string;
    userId?: number;
    id?: number;
    role?: number;
    fullName?: string;
    name?: string;
}

export interface Grade {
    id: number;
    subjectId: number;
    value: number; // 1-10
    isAbsent: boolean; // Для "Н"
    comment?: string; // Комментарий к оценке
    date: string;
    subjectName?: string;
    subject?: string;
    Subject?: string;
    teacherName?: string;
}

export interface ScheduleItem {
    id: number;
    dayOfWeek: number; // 0-6 (Вс-Сб)
    lessonNumber: number; // 1-8
    subjectId: number;
    subjectName: string;
    classId: number;
    homeWork?: string;
    teacherComment?: string; // Комментарий учителя всему классу
}

export interface Subject {
    id: number;
    name: string;
}

export interface ClassItem {
    id: number;
    name: string;
}

export interface User {
    id: number;
    fullName: string;
    role: number;
    classId?: number;
    className?: string;
}

export interface JournalEntry {
    studentId: number;
    studentName: string;
    grades: Grade[];
}

// --- API Методы ---

export const api = {
    auth: {
        login: (payload: LoginPayload) =>
            request<LoginResponse>('/api/Users/login', {
                method: 'POST',
                body: JSON.stringify(payload),
            }),
    },
    grades: {
        getByUser: (userId: number) =>
            request<Grade[]>(`/api/Grades/user/${userId}`),
        // Добавление новой или замена существующей оценки
        add: (payload: { userId: number; subjectId: number; value: number; isAbsent: boolean; comment?: string; date: string }) =>
            request<unknown>('/api/Grades/add', {
                method: 'POST',
                body: JSON.stringify(payload),
            }),
        // Удаление оценки
        delete: (gradeId: number) =>
            request<unknown>(`/api/Grades/${gradeId}`, { method: 'DELETE' }),
    },
    schedule: {
        // Получить расписание для класса
        getByClass: (classId: number) =>
            request<ScheduleItem[]>(`/api/Schedule/class/${classId}`),
        // Создать/Обновить урок в расписании (для админа)
        upsert: (payload: Partial<ScheduleItem>) =>
            request<unknown>('/api/Schedule/upsert', {
                method: 'POST',
                body: JSON.stringify(payload),
            }),
        // Добавить домашку (для учителя)
        updateHomeWork: (scheduleId: number, homeWork: string, comment?: string) =>
            request<unknown>(`/api/Schedule/${scheduleId}/homework`, {
                method: 'PATCH',
                body: JSON.stringify({ homeWork, comment }),
            }),
    },
    subjects: {
        all: () => request<Subject[]>('/api/Subjects/all'),
        create: (name: string) =>
            request<unknown>(`/api/Subjects/create`, {
                method: 'POST',
                body: JSON.stringify({ name }),
            }),
    },
    classes: {
        all: () => request<ClassItem[]>('/api/Classes/all'),
        create: (name: string) =>
            request<unknown>(`/api/Classes/create?name=${encodeURIComponent(name)}`, {
                method: 'POST',
            }),
    },
    users: {
        students: () => request<User[]>('/api/Users/students'),
        teachers: () => request<User[]>('/api/Users/teachers'),
        register: (params: {
            fullName: string;
            accessCode: string;
            role: number;
            classId?: number;
        }) => {
            const qs = new URLSearchParams({
                fullName: params.fullName,
                accessCode: params.accessCode,
                role: String(params.role),
                ...(params.classId !== undefined ? { classId: String(params.classId) } : {}),
            });
            return request<unknown>(`/api/Users/register?${qs}`, { method: 'POST' });
        },
    },
    journal: {
        get: (classId: number, subjectId: number) =>
            request<JournalEntry[]>(`/api/Journal/class/${classId}/subject/${subjectId}`),
    },
    teachers: {
        subjects: (teacherId: number) =>
            request<Subject[]>(`/api/Teachers/${teacherId}/subjects`),
        assign: (teacherId: number, subjectId: number) =>
            request<unknown>(
                `/api/Teachers/assign?teacherId=${teacherId}&subjectId=${subjectId}`,
                { method: 'POST' }
            ),
    },
};
