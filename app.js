/* ==================== 应用核心逻辑 ==================== */

// ---------- 全局状态 ----------
const AppState = {
  currentPage: 'home',
  prevPage: 'home',

  // 当前练习状态
  practice: {
    questions: [],
    currentIndex: 0,
    answers: {},        // {qid: 'A'}
    results: {},        // {qid: true/false}
    startTime: null,
    timerInterval: null,
    elapsed: 0,
    isExam: false,
    examTimeLimit: 0,   // 秒
    subject: '',
  },

  // 综合应用能力
  zonghe: {
    questions: [],
    currentIndex: 0,
    answers: {},
    startTime: null,
    timerInterval: null,
    timeLimit: 120 * 60,
    remaining: 120 * 60,
  },

  // 本地存储的统计数据
  stats: {
    totalDone: 0,
    totalCorrect: 0,
    totalTime: 0,     // 秒
    moduleStats: {},  // {key: {done, correct}}
  },
  wrongBook: [],      // [{question, myAnswer, ...}]
};

// ---------- 初始化 ----------
function init() {
  loadFromStorage();
  updateHomeStats();
  updateModuleCounts();
}

function loadFromStorage() {
  try {
    const stats = localStorage.getItem('ah_quiz_stats');
    if (stats) AppState.stats = JSON.parse(stats);
    const wrong = localStorage.getItem('ah_quiz_wrong');
    if (wrong) AppState.wrongBook = JSON.parse(wrong);
  } catch(e) { console.warn('读取本地数据失败', e); }
}

function saveToStorage() {
  try {
    localStorage.setItem('ah_quiz_stats', JSON.stringify(AppState.stats));
    localStorage.setItem('ah_quiz_wrong', JSON.stringify(AppState.wrongBook));
  } catch(e) {}
}

function updateHomeStats() {
  const { totalDone, totalCorrect, totalTime } = AppState.stats;
  document.getElementById('done-count').textContent = totalDone;
  const rate = totalDone > 0 ? Math.round(totalCorrect / totalDone * 100) : 0;
  document.getElementById('accuracy-rate').textContent = rate + '%';
}

function updateModuleCounts() {
  const keys = ['changshi','yanyu','shuliang','panduan','ziliao'];
  let total = 0;
  keys.forEach(k => {
    const el = document.getElementById('count-' + k);
    if (el && QUESTIONS_DB[k]) {
      const count = QUESTIONS_DB[k].questions.length;
      el.textContent = count + '题';
      total += count;
    }
  });
  // 更新首页总题目数
  const totalEl = document.getElementById('total-questions');
  if (totalEl) totalEl.textContent = total + '+';
}

// ---------- 页面导航 ----------
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  AppState.prevPage = AppState.currentPage;
  AppState.currentPage = name;

  if (name === 'wrong') renderWrongBook();
  if (name === 'stats') renderStats();
}

function goBack() {
  stopTimer();
  stopZongheTimer();
  showPage('home');
}

// ---------- 开始练习 ----------
function startPractice(moduleKey) {
  const db = QUESTIONS_DB[moduleKey];
  if (!db) return;

  let questions = db.questions ? [...db.questions] : [];
  // 资料分析特殊处理
  if (moduleKey === 'ziliao') {
    questions = db.questions.map(q => ({ ...q, passage: db.passage }));
  }

  beginPractice(questions, db.name, false, 0, moduleKey);
}

function startAllPractice(subject) {
  let allQ = [];
  const keys = ['changshi','yanyu','shuliang','panduan','ziliao'];
  keys.forEach(k => {
    const db = QUESTIONS_DB[k];
    if (db && db.questions) {
      const qs = db.questions.map(q => ({
        ...q,
        passage: k === 'ziliao' ? db.passage : null
      }));
      allQ = allQ.concat(qs);
    }
  });
  shuffle(allQ);
  beginPractice(allQ, '职业能力倾向测验·混合练习', false, 0, 'all');
}

function startMockExam(type) {
  if (type === 'zhiye') {
    startAllPractice('zhiye');
    AppState.practice.isExam = true;
    AppState.practice.examTimeLimit = 90 * 60;
    AppState.practice.elapsed = 0;
    // 重启计时为倒计时
    stopTimer();
    startExamTimer();
    document.getElementById('practice-title').textContent = '职业能力倾向测验·模拟考试';
  } else {
    // 综合应用能力模拟考试
    startZonghe('all');
  }
}

function beginPractice(questions, title, isExam, timeLimit, subject) {
  stopTimer();
  const ps = AppState.practice;
  ps.questions = questions;
  ps.currentIndex = 0;
  ps.answers = {};
  ps.results = {};
  ps.startTime = Date.now();
  ps.elapsed = 0;
  ps.isExam = isExam;
  ps.examTimeLimit = timeLimit;
  ps.subject = subject;

  document.getElementById('practice-title').textContent = title;
  showPage('practice');
  renderQuestion();
  renderAnswerSheet();
  startTimer();
}

// ---------- 渲染题目 ----------
function renderQuestion() {
  const ps = AppState.practice;
  const q = ps.questions[ps.currentIndex];
  if (!q) return;

  const total = ps.questions.length;
  const idx = ps.currentIndex;

  // 进度
  document.getElementById('question-progress').textContent = `${idx+1}/${total}`;
  document.getElementById('progress-bar').style.width = `${(idx / total) * 100}%`;

  // 标签
  const db = findDbByQuestion(q);
  let catName = '题目';
  if (db) {
    const cats = db.categories;
    catName = cats && cats[q.category] ? cats[q.category].name : db.name;
  }
  document.getElementById('q-category-badge').textContent = catName;
  document.getElementById('q-difficulty').textContent = '⭐'.repeat(q.difficulty || 1);
  document.getElementById('q-id').textContent = q.id;

  // 资料
  const matBox = document.getElementById('material-box');
  if (q.passage) {
    matBox.style.display = '';
    document.getElementById('material-content').textContent = q.passage;
  } else {
    matBox.style.display = 'none';
  }

  // 题目
  document.getElementById('question-text').textContent = q.question;

  // 选项
  const optList = document.getElementById('options-list');
  optList.innerHTML = '';
  const labels = ['A','B','C','D','E'];
  q.options.forEach((opt, i) => {
    const div = document.createElement('div');
    div.className = 'option-item';
    div.dataset.key = labels[i];
    div.innerHTML = `<span class="option-label">${labels[i]}</span><span class="option-text">${opt.replace(/^[A-D]\.\s*/, '')}</span>`;
    div.onclick = () => selectOption(labels[i], div, q);
    optList.appendChild(div);
  });

  // 如果已答过，恢复状态
  if (ps.answers[q.id] !== undefined) {
    showAnswerResult(q, ps.answers[q.id]);
  } else {
    document.getElementById('answer-panel').style.display = 'none';
    document.getElementById('btn-next').style.display = 'none';
    document.getElementById('btn-finish').style.display = 'none';
    document.getElementById('btn-mark').style.display = '';
  }

  updateAnswerSheet();
}

function findDbByQuestion(q) {
  for (const key of Object.keys(QUESTIONS_DB)) {
    const db = QUESTIONS_DB[key];
    if (db.questions && db.questions.find(x => x.id === q.id)) return db;
  }
  return null;
}

function selectOption(key, el, q) {
  const ps = AppState.practice;
  if (ps.answers[q.id] !== undefined) return; // 已作答

  ps.answers[q.id] = key;
  const isCorrect = key === q.answer;
  ps.results[q.id] = isCorrect;

  showAnswerResult(q, key);
  updateAnswerSheet();

  // 更新统计
  updateStats(q, isCorrect, ps.subject);
}

function showAnswerResult(q, myAnswer) {
  const ps = AppState.practice;
  const isCorrect = myAnswer === q.answer;

  // 禁用所有选项并标色
  document.querySelectorAll('.option-item').forEach(opt => {
    opt.classList.add('disabled');
    const k = opt.dataset.key;
    if (k === q.answer) opt.classList.add('correct');
    else if (k === myAnswer && !isCorrect) opt.classList.add('wrong');
  });

  // 显示解析
  const panel = document.getElementById('answer-panel');
  panel.style.display = '';
  const res = document.getElementById('answer-result');
  res.className = 'answer-result ' + (isCorrect ? 'correct-res' : 'wrong-res');
  res.innerHTML = isCorrect
    ? '✅ 回答正确！'
    : `❌ 回答错误！正确答案是 <strong>${q.answer}</strong>`;
  document.getElementById('explanation-text').textContent = q.explanation;

  // 按钮
  const total = ps.questions.length;
  const idx = ps.currentIndex;
  document.getElementById('btn-mark').style.display = '';
  if (idx < total - 1) {
    document.getElementById('btn-next').style.display = '';
    document.getElementById('btn-finish').style.display = 'none';
  } else {
    document.getElementById('btn-next').style.display = 'none';
    document.getElementById('btn-finish').style.display = '';
  }
}

function nextQuestion() {
  AppState.practice.currentIndex++;
  renderQuestion();
}

function markWrong() {
  const ps = AppState.practice;
  const q = ps.questions[ps.currentIndex];
  const myAnswer = ps.answers[q.id] || '未作答';
  addToWrongBook(q, myAnswer);
  showToast('已加入错题本 ✓');
}

// ---------- 答题卡 ----------
function renderAnswerSheet() {
  const ps = AppState.practice;
  const grid = document.getElementById('sheet-grid');
  grid.innerHTML = '';
  ps.questions.forEach((q, i) => {
    const btn = document.createElement('div');
    btn.className = 'sheet-num';
    btn.id = 'sheet-' + i;
    btn.textContent = i + 1;
    btn.onclick = () => jumpToQuestion(i);
    grid.appendChild(btn);
  });
  updateAnswerSheet();
}

function updateAnswerSheet() {
  const ps = AppState.practice;
  ps.questions.forEach((q, i) => {
    const btn = document.getElementById('sheet-' + i);
    if (!btn) return;
    btn.className = 'sheet-num';
    if (i === ps.currentIndex) {
      btn.classList.add('current');
    } else if (ps.results[q.id] === true) {
      btn.classList.add('correct');
    } else if (ps.results[q.id] === false) {
      btn.classList.add('wrong');
    } else if (ps.answers[q.id]) {
      btn.classList.add('answered');
    }
  });
}

function jumpToQuestion(i) {
  AppState.practice.currentIndex = i;
  renderQuestion();
}

// ---------- 计时器 ----------
function startTimer() {
  const ps = AppState.practice;
  ps.startTime = Date.now();
  ps.timerInterval = setInterval(() => {
    ps.elapsed = Math.floor((Date.now() - ps.startTime) / 1000);
    const timerEl = document.getElementById('timer-display');
    const timerBox = document.getElementById('timer-box');
    if (!timerEl) return;

    if (ps.isExam && ps.examTimeLimit > 0) {
      const remaining = ps.examTimeLimit - ps.elapsed;
      if (remaining <= 0) {
        clearInterval(ps.timerInterval);
        showResult();
        return;
      }
      timerEl.textContent = formatTime(remaining);
      if (remaining < 300) timerBox.classList.add('warning');
    } else {
      timerEl.textContent = formatTime(ps.elapsed);
    }
  }, 1000);
}

function startExamTimer() {
  const ps = AppState.practice;
  ps.startTime = Date.now();
  ps.timerInterval = setInterval(() => {
    ps.elapsed = Math.floor((Date.now() - ps.startTime) / 1000);
    const remaining = ps.examTimeLimit - ps.elapsed;
    const timerEl = document.getElementById('timer-display');
    const timerBox = document.getElementById('timer-box');
    if (!timerEl) return;
    if (remaining <= 0) {
      clearInterval(ps.timerInterval);
      showResult();
      return;
    }
    timerEl.textContent = formatTime(remaining);
    if (remaining < 300) timerBox.classList.add('warning');
  }, 1000);
}

function stopTimer() {
  if (AppState.practice.timerInterval) {
    clearInterval(AppState.practice.timerInterval);
    AppState.practice.timerInterval = null;
  }
}

// ---------- 查看结果 ----------
function showResult() {
  stopTimer();
  const ps = AppState.practice;
  const total = ps.questions.length;
  const correct = Object.values(ps.results).filter(v => v === true).length;
  const wrong = Object.values(ps.results).filter(v => v === false).length;
  const rate = total > 0 ? Math.round(correct / total * 100) : 0;
  const elapsed = ps.elapsed;

  // 表情
  let emoji = '😐';
  if (rate >= 90) emoji = '🏆';
  else if (rate >= 70) emoji = '🎉';
  else if (rate >= 50) emoji = '👍';
  else emoji = '💪';

  document.getElementById('result-emoji').textContent = emoji;
  document.getElementById('result-title').textContent = `本次练习结果（共${total}题）`;
  document.getElementById('score-num').textContent = correct;
  document.getElementById('score-total').textContent = `/${total}`;
  document.getElementById('res-correct').textContent = correct;
  document.getElementById('res-wrong').textContent = wrong;
  document.getElementById('res-time').textContent = formatTime(elapsed);
  document.getElementById('res-rate').textContent = rate + '%';

  // 圆弧动画
  const arc = document.getElementById('score-arc');
  const circumference = 2 * Math.PI * 54;
  const offset = circumference * (1 - rate / 100);
  setTimeout(() => {
    arc.style.transition = 'stroke-dashoffset 1s ease';
    arc.style.strokeDashoffset = offset;
    const color = rate >= 70 ? '#27ae60' : rate >= 50 ? '#f39c12' : '#e74c3c';
    arc.style.stroke = color;
  }, 200);

  // 保存错题
  ps.questions.forEach(q => {
    if (ps.results[q.id] === false) {
      addToWrongBook(q, ps.answers[q.id] || '未作答');
    }
  });

  showPage('result');
}

function retryExam() {
  const ps = AppState.practice;
  const subject = ps.subject;
  if (subject === 'all') startAllPractice('zhiye');
  else if (subject) startPractice(subject);
  else showPage('home');
}

function reviewWrong() {
  showPage('wrong');
}

// ---------- 综合应用能力 ----------
function startZonghe(type) {
  stopZongheTimer();
  const zh = AppState.zonghe;
  let questions = [];

  if (type === 'all') {
    questions = [...QUESTIONS_DB.zonghe.questions];
  } else {
    questions = QUESTIONS_DB.zonghe.questions.filter(q => q.type === type);
  }

  zh.questions = questions;
  zh.currentIndex = 0;
  zh.answers = {};
  zh.remaining = zh.timeLimit;
  zh.startTime = Date.now();

  document.getElementById('zonghe-title').textContent =
    type === 'all' ? '综合应用能力·模拟考试' : '综合应用能力·专项练习';

  showPage('zonghe');
  renderZongheQuestion();
  startZongheTimer();
}

function renderZongheQuestion() {
  const zh = AppState.zonghe;
  const q = zh.questions[zh.currentIndex];
  if (!q) return;

  const typeNames = { gainian: '概念分析题', cailiao: '材料分析题', xiezuo: '写作题' };
  document.getElementById('zh-type-badge').textContent = typeNames[q.type] || '主观题';
  document.getElementById('zh-qid').textContent = q.id;
  document.getElementById('zh-question-text').textContent = q.question;

  // 评分要点
  const list = document.getElementById('scoring-list');
  list.innerHTML = '';
  if (q.scoring) {
    q.scoring.forEach(s => {
      const li = document.createElement('li');
      li.innerHTML = `${s.point} <span class="score-pt">（${s.score}分）</span>`;
      list.appendChild(li);
    });
  }

  // 恢复已有答案
  const textarea = document.getElementById('zh-answer-input');
  textarea.value = zh.answers[q.id] || '';
  updateWordCount();

  // 隐藏参考答案
  document.getElementById('reference-panel').style.display = 'none';

  // 进度条
  const total = zh.questions.length;
  document.getElementById('zonghe-progress').style.width = `${(zh.currentIndex / total) * 100}%`;

  // 按钮
  const isLast = zh.currentIndex >= zh.questions.length - 1;
  document.getElementById('btn-zh-next').style.display = isLast ? 'none' : '';
  document.getElementById('btn-zh-finish').style.display = isLast ? '' : 'none';
}

function updateWordCount() {
  const val = document.getElementById('zh-answer-input').value;
  document.getElementById('word-count').textContent = val.length;
}

function showReference() {
  const zh = AppState.zonghe;
  const q = zh.questions[zh.currentIndex];

  // 保存答案
  zh.answers[q.id] = document.getElementById('zh-answer-input').value;

  const panel = document.getElementById('reference-panel');
  panel.style.display = '';
  document.getElementById('ref-content').textContent = q.reference;
}

function nextZonghe() {
  const zh = AppState.zonghe;
  const q = zh.questions[zh.currentIndex];
  zh.answers[q.id] = document.getElementById('zh-answer-input').value;
  zh.currentIndex++;
  renderZongheQuestion();
}

function finishZonghe() {
  const zh = AppState.zonghe;
  const q = zh.questions[zh.currentIndex];
  zh.answers[q.id] = document.getElementById('zh-answer-input').value;
  stopZongheTimer();
  showToast('✅ 本次综合应用能力作答完成！请对照参考答案自评。');
  showPage('home');
}

function startZongheTimer() {
  const zh = AppState.zonghe;
  zh.timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - zh.startTime) / 1000);
    zh.remaining = zh.timeLimit - elapsed;
    const el = document.getElementById('zonghe-timer');
    const box = document.getElementById('zonghe-timer-box');
    if (!el) return;
    if (zh.remaining <= 0) {
      clearInterval(zh.timerInterval);
      finishZonghe();
      return;
    }
    el.textContent = formatTime(zh.remaining);
    if (zh.remaining < 600) box.classList.add('warning');
  }, 1000);
}

function stopZongheTimer() {
  if (AppState.zonghe.timerInterval) {
    clearInterval(AppState.zonghe.timerInterval);
    AppState.zonghe.timerInterval = null;
  }
}

// ---------- 错题本 ----------
function addToWrongBook(q, myAnswer) {
  // 避免重复
  const exists = AppState.wrongBook.find(w => w.id === q.id && w.myAnswer === myAnswer);
  if (exists) return;
  AppState.wrongBook.unshift({
    id: q.id,
    question: q.question,
    options: q.options,
    answer: q.answer,
    myAnswer: myAnswer,
    explanation: q.explanation,
    category: q.category,
    addTime: new Date().toLocaleDateString()
  });
  // 最多保留100条
  if (AppState.wrongBook.length > 100) AppState.wrongBook.pop();
  saveToStorage();
}

function renderWrongBook() {
  const container = document.getElementById('wrong-list-container');
  if (!AppState.wrongBook.length) {
    container.innerHTML = '<div class="empty-tip">暂无错题，继续加油！🌟</div>';
    return;
  }
  container.innerHTML = AppState.wrongBook.map((w, i) => `
    <div class="wrong-question-card">
      <div class="wq-meta">
        <span class="q-badge">${w.category || '未分类'}</span>
        <span>${w.addTime}</span>
        <span style="margin-left:auto;cursor:pointer;color:#e74c3c" onclick="removeWrong(${i})">✕ 移除</span>
      </div>
      <div class="wq-question">${w.question}</div>
      ${w.options ? '<div class="wq-opts" style="font-size:13px;color:#7f8c8d;margin-bottom:8px">' + w.options.join('  ') + '</div>' : ''}
      <div class="wq-answer">
        我的答案：<span style="color:#e74c3c">${w.myAnswer}</span> &nbsp;|&nbsp;
        正确答案：<span class="correct">${w.answer}</span>
        ${w.explanation ? '<br><span style="color:#666;font-size:12px">💡 ' + w.explanation + '</span>' : ''}
      </div>
    </div>
  `).join('');
}

function removeWrong(i) {
  AppState.wrongBook.splice(i, 1);
  saveToStorage();
  renderWrongBook();
}

function clearWrongBook() {
  if (!confirm('确认清空所有错题？')) return;
  AppState.wrongBook = [];
  saveToStorage();
  renderWrongBook();
}

// ---------- 学习统计 ----------
function updateStats(q, isCorrect, moduleKey) {
  const s = AppState.stats;
  s.totalDone++;
  if (isCorrect) s.totalCorrect++;

  if (!s.moduleStats[moduleKey]) s.moduleStats[moduleKey] = { done: 0, correct: 0 };
  s.moduleStats[moduleKey].done++;
  if (isCorrect) s.moduleStats[moduleKey].correct++;

  saveToStorage();
  updateHomeStats();
}

function renderStats() {
  const s = AppState.stats;
  document.getElementById('stat-total-done').textContent = s.totalDone;
  document.getElementById('stat-correct').textContent = s.totalCorrect;
  const rate = s.totalDone > 0 ? Math.round(s.totalCorrect / s.totalDone * 100) : 0;
  document.getElementById('stat-rate').textContent = rate + '%';
  document.getElementById('stat-time').textContent = Math.round(s.totalTime / 60) + '分钟';

  // 各模块图表
  const chartEl = document.getElementById('module-chart');
  const modules = [
    { key: 'changshi', name: '常识判断', color: '#5c6bc0' },
    { key: 'yanyu', name: '言语理解', color: '#9c27b0' },
    { key: 'shuliang', name: '数量关系', color: '#0288d1' },
    { key: 'panduan', name: '判断推理', color: '#00897b' },
    { key: 'ziliao', name: '资料分析', color: '#f57c00' },
  ];
  chartEl.innerHTML = modules.map(m => {
    const ms = s.moduleStats[m.key];
    const done = ms ? ms.done : 0;
    const pct = done > 0 ? Math.round(ms.correct / done * 100) : 0;
    return `
      <div class="chart-row">
        <span class="chart-label">${m.name}</span>
        <div class="chart-bar-wrap">
          <div class="chart-bar" style="width:${pct}%;background:${m.color}"></div>
        </div>
        <span class="chart-pct">${pct}%</span>
      </div>
    `;
  }).join('');
}

// ---------- 工具函数 ----------
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function showToast(msg, duration = 2500) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position:fixed;bottom:32px;left:50%;transform:translateX(-50%);
      background:#2c3e50;color:white;padding:12px 28px;border-radius:24px;
      font-size:14px;z-index:9999;opacity:0;transition:opacity 0.3s;
      box-shadow:0 4px 20px rgba(0,0,0,0.3);pointer-events:none;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  setTimeout(() => { toast.style.opacity = '0'; }, duration);
}

// 字数统计实时更新
document.addEventListener('DOMContentLoaded', () => {
  const ta = document.getElementById('zh-answer-input');
  if (ta) ta.addEventListener('input', updateWordCount);
  init();
});
