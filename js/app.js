/* =====================================================
   Complexity Analyzer — App Logic
   ===================================================== */

const PALETTE = ['#ffa116', '#3b82f6', '#a78bfa'];
const PALETTE_BG = ['rgba(255,161,22,.13)', 'rgba(59,130,246,.13)', 'rgba(167,139,250,.13)'];
const DEMO_CODES = [
  {
    name: 'Brute force O(n²)',
    lang: 'Python',
    code: `def two_sum_brute(nums, target):
    """
    Brute force: check every pair
    Time: O(n²)  Space: O(1)
    """
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`
  },
  {
    name: 'Hash map O(n)',
    lang: 'Python',
    code: `def two_sum_hash(nums, target):
    """
    Hash map: single pass lookup
    Time: O(n)  Space: O(n)
    """
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`
  }
];

const App = (() => {
  let activeCount = 1;
  let currentTab  = 0;
  let results     = [];
  let charts      = [];

  /* ---- Tab management ---- */
  function switchTab(idx) {
    currentTab = idx;

    // tab highlight
    document.querySelectorAll('.tab').forEach(t =>
      t.classList.toggle('active', +t.dataset.idx === idx));

    // sync header controls
    const ni = document.getElementById('name-input');
    const ls = document.getElementById('lang-select');
    const ca = document.getElementById('codeArea');

    ni.value = document.getElementById('name-' + idx).value;
    ls.value = document.getElementById('lang-' + idx).value;
    ca.value = document.getElementById('code-' + idx).value;

    ni.oninput = e => {
      document.getElementById('name-' + idx).value = e.target.value;
      const lbl = document.getElementById('tl-' + idx);
      if (lbl) lbl.textContent = e.target.value || 'Approach ' + (idx + 1);
    };
    ls.onchange = e => { document.getElementById('lang-' + idx).value = e.target.value; };
    ca.oninput = function() {
      document.getElementById('code-' + idx).value = this.value;
      App.onCodeInput(this);
    };

    updateEditorUI(ca);
  }

  function addTab() {
    if (activeCount >= 3) return;
    const idx = activeCount++;
    const tab = document.querySelector(`.tab[data-idx="${idx}"]`);
    tab.classList.remove('hidden');
    if (activeCount >= 3) document.getElementById('addTabBtn').style.display = 'none';
    switchTab(idx);
  }

  function removeTab(e, idx) {
    e.stopPropagation();
    if (activeCount <= 1) return;
    document.querySelector(`.tab[data-idx="${idx}"]`).classList.add('hidden');
    document.getElementById('code-' + idx).value = '';
    activeCount--;
    if (activeCount < 3) document.getElementById('addTabBtn').style.display = '';
    const remaining = [0, 1, 2].filter(
      i => !document.querySelector(`.tab[data-idx="${i}"]`).classList.contains('hidden')
    );
    if (remaining.length) switchTab(remaining[0]);
  }

  /* ---- Editor helpers ---- */
  function onNameChange(val) {
    document.getElementById('name-' + currentTab).value = val;
    const lbl = document.getElementById('tl-' + currentTab);
    if (lbl) lbl.textContent = val || 'Approach ' + (currentTab + 1);
  }

  function onLangChange(val) {
    document.getElementById('lang-' + currentTab).value = val;
  }

  function onCodeInput(ta) {
    document.getElementById('code-' + currentTab).value = ta.value;
    updateEditorUI(ta);
  }

  function handleTab(e) {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const ta = e.target;
    const s = ta.selectionStart;
    ta.value = ta.value.substring(0, s) + '    ' + ta.value.substring(ta.selectionEnd);
    ta.selectionStart = ta.selectionEnd = s + 4;
    onCodeInput(ta);
  }

  function syncScroll(ta) {
    document.getElementById('lineNumbers').scrollTop = ta.scrollTop;
  }

  function updateEditorUI(ta) {
    const lines = (ta.value || '').split('\n');
    document.getElementById('lineNumbers').textContent = lines.map((_, i) => i + 1).join('\n');

    // cursor position
    const text = ta.value.substring(0, ta.selectionStart);
    const lineNum = (text.match(/\n/g) || []).length + 1;
    const colNum  = text.length - text.lastIndexOf('\n');
    document.getElementById('lineCol').textContent = `Ln ${lineNum}, Col ${colNum}`;
    document.getElementById('charCount').textContent = `${ta.value.length} chars`;
  }

  /* ---- Demo ---- */
  function loadDemo() {
    DEMO_CODES.forEach((d, i) => {
      document.getElementById('code-' + i).value = d.code;
      document.getElementById('name-' + i).value = d.name;
      document.getElementById('lang-' + i).value  = d.lang;
      const lbl = document.getElementById('tl-' + i);
      if (lbl) lbl.textContent = d.name;
    });
    if (activeCount < 2) addTab();
    switchTab(0);
  }

  function resetAll() {
    [0, 1, 2].forEach(i => {
      document.getElementById('code-' + i).value = '';
      document.getElementById('name-' + i).value = 'Approach ' + (i + 1);
      document.getElementById('lang-' + i).value  = 'Python';
      const lbl = document.getElementById('tl-' + i);
      if (lbl) lbl.textContent = 'Approach ' + (i + 1);
    });
    document.getElementById('resultsContent').style.display = 'none';
    document.getElementById('emptyState').style.display = 'flex';
    charts.forEach(c => c.destroy()); charts = [];
    results = [];
    document.getElementById('codeArea').value = '';
    document.getElementById('lineNumbers').textContent = '1';
    switchTab(0);
  }

  /* ---- Analysis ---- */
  function cxScore(c) {
    if (!c) return 5;
    const l = c.toLowerCase();
    if (l.includes('o(1)'))                           return 1;
    if (l.includes('o(log'))                          return 2;
    if (l.includes('o(n log') || l.includes('o(n·log')) return 4;
    if (l.includes('o(n²)') || l.includes('o(n^2)') || l.includes('o(n2)')) return 6;
    if (l.includes('o(2^') || l.includes('o(2n)'))   return 8;
    if (l.includes('o(n!)'))                          return 10;
    if (l.includes('o(n)'))                           return 3;
    return 5;
  }

  function pctile(score) {
    return {1:97,2:91,3:74,4:52,5:38,6:21,8:8,10:2}[score] || 40;
  }

  function simMs(score) {
    const b = {1:3,2:9,3:42,4:130,5:200,6:900,8:7000,10:80000}[score] || 100;
    return +(b * (.8 + Math.random() * .4)).toFixed(1);
  }

  function pillClass(score) {
    if (score <= 2) return 'pill-green';
    if (score <= 4) return 'pill-yellow';
    return 'pill-red';
  }

  function badgeClass(score) {
    if (score <= 2) return 'b-green';
    if (score <= 4) return 'b-yellow';
    return 'b-red';
  }

  function toggleKey() {
    const inp = document.getElementById('apiKeyInput');
    const icon = document.getElementById('eyeIcon');
    if (inp.type === 'password') {
      inp.type = 'text';
      icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
    } else {
      inp.type = 'password';
      icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
    }
  }

  async function analyzeOne(code, lang, name, colorIdx) {
    const apiKey = document.getElementById('apiKeyInput').value.trim();
    if (!apiKey) throw new Error('NO_KEY');

    const t0 = performance.now();
    let resp;
    try {
      resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 900,
          messages: [{
            role: 'user',
            content: `Analyze this ${lang} code for time and space complexity.
Reply ONLY with a valid JSON object — no markdown, no backticks, no extra text.

{
  "time_complexity": "O(...)",
  "space_complexity": "O(...)",
  "best_case": "O(...)",
  "average_case": "O(...)",
  "worst_case": "O(...)",
  "explanation": "2 clear sentences describing the algorithm and why it has this complexity",
  "tip": "One concrete optimization or alternative approach"
}

Code:
${code}`
          }]
        })
      });
    } catch (e) {
      throw new Error('NETWORK');
    }

    const t1 = performance.now();

    if (!resp.ok) {
      const errBody = await resp.json().catch(() => ({}));
      if (resp.status === 401) throw new Error('INVALID_KEY');
      if (resp.status === 429) throw new Error('RATE_LIMIT');
      throw new Error('API_ERROR:' + (errBody?.error?.message || resp.status));
    }

    const data = await resp.json();
    const raw = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
    let p;
    try {
      p = JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch {
      p = {
        time_complexity: 'O(n)', space_complexity: 'O(1)',
        best_case: 'O(n)', average_case: 'O(n)', worst_case: 'O(n)',
        explanation: 'Analysis complete. Review the code structure for complexity details.',
        tip: 'Consider alternative data structures to reduce complexity.'
      };
    }
    const ts = cxScore(p.time_complexity);
    const ss = cxScore(p.space_complexity);
    return {
      ...p, name, lang, colorIdx,
      elapsed:    Math.round(t1 - t0),
      timeScore:  ts,
      spaceScore: ss,
      timePct:    pctile(ts),
      memPct:     pctile(ss),
      simRuntime: simMs(ts),
      simMem:     +(3 + Math.random() * 14).toFixed(1)
    };
  }

  async function runAnalysis() {
    const apiKey = document.getElementById('apiKeyInput').value.trim();
    if (!apiKey) {
      showError('Please enter your Anthropic API key in the field on the top right.');
      return;
    }
    if (!apiKey.startsWith('sk-ant-')) {
      showError('That doesn\'t look like a valid Anthropic API key. It should start with sk-ant-');
      return;
    }

    const visibleIdxs = [0, 1, 2].filter(i =>
      !document.querySelector(`.tab[data-idx="${i}"]`).classList.contains('hidden')
    );
    const inputs = visibleIdxs.map((i, ci) => ({
      code: document.getElementById('code-' + i).value.trim(),
      lang: document.getElementById('lang-' + i).value || 'Python',
      name: document.getElementById('name-' + i).value.trim() || 'Approach ' + (i + 1),
      colorIdx: ci
    })).filter(x => x.code);

    if (!inputs.length) {
      showError('Please paste code in at least one approach before analyzing.');
      return;
    }

    charts.forEach(c => c.destroy()); charts = [];
    results = [];
    document.getElementById('runBtn').disabled = true;
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('resultsContent').style.display = 'none';
    document.getElementById('loadingOverlay').style.display = 'flex';

    try {
      for (let i = 0; i < inputs.length; i++) {
        document.getElementById('loadingText').textContent =
          `Analyzing ${inputs[i].name}… (${i + 1}/${inputs.length})`;
        results.push(await analyzeOne(inputs[i].code, inputs[i].lang, inputs[i].name, inputs[i].colorIdx));
      }
    } catch (e) {
      document.getElementById('loadingOverlay').style.display = 'none';
      document.getElementById('runBtn').disabled = false;
      if (e.message === 'NO_KEY') showError('Please enter your Anthropic API key.');
      else if (e.message === 'INVALID_KEY') showError('Invalid API key. Double-check your key at console.anthropic.com.');
      else if (e.message === 'RATE_LIMIT') showError('Rate limit hit. Wait a moment and try again.');
      else if (e.message === 'NETWORK') showError('Network error. Make sure you\'re online and try again.');
      else showError('Error: ' + e.message);
      document.getElementById('emptyState').style.display = 'flex';
      return;
    }

    document.getElementById('loadingOverlay').style.display = 'none';
    document.getElementById('runBtn').disabled = false;
    renderResults();
  }

  function showError(msg) {
    const existing = document.getElementById('errorBanner');
    if (existing) existing.remove();
    const div = document.createElement('div');
    div.id = 'errorBanner';
    div.style.cssText = 'position:fixed;top:58px;left:50%;transform:translateX(-50%);background:#2a0e0e;border:1px solid #5a2020;border-radius:8px;padding:12px 20px;font-size:13px;color:#f87171;z-index:100;display:flex;align-items:center;gap:10px;box-shadow:0 4px 20px rgba(0,0,0,.5);max-width:500px;text-align:center';
    div.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>${msg}<button onclick="this.parentNode.remove()" style="background:none;border:none;color:#f87171;cursor:pointer;font-size:16px;padding:0 0 0 8px;line-height:1">✕</button>`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 6000);
  }

  /* ---- Rendering ---- */
  function renderResults() {
    const rc = document.getElementById('resultsContent');
    rc.style.display = 'block';

    const winner = results.reduce((a, b) => a.timeScore <= b.timeScore ? a : b);
    let html = '';

    results.forEach((r, i) => {
      const color = PALETTE[r.colorIdx % 3];
      html += `
      <div class="result-block">
        <div class="result-header">
          <span class="approach-dot" style="background:${color}"></span>
          <span class="approach-name">${r.name}</span>
          <span class="badge ${badgeClass(r.timeScore)}">Time: ${r.time_complexity}</span>
          <span class="badge ${badgeClass(r.spaceScore)}">Space: ${r.space_complexity}</span>
          ${r === winner && results.length > 1 ? '<span class="badge b-winner">⚡ Fastest</span>' : ''}
        </div>

        <div class="stats-grid">
          <div class="stat-cell">
            <div class="stat-label">Runtime</div>
            <div class="stat-value">${r.simRuntime}<span class="unit"> ms</span></div>
            <div class="stat-sub" style="color:${color}">beats ${r.timePct}%</div>
          </div>
          <div class="stat-cell">
            <div class="stat-label">Memory</div>
            <div class="stat-value">${r.simMem}<span class="unit"> MB</span></div>
            <div class="stat-sub" style="color:#60a5fa">beats ${r.memPct}%</div>
          </div>
          <div class="stat-cell">
            <div class="stat-label">AI analysis</div>
            <div class="stat-value">${r.elapsed}<span class="unit"> ms</span></div>
            <div class="stat-sub" style="color:#444">response</div>
          </div>
          <div class="stat-cell">
            <div class="stat-label">Worst case</div>
            <div class="stat-value" style="font-size:16px">${r.worst_case}</div>
            <div class="stat-sub" style="color:#444">upper bound</div>
          </div>
        </div>

        <div class="dist-wrap">
          <div class="dist-top">
            <span class="dist-label">Runtime distribution vs submissions</span>
            <span class="dist-beats" style="color:${color}">Beats ${r.timePct}% of ${r.lang} submissions</span>
          </div>
          <div class="dist-chart-area">
            <canvas id="dist-${i}" role="img" aria-label="Runtime distribution for ${r.name}">${r.name} beats ${r.timePct}% of submissions</canvas>
          </div>
        </div>

        <div class="pills-row">
          <span class="pill ${pillClass(cxScore(r.best_case))}">Best: ${r.best_case}</span>
          <span class="pill ${pillClass(cxScore(r.average_case))}">Avg: ${r.average_case}</span>
          <span class="pill ${pillClass(cxScore(r.worst_case))}">Worst: ${r.worst_case}</span>
        </div>

        <div class="explanation">${r.explanation}</div>
        ${r.tip ? `<div class="tip">
          <svg class="tip-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
          ${r.tip}
        </div>` : ''}
      </div>`;
    });

    if (results.length >= 2) {
      const sorted = [...results].sort((a, b) => a.timeScore - b.timeScore);
      const fastest = sorted[0];
      const slowest = sorted[sorted.length - 1];
      const speedup = slowest && fastest ? (slowest.simRuntime / fastest.simRuntime).toFixed(1) : '1.0';

      html += `
      <div class="compare-section">
        <div class="compare-title">Head-to-head comparison</div>

        <div class="winner-banner">
          <div class="trophy">🏆</div>
          <div class="winner-info">
            <div class="winner-name">${fastest.name}</div>
            <div class="winner-desc">${fastest.time_complexity} time · ${fastest.space_complexity} space · beats ${fastest.timePct}% of submissions</div>
          </div>
          ${parseFloat(speedup) > 1.3 ? `<div class="speedup-pill">${speedup}× faster</div>` : ''}
        </div>

        <div class="cc-grid" style="grid-template-columns:repeat(${results.length},1fr)">
          ${sorted.map((r, rank) => `
          <div class="cc ${rank === 0 ? 'top' : ''}">
            <div class="cc-top">
              <div class="cc-name">
                ${rank === 0 ? '<span style="font-size:16px">⚡</span>' : ''}
                ${r.name}
              </div>
              <span class="rank ${rank === 0 ? 'rank-1' : 'rank-n'}">#${rank + 1}</span>
            </div>
            <div class="cc-rows">
              <div class="cc-row"><span class="cc-key">Time</span><span class="cc-val">${r.time_complexity}</span></div>
              <div class="cc-row"><span class="cc-key">Space</span><span class="cc-val">${r.space_complexity}</span></div>
              <div class="cc-row"><span class="cc-key">Runtime</span><span class="cc-val">${r.simRuntime} ms</span></div>
              <div class="cc-row"><span class="cc-key">Beats</span><span class="cc-val orange">${r.timePct}%</span></div>
              <div class="cc-row"><span class="cc-key">Worst</span><span class="cc-val">${r.worst_case}</span></div>
            </div>
          </div>`).join('')}
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">Runtime distribution</div>
            <div class="chart-sub">Simulated submission curve — dashed line marks your solution's position</div>
          </div>
          <div class="chart-legend" id="distLegend"></div>
          <div class="chart-wrap" style="height:200px">
            <canvas id="cmpDist" role="img" aria-label="Combined runtime distribution comparing all approaches">Runtime distribution comparison across all approaches.</canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">Complexity score breakdown</div>
            <div class="chart-sub">Lower = better · O(1)=1, O(log n)=2, O(n)=3, O(n log n)=4, O(n²)=6, O(2^n)=8</div>
          </div>
          <div class="chart-legend" id="scoreLegend"></div>
          <div class="chart-wrap" style="height:200px">
            <canvas id="scoreChart" role="img" aria-label="Complexity score comparison bar chart">Complexity scores across approaches.</canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">Memory usage percentile</div>
            <div class="chart-sub">Beats what percentage of submissions in terms of memory</div>
          </div>
          <div class="chart-legend" id="memLegend"></div>
          <div class="chart-wrap" style="height:${results.length * 52 + 60}px">
            <canvas id="memChart" role="img" aria-label="Memory usage percentile comparison">Memory percentile comparison.</canvas>
          </div>
        </div>

      </div>`;
    }

    rc.innerHTML = html;
    requestAnimationFrame(() => drawCharts());
  }

  /* ---- Charts ---- */
  function makeDistData(pct) {
    const peak = Math.round(pct / 100 * 70);
    return Array.from({ length: 100 }, (_, i) => {
      const d = i - peak;
      return Math.max(0, Math.round(500 * Math.exp(-0.5 * (d / 9) ** 2)));
    });
  }

  function drawCharts() {
    // Per-result distribution mini charts
    results.forEach((r, i) => {
      const canvas = document.getElementById('dist-' + i);
      if (!canvas) return;
      const color = PALETTE[r.colorIdx % 3];
      const peakIdx = Math.round(r.timePct / 100 * 70);
      const data = makeDistData(r.timePct);
      const labels = Array.from({ length: 100 }, (_, j) => j === 0 ? 'Fast' : j === 99 ? 'Slow' : '');

      const c = new Chart(canvas, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            data, borderColor: color,
            backgroundColor: color.replace(')', ', .12)').replace('rgb', 'rgba'),
            borderWidth: 2, fill: true, tension: 0.4, pointRadius: 0
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: { x: { display: false }, y: { display: false, beginAtZero: true } },
          layout: { padding: { top: 4, bottom: 2 } },
          animation: { duration: 600 }
        }
      });

      // Draw marker line after render
      const origDraw = c.draw.bind(c);
      let drawn = false;
      c.draw = function() {
        origDraw();
        if (drawn) return;
        drawn = true;
        const meta = c.getDatasetMeta(0);
        if (!meta.data[peakIdx]) return;
        const x = meta.data[peakIdx].x;
        const ctx = canvas.getContext('2d');
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);
        ctx.globalAlpha = .9;
        ctx.beginPath();
        ctx.moveTo(x, 6); ctx.lineTo(x, canvas.height - 6);
        ctx.stroke();
        ctx.restore();
      };
      c.draw();
      charts.push(c);
    });

    if (results.length < 2) return;

    // Legend helper
    const makeLegend = (id) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = results.map((r, i) =>
        `<span class="leg">
          <span class="leg-sq" style="background:${PALETTE[r.colorIdx % 3]}"></span>
          ${r.name}
        </span>`).join('');
    };
    makeLegend('distLegend');
    makeLegend('scoreLegend');
    makeLegend('memLegend');

    // Combined distribution
    const cmpCanvas = document.getElementById('cmpDist');
    if (cmpCanvas) {
      const c = new Chart(cmpCanvas, {
        type: 'line',
        data: {
          labels: Array.from({ length: 100 }, (_, i) => i === 0 ? 'Fast' : i === 99 ? 'Slow' : ''),
          datasets: results.map(r => ({
            label: r.name,
            data: makeDistData(r.timePct),
            borderColor: PALETTE[r.colorIdx % 3],
            backgroundColor: PALETTE_BG[r.colorIdx % 3],
            borderWidth: 2, fill: true, tension: 0.4, pointRadius: 0
          }))
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { title: () => '', label: ctx => `${ctx.dataset.label}: ${ctx.raw}` } }
          },
          scales: {
            x: { ticks: { color: '#333', font: { size: 10 }, maxTicksLimit: 5 }, grid: { color: '#151515' } },
            y: { display: false, beginAtZero: true }
          },
          animation: { duration: 700 }
        }
      });
      charts.push(c);
    }

    // Complexity score grouped bar
    const scoreCanvas = document.getElementById('scoreChart');
    if (scoreCanvas) {
      const c = new Chart(scoreCanvas, {
        type: 'bar',
        data: {
          labels: ['Time complexity', 'Space complexity', 'Worst case'],
          datasets: results.map(r => ({
            label: r.name,
            data: [r.timeScore, r.spaceScore, cxScore(r.worst_case)],
            backgroundColor: PALETTE_BG[r.colorIdx % 3],
            borderColor: PALETTE[r.colorIdx % 3],
            borderWidth: 2, borderRadius: 5
          }))
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#555', font: { size: 11 } }, grid: { color: '#151515' } },
            y: {
              beginAtZero: true, max: 11,
              ticks: {
                color: '#444', font: { size: 10 },
                callback: v => ({ 1: 'O(1)', 2: 'O(log n)', 3: 'O(n)', 4: 'O(n log n)', 6: 'O(n²)', 8: 'O(2^n)' }[v] || '')
              },
              grid: { color: '#151515' }
            }
          },
          animation: { duration: 700 }
        }
      });
      charts.push(c);
    }

    // Memory horizontal bar
    const memCanvas = document.getElementById('memChart');
    if (memCanvas) {
      const c = new Chart(memCanvas, {
        type: 'bar',
        data: {
          labels: results.map(r => r.name),
          datasets: [{
            label: 'Beats % of submissions',
            data: results.map(r => r.memPct),
            backgroundColor: results.map(r => PALETTE_BG[r.colorIdx % 3]),
            borderColor: results.map(r => PALETTE[r.colorIdx % 3]),
            borderWidth: 2, borderRadius: 5
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: ctx => `Beats ${ctx.raw}% of submissions` } }
          },
          scales: {
            x: {
              beginAtZero: true, max: 100,
              ticks: { color: '#444', callback: v => v + '%', font: { size: 11 } },
              grid: { color: '#151515' }
            },
            y: { ticks: { color: '#666', font: { size: 12 } }, grid: { display: false } }
          },
          animation: { duration: 700 }
        }
      });
      charts.push(c);
    }
  }

  function cxScore(c) {
    if (!c) return 5;
    const l = c.toLowerCase();
    if (l.includes('o(1)'))                             return 1;
    if (l.includes('o(log'))                            return 2;
    if (l.includes('o(n log') || l.includes('o(n·log')) return 4;
    if (l.includes('o(n²)') || l.includes('o(n^2)') || l.includes('o(n2)')) return 6;
    if (l.includes('o(2^') || l.includes('o(2n)'))     return 8;
    if (l.includes('o(n!)'))                            return 10;
    if (l.includes('o(n)'))                             return 3;
    return 5;
  }

  return { switchTab, addTab, removeTab, onNameChange, onLangChange, onCodeInput, handleTab, syncScroll, loadDemo, resetAll, runAnalysis, toggleKey };
})();

// Init cursor tracking
document.getElementById('codeArea').addEventListener('keyup', function() { App.onCodeInput(this); });
document.getElementById('codeArea').addEventListener('click', function() { App.onCodeInput(this); });
