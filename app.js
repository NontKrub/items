const DEVICES = ["วอ-01","วอ-02","วอ-03","วอ-04","วอ-05","วอ-06","วอ-07","วอ-08"];

function loadData() {
  return JSON.parse(localStorage.getItem("walkie_data") || "{}");
}
function saveData(d) {
  localStorage.setItem("walkie_data", JSON.stringify(d));
}
function loadHistory() {
  return JSON.parse(localStorage.getItem("walkie_history") || "[]");
}
function saveHistory(h) {
  localStorage.setItem("walkie_history", JSON.stringify(h));
}

function renderSelect() {
  const data = loadData();
  const sel = document.getElementById("deviceSelect");
  sel.innerHTML = "";
  DEVICES.forEach(d => {
    if (!data[d] || data[d].status === "ว่าง") {
      const opt = document.createElement("option");
      opt.value = d; opt.textContent = d;
      sel.appendChild(opt);
    }
  });
}

function renderTable() {
  const data = loadData();
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";
  DEVICES.forEach(id => {
    const info = data[id];
    const status = info ? info.status : "ว่าง";
    const isOverdue = info && info.dueDate && new Date(info.dueDate) < new Date() && status === "ถูกยืม";
    const row = `<tr class="${isOverdue ? 'overdue' : ''}">
      <td>${id}</td>
      <td>${info ? info.borrower : "-"}</td>
      <td>${info ? info.borrowDate : "-"}</td>
      <td>${info ? info.dueDate : "-"}</td>
      <td><span class="badge ${status === 'ว่าง' ? 'available' : 'borrowed'}">${isOverdue ? '⚠️ เกินกำหนด' : status}</span></td>
      <td>${status === "ถูกยืม" ? `<button onclick="returnDevice('${id}')">📥 คืน</button>` : "-"}</td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

function renderHistory() {
  const history = loadHistory();
  const tbody = document.getElementById("historyBody");
  tbody.innerHTML = [...history].reverse().map(h =>
    `<tr><td>${h.device}</td><td>${h.borrower}</td><td>${h.borrowDate}</td><td>${h.returnDate}</td></tr>`
  ).join("");
}

function borrowDevice() {
  const borrower = document.getElementById("borrower").value.trim();
  const device = document.getElementById("deviceSelect").value;
  const dueDate = document.getElementById("dueDate").value;
  if (!borrower) return alert("กรุณากรอกชื่อผู้ยืม");
  if (!device) return alert("ไม่มีอุปกรณ์ว่าง");
  if (!dueDate) return alert("กรุณาระบุวันที่คืน");
  const data = loadData();
  data[device] = {
    borrower, status: "ถูกยืม",
    borrowDate: new Date().toLocaleDateString("th-TH"),
    dueDate
  };
  saveData(data);
  document.getElementById("borrower").value = "";
  refresh();
}

function returnDevice(device) {
  const data = loadData();
  const info = data[device];
  if (!info) return;
  const history = loadHistory();
  history.push({
    device, borrower: info.borrower,
    borrowDate: info.borrowDate,
    returnDate: new Date().toLocaleDateString("th-TH")
  });
  saveHistory(history);
  delete data[device];
  saveData(data);
  refresh();
}

function clearHistory() {
  if (confirm("ล้างประวัติทั้งหมด?")) {
    localStorage.removeItem("walkie_history");
    renderHistory();
  }
}

function refresh() {
  renderSelect();
  renderTable();
  renderHistory();
}

refresh();
