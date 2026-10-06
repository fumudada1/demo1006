/* 依洛嘉官方旗艦店：聯絡我們頁面表單 */
(() => {
  'use strict';

  const form = document.getElementById('contactForm');
  if (!form) return;

  const MAIL_TO = 'sunnyelg1118@gmail.com';
  const status = document.getElementById('formStatus');

  /* 驗證規則：回傳錯誤訊息，通過則回傳空字串 */
  const rules = {
    cName: (v) => (v.trim() ? '' : '請輸入姓名'),
    cPhone: (v) => (!v.trim() || /^[0-9+\-()\s]{7,20}$/.test(v.trim()) ? '' : '電話格式不正確'),
    cEmail: (v) => {
      if (!v.trim()) return '請輸入電子郵件';
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : '電子郵件格式不正確';
    },
    cMsg: (v) => (v.trim().length >= 5 ? '' : '請輸入至少 5 個字的留言內容'),
  };

  const showError = (id, msg) => {
    const input = document.getElementById(id);
    const err = form.querySelector(`.field__error[data-for="${id}"]`);
    err.textContent = msg;
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    input.classList.toggle('is-invalid', Boolean(msg));
  };

  const validate = (id) => {
    const msg = rules[id](document.getElementById(id).value);
    showError(id, msg);
    return !msg;
  };

  // 離開欄位時即時驗證；已出現錯誤時輸入中就重新檢查
  Object.keys(rules).forEach((id) => {
    const el = document.getElementById(id);
    el.addEventListener('blur', () => validate(id));
    el.addEventListener('input', () => { if (el.classList.contains('is-invalid')) validate(id); });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    status.className = 'form-status';
    const ok = Object.keys(rules).map(validate).every(Boolean);
    if (!ok) {
      status.textContent = '請修正標示的欄位後再送出。';
      status.classList.add('is-error');
      form.querySelector('.is-invalid')?.focus();
      return;
    }

    // 靜態網站沒有後端：整理成郵件草稿，交由使用者的郵件軟體寄出
    const d = new FormData(form);
    const subject = `【官網留言】${d.get('topic')}－${d.get('name').trim()}`;
    const body = [
      `姓名：${d.get('name').trim()}`,
      `電話：${d.get('phone').trim() || '（未填）'}`,
      `Email：${d.get('email').trim()}`,
      `類型：${d.get('topic')}`,
      '',
      '留言內容：',
      d.get('message').trim(),
    ].join('\n');
    location.href = `mailto:${MAIL_TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    status.textContent = '已為您開啟郵件軟體，請在草稿中按「傳送」完成留言。若沒有自動開啟，請直接來信 ' + MAIL_TO + '。';
    status.classList.add('is-ok');
  });
})();
