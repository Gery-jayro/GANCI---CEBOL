const SETTINGS = {
    storeName: "JayCin",
    whatsapp: "628997465249",
    freeShipping: 100000,
    shippingMin: 10000,
    shippingMax: 50000,
    pickupAddress: "Toko JayCin (isi alamat tokomu di SETTINGS.pickupAddress)"
};

const products = [
    {
        id: 1,
        title: "Ganci Cebol Topi Hijau",
        cats: ["Casual"],
        price: 15000,
        old: 20000,
        sold: 20,
        image: "images/ganci-1.jpg",
        colors: ["#86efac", "#dcfce7"],
        desc: "Gantungan kunci akrilik bening bergambar Cebol dengan topi hijau dan sweater merah. Cocok dipasang di tas, kunci motor, atau resleting jaket."
    },
    {
        id: 2,
        title: "Ganci Cebol Seragam Kerja",
        cats: ["Kerja"],
        price: 18000,
        old: 25000,
        sold: 12,
        image: "images/ganci-2.jpg",
        colors: ["#7dd3fc", "#e0f2fe"],
        desc: "Gantungan kunci akrilik bening bergambar Cebol berseragam kerja biru lengkap dengan headphone. Teman yang pas untuk kunci loker atau tas kerja."
    },
    {
        id: 3,
        title: "Ganci Cebol Tas Selempang",
        cats: ["Casual"],
        price: 22000,
        old: 28000,
        sold: 10,
        image: "images/ganci-3.jpg",
        colors: ["#c4b5fd", "#ede9fe"],
        desc: "Gantungan kunci akrilik bening bergambar Cebol bergaya santai dengan kaos putih dan tas selempang kecil. Bikin tas atau kunci jadi lebih berkarakter."
    },
    {
        id: 4,
        title: "Ganci Cebol Seragam Sekolah",
        cats: ["Sekolah"],
        price: 25000,
        sold: 15,
        image: "images/ganci-4.jpg",
        colors: ["#f9a8d4", "#fce7f3"],
        desc: "Gantungan kunci akrilik bening bergambar Cebol berseragam sekolah lengkap dengan dasi biru. Cocok untuk tas sekolah atau hadiah teman sekelas."
    }
];

// Pilihan ganci: tambahan harga dihitung dari harga dasar produk
const SIZES = [
    { label: "5 cm", add: 0 },
    { label: "6 cm", add: 3000 },
    { label: "7 cm", add: 5000 }
];
const SIDES = [
    { label: "1 sisi", add: 0 },
    { label: "2 sisi", add: 2000 }
];

const CATEGORY_ICONS = { Casual: "👕", Kerja: "🎧", Sekolah: "🎒" };

const $ = id => document.getElementById(id);
const rp = n => "Rp" + n.toLocaleString("id-ID");
const productById = id => products.find(b => b.id === id);
const categories = [
    ...new Set([
        ...Object.keys(CATEGORY_ICONS),
        ...products.flatMap(b => b.cats)
    ])
];
const activeCategories = () =>
    categories.filter(c => products.some(b => b.cats.includes(c)));
const addOf = (size = 0, side = 0) => SIZES[size].add + SIDES[side].add;
const optText = i =>
    `${SIZES[i.size || 0].label} · ${SIDES[i.side || 0].label}`;
const discOf = (b, add = 0) =>
    b.old
        ? `<span class="disc">${Math.round((1 - (b.price + add) / (b.old + add)) * 100)}%</span>`
        : "";
const cartCount = () => cart.reduce((n, i) => n + i.qty, 0);

const load = (key, fallback) => {
    try {
        return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (e) {
        return fallback;
    }
};
const store = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
};

let activeCat = "Semua";
let query = "";
let cart = load("jaycin-cart", []).filter(
    i => productById(i.id) && Number(i.qty) > 0
);
let wish = load("jaycin-wish", []);
let shipMode = "kirim";
try {
    shipMode =
        localStorage.getItem("jaycin-ship") === "ambil" ? "ambil" : "kirim";
} catch (e) {}

const HEART = size =>
    `<svg viewBox="0 0 24 24" width="${size}" height="${size}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg>`;
const BACK = size =>
    `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`;

const gradientOf = b => `linear-gradient(160deg,${b.colors[0]},${b.colors[1]})`;

const coverHTML = b => `
  <div class="cover${b.image ? " has-img" : ""}" style="--g:${gradientOf(b)}">
    ${b.image ? `<img src="${b.image}" alt="Foto ${b.title}" loading="lazy" decoding="async" onerror="this.parentElement.classList.remove('has-img');this.remove()">` : ""}
  </div>`;

const cardHTML = b => `
  <article class="card" data-open="${b.id}">
    <button type="button" class="wish${wish.includes(b.id) ? " on" : ""}" data-wish="${b.id}" aria-label="Simpan ke wishlist">${HEART(22)}</button>
    ${coverHTML(b)}
    <div class="info">
      <span class="sold">${b.sold.toLocaleString("id-ID")} terjual</span>
      <h3 class="title">${b.title}</h3>
      <div class="price-row">
        <span class="price">${rp(b.price)}</span>
        ${b.old ? `<span class="old">${rp(b.old)}</span>` : ""}
        ${discOf(b)}
      </div>
    </div>
  </article>`;

function renderChips() {
    $("chips").innerHTML = ["Semua", ...activeCategories()]
        .map(
            c =>
                `<button type="button" class="chip${c === activeCat ? " active" : ""}" data-cat="${c}">${c}</button>`
        )
        .join("");
}

const SORTS = {
    popular: (a, b) => b.sold - a.sold,
    low: (a, b) => a.price - b.price,
    high: (a, b) => b.price - a.price,
    title: (a, b) => a.title.localeCompare(b.title, "id")
};

function renderGrid() {
    const q = query.trim().toLowerCase();

    const list = products
        .filter(
            b =>
                (activeCat === "Semua" || b.cats.includes(activeCat)) &&
                (!q ||
                    `${b.title} ${b.cats.join(" ")}`.toLowerCase().includes(q))
        )
        .sort(SORTS[$("sortBy").value]);

    $("grid").innerHTML = list.map(cardHTML).join("");
    $("empty").hidden = list.length > 0;
    $("resultInfo").textContent = `${list.length} ganci ditemukan`;
}

const goCatalog = () =>
    $("katalog").scrollIntoView({ behavior: "smooth", block: "start" });

function resetSearch() {
    query = "";
    activeCat = "Semua";
    $("searchInput").value = "";
    renderChips();
    renderGrid();
}

const saveCart = () => store("jaycin-cart", cart);

function calcTotals() {
    const subtotal = cart.reduce(
        (sum, i) =>
            sum + (productById(i.id).price + addOf(i.size, i.side)) * i.qty,
        0
    );

    const free =
        !subtotal || subtotal >= SETTINGS.freeShipping || shipMode === "ambil";

    return { subtotal, free, total: subtotal };
}

const cartItemHTML = i => {
    const b = productById(i.id);
    const key = `${i.id}:${i.size || 0}:${i.side || 0}`;
    const image = b.image;

    return `
    <div class="item">
      <div class="item-cover">
        ${image ? `<img src="${image}" alt="Foto ${b.title}" decoding="async" onerror="this.style.display='none'">` : ""}
      </div>
      <div>
        <h4>${b.title}</h4>
        <small class="opt-line">${optText(i)}</small>
        <div class="p">${rp(b.price + addOf(i.size, i.side))}</div>
        <div class="qty">
          <button type="button" data-dec="${key}">−</button>
          <span>${i.qty}</span>
          <button type="button" data-inc="${key}">+</button>
        </div>
        <button type="button" class="remove" data-del="${key}">Hapus</button>
      </div>
    </div>`;
};

const RANGE = `${rp(SETTINGS.shippingMin)} – ${rp(SETTINGS.shippingMax)}`;

const shippingHTML = () => `
  <div class="ship">
    <h4 class="ship-title">Opsi Pengiriman</h4>
    <div class="ship-cards">
      <button type="button" class="ship-card${shipMode === "kirim" ? " on" : ""}" data-ship="kirim">
        <span class="ship-ico">🚚</span>
        <b>Antar ke alamatmu</b>
        <small>Ongkir ${RANGE}, sesuai alamat. Gratis di atas ${rp(SETTINGS.freeShipping)}</small>
      </button>
      <button type="button" class="ship-card${shipMode === "ambil" ? " on" : ""}" data-ship="ambil">
        <span class="ship-ico">🏬</span>
        <b>Ambil di tempat</b>
        <small>Gratis</small>
      </button>
    </div>
    <p class="ship-note">${
        shipMode === "ambil"
            ? `Ambil langsung di toko (gratis): ${SETTINGS.pickupAddress}`
            : "Alamat lengkap kamu tulis di pesan WhatsApp."
    }</p>
  </div>`;

function renderCart() {
    const count = cartCount();

    $("cartCount").textContent = count;
    if ($("dCartCount")) $("dCartCount").textContent = count;

    $("cartItems").innerHTML = cart.length
        ? cart.map(cartItemHTML).join("") + shippingHTML()
        : `<div class="cart-empty"><div>🛒</div><p>Keranjangmu masih kosong.<br>Yuk pilih ganci favoritmu!</p></div>`;

    const { subtotal, free, total } = calcTotals();
    const ongkir = !subtotal
        ? "-"
        : shipMode === "ambil"
          ? "Ambil di tempat"
          : free
            ? "Gratis"
            : RANGE;

    $("subtotal").textContent = rp(subtotal);
    $("shipping").textContent = ongkir;
    $("total").textContent =
        subtotal && !free ? `${rp(total)} + ongkir` : rp(total);
    $("checkoutBtn").disabled = !cart.length;
}

function toast(msg) {
    const t = $("toast");

    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.classList.remove("show"), 1800);
}

function addToCart(id, size = 0, side = 0) {
    const b = productById(id);
    const item = cart.find(
        i => i.id === id && (i.size || 0) === size && (i.side || 0) === side
    );

    if (item) item.qty++;
    else cart.push({ id, size, side, qty: 1 });

    saveCart();
    renderCart();

    const badge = $("cartCount");
    badge.classList.remove("bump");
    void badge.offsetWidth;
    badge.classList.add("bump");

    toast(`✓ ${b.title} (${optText({ size, side })}) ditambahkan`);
}

function setCartOpen(open) {
    $("drawer").classList.toggle("open", open);
    $("drawer").setAttribute("aria-hidden", String(!open));
    $("overlay").hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
    updateNav();
}

const openCart = () => setCartOpen(true);
const closeCart = () => setCartOpen(false);

const recommendations = b =>
    products
        .filter(x => x.id !== b.id)
        .sort(
            (x, y) =>
                y.cats.filter(c => b.cats.includes(c)).length -
                x.cats.filter(c => b.cats.includes(c)).length
        )
        .slice(0, 8);

const recCardHTML = b => `
  <article class="rec-card" data-dopen="${b.id}">
    ${coverHTML(b)}
    <div class="rec-info">
      <h4>${b.title}</h4>
      <span class="price">${rp(b.price)}</span>
    </div>
  </article>`;

function updateRec() {
    const row = $("recRow");
    const prev = document.querySelector("[data-recprev]");
    const next = document.querySelector("[data-recnext]");
    if (!row || !prev || !next) return;

    prev.disabled = row.scrollLeft < 4;
    next.disabled = row.scrollLeft + row.clientWidth >= row.scrollWidth - 4;
}

const scrollRec = dir =>
    $("recRow").scrollBy({
        left: dir * $("recRow").clientWidth * 0.8,
        behavior: "smooth"
    });

const priceHTML = (b, add) => `
  <span class="d-price">${rp(b.price + add)}</span>
  ${discOf(b, add)}
  ${b.old ? `<span class="d-old">${rp(b.old + add)}</span>` : ""}`;

const optButtons = (list, attr) =>
    list
        .map(
            (o, i) =>
                `<button type="button" class="opt${i ? "" : " on"}" data-${attr}="${i}">${o.label}${o.add ? ` <small>+${rp(o.add)}</small>` : ""}</button>`
        )
        .join("");

let detailId = null;
const sel = { size: 0, side: 0 };

function setOpt(kind, i) {
    sel[kind] = i;
    document
        .querySelectorAll(`[data-d${kind}]`)
        .forEach((btn, n) => btn.classList.toggle("on", n === i));
    $("dPrices").innerHTML = priceHTML(
        productById(detailId),
        addOf(sel.size, sel.side)
    );
}

function renderDetail(b) {
    detailId = b.id;
    sel.size = sel.side = 0;
    $("detail").innerHTML = `
    <div class="d-bar">
      <button type="button" class="d-circle" data-dclose aria-label="Kembali">${BACK(24)}</button>
      <button type="button" class="d-circle" data-dcart aria-label="Buka keranjang">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 4h2l2.4 11h10.2L20 7H6"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/></svg>
        <span class="d-badge" id="dCartCount">${cartCount()}</span>
      </button>
    </div>

    <div class="d-scroll">
      <div class="d-media">
        <div class="d-gallery">
          <div class="d-slide">
            <img src="${b.image}" alt="Foto ${b.title}" decoding="async">
          </div>
        </div>
      </div>

      <div class="d-body">
        <div class="d-price-row">
          <div class="d-prices" id="dPrices">${priceHTML(b, 0)}</div>
          <div class="d-actions">
            <button type="button" class="d-icon d-heart${wish.includes(b.id) ? " on" : ""}" data-wish="${b.id}" aria-label="Simpan ke wishlist">${HEART(26)}</button>
            <button type="button" class="d-icon" data-dshare="${b.id}" aria-label="Bagikan">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>
            </button>
          </div>
        </div>

        <h1 class="d-title">${b.title}</h1>
        <p class="d-sold">${b.sold.toLocaleString("id-ID")} terjual</p>

        <section class="d-desc">
          <h3>Deskripsi</h3>
          <p>${b.desc}</p>
        </section>

        <section class="d-opts">
          <h3>Ukuran</h3>
          <div class="opt-row">${optButtons(SIZES, "dsize")}</div>
          <h3>Jumlah sisi</h3>
          <div class="opt-row">${optButtons(SIDES, "dside")}</div>
        </section>
      </div>

      <section class="d-rec">
        <h3>Mungkin kamu juga suka</h3>
        <div class="rec-wrap">
          <button type="button" class="d-arrow rec-prev" data-recprev aria-label="Geser ke kiri" disabled>&#10094;</button>
          <div class="rec-row" id="recRow">${recommendations(b).map(recCardHTML).join("")}</div>
          <button type="button" class="d-arrow rec-next" data-recnext aria-label="Geser ke kanan">&#10095;</button>
        </div>
      </section>
    </div>

    <div class="d-foot">
      <button type="button" class="d-add" data-dadd="${b.id}">+ Keranjang</button>
    </div>`;

    $("recRow").addEventListener("scroll", updateRec, { passive: true });
    updateRec();
}

function openDetail(id) {
    const b = productById(id);
    if (!b) return;

    renderDetail(b);
    $("detail").classList.add("open");
    $("detail").setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    try {
        history.pushState({ detail: id }, "");
    } catch (e) {}
}

function closeDetail(fromPop) {
    const el = $("detail");
    if (!el.classList.contains("open")) return;

    el.classList.remove("open");
    el.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    if (!fromPop && history.state && history.state.detail) history.back();
}

window.addEventListener("popstate", e => {
    if ($("detail").classList.contains("open")) return closeDetail(true);
    showView((e.state && e.state.view) || "home", false);
});

async function shareProduct(id) {
    const b = productById(id);
    const text = `${b.title} — ${rp(b.price)} di ${SETTINGS.storeName}`;

    try {
        if (navigator.share) {
            await navigator.share({ title: b.title, text, url: location.href });
        } else if (navigator.clipboard) {
            await navigator.clipboard.writeText(`${text} ${location.href}`);
            toast("Tautan disalin");
        }
    } catch (e) {}
}

let currentView = "home";
let catViewSel = null;

function updateNav() {
    const drawerOpen = $("drawer").classList.contains("open");

    document
        .querySelectorAll(".mobile-nav [data-nav]")
        .forEach(a =>
            a.classList.toggle(
                "active",
                a.dataset.nav === (drawerOpen ? "cart" : currentView)
            )
        );
}

function showView(name, push) {
    if (name === currentView) return;

    currentView = name;
    if (name === "kategori") catViewSel = null;

    document.querySelector("main").hidden = name !== "home";
    $("viewCategory").hidden = name !== "kategori";
    $("viewWishlist").hidden = name !== "wishlist";

    if (name === "kategori") renderCategoryView();
    if (name === "wishlist") renderWishlistView();

    updateNav();
    window.scrollTo({ top: 0, behavior: "instant" });

    if (!push) return;

    try {
        const onTab = Boolean(history.state && history.state.view);

        if (name === "home") {
            if (onTab) history.back();
        } else if (onTab) {
            history.replaceState({ view: name }, "");
        } else {
            history.pushState({ view: name }, "");
        }
    } catch (e) {}
}

const gridOrEmpty = (list, icon, title, text, extra = "") =>
    list.length
        ? `<div class="grid">${list.map(cardHTML).join("")}</div>`
        : `<div class="v-empty"><div>${icon}</div><h3>${title}</h3><p>${text}</p>${extra}</div>`;

function renderCategoryView() {
    const el = $("viewCategory");

    if (catViewSel === null) {
        el.innerHTML = `
      <div class="v-head"><h2>Kategori</h2><p>Pilih kategori ganci favoritmu</p></div>
      <div class="cat-grid">${["Semua", ...categories]
          .map(c => {
              const all = c === "Semua";
              const n = all
                  ? products.length
                  : products.filter(b => b.cats.includes(c)).length;

              return `
          <button type="button" class="cat-card" data-catview="${c}">
            <span class="cat-ico">${all ? "🔑" : CATEGORY_ICONS[c] || "🔑"}</span>
            <b>${all ? "Semua Ganci" : c}</b>
            <small>${n ? n + " ganci" : "Segera hadir"}</small>
          </button>`;
          })
          .join("")}</div>`;
        return;
    }

    const list = products
        .filter(b => catViewSel === "Semua" || b.cats.includes(catViewSel))
        .sort(SORTS.popular);

    el.innerHTML = `
    <div class="v-head v-back">
      <button type="button" class="v-backbtn" data-catback aria-label="Kembali ke kategori">${BACK(22)}</button>
      <div>
        <h2>${catViewSel === "Semua" ? "Semua Ganci" : catViewSel}</h2>
        <p>${list.length} ganci</p>
      </div>
    </div>
    ${gridOrEmpty(list, "🕘", "Segera hadir", "Ganci untuk kategori ini belum tersedia.")}`;
}

function renderWishlistView() {
    const list = products.filter(b => wish.includes(b.id));

    $("viewWishlist").innerHTML = `
    <div class="v-head"><h2>Wishlist</h2><p>${list.length} ganci tersimpan</p></div>
    ${gridOrEmpty(
        list,
        "🤍",
        "Wishlist masih kosong",
        "Ketuk ikon hati pada ganci untuk menyimpannya di sini.",
        `<button type="button" class="btn btn-primary" data-nav="home">Cari ganci</button>`
    )}`;
}

function checkoutWhatsApp() {
    if (!cart.length) return toast("Keranjang masih kosong.");
    if (!/^\d{8,15}$/.test(SETTINGS.whatsapp))
        return toast("Periksa nomor WhatsApp di SETTINGS.");

    const ambil = shipMode === "ambil";
    const { subtotal, free, total } = calcTotals();

    const items = cart
        .map((item, n) => {
            const b = productById(item.id);
            const unit = b.price + addOf(item.size, item.side);
            return `${n + 1}. ${b.title} (${optText(item)}) — ${rp(unit)} x ${item.qty} = ${rp(unit * item.qty)}`;
        })
        .join("\n");

    const message = [
        `Halo ${SETTINGS.storeName}, saya ingin memesan ganci berikut:`,
        "",
        items,
        "",
        `Subtotal: ${rp(subtotal)}`,
        `Pengiriman: ${ambil ? "Ambil di tempat" : "Antar ke alamat"}`,
        `Ongkir: ${ambil ? "Gratis (ambil di tempat)" : free ? "Gratis" : RANGE + " (mohon info ongkir sesuai alamat)"}`,
        `Total: ${rp(total)}${ambil || free ? "" : " + ongkir"}`,
        "",
        ambil
            ? `Saya ambil di toko: ${SETTINGS.pickupAddress}`
            : "Alamat pengiriman lengkap:\n(tulis alamat, nama penerima, dan nomor HP di sini)",
        "",
        "Mohon konfirmasi stok dan cara pembayaran. Terima kasih."
    ].join("\n");

    window.open(
        `https://wa.me/${SETTINGS.whatsapp}?text=${encodeURIComponent(message)}`,
        "_blank"
    );
}

const findItem = key => {
    const [id, size, side] = key.split(":").map(Number);
    return cart.find(
        i => i.id === id && (i.size || 0) === size && (i.side || 0) === side
    );
};

const changeQty = (key, step) => {
    const item = findItem(key);

    if (item) item.qty += step;
    cart = cart.filter(i => i.qty > 0);
    saveCart();
    renderCart();
};

const ACTIONS = {
    open: id => openDetail(Number(id)),
    dclose: () => closeDetail(),
    dcart: openCart,
    dadd: id => addToCart(Number(id), sel.size, sel.side),
    dsize: i => setOpt("size", Number(i)),
    dside: i => setOpt("side", Number(i)),
    dshare: id => shareProduct(Number(id)),
    dopen: id => {
        renderDetail(productById(Number(id)));
        try {
            history.replaceState({ detail: Number(id) }, "");
        } catch (e) {}
    },
    recprev: () => scrollRec(-1),
    recnext: () => scrollRec(1),

    nav: (name, _, e) => {
        e.preventDefault();

        if (name === "cart") return openCart();
        if (name !== currentView) return showView(name, true);

        if (name === "kategori" && catViewSel !== null) {
            catViewSel = null;
            renderCategoryView();
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
    },

    catview: c => {
        catViewSel = c;
        renderCategoryView();
        window.scrollTo({ top: 0, behavior: "instant" });
    },

    catback: () => {
        catViewSel = null;
        renderCategoryView();
    },

    ship: mode => {
        shipMode = mode === "ambil" ? "ambil" : "kirim";
        try {
            localStorage.setItem("jaycin-ship", shipMode);
        } catch (e) {}
        renderCart();
    },

    wish: id => {
        id = Number(id);
        const on = !wish.includes(id);

        wish = on ? [...wish, id] : wish.filter(x => x !== id);
        store("jaycin-wish", wish);

        document
            .querySelectorAll(`[data-wish="${id}"]`)
            .forEach(btn => btn.classList.toggle("on", on));
        if (currentView === "wishlist") renderWishlistView();
    },

    cat: (c, btn) => {
        activeCat = c;
        query = "";
        $("searchInput").value = "";
        renderChips();
        renderGrid();
        if (!btn.classList.contains("chip")) goCatalog();
    },

    inc: id => changeQty(id, 1),
    dec: id => changeQty(id, -1),
    del: key => {
        const item = findItem(key);
        cart = cart.filter(i => i !== item);
        saveCart();
        renderCart();
    }
};

const ACTION_SELECTOR = Object.keys(ACTIONS)
    .map(k => `[data-${k}]`)
    .join(",");

document.addEventListener("click", e => {
    const t = e.target.closest(ACTION_SELECTOR);
    if (!t) return;

    const key = Object.keys(ACTIONS).find(k => k in t.dataset);
    ACTIONS[key](t.dataset[key], t, e);
});

$("searchInput").addEventListener("input", e => {
    query = e.target.value;
    activeCat = "Semua";
    if (currentView !== "home") showView("home", true);
    renderChips();
    renderGrid();
});

$("searchForm").addEventListener("submit", e => {
    e.preventDefault();
    if (currentView !== "home") showView("home", true);
    goCatalog();
});

$("sortBy").addEventListener("change", renderGrid);
$("resetBtn").addEventListener("click", resetSearch);
$("openCart").addEventListener("click", openCart);
$("closeCart").addEventListener("click", closeCart);
$("overlay").addEventListener("click", closeCart);
$("checkoutBtn").addEventListener("click", checkoutWhatsApp);

document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
        closeCart();
        closeDetail();
    }
});

try {
    history.replaceState(null, "");
} catch (e) {}

if (window.matchMedia("(max-width: 699px)").matches) {
    $("searchInput").placeholder = "Cari ganci";
}

renderChips();
renderGrid();
renderCart();
updateNav();
