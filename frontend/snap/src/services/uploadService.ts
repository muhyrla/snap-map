const API_BASE = process.env.REACT_APP_API_URL ?? '';

function authHeader(initData: string) {
  return { Authorization: `tma ${initData}` };
}

export interface PresignResponse {
  url: string;
  objectKey: string;
}

export type VerificationState = 'QUEUED' | 'PROCESSING' | 'APPROVED' | 'REJECTED' | 'FAILED';

export interface VerificationStatus {
  taskId: string;
  state: VerificationState;
  userId: number;
  objectKey: string;
  message: string | null;
  updatedAtEpochMillis: number;
}

/** Шаг 1: получить presigned URL для загрузки в S3. */
export async function presign(initData: string, objectToFind: string): Promise<PresignResponse> {
  const res = await fetch(`${API_BASE}/api/uploads/presign`, {
    method: 'POST',
    headers: { ...authHeader(initData), 'Content-Type': 'application/json' },
    body: JSON.stringify({ object_to_find: objectToFind }),
  });
  if (!res.ok) throw new Error('Failed to presign upload');
  return res.json();
}

/** Шаг 2: залить файл прямо в S3 по presigned URL. */
export async function uploadToS3(url: string, file: File): Promise<void> {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  });
  if (!res.ok) throw new Error('Failed to upload to storage');
}

/** Шаг 3: поставить задачу на верификацию. */
export async function requestVerification(
  initData: string,
  params: { objectKey: string; expectedLabel: string; questId?: number | null; allowFeedPhotos?: boolean }
): Promise<{ taskId: string; status: VerificationStatus }> {
  const res = await fetch(`${API_BASE}/api/uploads/verify`, {
    method: 'POST',
    headers: { ...authHeader(initData), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      objectKey: params.objectKey,
      expectedLabel: params.expectedLabel,
      questId: params.questId ?? null,
      allowFeedPhotos: params.allowFeedPhotos ?? false,
    }),
  });
  if (!res.ok) throw new Error('Failed to request verification');
  return res.json();
}

/** Шаг 4: получить текущий статус задачи (для поллинга). */
export async function getVerificationStatus(
  initData: string,
  taskId: string
): Promise<VerificationStatus> {
  const res = await fetch(`${API_BASE}/api/uploads/verify/status?taskId=${encodeURIComponent(taskId)}`, {
    headers: authHeader(initData),
  });
  if (!res.ok) throw new Error('Failed to fetch verification status');
  const data = await res.json();
  return data.status as VerificationStatus;
}

/**
 * Полный конвейер: presign → upload → verify → polling до финального статуса.
 * onState вызывается на каждом шаге для UI.
 */
export async function runSnapPipeline(
  initData: string,
  file: File,
  params: { objectToFind: string; expectedLabel: string; questId?: number | null; allowFeedPhotos?: boolean },
  onState?: (state: VerificationState | 'UPLOADING') => void,
): Promise<VerificationState> {
  onState?.('UPLOADING');
  const { url, objectKey } = await presign(initData, params.objectToFind);
  await uploadToS3(url, file);

  onState?.('QUEUED');
  const { taskId } = await requestVerification(initData, {
    objectKey,
    expectedLabel: params.expectedLabel,
    questId: params.questId,
    allowFeedPhotos: params.allowFeedPhotos,
  });

  // Поллинг до финального решения (макс ~60 c)
  const deadline = Date.now() + 60_000;
  let lastState: VerificationState = 'QUEUED';
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 2000));
    try {
      const status = await getVerificationStatus(initData, taskId);
      if (status.state !== lastState) {
        lastState = status.state;
        onState?.(status.state);
      }
      if (status.state === 'APPROVED' || status.state === 'REJECTED' || status.state === 'FAILED') {
        return status.state;
      }
    } catch {
      // временная ошибка сети — продолжаем поллинг
    }
  }
  return lastState;
}
