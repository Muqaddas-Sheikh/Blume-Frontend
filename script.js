// ═══════════════════════════════════════
//  BLUME RESTAURANT — MAIN SCRIPT
// ═══════════════════════════════════════

// ================= MENU RENDER =================
async function renderMenu(f = "all") {
  try {
    const res  = await fetch(`${API_BASE}/api/menu`);
    const data = await res.json();
    const items = f === "all" ? data : data.filter(i => i.cat === f);
    const g     = document.getElementById("mgrid");
    if (!g) return;
    g.innerHTML = items.map(m => `
      <div class="mcard" onclick="openItem('${m._id}')" style="cursor:pointer">
        <img class="mcard-img" src="${m.img}" alt="${m.name}" loading="lazy"/>
        <div class="mcard-body">
          <div class="mcard-tag">${m.tag}</div>
          <h3>${m.name}</h3>
          <p>${m.desc}</p>
          <div class="mcard-foot">
            <div class="mprice">$${m.price}</div>
            <div class="morder" onclick="event.stopPropagation(); quickAdd('${m._id}', '${m.name}')">
              Add to Order
            </div>
          </div>
        </div>
      </div>
    `).join("");
  } catch (err) {
    console.log("Menu load error:", err);
  }
}

// ================= OPEN ITEM PAGE =================
function openItem(id) {
  window.location = `Item.html?id=${id}`;
}

// ================= QUICK ADD CART =================
function quickAdd(id, name) {
  Cart.add(id, 1);
  showToast((name || "Item") + " added!");
}

// ================= TOAST =================
function showToast(msg) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    t.id = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 2500);
}

// ================= FILTER MENU =================
function fMenu(cat, btn) {
  document.querySelectorAll(".mtab").forEach(t => t.classList.remove("active"));
  btn.classList.add("active");
  renderMenu(cat);
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  renderMenu("all");
  if (typeof Auth !== "undefined") Auth.updateNav();
  if (typeof Cart !== "undefined") Cart.updateBadge();

  // ✅ Hamburger
  const hbg     = document.getElementById("hbg");
  const mob     = document.getElementById("mobMenu");
  const overlay = document.getElementById("mobOverlay");

  if (hbg && mob) {
    hbg.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = mob.classList.toggle("open");
      hbg.classList.toggle("open");
      if (overlay) overlay.classList.toggle("open");
      // ✅ FIX: body scroll band karo jab menu open ho
      document.body.classList.toggle("menu-open", isOpen);
    });
  }

  if (overlay) {
    overlay.addEventListener("click", () => cMob());
  }

  // Auth nav update
  const user = typeof Auth !== "undefined" ? Auth.get() : null;
  const mobAuthLink    = document.getElementById("mob-auth-link");
  const mobProfileLink = document.getElementById("mob-profile-link");
  if (user) {
    if (mobAuthLink)    mobAuthLink.style.display    = "none";
    if (mobProfileLink) mobProfileLink.style.display = "";
  }
});

// ================= cMob — menu band karo =================
function cMob() {
  const hbg     = document.getElementById("hbg");
  const mob     = document.getElementById("mobMenu");
  const overlay = document.getElementById("mobOverlay");
  if (hbg)     hbg.classList.remove("open");
  if (mob)     mob.classList.remove("open");
  if (overlay) overlay.classList.remove("open");
  // ✅ FIX: body scroll wapas on karo
  document.body.classList.remove("menu-open");
}

// ================= NAV SCROLL =================
window.addEventListener("scroll", () =>
  document.getElementById("nav")?.classList.toggle("scrolled", scrollY > 60)
);

// ================= SCROLL REVEAL =================
const obs = new IntersectionObserver(entries =>
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("vis");
      obs.unobserve(e.target);
    }
  }), { threshold: 0.1 }
);
document.querySelectorAll(".reveal").forEach(r => obs.observe(r));

// ================= RESERVATION =================
async function submitRes() {
  const b = document.getElementById("resbtn");
  b.textContent = "Booking...";
  b.disabled = true;

  const inputs    = document.querySelectorAll('.form input, .form select, .form textarea');
  const firstName = inputs[0]?.value.trim() || '';
  const lastName  = inputs[1]?.value.trim() || '';
  const email     = inputs[2]?.value.trim() || '';
  const phone     = inputs[3]?.value.trim() || '';
  const date      = inputs[4]?.value        || '';
  const time      = inputs[5]?.value        || '';
  const guests    = inputs[6]?.value        || '';
  const notes     = inputs[7]?.value        || '';

  if (!firstName || !email || !phone || !date || !time || !guests) {
    alert('Please fill in all reservation fields.');
    b.textContent = "Confirm Reservation";
    b.disabled = false;
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/reservations`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, phone, date, time, guests, notes })
    });
    const data = await res.json();
    if (!res.ok) {
      alert('Booking failed: ' + data.error);
      b.textContent = "Confirm Reservation";
      b.disabled = false;
      return;
    }
    b.textContent = "Reservation Confirmed ✓";
    b.style.background = "#145214";
  } catch (err) {
    console.log(err);
    b.textContent = "Error! Try Again";
  }

  setTimeout(() => {
    b.textContent = "Confirm Reservation";
    b.style.background = "";
    b.disabled = false;
  }, 3000);
}