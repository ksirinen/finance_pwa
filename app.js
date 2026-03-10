(() => {
  const PIN_HASH_KEY = "fin_pin_hash_v1";
  const DATA_KEY = "fin_data_v1";

  const COLORS = ["#22c55e","#38bdf8","#f59e0b","#ef4444","#a855f7","#14b8a6","#f97316","#eab308"];

  const lockScreen = document.getElementById("lock-screen");
  const mainScreen = document.getElementById("main-screen");
  const bottomNav = document.getElementById("bottom-nav");
  const setupBlock = document.getElementById("setup-block");
  const unlockBlock = document.getElementById("unlock-block");
  const authMessage = document.getElementById("auth-message");

  const setupPinInput = document.getElementById("setup-pin");
  const setupPinConfirmInput = document.getElementById("setup-pin-confirm");
  const unlockPinInput = document.getElementById("unlock-pin");

  const setupBtn = document.getElementById("setup-pin-btn");
  const unlockBtn = document.getElementById("unlock-btn");
  const resetBtn = document.getElementById("reset-btn");
  const lockBtn = document.getElementById("lock-btn");

  const typeInput = document.getElementById("type-input");
  const accountInput = document.getElementById("account-input");
  const categoryInput = document.getElementById("category-input");
  const amountInput = document.getElementById("amount-input");
  const dateInput = document.getElementById("date-input");
  const noteInput = document.getElementById("note-input");
  const addOperationBtn = document.getElementById("add-operation-btn");
  const openTransferBtn = document.getElementById("open-transfer-btn");
  const exportBtn = document.getElementById("export-btn");

  const kaspiBalance = document.getElementById("kaspi-balance");
  const freedomBalance = document.getElementById("freedom-balance");
  const cryptoBalance = document.getElementById("crypto-balance");
  const depositBalance = document.getElementById("deposit-balance");
  const allAssets = document.getElementById("all-assets");
  const totalBalance = document.getElementById("total-balance");
  const weekExpense = document.getElementById("week-expense");
  const monthExpense = document.getElementById("month-expense");
  const monthIncome = document.getElementById("month-income");
  const opsCount = document.getElementById("ops-count");
  const lastOperationLabel = document.getElementById("last-operation-label");
  const lastOperationAmount = document.getElementById("last-operation-amount");

  const assetsTotalBalance = document.getElementById("assets-total-balance");
  const assetsAllAssets = document.getElementById("assets-all-assets");
  const assetsDeposit = document.getElementById("assets-deposit");
  const assetsCrypto = document.getElementById("assets-crypto");
  const assetsBreakdown = document.getElementById("assets-breakdown");

  const analyticsWeekExpense = document.getElementById("analytics-week-expense");
  const analyticsMonthExpense = document.getElementById("analytics-month-expense");
  const analyticsMonthIncome = document.getElementById("analytics-month-income");

  const recentList = document.getElementById("recent-list");
  const donutSegments = document.getElementById("donut-segments");
  const donutTotal = document.getElementById("donut-total");
  const chartLegend = document.getElementById("chart-legend");

  const operationModal = document.getElementById("operation-modal");
  const editTypeInput = document.getElementById("edit-type-input");
  const editAccountInput = document.getElementById("edit-account-input");
  const editCategoryInput = document.getElementById("edit-category-input");
  const editAmountInput = document.getElementById("edit-amount-input");
  const editDateInput = document.getElementById("edit-date-input");
  const editNoteInput = document.getElementById("edit-note-input");
  const saveEditBtn = document.getElementById("save-edit-btn");
  const deleteEditBtn = document.getElementById("delete-edit-btn");
  const closeEditBtn = document.getElementById("close-edit-btn");

  const transferModal = document.getElementById("transfer-modal");
  const transferFromInput = document.getElementById("transfer-from-input");
  const transferToInput = document.getElementById("transfer-to-input");
  const transferAmountInput = document.getElementById("transfer-amount-input");
  const transferDateInput = document.getElementById("transfer-date-input");
  const transferNoteInput = document.getElementById("transfer-note-input");
  const saveTransferBtn = document.getElementById("save-transfer-btn");
  const closeTransferBtn = document.getElementById("close-transfer-btn");

  const state = {
    operations: [],
    currentScreen: "home",
    editingOperationId: null
  };

  function todayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  if (dateInput) dateInput.value = todayISO();
  if (transferDateInput) transferDateInput.value = todayISO();

  function showMessage(text, ok = false) {
    authMessage.textContent = text;
    authMessage.style.color = ok ? "#86efac" : "#fca5a5";
  }

  function hasPin() {
    return !!localStorage.getItem(PIN_HASH_KEY);
  }

  function showSetup() {
    setupBlock.classList.remove("hidden");
    unlockBlock.classList.add("hidden");
    lockScreen.classList.remove("hidden");
    mainScreen.classList.add("hidden");
    bottomNav.classList.add("hidden");
    showMessage("");
  }

  function showUnlock() {
    setupBlock.classList.add("hidden");
    unlockBlock.classList.remove("hidden");
    lockScreen.classList.remove("hidden");
    mainScreen.classList.add("hidden");
    bottomNav.classList.add("hidden");
    showMessage("");
  }

  function showMain() {
    lockScreen.classList.add("hidden");
    mainScreen.classList.remove("hidden");
    bottomNav.classList.remove("hidden");
    switchScreen(state.currentScreen || "home");
    render();
  }

  function switchScreen(name) {
    state.currentScreen = name;
    document.querySelectorAll(".screen").forEach(el => el.classList.remove("active"));
    const target = document.getElementById(`screen-${name}`);
    if (target) target.classList.add("active");

    document.querySelectorAll(".nav-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.screen === name);
    });
  }

  function openEditModal(id) {
    const op = state.operations.find(x => x.id === id);
    if (!op) return;

    state.editingOperationId = id;
    editTypeInput.value = op.type;
    editAccountInput.value = op.account;
    editCategoryInput.value = op.category;
    editAmountInput.value = op.amount;
    editDateInput.value = op.date;
    editNoteInput.value = op.note || "";

    operationModal.classList.remove("hidden");
  }

  function closeEditModal() {
    state.editingOperationId = null;
    operationModal.classList.add("hidden");
  }

  function openTransferModal() {
    transferFromInput.value = "Kaspi";
    transferToInput.value = "Freedom";
    transferAmountInput.value = "";
    transferDateInput.value = todayISO();
    transferNoteInput.value = "";
    transferModal.classList.remove("hidden");
  }

  function closeTransferModal() {
    transferModal.classList.add("hidden");
  }

  async function sha256(text) {
    const data = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }

  function saveData() {
    localStorage.setItem(DATA_KEY, JSON.stringify(state));
  }

  function loadData() {
    try {
      const raw = localStorage.getItem(DATA_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.operations)) state.operations = parsed.operations;
      if (parsed && parsed.currentScreen) state.currentScreen = parsed.currentScreen;
    } catch (_) {}
  }

  async function createPin() {
    const pin = (setupPinInput.value || "").trim();
    const confirm = (setupPinConfirmInput.value || "").trim();

    if (!/^\d{4,6}$/.test(pin)) {
      showMessage("PIN должен быть из 4–6 цифр");
      return;
    }
    if (pin !== confirm) {
      showMessage("PIN не совпадает");
      return;
    }

    const hash = await sha256(pin);
    localStorage.setItem(PIN_HASH_KEY, hash);
    if (!localStorage.getItem(DATA_KEY)) saveData();
    showMain();
  }

  async function unlock() {
    const pin = (unlockPinInput.value || "").trim();
    const savedHash = localStorage.getItem(PIN_HASH_KEY);

    if (!savedHash) {
      showSetup();
      return;
    }

    const hash = await sha256(pin);
    if (hash !== savedHash) {
      showMessage("Неверный PIN");
      return;
    }

    loadData();
    showMain();
  }

  function resetApp() {
    localStorage.clear();
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        regs.forEach(r => r.unregister());
      }).finally(() => {
        location.reload();
      });
      return;
    }
    location.reload();
  }

  function formatNumber(v) {
    return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(Number(v || 0));
  }

  function moneyLabel(account) {
    return account === "Crypto" ? "USDT" : "KZT";
  }

  function toTs(dateString) {
    return new Date(`${dateString}T12:00:00`).getTime();
  }

  function sortedOperations() {
    return [...state.operations].sort((a, b) => {
      const dateDiff = toTs(b.date) - toTs(a.date);
      if (dateDiff !== 0) return dateDiff;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }

  function monthOps() {
    const now = new Date();
    return state.operations.filter(op => {
      const d = new Date(`${op.date}T12:00:00`);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
  }

  function weekOps() {
    const limit = Date.now() - 6 * 24 * 60 * 60 * 1000;
    return state.operations.filter(op => toTs(op.date) >= limit);
  }

  function balances() {
    const out = { Kaspi: 0, Freedom: 0, Crypto: 0, Deposit: 0 };
    for (const op of state.operations) {
      const amount = Number(op.amount || 0);
      if (op.type === "income") out[op.account] += amount;
      if (op.type === "expense") out[op.account] -= amount;
      if (op.type === "adjustment") out[op.account] += amount;
    }
    return out;
  }

  function expenseBreakdown() {
    const map = {};
    for (const op of monthOps()) {
      if (op.type !== "expense") continue;
      if (op.category === "Корректировка") continue;
      if (op.category === "Перевод") continue;
      map[op.category] = (map[op.category] || 0) + Number(op.amount || 0);
    }
    return map;
  }

  function polarToCartesian(cx, cy, r, angleDeg) {
    const angleRad = (angleDeg - 90) * Math.PI / 180.0;
    return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
  }

  function describeArc(cx, cy, r, startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  }

  function renderDonut() {
    donutSegments.innerHTML = "";
    chartLegend.innerHTML = "";

    const breakdown = expenseBreakdown();
    const entries = Object.entries(breakdown).sort((a,b) => b[1] - a[1]);
    const total = entries.reduce((s,[,v]) => s + v, 0);
    donutTotal.textContent = formatNumber(total);

    if (!entries.length) {
      chartLegend.innerHTML = '<div class="muted">Пока нет расходов за месяц</div>';
      return;
    }

    let angle = 0;
    entries.forEach(([category, value], index) => {
      const percent = value / total;
      const sweep = percent * 360;
      const color = COLORS[index % COLORS.length];

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", describeArc(110,110,70,angle,angle + sweep));
      path.setAttribute("class", "seg");
      path.setAttribute("stroke", color);
      donutSegments.appendChild(path);

      const row = document.createElement("div");
      row.className = "legend-row";
      row.innerHTML = `
        <div class="dot" style="background:${color}"></div>
        <div>${category}</div>
        <div>${Math.round(percent * 100)}% · ${formatNumber(value)}</div>
      `;
      chartLegend.appendChild(row);

      angle += sweep;
    });
  }

  function operationTitle(op) {
    if (op.type === "adjustment") return "Корректировка";
    if (op.transferId) return op.type === "expense" ? "Перевод исходящий" : "Перевод входящий";
    return op.type === "income" ? "Доход" : "Расход";
  }

  function renderRecent() {
    recentList.innerHTML = "";
    const recent = sortedOperations().slice(0, 5);

    if (!recent.length) {
      recentList.innerHTML = '<div class="muted">Последних операций пока нет</div>';
      return;
    }

    for (const op of recent) {
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <div class="date">${op.date}</div>
        <div><strong>${operationTitle(op)}</strong> · ${op.account}</div>
        <div>${op.category} · ${formatNumber(op.amount)} ${moneyLabel(op.account)}</div>
        <div class="muted" style="margin-top:6px;">${op.note || "Без комментария"}</div>
        <div class="recent-actions">
          <button class="small-btn blue" data-edit-id="${op.id}">Редактировать</button>
          <button class="small-btn danger" data-delete-id="${op.id}">Удалить</button>
        </div>
      `;
      recentList.appendChild(div);
    }

    recentList.querySelectorAll("[data-edit-id]").forEach(btn => {
      btn.addEventListener("click", () => openEditModal(btn.dataset.editId));
    });

    recentList.querySelectorAll("[data-delete-id]").forEach(btn => {
      btn.addEventListener("click", () => deleteOperation(btn.dataset.deleteId));
    });
  }

  function renderAssetsBlock() {
    const b = balances();
    const totalBalanceValue = b.Kaspi + b.Freedom + b.Crypto;
    const allAssetsValue = totalBalanceValue + b.Deposit;

    assetsTotalBalance.textContent = formatNumber(totalBalanceValue);
    assetsAllAssets.textContent = formatNumber(allAssetsValue);
    assetsDeposit.textContent = formatNumber(b.Deposit);
    assetsCrypto.textContent = formatNumber(b.Crypto);

    assetsBreakdown.innerHTML = "";
    const rows = [
      ["Kaspi", b.Kaspi],
      ["Freedom", b.Freedom],
      ["Crypto", b.Crypto],
      ["Deposit", b.Deposit]
    ];

    rows.forEach(([name, value]) => {
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <div><strong>${name}</strong></div>
        <div class="muted" style="margin-top:6px;">${formatNumber(value)} ${name === "Crypto" ? "USDT" : "KZT"}</div>
      `;
      assetsBreakdown.appendChild(div);
    });
  }

  function renderLastOperation() {
    const sorted = sortedOperations();
    const last = sorted[0];

    if (!last) {
      lastOperationLabel.textContent = "—";
      lastOperationAmount.textContent = "—";
      return;
    }

    lastOperationLabel.textContent = `${operationTitle(last)} · ${last.account}`;
    lastOperationAmount.textContent = `${formatNumber(last.amount)} ${moneyLabel(last.account)}`;
  }

  function render() {
    const b = balances();

    const monthExpenseTotal = monthOps()
      .filter(op => op.type === "expense" && !op.transferId)
      .reduce((s, op) => s + Number(op.amount || 0), 0);

    const monthIncomeTotal = monthOps()
      .filter(op => op.type === "income" && !op.transferId)
      .reduce((s, op) => s + Number(op.amount || 0), 0);

    const weekExpenseTotal = weekOps()
      .filter(op => op.type === "expense" && !op.transferId)
      .reduce((s, op) => s + Number(op.amount || 0), 0);

    const totalBalanceValue = b.Kaspi + b.Freedom + b.Crypto;
    const allAssetsValue = totalBalanceValue + b.Deposit;

    kaspiBalance.textContent = formatNumber(b.Kaspi);
    freedomBalance.textContent = formatNumber(b.Freedom);
    cryptoBalance.textContent = formatNumber(b.Crypto);
    depositBalance.textContent = formatNumber(b.Deposit);
    totalBalance.textContent = formatNumber(totalBalanceValue);
    allAssets.textContent = formatNumber(allAssetsValue);
    weekExpense.textContent = formatNumber(weekExpenseTotal);
    monthExpense.textContent = formatNumber(monthExpenseTotal);
    monthIncome.textContent = formatNumber(monthIncomeTotal);
    opsCount.textContent = String(state.operations.length);

    analyticsWeekExpense.textContent = formatNumber(weekExpenseTotal);
    analyticsMonthExpense.textContent = formatNumber(monthExpenseTotal);
    analyticsMonthIncome.textContent = formatNumber(monthIncomeTotal);

    renderLastOperation();
    renderDonut();
    renderAssetsBlock();
    renderRecent();
  }

  function addOperation() {
    const type = typeInput.value;
    const account = accountInput.value;
    const category = categoryInput.value;
    const amount = Number(amountInput.value || 0);
    const date = dateInput.value || todayISO();
    const note = (noteInput.value || "").trim();

    if (!amount || amount <= 0) {
      alert("Введи сумму больше нуля");
      return;
    }

    state.operations.push({
      id: crypto.randomUUID(),
      type,
      account,
      category,
      amount,
      date,
      note,
      createdAt: Date.now()
    });

    saveData();
    render();

    amountInput.value = "";
    noteInput.value = "";
    dateInput.value = todayISO();
  }

  function addTransfer() {
    const from = transferFromInput.value;
    const to = transferToInput.value;
    const amount = Number(transferAmountInput.value || 0);
    const date = transferDateInput.value || todayISO();
    const note = (transferNoteInput.value || "").trim();
    const transferId = crypto.randomUUID();

    if (from === to) {
      alert("Счет отправки и счет получения не должны совпадать");
      return;
    }

    if (!amount || amount <= 0) {
      alert("Введи сумму больше нуля");
      return;
    }

    state.operations.push({
      id: crypto.randomUUID(),
      transferId,
      type: "expense",
      account: from,
      category: "Перевод",
      amount,
      date,
      note: note || `Перевод на ${to}`,
      createdAt: Date.now()
    });

    state.operations.push({
      id: crypto.randomUUID(),
      transferId,
      type: "income",
      account: to,
      category: "Перевод",
      amount,
      date,
      note: note || `Перевод с ${from}`,
      createdAt: Date.now() + 1
    });

    saveData();
    render();
    closeTransferModal();
  }

  function adjustAccount(account) {
    const current = balances()[account] || 0;
    const label = moneyLabel(account);
    const raw = prompt(`Текущий баланс ${account}: ${formatNumber(current)} ${label}\nВведи новое значение:`);

    if (raw === null) return;

    const target = Number(String(raw).replace(",", "."));
    if (Number.isNaN(target)) {
      alert("Введено не число");
      return;
    }

    const delta = target - current;
    if (delta === 0) return;

    state.operations.push({
      id: crypto.randomUUID(),
      type: "adjustment",
      account,
      category: "Корректировка",
      amount: delta,
      date: todayISO(),
      note: `Баланс изменен вручную до ${target}`,
      createdAt: Date.now()
    });

    saveData();
    render();
  }

  function deleteOperation(id) {
    const op = state.operations.find(x => x.id === id);
    if (!op) return;

    let idsToDelete = [id];
    if (op.transferId) {
      idsToDelete = state.operations.filter(x => x.transferId === op.transferId).map(x => x.id);
    }

    const ok = confirm(`Удалить операцию?\n${operationTitle(op)} · ${op.account} · ${formatNumber(op.amount)} ${moneyLabel(op.account)}`);
    if (!ok) return;

    state.operations = state.operations.filter(x => !idsToDelete.includes(x.id));
    saveData();
    render();
    if (state.editingOperationId === id) closeEditModal();
  }

  function saveEditedOperation() {
    const id = state.editingOperationId;
    const op = state.operations.find(x => x.id === id);
    if (!op) return;

    const newType = editTypeInput.value;
    const newAccount = editAccountInput.value;
    const newCategory = (editCategoryInput.value || "").trim() || "Другое";
    const newAmount = Number(editAmountInput.value || 0);
    const newDate = (editDateInput.value || "").trim();
    const newNote = (editNoteInput.value || "").trim();

    if (!["income", "expense", "adjustment"].includes(newType)) {
      alert("Неверный тип");
      return;
    }

    if (!["Kaspi", "Freedom", "Crypto", "Deposit"].includes(newAccount)) {
      alert("Неверный счет");
      return;
    }

    if (!newAmount || Number.isNaN(newAmount) || newAmount <= 0) {
      alert("Сумма должна быть больше нуля");
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      alert("Дата должна быть в формате YYYY-MM-DD");
      return;
    }

    op.type = newType;
    op.account = newAccount;
    op.category = newCategory;
    op.amount = newAmount;
    op.date = newDate;
    op.note = newNote;

    saveData();
    render();
    closeEditModal();
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "fin-backup.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  setupBtn.addEventListener("click", createPin);
  unlockBtn.addEventListener("click", unlock);
  resetBtn.addEventListener("click", resetApp);
  lockBtn.addEventListener("click", () => {
    unlockPinInput.value = "";
    showUnlock();
  });

  addOperationBtn.addEventListener("click", addOperation);
  openTransferBtn.addEventListener("click", openTransferModal);
  exportBtn.addEventListener("click", exportData);

  saveEditBtn.addEventListener("click", saveEditedOperation);
  deleteEditBtn.addEventListener("click", () => {
    if (state.editingOperationId) deleteOperation(state.editingOperationId);
  });
  closeEditBtn.addEventListener("click", closeEditModal);

  saveTransferBtn.addEventListener("click", addTransfer);
  closeTransferBtn.addEventListener("click", closeTransferModal);

  operationModal.addEventListener("click", (e) => {
    if (e.target === operationModal) closeEditModal();
  });

  transferModal.addEventListener("click", (e) => {
    if (e.target === transferModal) closeTransferModal();
  });

  document.querySelectorAll("[data-account-adjust]").forEach(btn => {
    btn.addEventListener("click", () => adjustAccount(btn.dataset.accountAdjust));
  });

  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      switchScreen(btn.dataset.screen);
      saveData();
    });
  });

  if (hasPin()) {
    loadData();
    showUnlock();
  } else {
    showSetup();
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch(console.error);
    });
  }
})();
