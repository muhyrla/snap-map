import React, { useState, useRef, useEffect } from 'react';
import { QuestDto } from '../services/questsService';
import { runSnapPipeline, VerificationState } from '../services/uploadService';
import { PhotoTile } from '../components/Shell';
import { IconCamera, IconCheck, IconCross } from '../icons';

type Phase = 'pick' | 'preview' | 'uploading' | 'processing' | 'approved' | 'rejected' | 'failed';

interface SnapFlowProps {
  quest: QuestDto;
  initData: string | null;
  onClose: () => void;
  onSuccess: (quest: QuestDto) => void;
}

const stateToPhase = (s: VerificationState | 'UPLOADING'): Phase => {
  switch (s) {
    case 'UPLOADING': return 'uploading';
    case 'QUEUED':
    case 'PROCESSING': return 'processing';
    case 'APPROVED': return 'approved';
    case 'REJECTED': return 'rejected';
    default: return 'failed';
  }
};

const SnapFlow: React.FC<SnapFlowProps> = ({ quest, initData, onClose, onSuccess }) => {
  const [phase, setPhase] = useState<Phase>('pick');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [allowFeed, setAllowFeed] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Автоматически открываем камеру при монтировании
  useEffect(() => {
    inputRef.current?.click();
  }, []);

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(f));
    setPhase('preview');
  };

  const submit = async () => {
    if (!file) return;
    setErrorMsg(null);

    // Офлайн-мок: нет initData → имитируем успех
    if (!initData) {
      setPhase('uploading');
      setTimeout(() => setPhase('processing'), 500);
      setTimeout(() => { setPhase('approved'); }, 1600);
      return;
    }

    const expectedLabel = quest.expectedLabel || quest.name;
    try {
      const finalState = await runSnapPipeline(
        initData,
        file,
        {
          objectToFind: expectedLabel,
          expectedLabel,
          questId: quest.id,
          allowFeedPhotos: allowFeed,
        },
        (s) => setPhase(stateToPhase(s)),
      );
      setPhase(stateToPhase(finalState));
    } catch (e: any) {
      setErrorMsg(e?.message ?? 'Ошибка загрузки');
      setPhase('failed');
    }
  };

  const busy = phase === 'uploading' || phase === 'processing';

  return (
    <div className="sheet-overlay" onClick={busy ? undefined : onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90%' }}>
        <div className="sheet-handle" />
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleFile}
        />

        <div style={{ padding: '0 18px 22px' }}>
          <div className="h2" style={{ marginBottom: 4 }}>{quest.name}</div>
          <div className="muted" style={{ marginBottom: 16 }}>{quest.description}</div>

          {/* Превью снимка */}
          {previewUrl && (phase === 'preview' || busy) && (
            <PhotoTile image={`url("${previewUrl}")`} aspect="4/3" style={{ marginBottom: 16 }} />
          )}

          {/* Фаза: выбор (камера открывается автоматически) */}
          {phase === 'pick' && (
            <button className="btn primary block lg" onClick={() => inputRef.current?.click()}>
              <IconCamera size={18} /> Открыть камеру
            </button>
          )}

          {/* Фаза: превью + отправка */}
          {phase === 'preview' && (
            <>
              <label className="row" style={{ gap: 10, marginBottom: 16, cursor: 'pointer', alignItems: 'center' }}>
                <input type="checkbox" checked={allowFeed} onChange={(e) => setAllowFeed(e.target.checked)} />
                <span style={{ fontSize: 14, color: 'var(--dark)' }}>Показывать фото в ленте</span>
              </label>
              <button className="btn primary block lg" onClick={submit} style={{ marginBottom: 10 }}>
                Отправить на проверку
              </button>
              <button className="btn outlined block" onClick={() => inputRef.current?.click()}>
                <IconCamera size={16} /> Переснять
              </button>
            </>
          )}

          {/* Фазы: загрузка / проверка */}
          {busy && (
            <div className="center" style={{ flexDirection: 'column', gap: 12, padding: '10px 0 4px' }}>
              <div className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--blue)', borderColor: 'rgba(0,122,255,0.2)', borderTopWidth: 3, borderWidth: 3 }} />
              <div className="muted">{phase === 'uploading' ? 'Загружаем снимок…' : 'Проверяем нейросетью…'}</div>
            </div>
          )}

          {/* Финал: успех */}
          {phase === 'approved' && (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div className="check-circle" style={{ margin: '4px auto 14px' }}>
                <IconCheck size={42} strokeWidth={3} />
              </div>
              <div className="h1" style={{ fontSize: 22, marginBottom: 6 }}>Квест засчитан!</div>
              <div className="muted" style={{ marginBottom: 18 }}>+{quest.reward} снэпов на баланс</div>
              <button className="btn primary block" onClick={() => onSuccess(quest)}>Отлично</button>
            </div>
          )}

          {/* Финал: отклонено */}
          {phase === 'rejected' && (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div className="check-circle" style={{ margin: '4px auto 14px', background: 'var(--red)' }}>
                <IconCross size={42} strokeWidth={3} />
              </div>
              <div className="h1" style={{ fontSize: 22, marginBottom: 6 }}>Не распознали объект</div>
              <div className="muted" style={{ marginBottom: 18 }}>Попробуй снять ещё раз, ближе к сути квеста</div>
              <button className="btn primary block" onClick={() => inputRef.current?.click()} style={{ marginBottom: 10 }}>
                <IconCamera size={16} /> Переснять
              </button>
              <button className="btn outlined block" onClick={onClose}>Закрыть</button>
            </div>
          )}

          {/* Финал: ошибка/таймаут */}
          {phase === 'failed' && (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div className="h2" style={{ marginBottom: 6 }}>Что-то пошло не так</div>
              <div className="muted" style={{ marginBottom: 18 }}>{errorMsg ?? 'Проверка не завершилась. Попробуй позже.'}</div>
              <button className="btn primary block" onClick={() => inputRef.current?.click()} style={{ marginBottom: 10 }}>
                <IconCamera size={16} /> Переснять
              </button>
              <button className="btn outlined block" onClick={onClose}>Закрыть</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SnapFlow;
