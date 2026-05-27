import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/_onboarding.scss';

const CITIES = ['Омск', 'Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань', 'Другой'];

const Onboarding: React.FC = () => {
  const { completeOnboarding } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [city, setCity] = useState('Омск');
  const [accepted1, setAccepted1] = useState(false);
  const [accepted2, setAccepted2] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    setLoading(true);
    await completeOnboarding(city);
    setLoading(false);
  };

  return (
    <div className="ob-screen">
      <div className="ob-dots">
        {([1, 2, 3] as const).map(n => (
          <span key={n} className={`ob-dot${n === step ? ' ob-dot--active' : ''}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="ob-step">
          <div className="ob-step__body ob-step__body--center">
            <div className="ob-logo">SnapMap</div>
            <p className="ob-tagline">Исследуй город. Зарабатывай снэпы.</p>
            <div className="ob-tiles">
              <div className="ob-tile ob-tile--1">🦆</div>
              <div className="ob-tile ob-tile--2">🌸</div>
              <div className="ob-tile ob-tile--3">🏛️</div>
            </div>
          </div>
          <button className="ob-btn ob-btn--primary" onClick={() => setStep(2)}>
            Начать
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="ob-step">
          <div className="ob-step__body">
            <h1 className="ob-title">Выбери свой город</h1>
            <p className="ob-subtitle">Квесты и рейтинг подстроятся под твой город</p>
            <div className="ob-city-list">
              {CITIES.map(c => (
                <button
                  key={c}
                  className={`ob-city-btn${city === c ? ' ob-city-btn--active' : ''}`}
                  onClick={() => setCity(c)}
                >
                  <span className="ob-city-btn__icon">📍</span>
                  <span className="ob-city-btn__label">{c}</span>
                  {city === c && <span className="ob-city-btn__check">✓</span>}
                </button>
              ))}
            </div>
          </div>
          <div className="ob-actions">
            <button className="ob-btn ob-btn--back" onClick={() => setStep(1)}>‹</button>
            <button className="ob-btn ob-btn--primary" onClick={() => setStep(3)}>Продолжить</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="ob-step">
          <div className="ob-step__body">
            <h1 className="ob-title">Почти готово</h1>
            <p className="ob-subtitle">Осталось согласиться с парой пунктов и можно начинать</p>

            <button className="ob-check-row" onClick={() => setAccepted1(v => !v)}>
              <span className={`ob-checkbox${accepted1 ? ' ob-checkbox--on' : ''}`}>{accepted1 ? '✓' : ''}</span>
              <span className="ob-check-row__text">
                Принимаю <span className="ob-link">условия использования</span>
              </span>
            </button>

            <button className="ob-check-row" onClick={() => setAccepted2(v => !v)}>
              <span className={`ob-checkbox${accepted2 ? ' ob-checkbox--on' : ''}`}>{accepted2 ? '✓' : ''}</span>
              <span className="ob-check-row__text">
                Согласен с <span className="ob-link">политикой конфиденциальности</span>
              </span>
            </button>

            <div className="ob-city-confirm">
              <span>📍</span>
              <div>
                <div className="ob-city-confirm__name">Город: {city}</div>
                <div className="ob-city-confirm__hint">Сменить можно позже в профиле</div>
              </div>
            </div>
          </div>

          <div className="ob-actions">
            <button className="ob-btn ob-btn--back" onClick={() => setStep(2)}>‹</button>
            <button
              className="ob-btn ob-btn--primary"
              disabled={!accepted1 || !accepted2 || loading}
              onClick={handleFinish}
            >
              {loading ? 'Загрузка...' : 'Войти / Зарегистрироваться'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
