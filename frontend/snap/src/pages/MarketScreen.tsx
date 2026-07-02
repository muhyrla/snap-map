import React, { useState, useEffect } from 'react';
import { ShopItemDto, PurchaseDto, getMarketItems, purchaseItem, getPurchases } from '../services/shopService';
import { market as mockMarket } from '../data';
import { PhotoTile, AnimatedNumber } from '../components/Shell';
import { IconBolt, IconCheck, IconCopy } from '../icons';

const CATEGORIES = ['Все', 'Скидки', 'Бесплатный товар', 'Услуги', 'Мерч', 'Цифровые коды'];

// ─── MarketCard ───────────────────────────────────────────────────────────────

const MarketCard: React.FC<{ item: ShopItemDto; onOpen: (item: ShopItemDto) => void }> = ({ item, onOpen }) => (
  <button onClick={() => onOpen(item)} className="card" style={{ overflow: 'hidden', padding: 0, textAlign: 'left' }}>
    <div style={{ position: 'relative' }}>
      <PhotoTile image={item.imageUrl ? `url("${item.imageUrl}")` : undefined} emoji={item.emoji ?? '🎁'} aspect="1/1" style={{ borderRadius: 0 }}/>
      {item.discount > 0 && <span className="discount-badge">-{item.discount}%</span>}
    </div>
    <div style={{ padding: '10px 12px 12px' }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark)', lineHeight: 1.3, marginBottom: 6, minHeight: 34, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {item.title}
      </div>
      <div className="row" style={{ gap: 4, alignItems: 'center' }}>
        <IconBolt size={13} style={{ color: 'var(--blue)' }}/>
        <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--blue)' }}>{item.price}</span>
      </div>
    </div>
  </button>
);

// ─── MarketDetail ─────────────────────────────────────────────────────────────

interface DetailProps {
  item: ShopItemDto;
  balance: number;
  onClose: () => void;
  onConfirmBuy: (item: ShopItemDto) => Promise<PurchaseDto | null>;
}

const MarketDetail: React.FC<DetailProps> = ({ item, balance, onClose, onConfirmBuy }) => {
  const [step, setStep] = useState<'view' | 'confirm' | 'done'>('view');
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const canAfford = balance >= item.price;

  const confirm = async () => {
    setLoading(true);
    const result = await onConfirmBuy(item);
    setLoading(false);
    if (result) {
      setCode(result.code);
      setStep('done');
    }
  };

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '88%' }}>
        <div className="sheet-handle"/>

        {step === 'view' && (
          <div style={{ padding: '0 18px 18px' }}>
            <PhotoTile image={item.imageUrl ? `url("${item.imageUrl}")` : undefined} emoji={item.emoji ?? '🎁'} aspect="16/9" style={{ marginBottom: 14 }}/>
            <div className="h1" style={{ marginBottom: 6, fontSize: 22 }}>{item.title}</div>
            <div className="row" style={{ gap: 10, marginBottom: 14 }}>
              <span className="pill blue" style={{ fontWeight: 700 }}><IconBolt size={14}/>{item.price}</span>
              {item.discount > 0 && <span className="pill red">-{item.discount}%</span>}
            </div>
            {item.description && (
              <div className="muted" style={{ lineHeight: 1.5, marginBottom: 18, color: 'var(--dark)' }}>{item.description}</div>
            )}
            <div className="card pad" style={{ background: 'var(--bg)', boxShadow: 'none', marginBottom: 18 }}>
              <div className="row" style={{ justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--gray)' }}>Ваш баланс после</span>
                <span style={{ fontWeight: 700, color: canAfford ? 'var(--dark)' : 'var(--red)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <IconBolt size={13}/>{(balance - item.price).toLocaleString('ru-RU')}
                </span>
              </div>
            </div>
            <button className="btn primary block lg" disabled={!canAfford} onClick={() => setStep('confirm')}>
              {canAfford ? <><IconBolt size={16}/>Обменять за {item.price}</> : 'Недостаточно снэпов'}
            </button>
          </div>
        )}

        {step === 'confirm' && (
          <div style={{ padding: '4px 18px 18px' }}>
            <div className="h2" style={{ marginBottom: 8 }}>Подтверждение</div>
            <div className="muted" style={{ marginBottom: 18 }}>
              Потратить <b style={{ color: 'var(--blue)', display: 'inline-flex', alignItems: 'center', gap: 2, verticalAlign: 'middle' }}><IconBolt size={13}/>{item.price}</b> на «{item.title}»?
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn outlined block" onClick={() => setStep('view')}>Отмена</button>
              <button className="btn primary block" disabled={loading} onClick={confirm}>
                {loading ? 'Обрабатываем...' : 'Обменять'}
              </button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div style={{ padding: '10px 18px 22px', textAlign: 'center' }}>
            <div className="check-circle" style={{ margin: '8px auto 14px' }}>
              <IconCheck size={42} strokeWidth={3}/>
            </div>
            <div className="h1" style={{ marginBottom: 6, fontSize: 22 }}>Награда получена!</div>
            <div className="muted" style={{ marginBottom: 18 }}>Покажи код на кассе</div>
            <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '16px 18px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 700, letterSpacing: 1.5, color: 'var(--dark)' }}>{code}</div>
              <button className="btn sm outlined" onClick={() => {
                navigator.clipboard?.writeText(code).catch(() => {});
                setCopied(true);
                setTimeout(() => setCopied(false), 1400);
              }}>
                <IconCopy size={16}/> {copied ? 'Готово' : 'Копировать'}
              </button>
            </div>
            <button className="btn primary block" onClick={onClose}>Закрыть</button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── PurchaseHistory ──────────────────────────────────────────────────────────

const PurchaseHistory: React.FC<{ initData: string | null; onClose: () => void }> = ({ initData, onClose }) => {
  const [items, setItems] = useState<PurchaseDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!initData) { setLoading(false); return; }
    getPurchases(initData).then(setItems).catch(() => {}).finally(() => setLoading(false));
  }, [initData]);

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle"/>
        <div style={{ padding: '0 18px 18px' }}>
          <div className="h2" style={{ marginBottom: 14 }}>Мои покупки</div>
          {loading ? (
            [1,2].map(i => <div key={i} className="skel" style={{ height: 60, borderRadius: 12, marginBottom: 8 }}/>)
          ) : items.length === 0 ? (
            <div className="muted" style={{ textAlign: 'center', padding: '20px 0' }}>Пока ничего не куплено</div>
          ) : items.map((p, i) => (
            <div key={p.id} className="row" style={{ gap: 12, padding: '12px 0', borderBottom: i < items.length - 1 ? '1px solid rgba(141,153,174,0.15)' : 'none' }}>
              <PhotoTile image={p.item.imageUrl ? `url("${p.item.imageUrl}")` : undefined} emoji={p.item.emoji ?? '🎁'} aspect="1/1" style={{ width: 48, height: 48, flex: '0 0 48px', borderRadius: 8 }}/>
              <div className="grow">
                <div style={{ fontWeight: 600, fontSize: 13 }}>{p.item.title}</div>
                <div style={{ fontSize: 11, color: 'var(--gray)' }}>код {p.code}</div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--red)' }}>−{p.pricePaid}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── MarketScreen ─────────────────────────────────────────────────────────────

interface MarketScreenProps {
  balance: number;
  initData: string | null;
  onPurchase: (item: ShopItemDto, result: PurchaseDto) => void;
}

const MarketScreen: React.FC<MarketScreenProps> = ({ balance, initData, onPurchase }) => {
  const [filter, setFilter] = useState('Все');
  const [items, setItems] = useState<ShopItemDto[]>([]);
  const [detail, setDetail] = useState<ShopItemDto | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(balance);

  useEffect(() => { setCurrentBalance(balance); }, [balance]);

  useEffect(() => {
    if (initData) {
      const cat = filter === 'Все' ? undefined : filter;
      getMarketItems(initData, cat).then(setItems).catch(() => setItems(mockMarket as any));
    } else {
      const cat = filter === 'Все' ? null : filter;
      const filtered = cat
        ? (mockMarket as any[]).filter((m: any) => m.category === cat || (cat === 'Скидки' && m.discount > 0))
        : mockMarket as any[];
      setItems(filtered.map((m: any) => ({ id: m.id, title: m.title, description: null, price: m.price, discount: m.discount, category: m.category, imageUrl: null, emoji: m.emoji })));
    }
  }, [filter, initData]);

  const handleConfirmBuy = async (item: ShopItemDto): Promise<PurchaseDto | null> => {
    if (!initData) {
      // офлайн-мок
      const mock: PurchaseDto = { id: Date.now(), item, code: 'SNAP-' + Math.random().toString(36).slice(2, 7).toUpperCase(), pricePaid: item.price, purchasedAt: new Date().toISOString() };
      setCurrentBalance(b => b - item.price);
      onPurchase(item, mock);
      return mock;
    }
    try {
      const result = await purchaseItem(initData, item.id);
      setCurrentBalance(b => b - item.price);
      onPurchase(item, result);
      return result;
    } catch (e: any) {
      return null;
    }
  };

  return (
    <>
      <div className="scroll">
        <div className="page-pad">
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
            <div className="h1">Маркет</div>
            <button className="btn sm outlined" onClick={() => setShowHistory(true)}>Мои покупки</button>
          </div>
          <div className="muted" style={{ marginBottom: 14 }}>Обменивай снэпы на скидки, услуги и цифровые коды</div>

          {/* Баланс */}
          <div className="card pad" style={{ marginBottom: 14, background: 'linear-gradient(135deg,var(--blue) 0%,#005bb5 100%)', color: '#fff', boxShadow: '0 6px 18px rgba(0,122,255,0.3)' }}>
            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4, fontWeight: 500 }}>Ваш баланс</div>
            <div className="row" style={{ gap: 6, alignItems: 'baseline' }}>
              <IconBolt size={20} style={{ color: '#FFD60A' }}/>
              <AnimatedNumber value={currentBalance} className="big-num" style={{ fontSize: 30, fontWeight: 900, lineHeight: 1, color: '#fff' }}/>
            </div>
          </div>

          {/* Фильтры */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginLeft: -16, marginRight: -16, padding: '2px 16px 12px' }}>
            {CATEGORIES.map(f => (
              <button key={f} className={`pill${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)} style={{ whiteSpace: 'nowrap', flex: '0 0 auto' }}>{f}</button>
            ))}
          </div>

          {/* Сетка */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {items.map(item => <MarketCard key={item.id} item={item} onOpen={setDetail}/>)}
          </div>
        </div>
      </div>

      {detail && (
        <MarketDetail
          item={detail}
          balance={currentBalance}
          onClose={() => setDetail(null)}
          onConfirmBuy={handleConfirmBuy}
        />
      )}

      {showHistory && (
        <PurchaseHistory initData={initData} onClose={() => setShowHistory(false)}/>
      )}
    </>
  );
};

export default MarketScreen;
