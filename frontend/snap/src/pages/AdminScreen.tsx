import React, { useState, useEffect, useCallback } from 'react';
import {
  AdminQuest, AdminQuestInput, getAdminQuests, createQuest, updateQuest, deleteQuest,
  AdminShopItem, AdminShopInput, getAdminShop, createShopItem, updateShopItem, deleteShopItem,
} from '../services/adminService';

type Tab = 'quests' | 'shop';

interface AdminScreenProps {
  initData: string | null;
  onClose: () => void;
  onToast: (text: string) => void;
}

// ─── Мелкие поля формы ─────────────────────────────────────────────────────────

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label style={{ display: 'block', marginBottom: 12 }}>
    <span style={{ display: 'block', fontSize: 12, color: 'var(--gray)', marginBottom: 5, fontWeight: 600 }}>{label}</span>
    {children}
  </label>
);

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 10,
  border: '1px solid rgba(141,153,174,0.3)', fontSize: 14, background: 'var(--bg)', color: 'var(--dark)',
};

// ─── Форма квеста ───────────────────────────────────────────────────────────────

const QuestForm: React.FC<{
  initial?: AdminQuest;
  onSubmit: (body: AdminQuestInput) => void;
  onCancel: () => void;
}> = ({ initial, onSubmit, onCancel }) => {
  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState<'daily' | 'weekly' | 'special'>(initial?.type ?? 'daily');
  const [metadata, setMetadata] = useState(initial?.metadata ?? '');
  const [emoji, setEmoji] = useState(initial?.emoji ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [reward, setReward] = useState(initial?.reward != null ? String(initial.reward) : '');
  const [difficulty, setDifficulty] = useState(initial?.difficulty != null ? String(initial.difficulty) : '');

  const submit = () => {
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      type,
      metadata: metadata.trim() || null,
      emoji: emoji.trim() || null,
      description: description.trim() || null,
      reward: reward ? Number(reward) : null,
      difficulty: difficulty ? Number(difficulty) : null,
    });
  };

  return (
    <div className="card pad" style={{ marginBottom: 14 }}>
      <div className="h2" style={{ marginBottom: 12 }}>{initial ? 'Редактировать квест' : 'Новый квест'}</div>
      <Field label="Название"><input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Сфоткай закат"/></Field>
      <Field label="Тип">
        <select style={inputStyle} value={type} onChange={e => setType(e.target.value as any)}>
          <option value="daily">daily — ежедневный</option>
          <option value="weekly">weekly — недельный</option>
          <option value="special">special — особый</option>
        </select>
      </Field>
      <Field label="Цель для ИИ-проверки (metadata / expectedLabel)">
        <input style={inputStyle} value={metadata} onChange={e => setMetadata(e.target.value)} placeholder="sunset"/>
      </Field>
      <Field label="Emoji"><input style={inputStyle} value={emoji} onChange={e => setEmoji(e.target.value)} placeholder="🌅"/></Field>
      <Field label="Описание"><textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={description} onChange={e => setDescription(e.target.value)}/></Field>
      <div className="row" style={{ gap: 10 }}>
        <div style={{ flex: 1 }}><Field label="Награда"><input style={inputStyle} type="number" value={reward} onChange={e => setReward(e.target.value)} placeholder="100"/></Field></div>
        <div style={{ flex: 1 }}><Field label="Сложность"><input style={inputStyle} type="number" value={difficulty} onChange={e => setDifficulty(e.target.value)} placeholder="1"/></Field></div>
      </div>
      <div className="row" style={{ gap: 10, marginTop: 4 }}>
        <button className="btn outlined block" onClick={onCancel}>Отмена</button>
        <button className="btn primary block" onClick={submit}>Сохранить</button>
      </div>
    </div>
  );
};

// ─── Форма товара ───────────────────────────────────────────────────────────────

const ShopForm: React.FC<{
  initial?: AdminShopItem;
  onSubmit: (body: AdminShopInput) => void;
  onCancel: () => void;
}> = ({ initial, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [price, setPrice] = useState(initial?.price != null ? String(initial.price) : '');
  const [discount, setDiscount] = useState(initial?.discount != null ? String(initial.discount) : '0');
  const [emoji, setEmoji] = useState(initial?.emoji ?? '');
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [active, setActive] = useState(initial?.active ?? true);

  const submit = () => {
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      category: category.trim() || undefined,
      price: price ? Number(price) : 0,
      discount: discount ? Number(discount) : 0,
      emoji: emoji.trim() || null,
      imageUrl: imageUrl.trim() || null,
      description: description.trim() || null,
      active,
    });
  };

  return (
    <div className="card pad" style={{ marginBottom: 14 }}>
      <div className="h2" style={{ marginBottom: 12 }}>{initial ? 'Редактировать товар' : 'Новый товар'}</div>
      <Field label="Название"><input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} placeholder="Скидка 20% на кофе"/></Field>
      <Field label="Категория"><input style={inputStyle} value={category} onChange={e => setCategory(e.target.value)} placeholder="Скидки"/></Field>
      <div className="row" style={{ gap: 10 }}>
        <div style={{ flex: 1 }}><Field label="Цена (снэпы)"><input style={inputStyle} type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="500"/></Field></div>
        <div style={{ flex: 1 }}><Field label="Скидка %"><input style={inputStyle} type="number" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="0"/></Field></div>
      </div>
      <Field label="Emoji"><input style={inputStyle} value={emoji} onChange={e => setEmoji(e.target.value)} placeholder="☕"/></Field>
      <Field label="URL картинки"><input style={inputStyle} value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..."/></Field>
      <Field label="Описание"><textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={description} onChange={e => setDescription(e.target.value)}/></Field>
      <label className="row" style={{ gap: 8, marginBottom: 12, cursor: 'pointer' }}>
        <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)}/>
        <span style={{ fontSize: 14 }}>Активен (виден в магазине)</span>
      </label>
      <div className="row" style={{ gap: 10 }}>
        <button className="btn outlined block" onClick={onCancel}>Отмена</button>
        <button className="btn primary block" onClick={submit}>Сохранить</button>
      </div>
    </div>
  );
};

// ─── Строка списка ──────────────────────────────────────────────────────────────

const Row: React.FC<{ title: string; subtitle: string; dim?: boolean; onEdit: () => void; onDelete: () => void }> =
  ({ title, subtitle, dim, onEdit, onDelete }) => (
    <div className="card pad" style={{ marginBottom: 8, opacity: dim ? 0.5 : 1 }}>
      <div className="row" style={{ justifyContent: 'space-between', gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--dark)' }}>{title}</div>
          <div style={{ fontSize: 12, color: 'var(--gray)' }}>{subtitle}</div>
        </div>
        <div className="row" style={{ gap: 6, flex: '0 0 auto' }}>
          <button className="btn sm outlined" onClick={onEdit}>✏️</button>
          <button className="btn sm outlined" style={{ color: 'var(--red)' }} onClick={onDelete}>🗑</button>
        </div>
      </div>
    </div>
  );

// ─── AdminScreen ────────────────────────────────────────────────────────────────

const AdminScreen: React.FC<AdminScreenProps> = ({ initData, onClose, onToast }) => {
  const [tab, setTab] = useState<Tab>('quests');
  const [quests, setQuests] = useState<AdminQuest[]>([]);
  const [shop, setShop] = useState<AdminShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQuest, setEditingQuest] = useState<AdminQuest | 'new' | null>(null);
  const [editingShop, setEditingShop] = useState<AdminShopItem | 'new' | null>(null);

  const reload = useCallback(async () => {
    if (!initData) return;
    setLoading(true);
    try {
      if (tab === 'quests') setQuests(await getAdminQuests(initData));
      else setShop(await getAdminShop(initData));
    } catch {
      onToast('Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, [initData, tab, onToast]);

  useEffect(() => { reload(); }, [reload]);

  // ── Квесты ──
  const saveQuest = async (body: AdminQuestInput) => {
    if (!initData) return;
    try {
      if (editingQuest && editingQuest !== 'new') await updateQuest(initData, editingQuest.id, body);
      else await createQuest(initData, body);
      onToast('Квест сохранён');
      setEditingQuest(null);
      reload();
    } catch { onToast('Не удалось сохранить'); }
  };
  const removeQuest = async (q: AdminQuest) => {
    if (!initData || !window.confirm(`Удалить квест «${q.name}»?`)) return;
    try { await deleteQuest(initData, q.id); onToast('Удалено'); reload(); }
    catch { onToast('Не удалось удалить'); }
  };

  // ── Товары ──
  const saveShop = async (body: AdminShopInput) => {
    if (!initData) return;
    try {
      if (editingShop && editingShop !== 'new') await updateShopItem(initData, editingShop.id, body);
      else await createShopItem(initData, body);
      onToast('Товар сохранён');
      setEditingShop(null);
      reload();
    } catch { onToast('Не удалось сохранить'); }
  };
  const removeShop = async (it: AdminShopItem) => {
    if (!initData || !window.confirm(`Удалить товар «${it.title}»?`)) return;
    try { await deleteShopItem(initData, it.id); onToast('Удалено'); reload(); }
    catch { onToast('Не удалось удалить'); }
  };

  return (
    <div className="scroll">
      <div className="page-pad">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
          <div className="h1">Админка</div>
          <button className="btn sm outlined" onClick={onClose}>Закрыть</button>
        </div>

        {/* Табы */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          <button className={`pill${tab === 'quests' ? ' active' : ''}`} onClick={() => { setTab('quests'); setEditingQuest(null); }}>Квесты</button>
          <button className={`pill${tab === 'shop' ? ' active' : ''}`} onClick={() => { setTab('shop'); setEditingShop(null); }}>Товары</button>
        </div>

        {tab === 'quests' && (
          <>
            {editingQuest ? (
              <QuestForm
                initial={editingQuest === 'new' ? undefined : editingQuest}
                onSubmit={saveQuest}
                onCancel={() => setEditingQuest(null)}
              />
            ) : (
              <button className="btn primary block" style={{ marginBottom: 14 }} onClick={() => setEditingQuest('new')}>+ Добавить квест</button>
            )}
            {loading ? <div className="muted">Загрузка…</div>
              : quests.length === 0 ? <div className="muted" style={{ textAlign: 'center', padding: 20 }}>Квестов пока нет</div>
              : quests.map(q => (
                <Row key={q.id}
                  title={`${q.emoji ?? ''} ${q.name}`.trim()}
                  subtitle={`${q.type} · цель: ${q.metadata ?? '—'} · награда: ${q.reward ?? 0}`}
                  onEdit={() => setEditingQuest(q)}
                  onDelete={() => removeQuest(q)}
                />
              ))}
          </>
        )}

        {tab === 'shop' && (
          <>
            {editingShop ? (
              <ShopForm
                initial={editingShop === 'new' ? undefined : editingShop}
                onSubmit={saveShop}
                onCancel={() => setEditingShop(null)}
              />
            ) : (
              <button className="btn primary block" style={{ marginBottom: 14 }} onClick={() => setEditingShop('new')}>+ Добавить товар</button>
            )}
            {loading ? <div className="muted">Загрузка…</div>
              : shop.length === 0 ? <div className="muted" style={{ textAlign: 'center', padding: 20 }}>Товаров пока нет</div>
              : shop.map(it => (
                <Row key={it.id}
                  title={`${it.emoji ?? ''} ${it.title}`.trim()}
                  subtitle={`${it.category || '—'} · ${it.price} снэпов${it.active ? '' : ' · скрыт'}`}
                  dim={!it.active}
                  onEdit={() => setEditingShop(it)}
                  onDelete={() => removeShop(it)}
                />
              ))}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminScreen;
