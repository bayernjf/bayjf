import { useEffect, useMemo, useState } from 'react';
import { PROJECTS_EN } from '../context/LanguageContext';
import { DEFAULT_CATALOG, type ProjectStatus } from '../data/projectCatalog';
import LogoMark from './LogoMark';

interface CatalogState {
  order: readonly string[];
  status: Record<string, ProjectStatus>;
}

interface Row {
  id: string;
  title: string;
  status: ProjectStatus;
}

type RowsUpdater = Row[] | ((current: Row[]) => Row[]);

const STATUSES: ProjectStatus[] = ['launch', 'soon', 'delist'];
const STATUS_LABEL: Record<ProjectStatus, string> = {
  launch: '已上线',
  soon: '即将上线',
  delist: '已下架',
};

const TITLE_BY_ID = Object.fromEntries(PROJECTS_EN.map((p) => [p.id, p.title]));

const DEFAULT_ROWS: Row[] = DEFAULT_CATALOG.order.map((id) => ({
  id,
  title: TITLE_BY_ID[id] ?? id,
  status: DEFAULT_CATALOG.status[id] ?? 'launch',
}));

function rowsFromCatalog(catalog: CatalogState): Row[] {
  const statusMap: Record<string, ProjectStatus> = {};
  for (const [id, status] of Object.entries(catalog.status)) statusMap[id] = status;
  return catalog.order.map((id) => ({
    id,
    title: TITLE_BY_ID[id] ?? id,
    status: statusMap[id] ?? 'launch',
  }));
}

function moveRow(rows: Row[], from: number, to: number): Row[] {
  if (from === to || from < 0 || to < 0 || from >= rows.length || to >= rows.length) return rows;
  const next = [...rows];
  const [row] = next.splice(from, 1);
  next.splice(to, 0, row);
  return next;
}

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
  const [dragId, setDragId] = useState<string | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [overAfter, setOverAfter] = useState(false);
  const [indexDrafts, setIndexDrafts] = useState<Record<string, string>>({});

  const handleDragOver = (event: React.DragEvent<HTMLLIElement>, index: number) => {
    event.preventDefault();
    if (!dragId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const after = event.clientY > rect.top + rect.height / 2;
    if (overIndex !== index || overAfter !== after) {
      setOverIndex(index);
      setOverAfter(after);
    }
    const desiredIndex = after ? index + 1 : index;
    setRows((current) => {
      const from = current.findIndex((row) => row.id === dragId);
      if (from === -1) return current;
      let target = desiredIndex;
      if (from < desiredIndex) target -= 1;
      if (from === target) return current;
      const moved = moveRow(current, from, target);
      return moved;
    });
  };

  const endDrag = () => {
    if (dragId) setDirty(true);
    setDragId(null);
    setOverIndex(null);
    setOverAfter(false);
  };

  const move = (index: number, delta: number) => {
    setRows((current) => moveRow(current, index, index + delta));
    setDirty(true);
  };

  const updateRows = (updater: RowsUpdater) => {
    setRows(updater);
    setMessage('');
    setDirty(true);
  };

  const moveToPosition = (id: string, value: string) => {
    const target = Number(value.trim()) - 1;
    setIndexDrafts((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    if (!Number.isInteger(target)) return;
    setRows((current) => moveRow(current, current.findIndex((row) => row.id === id), target));
    setDirty(true);
  };

  const setStatus = (id: string, status: ProjectStatus) => {
    updateRows((current) => current.map((row) => (row.id === id ? { ...row, status } : row)));
  };

  const loadCatalog = async () => {
    const response = await fetch('/api/catalog', { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to load catalog');
    const catalog = (await response.json()) as CatalogState;
    setRows(rowsFromCatalog(catalog));
    setIndexDrafts({});
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

  const resetToDefault = () => {
    if (!window.confirm('确认重置为 projectCatalog.ts 中的默认顺序和状态吗？未保存的 Admin 改动会丢失。')) return;
    setRows(DEFAULT_ROWS);
    setIndexDrafts({});
    setMessage('已重置为 projectCatalog.ts 默认配置，点击保存后生效。');
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    setMessage('');
    const payload = {
      order: rows.map((row) => row.id),
      status: Object.fromEntries(rows.map((row) => [row.id, row.status])),
    };
    try {
      const response = await fetch('/api/admin/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        await loadCatalog();
        setMessage('已保存，刷新公开页面即可生效。');
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
        <a href="/" className="mb-6 inline-flex items-center gap-2 self-start" aria-label="返回首页">
          <LogoMark size={32} />
          <span className="text-lg font-semibold">BayJF Admin</span>
        </a>
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
        <div className="flex items-center gap-3">
          <a href="/" className="shrink-0" aria-label="返回首页" title="返回首页">
            <LogoMark size={36} />
          </a>
          <div>
          <h1 className="text-2xl font-semibold">项目目录管理</h1>
          <p className="mt-1 text-sm opacity-70">
            共 {rows.length} 个 · 上线 {counts.launch} · 即将上线 {counts.soon} · 下架 {counts.delist}
          </p>
          </div>
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
              draggable={!saving}
              onDragStart={() => setDragId(row.id)}
              onDragEnd={endDrag}
              onDragOver={(event) => handleDragOver(event, index)}
              onDrop={(event) => {
                event.preventDefault();
                endDrag();
              }}
              className={`relative flex items-center gap-3 rounded-xl border bg-white/5 px-4 py-3 transition ${
                dragId === row.id
                  ? 'border-sky-400/60 opacity-60 shadow-lg shadow-sky-500/10'
                  : 'border-white/10 hover:border-white/25 hover:bg-white/10'
              } ${overIndex === index && overAfter ? 'border-b-2 border-b-sky-400' : ''} ${
                overIndex === index && !overAfter ? 'border-t-2 border-t-sky-400' : ''
              }`}
            >
              <span className="cursor-grab select-none text-sm opacity-40 active:cursor-grabbing" aria-hidden="true">
                ⋮⋮
              </span>
              <input
                value={indexDrafts[row.id] ?? String(index + 1)}
                onChange={(event) => setIndexDrafts((current) => ({ ...current, [row.id]: event.target.value }))}
                onBlur={(event) => moveToPosition(row.id, event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    moveToPosition(row.id, event.currentTarget.value);
                  }
                }}
                aria-label={`${row.title} 序号`}
                title="输入序号后按回车或失焦生效"
                inputMode="numeric"
                className="w-14 rounded-lg border border-white/20 bg-night px-2 py-1.5 text-center text-sm outline-none focus:border-white/50"
              />
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

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <div className="group relative inline-flex">
          <button
            type="button"
            onClick={resetToDefault}
            disabled={saving}
            className="rounded-lg border border-white/20 px-5 py-2.5 font-medium transition hover:bg-white/5 disabled:opacity-40"
          >
            重置
          </button>
          <span className="pointer-events-none absolute bottom-full left-0 z-10 mb-2 hidden w-72 rounded-lg border border-white/10 bg-night px-3 py-2 text-xs leading-relaxed text-paper shadow-xl group-hover:block">
            重置为 projectCatalog.ts 配置状态：恢复代码中的默认项目顺序和上线状态，不会自动保存。
          </span>
        </div>
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
