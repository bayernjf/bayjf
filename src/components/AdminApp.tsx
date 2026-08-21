import { useEffect, useMemo, useState } from 'react';
import { PROJECTS_EN } from '../context/LanguageContext';
import type { ProjectStatus } from '../data/projectCatalog';

interface CatalogState {
  order: string[];
  status: Record<string, ProjectStatus>;
}

interface Row {
  id: string;
  title: string;
  status: ProjectStatus;
}

const STATUSES: ProjectStatus[] = ['launch', 'soon', 'delist'];
const STATUS_LABEL: Record<ProjectStatus, string> = {
  launch: '已上线',
  soon: '即将上线',
  delist: '已下架',
};

const TITLE_BY_ID = Object.fromEntries(PROJECTS_EN.map((p) => [p.id, p.title]));

export default function AdminApp() {
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [logging, setLogging] = useState(false);

  const [rows, setRows] = useState<Row[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [dirty, setDirty] = useState(false);

  const move = (index: number, delta: number) => {
    setRows((current) => {
      const next = [...current];
      const target = index + delta;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setDirty(true);
  };

  const setStatus = (id: string, status: ProjectStatus) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, status } : row)));
    setDirty(true);
  };

  const loadCatalog = async () => {
    const response = await fetch('/api/catalog', { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to load catalog');
    const catalog = (await response.json()) as CatalogState;
    const statusMap: Record<string, ProjectStatus> = {};
    for (const [id, status] of Object.entries(catalog.status)) statusMap[id] = status;
    setRows(
      catalog.order.map((id) => ({
        id,
        title: TITLE_BY_ID[id] ?? id,
        status: statusMap[id] ?? 'launch',
      })),
    );
    setLoaded(true);
    setDirty(false);
  };

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setLogging(true);
    setLoginError('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        setAuthed(true);
        void loadCatalog();
      } else {
        const body = await response.json().catch(() => ({}));
        setLoginError(body.message || '登录失败');
      }
    } catch {
      setLoginError('网络错误，请稍后重试');
    } finally {
      setLogging(false);
    }
  };

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuthed(false);
    setRows([]);
    setPassword('');
  };

  const save = async () => {
    setSaving(true);
    setMessage('');
    const payload: CatalogState = {
      order: rows.map((row) => row.id),
      status: rows.reduce<Record<string, ProjectStatus>>((acc, row) => {
        if (row.status !== 'launch') acc[row.id] = row.status;
        return acc;
      }, {}),
    };
    try {
      const response = await fetch('/api/admin/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setMessage('已保存，刷新公开页面即可生效（约 1 分钟缓存）。');
        setDirty(false);
      } else {
        const body = await response.json().catch(() => ({}));
        setMessage(body.message || '保存失败');
      }
    } catch {
      setMessage('网络错误，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch('/api/admin/session', { cache: 'no-store' });
        const data = (await response.json()) as { authenticated?: boolean };
        if (!cancelled && data.authenticated) {
          setAuthed(true);
          await loadCatalog();
        }
      } catch {
        // Stay on login screen when the API is unavailable.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(() => {
    const result = { launch: 0, soon: 0, delist: 0 };
    for (const row of rows) result[row.status] += 1;
    return result;
  }, [rows]);

  if (!authed) {
    return (
      <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-16 text-paper dark:text-paper">
        <h1 className="mb-1 text-2xl font-semibold">BayJF Admin</h1>
        <p className="mb-8 text-sm opacity-70">仅管理员登录，不开放注册。</p>
        <form onSubmit={login} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            用户名
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 outline-none focus:border-white/50"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            密码
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 outline-none focus:border-white/50"
            />
          </label>
          {loginError && <p className="text-sm text-red-400">{loginError}</p>}
          <button
            type="submit"
            disabled={logging}
            className="mt-2 rounded-lg bg-paper px-4 py-2 font-medium text-night transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {logging ? '登录中…' : '登录'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 text-paper dark:text-paper">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">项目目录管理</h1>
          <p className="mt-1 text-sm opacity-70">
            共 {rows.length} 个 · 上线 {counts.launch} · 即将上线 {counts.soon} · 下架 {counts.delist}
          </p>
        </div>
        <button onClick={logout} className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/5">
          退出
        </button>
      </div>

      {!loaded ? (
        <p className="opacity-70">加载中…</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((row, index) => (
            <li
              key={row.id}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <span className="w-6 text-center text-sm opacity-50">{index + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{row.title}</p>
                <p className="truncate text-xs opacity-50">{row.id}</p>
              </div>
              <select
                value={row.status}
                onChange={(e) => setStatus(row.id, e.target.value as ProjectStatus)}
                className="rounded-lg border border-white/20 bg-night px-2 py-1.5 text-sm outline-none"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABEL[status]}
                  </option>
                ))}
              </select>
              <div className="flex gap-1">
                <button
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="rounded-md border border-white/20 px-2 py-1 text-sm disabled:opacity-30"
                  aria-label="上移"
                >
                  ↑
                </button>
                <button
                  onClick={() => move(index, 1)}
                  disabled={index === rows.length - 1}
                  className="rounded-md border border-white/20 px-2 py-1 text-sm disabled:opacity-30"
                  aria-label="下移"
                >
                  ↓
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving || !dirty}
          className="rounded-lg bg-paper px-5 py-2.5 font-medium text-night transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {saving ? '保存中…' : '保存'}
        </button>
        {message && <p className="text-sm opacity-80">{message}</p>}
        {dirty && !message && <p className="text-sm opacity-60">有未保存的改动</p>}
      </div>
    </div>
  );
}
