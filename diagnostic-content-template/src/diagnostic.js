/**
 * DiagnosticModule - 汎用診断コンテンツエンジン
 *
 * 使い方:
 *   const diag = new DiagnosticModule('#container', diagnosisData);
 *   diag.start();
 *
 * または外部JSONを読み込み:
 *   DiagnosticModule.loadFromJSON('#container', './data/sample.json');
 */
class DiagnosticModule {
  /**
   * @param {string|HTMLElement} container - マウント先のセレクタまたはDOM要素
   * @param {object} data - 診断データオブジェクト (meta, settings, questions, results)
   * @param {object} [options] - 追加オプション
   */
  constructor(container, data, options = {}) {
    this.container =
      typeof container === 'string'
        ? document.querySelector(container)
        : container;

    if (!this.container) {
      throw new Error(`DiagnosticModule: コンテナが見つかりません - ${container}`);
    }

    this.data = data;
    this.meta = data.meta;
    this.settings = { ...DiagnosticModule.DEFAULT_SETTINGS, ...data.settings };
    this.questions = data.questions;
    this.results = data.results;

    this.options = options;
    this.currentIndex = 0;
    this.scores = {};
    this.answers = [];

    this._initScores();
    this._injectStyles();
  }

  /* ------------------------------------------------------------------ */
  /*  Static helpers                                                     */
  /* ------------------------------------------------------------------ */

  static DEFAULT_SETTINGS = {
    choiceStyle: 'grid',
    showProgress: true,
    showQuestionNumber: true,
    animation: 'fade',
    resultShareEnabled: false,
    scoringMode: 'highest',  // "highest" = カテゴリ別最高スコア, "range" = 合計スコアの範囲判定
  };

  /**
   * JSONファイルから診断を読み込んで自動起動する
   */
  static async loadFromJSON(container, jsonPath, options = {}) {
    const res = await fetch(jsonPath);
    if (!res.ok) throw new Error(`JSON読み込み失敗: ${res.status}`);
    const data = await res.json();
    const instance = new DiagnosticModule(container, data, options);
    instance.start();
    return instance;
  }

  /* ------------------------------------------------------------------ */
  /*  Public API                                                         */
  /* ------------------------------------------------------------------ */

  /** 診断を開始（スタート画面を表示） */
  start() {
    this.currentIndex = 0;
    this.answers = [];
    this._initScores();
    this._renderStart();
  }

  /** 診断をリセットしてスタート画面に戻る */
  reset() {
    this.start();
  }

  /** 現在のスコアを取得 */
  getScores() {
    if (this.settings.scoringMode === 'range') {
      return { total: this.totalScore };
    }
    return { ...this.scores };
  }

  /** コールバック: 結果確定時 */
  onResult(callback) {
    this._onResultCallback = callback;
  }

  /* ------------------------------------------------------------------ */
  /*  Internal: score                                                    */
  /* ------------------------------------------------------------------ */

  _initScores() {
    if (this.settings.scoringMode === 'range') {
      // range モード: 単一の合計スコア
      this.totalScore = 0;
    } else {
      // highest モード: カテゴリ別スコア
      this.scores = {};
      this.results.forEach((r) => {
        this.scores[r.id] = 0;
      });
    }
  }

  _addScores(choiceScores) {
    if (this.settings.scoringMode === 'range') {
      // range モード: choice.score (数値) を加算
      this.totalScore += (typeof choiceScores === 'number' ? choiceScores : 0);
    } else {
      // highest モード: カテゴリ別に加算
      Object.entries(choiceScores).forEach(([key, value]) => {
        if (this.scores[key] !== undefined) {
          this.scores[key] += value;
        }
      });
    }
  }

  _getTopResult() {
    if (this.settings.scoringMode === 'range') {
      return this._getRangeResult();
    }
    return this._getHighestResult();
  }

  /** highest モード: カテゴリ別最高スコアの結果を返す */
  _getHighestResult() {
    let maxScore = -Infinity;
    let topId = this.results[0].id;
    Object.entries(this.scores).forEach(([id, score]) => {
      if (score > maxScore) {
        maxScore = score;
        topId = id;
      }
    });
    return this.results.find((r) => r.id === topId);
  }

  /** range モード: 合計スコアが該当する範囲の結果を返す */
  _getRangeResult() {
    const total = this.totalScore;
    for (const r of this.results) {
      if (r.range && total >= r.range[0] && total <= r.range[1]) {
        return r;
      }
    }
    // どの範囲にも該当しない場合は最後の結果をフォールバック
    return this.results[this.results.length - 1];
  }

  /* ------------------------------------------------------------------ */
  /*  Internal: rendering                                                */
  /* ------------------------------------------------------------------ */

  _el(tag, className, html) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (html !== undefined) el.innerHTML = html;
    return el;
  }

  _clear() {
    this.container.innerHTML = '';
  }

  _animate(el) {
    const anim = this.settings.animation;
    if (anim === 'fade') {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.35s ease';
      requestAnimationFrame(() => {
        el.style.opacity = '1';
      });
    } else if (anim === 'slide') {
      el.style.transform = 'translateX(30px)';
      el.style.opacity = '0';
      el.style.transition = 'transform 0.35s ease, opacity 0.35s ease';
      requestAnimationFrame(() => {
        el.style.transform = 'translateX(0)';
        el.style.opacity = '1';
      });
    }
  }

  /* --- Start screen --- */

  _renderStart() {
    this._clear();
    const wrap = this._el('div', 'dmod-wrap');
    const inner = this._el('div', 'dmod-start');
    inner.appendChild(this._el('h2', 'dmod-title', this.meta.title));
    inner.appendChild(this._el('p', 'dmod-desc', this.meta.description));

    const btn = this._el('button', 'dmod-btn dmod-btn--start', '診断をはじめる');
    btn.addEventListener('click', () => this._renderQuestion());
    inner.appendChild(btn);

    wrap.appendChild(inner);
    this.container.appendChild(wrap);
    this._animate(wrap);
  }

  /* --- Question screen --- */

  _renderQuestion() {
    this._clear();
    const q = this.questions[this.currentIndex];
    const total = this.questions.length;

    const wrap = this._el('div', 'dmod-wrap');

    // Progress bar
    if (this.settings.showProgress) {
      const progressOuter = this._el('div', 'dmod-progress');
      const progressInner = this._el('div', 'dmod-progress__bar');
      progressInner.style.width = `${((this.currentIndex) / total) * 100}%`;
      progressOuter.appendChild(progressInner);
      wrap.appendChild(progressOuter);
    }

    // Question number
    const qNum = this.settings.showQuestionNumber
      ? `<span class="dmod-qnum">Q${this.currentIndex + 1}/${total}</span> `
      : '';

    const qText = this._el('p', 'dmod-question', qNum + q.text);
    wrap.appendChild(qText);

    // Question image
    if (q.image) {
      const qImg = this._el('img', 'dmod-question__image');
      qImg.src = q.image;
      qImg.alt = q.text;
      wrap.appendChild(qImg);
    }

    // Choices
    const choiceCount = q.choices.length;
    const styleClass =
      this.settings.choiceStyle === 'horizontal' || choiceCount === 2
        ? 'dmod-choices--horizontal'
        : 'dmod-choices--grid';

    const choicesWrap = this._el('div', `dmod-choices ${styleClass}`);

    q.choices.forEach((choice) => {
      const btn = this._el('button', 'dmod-choice', choice.text);
      btn.addEventListener('click', () => this._handleAnswer(choice));
      choicesWrap.appendChild(btn);
    });

    wrap.appendChild(choicesWrap);
    this.container.appendChild(wrap);
    this._animate(wrap);
  }

  _handleAnswer(choice) {
    this.answers.push({ questionId: this.questions[this.currentIndex].id, choiceId: choice.id });
    // range モードは choice.score (数値)、highest モードは choice.scores (オブジェクト)
    this._addScores(this.settings.scoringMode === 'range' ? choice.score : choice.scores);
    this.currentIndex++;
    if (this.currentIndex < this.questions.length) {
      this._renderQuestion();
    } else {
      this._renderResult();
    }
  }

  /* --- Result screen --- */

  _renderResult() {
    this._clear();
    const result = this._getTopResult();

    // Callback (URL遷移前に実行)
    if (this._onResultCallback) {
      this._onResultCallback(result, this.getScores(), this.answers);
    }

    // result.url が設定されていれば別ページへ遷移
    if (result.url) {
      window.location.href = result.url;
      return;
    }

    // --- インライン結果表示 ---
    const wrap = this._el('div', 'dmod-wrap');
    const inner = this._el('div', 'dmod-result');

    inner.appendChild(this._el('p', 'dmod-result__label', '診断結果'));
    inner.appendChild(this._el('h2', 'dmod-result__title', result.title));

    if (result.image) {
      const img = this._el('img', 'dmod-result__image');
      img.src = result.image;
      img.alt = result.title;
      inner.appendChild(img);
    }

    inner.appendChild(this._el('p', 'dmod-result__desc', result.description));

    if (result.tags && result.tags.length) {
      const tagsWrap = this._el('div', 'dmod-result__tags');
      result.tags.forEach((t) => {
        tagsWrap.appendChild(this._el('span', 'dmod-tag', `#${t}`));
      });
      inner.appendChild(tagsWrap);
    }

    // Share button
    if (this.settings.resultShareEnabled && navigator.share) {
      const shareBtn = this._el('button', 'dmod-btn dmod-btn--share', 'シェアする');
      shareBtn.addEventListener('click', () => {
        navigator.share({
          title: this.meta.title,
          text: `${this.meta.title}の結果: ${result.title}`,
          url: location.href,
        });
      });
      inner.appendChild(shareBtn);
    }

    // Retry button
    const retryBtn = this._el('button', 'dmod-btn dmod-btn--retry', 'もう一度診断する');
    retryBtn.addEventListener('click', () => this.reset());
    inner.appendChild(retryBtn);

    wrap.appendChild(inner);
    this.container.appendChild(wrap);
    this._animate(wrap);
  }

  /* ------------------------------------------------------------------ */
  /*  Internal: scoped styles (injected once)                            */
  /* ------------------------------------------------------------------ */

  _injectStyles() {
    if (document.getElementById('dmod-styles')) return;
    const style = document.createElement('style');
    style.id = 'dmod-styles';
    style.textContent = DiagnosticModule.CSS;
    document.head.appendChild(style);
  }

  static CSS = `
/* ======================================
   DiagnosticModule - Scoped Styles
   All selectors prefixed with .dmod-
   ====================================== */

.dmod-wrap {
  max-width: 640px;
  margin: 0 auto;
  padding: 32px 24px;
  font-family: "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic", sans-serif;
  color: #333;
  box-sizing: border-box;
}

/* --- Start --- */
.dmod-start {
  text-align: center;
}
.dmod-title {
  font-size: 1.6rem;
  margin: 0 0 12px;
  line-height: 1.4;
}
.dmod-desc {
  font-size: 1rem;
  color: #666;
  margin: 0 0 28px;
  line-height: 1.6;
}

/* --- Buttons --- */
.dmod-btn {
  display: inline-block;
  padding: 14px 40px;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}
.dmod-btn:hover {
  transform: translateY(-2px);
}
.dmod-btn--start,
.dmod-btn--retry {
  background: #4f46e5;
  color: #fff;
}
.dmod-btn--start:hover,
.dmod-btn--retry:hover {
  background: #4338ca;
}
.dmod-btn--share {
  background: #10b981;
  color: #fff;
  margin-right: 12px;
  margin-bottom: 12px;
}
.dmod-btn--share:hover {
  background: #059669;
}

/* --- Progress --- */
.dmod-progress {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  margin-bottom: 24px;
  overflow: hidden;
}
.dmod-progress__bar {
  height: 100%;
  background: #4f46e5;
  border-radius: 3px;
  transition: width 0.4s ease;
}

/* --- Question --- */
.dmod-question {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 24px;
  line-height: 1.5;
}
.dmod-qnum {
  color: #4f46e5;
  margin-right: 6px;
}

/* --- Question image --- */
.dmod-question__image {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  margin: 0 auto 24px;
}

/* --- Choices --- */
.dmod-choices {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.dmod-choices--grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.dmod-choices--horizontal {
  display: flex;
  gap: 12px;
  justify-content: center;
}
.dmod-choice {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 20px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, transform 0.15s;
  text-align: center;
  min-height: 56px;
}
.dmod-choices--horizontal .dmod-choice {
  flex: 1;
  max-width: 200px;
}
.dmod-choice:hover {
  border-color: #4f46e5;
  background: #eef2ff;
  transform: translateY(-2px);
}

/* --- Result --- */
.dmod-result {
  text-align: center;
}
.dmod-result__label {
  font-size: 0.9rem;
  color: #4f46e5;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 8px;
}
.dmod-result__title {
  font-size: 1.8rem;
  margin: 0 0 20px;
  line-height: 1.3;
}
.dmod-result__image {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  margin-bottom: 20px;
}
.dmod-result__desc {
  font-size: 1rem;
  line-height: 1.7;
  color: #555;
  margin: 0 0 24px;
}
.dmod-result__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 28px;
}
.dmod-tag {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 20px;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 0.85rem;
}

/* --- Responsive --- */
@media (max-width: 480px) {
  .dmod-wrap {
    padding: 20px 16px;
  }
  .dmod-title {
    font-size: 1.3rem;
  }
  .dmod-question {
    font-size: 1.05rem;
  }
  .dmod-choices--grid {
    grid-template-columns: 1fr;
  }
  .dmod-result__title {
    font-size: 1.4rem;
  }
}
`;
}

// ESM / UMD 互換エクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DiagnosticModule;
}
