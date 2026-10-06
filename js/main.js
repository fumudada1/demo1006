/* 依洛嘉官方旗艦店：首頁互動腳本 */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ===== 商品資料（來自 elg-latest-products.md） ===== */
  const IMG = 'https://image-cdn-flare.qdm.cloud/q60d4bf275a1cc/image/data/';
  const PRODUCT_URL = 'https://www.elg.com.tw/product/product&product_id=';
  const PRODUCTS = [
    { id: 555, name: 'SBIR典藏台南肌秘面膜禮盒', price: 2000, img: '2026/08/12/fcc77a7ac07821d30dd8f21a1b28eb00.jpg', tag: 'NEW', feature: true },
    { id: 554, name: '【依洛嘉 E.L.G】美肌之盾光感無瑕底妝液/35g', price: 900, img: '2026/04/28/606f3600c4ce327df1cfcaf1ed6e28af.jpg' },
    { id: 553, name: '【依洛嘉E.L.G】植物烏髮養護精華乳50g', price: 980, img: '2026/04/28/3052a64991949510f042306fa82e51c2.jpg' },
    { id: 538, name: '【依洛嘉 E.L.G】山芙蓉舒緩修護化妝水100ml', price: 399, img: '2026/01/27/4c4c591253d99a18fc9a465493f502f8.jpg' },
    { id: 525, name: '【依洛嘉 E.L.G】私密抑菌潔淨慕斯100ml', price: 699, img: '2025/05/20/b58ea72226b9b48c15e89fd778128f4a.jpg' },
    { id: 524, name: '【依洛嘉 E.L.G】私密抑菌清爽噴霧60ml', price: 699, img: '2025/05/20/4855a33d7b0e892838490687725a8e4c.jpg' },
    { id: 523, name: '【依洛嘉 E.L.G】水潤保濕肽精華/30ml', price: 1980, img: '2025/04/08/d5451b0024b3df278fde8b4e6686526b.jpg' },
    { id: 522, name: '【依洛嘉 E.L.G】舒敏修護肽精華/30ml', price: 1980, img: '2025/04/08/22f7fd78ea01471e96d19699c0f95e10.jpg' },
    { id: 521, name: '【依洛嘉 E.L.G】煥采透亮肽精華/30ml', price: 1980, img: '2025/04/08/4435614ccd07db402c214c17060a0938.jpg' },
    { id: 520, name: '【依洛嘉 E.L.G】緊顏抗老肽精華/30ml', price: 1980, img: '2025/04/08/d6cd714fe09d6808e0acf91c6c72cbec.jpg' },
  ];

  /* ===== 幣別（僅顯示換算，匯率為示意值） ===== */
  const RATE = { TWD: 1, USD: 1 / 32 };
  let currency = 'TWD';
  const money = (n) => currency === 'USD' ? `US$${(n * RATE.USD).toFixed(2)}` : `$${n.toLocaleString('en-US')}`;

  /* ===== 購物車（localStorage） ===== */
  const CART_KEY = 'elg_cart';
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { cart = []; }
  const saveCart = () => { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch { /* 無痕模式略過 */ } };

  const toastEl = $('#toast');
  let toastTimer;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-show'), 1800);
  };

  /* ===== 渲染商品卡片 ===== */
  const renderProducts = () => {
    const grid = $('#productGrid');
    if (!grid) return; // 非首頁沒有商品區
    grid.innerHTML = PRODUCTS.map((p, i) => `
      <article class="card${p.feature ? ' card--feature' : ''}">
        <a class="card__img" href="${PRODUCT_URL}${p.id}" target="_blank" rel="noopener">
          <img src="${IMG}${p.img}" alt="${p.name}" loading="${i < 3 ? 'eager' : 'lazy'}">
          ${p.tag ? `<span class="card__tag">${p.tag}</span>` : ''}
        </a>
        <div class="card__info">
          <p class="card__no">No.${String(i + 1).padStart(2, '0')}</p>
          <h3 class="card__name"><a href="${PRODUCT_URL}${p.id}" target="_blank" rel="noopener">${p.name}</a></h3>
          <p class="card__price" data-price="${p.price}">${money(p.price)}<span class="card__stock">現貨</span></p>
          <button class="btn btn--primary btn--block" data-add="${p.id}"><i class="bi bi-bag-plus" aria-hidden="true"></i> 加入購物車</button>
        </div>
      </article>`).join('');
  };

  /* ===== 渲染購物車 ===== */
  const renderCart = () => {
    const count = cart.reduce((s, c) => s + c.qty, 0);
    const total = cart.reduce((s, c) => s + c.qty * c.price, 0);
    $('#cartCount').textContent = count;
    $('#cartTotal').textContent = money(total);
    $('#cartList').innerHTML = cart.length ? cart.map((c) => `
      <li class="ci">
        <img src="${IMG}${c.img}" alt="">
        <div>
          <p class="ci__name">${c.name}</p>
          <p class="ci__price">${money(c.price)}</p>
          <div class="ci__qty">
            <button data-dec="${c.id}" aria-label="減少數量">−</button>
            <span>${c.qty}</span>
            <button data-inc="${c.id}" aria-label="增加數量">+</button>
          </div>
        </div>
        <button class="ci__del" data-del="${c.id}" aria-label="移除商品"><i class="bi bi-trash3" aria-hidden="true"></i></button>
      </li>`).join('') : '<li class="drawer__empty"><i class="bi bi-bag-heart" aria-hidden="true"></i><br>購物車目前是空的</li>';
    $$('.card__price').forEach((el) => {
      el.firstChild.textContent = money(Number(el.dataset.price));
    });
  };

  const addToCart = (id) => {
    const p = PRODUCTS.find((x) => x.id === id);
    if (!p) return;
    const found = cart.find((c) => c.id === id);
    if (found) found.qty += 1;
    else cart.push({ id: p.id, name: p.name, price: p.price, img: p.img, qty: 1 });
    saveCart(); renderCart(); toast('已加入購物車');
  };

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-add],[data-inc],[data-dec],[data-del]');
    if (!t) return;
    if (t.dataset.add) return addToCart(Number(t.dataset.add));
    const id = Number(t.dataset.inc || t.dataset.dec || t.dataset.del);
    const item = cart.find((c) => c.id === id);
    if (!item) return;
    if (t.dataset.inc) item.qty += 1;
    if (t.dataset.dec) item.qty -= 1;
    if (t.dataset.del || item.qty <= 0) cart = cart.filter((c) => c.id !== id);
    saveCart(); renderCart();
  });

  /* 抽屜開關 */
  const drawer = $('#drawer');
  const overlay = $('#overlay');
  const setDrawer = (open) => {
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    overlay.hidden = !open;
  };
  $('#cartBtn').addEventListener('click', () => setDrawer(true));
  $('#drawerClose').addEventListener('click', () => setDrawer(false));
  overlay.addEventListener('click', () => setDrawer(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setDrawer(false); });
  $('#clearCart').addEventListener('click', () => { cart = []; saveCart(); renderCart(); });
  $('#checkoutBtn').addEventListener('click', () => {
    toast(cart.length ? '此為示範網站，尚未串接金流' : '請先加入商品');
  });

  /* ===== 幣別切換 ===== */
  $$('[data-currency]').forEach((b) => b.addEventListener('click', () => {
    currency = b.dataset.currency;
    $('#currencyBtn').textContent = currency;
    renderCart();
  }));

  /* ===== 頂端工具列下拉（觸控裝置用點擊） ===== */
  $$('.dropdown__btn').forEach((btn) => btn.addEventListener('click', (e) => {
    const li = btn.parentElement;
    const open = !li.classList.contains('is-open');
    $$('.dropdown.is-open').forEach((d) => { d.classList.remove('is-open'); d.firstElementChild.setAttribute('aria-expanded', 'false'); });
    li.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
    e.stopPropagation();
  }));
  document.addEventListener('click', () => $$('.dropdown.is-open').forEach((d) => d.classList.remove('is-open')));

  /* ===== 主選單：漢堡 + 手風琴 ===== */
  const nav = $('#mainNav');
  const navToggle = $('#navToggle');
  navToggle.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  });
  $$('.sub-toggle').forEach((btn) => btn.addEventListener('click', () => {
    const li = btn.parentElement;
    const open = !li.classList.contains('is-open');
    li.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
  }));

  /* ===== 輪播圖 ===== */
  const slides = $$('.hero__slide');
  const dotsBox = $('#heroDots');
  let cur = 0;
  let timer;
  (dotsBox ? slides : []).forEach((_, i) => {
    const d = document.createElement('button');
    d.setAttribute('aria-label', `第 ${i + 1} 張`);
    d.addEventListener('click', () => { go(i); restart(); });
    dotsBox.appendChild(d);
  });
  const dots = dotsBox ? $$('button', dotsBox) : [];
  function go(n) {
    if (!slides.length) return;
    cur = (n + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('is-active', i === cur));
    dots.forEach((d, i) => d.classList.toggle('is-active', i === cur));
  }
  function restart() {
    clearInterval(timer);
    if (!slides.length) return;
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(() => go(cur + 1), 5000);
  }
  const hero = $('.hero');
  if (hero) {
  $('#heroPrev').addEventListener('click', () => { go(cur - 1); restart(); });
  $('#heroNext').addEventListener('click', () => { go(cur + 1); restart(); });
  hero.addEventListener('mouseenter', () => clearInterval(timer));
  hero.addEventListener('mouseleave', restart);
  // 觸控滑動
  let sx = 0;
  hero.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 40) { go(cur + (dx < 0 ? 1 : -1)); restart(); }
  });
  }

  /* ===== 回到頂端 ===== */
  $('#toTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ===== 固定頁首高度（供錨點捲動預留位置） ===== */
  const setHeaderH = () => {
    // 手機版選單展開時不計入，避免捲動偏移過大
    const h = $('.header').getBoundingClientRect().height;
    document.documentElement.style.setProperty('--header-h', `${Math.round(h)}px`);
  };
  setHeaderH();
  addEventListener('resize', setHeaderH);

  /* ===== 選單平滑捲動 ===== */
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  $$('.nav a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const target = a.hash === '#top' ? document.body : $(a.hash);
    if (!target) return;
    e.preventDefault();
    const top = a.hash === '#top' ? 0 : target.getBoundingClientRect().top + scrollY - $('.header').offsetHeight - 12;
    window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
    history.replaceState(null, '', a.hash);
    // 手機版點選後收合選單
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }));

  /* 捲動時標示目前所在區塊的選單項目 */
  const spyLinks = $$('.nav__list > li > a[href^="#"]').filter((a) => a.hash !== '#top');
  const spyMap = spyLinks.map((a) => ({ a, el: $(a.hash) })).filter((x) => x.el);
  const spy = () => {
    const y = scrollY + $('.header').offsetHeight + 80;
    let cur = null;
    spyMap.forEach(({ a, el }) => { if (el.offsetTop <= y) cur = a; });
    // 同一個錨點對應多個選單項目時，僅標示第一個
    const first = cur && spyMap.find((x) => x.el === $(cur.hash)).a;
    spyLinks.forEach((a) => a.classList.toggle('is-current', a === first));
  };
  addEventListener('scroll', spy, { passive: true });

  /* ===== 滾動淡入 ===== */
  renderProducts(); // 先產生商品卡片，才能掛上淡入效果
  const revealRules = [
    ['.banner-strip', ''], ['.quick', ''], ['.section__head', ''],
    ['.card--feature', 'reveal--left'], ['.skin__list li', 'reveal--zoom'],
    ['.social__list li', 'reveal--zoom'], ['.footer__grid > div', ''], ['.footer__copy', ''],
    // 聯絡我們頁面
    ['.contact-card', 'reveal--zoom'],
    ['.contact-form-wrap', 'reveal--left'], ['.contact-map-wrap', 'reveal--right'],
  ];
  const targets = [];
  revealRules.forEach(([sel, extra]) => $$(sel).forEach((el) => {
    el.classList.add('reveal');
    if (extra) el.classList.add(extra);
    targets.push(el);
  }));
  // 商品卡片依欄位錯開延遲，呈現依序浮現
  $$('.card:not(.card--feature)').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.setProperty('--d', `${(i % 4) * 0.12}s`);
    targets.push(el);
  });
  // 同一列的元素依序延遲
  ['.skin__list li', '.social__list li', '.footer__grid > div', '.contact-card'].forEach((sel) => {
    $$(sel).forEach((el, i) => el.style.setProperty('--d', `${i * 0.12}s`));
  });

  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach((el) => io.observe(el));
  } else {
    targets.forEach((el) => el.classList.add('is-visible'));
  }

  /* ===== 初始化 ===== */
  renderCart();
  go(0);
  restart();
})();
