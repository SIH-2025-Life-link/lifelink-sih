// Feedback & Grievances - client logic
(function(){
  const API = window.LifeLinkAPI || {};
  const API_BASE = (API && API.BASE_URL) || 'http://localhost:5000';
  const form = document.getElementById('feedbackForm');
  const ok = document.getElementById('fbSuccess');
  const err = document.getElementById('fbError');

  function show(el){ el && (el.style.display = 'block'); }
  function hide(el){ el && (el.style.display = 'none'); }

  async function postFeedback(payload){
    try {
      const res = await fetch(API_BASE + '/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('non-ok');
      return await res.json();
    } catch(e){ throw e; }
  }

  function fallbackSave(payload){
    // Save locally; mimic offline queue
    const key = 'lifelink_feedback_queue';
    const cur = JSON.parse(localStorage.getItem(key) || '[]');
    cur.push({ ...payload, _ts: Date.now() });
    localStorage.setItem(key, JSON.stringify(cur));
  }

  form && form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hide(ok); hide(err);
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      await postFeedback(data);
      show(ok);
      form.reset();
    } catch(_){
      fallbackSave(data);
      show(err);
      form.reset();
    }
  });
})();
