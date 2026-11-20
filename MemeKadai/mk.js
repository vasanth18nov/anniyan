// MemeKadai — anniyan.online/MemeKadai
// Firebase Auth (Google) + Firestore. Images are stored as bytes in /media/{postId}.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js';
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut,
  onAuthStateChanged, connectAuthEmulator, signInWithCredential,
} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js';
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager, memoryLocalCache,
  connectFirestoreEmulator, collection, collectionGroup, doc, getDoc, getDocFromCache, getDocs,
  query, where, orderBy, limit, startAfter, writeBatch, runTransaction, serverTimestamp,
  increment, Timestamp, Bytes, setDoc, updateDoc, deleteDoc,
} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js';

// ---------------------------------------------------------------- config
const firebaseConfig = {
  apiKey: 'AIzaSyBCJ7XhESYMdS8QLoND51_4VKO2t8xKSn4',
  authDomain: 'memekadai-anniyan.firebaseapp.com',
  projectId: 'memekadai-anniyan',
  storageBucket: 'memekadai-anniyan.firebasestorage.app',
  messagingSenderId: '214816352993',
  appId: '1:214816352993:web:48d969d978562d64a265a0',
};
const ADMIN_UIDS = []; // keep in sync with firestore.rules
const EMU = new URLSearchParams(location.search).has('emu');
const PAGE = 8;
const HIDE_AT_REPORTS = 3;
const MAX_MEDIA = 900_000;      // bytes, Firestore doc limit is ~1 MB
const TARGET_MEDIA = 320_000;   // aim for this when compressing
const MAX_W = 1000;

export const SECTIONS = [
  { id: 'funny', name: 'Funny', ic: '😂' },
  { id: 'tamil', name: 'Tamil', ic: '🎬' },
  { id: 'malaysia', name: 'Malaysia', ic: '🇲🇾' },
  { id: 'desi', name: 'Desi', ic: '🪔' },
  { id: 'cricket', name: 'Cricket', ic: '🏏' },
  { id: 'gaming', name: 'Gaming', ic: '🎮' },
  { id: 'movies', name: 'Movies & TV', ic: '🍿' },
  { id: 'anime', name: 'Anime', ic: '🍥' },
  { id: 'animals', name: 'Animals', ic: '🐒' },
  { id: 'wholesome', name: 'Wholesome', ic: '🥹' },
  { id: 'relationship', name: 'Relationship', ic: '💔' },
  { id: 'work', name: 'School & Work', ic: '💼' },
  { id: 'tech', name: 'Tech', ic: '💻' },
  { id: 'sports', name: 'Sports', ic: '⚽' },
  { id: 'food', name: 'Food', ic: '🍛' },
  { id: 'random', name: 'Random', ic: '🎲' },
];
const SECTION = Object.fromEntries(SECTIONS.map((s) => [s.id, s]));
const SORTS = [
  { id: 'hot', name: 'Hot', ic: '🔥' },
  { id: 'trending', name: 'Trending', ic: '📈' },
  { id: 'fresh', name: 'Fresh', ic: '🌱' },
  { id: 'top', name: 'Top', ic: '🏆' },
];
const REPORT_REASONS = [
  ['spam', 'Spam or scam'], ['nudity', 'Nudity or sexual content'], ['hate', 'Hate or harassment'],
  ['violence', 'Violence or gore'], ['copyright', 'Stolen / copyright'], ['other', 'Something else'],
];

// ---------------------------------------------------------------- firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
let db;
try {
  db = initializeFirestore(app, {
    localCache: EMU ? memoryLocalCache()
      : persistentLocalCache({ tabManager: persistentMultipleTabManager(), cacheSizeBytes: 120 * 1024 * 1024 }),
  });
} catch (e) {
  db = initializeFirestore(app, { localCache: memoryLocalCache() });
}
if (EMU) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9199', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8185);
}

// ---------------------------------------------------------------- state
const state = {
  user: null,          // firebase user
  ready: false,        // users/{uid} doc ensured
  offset: 0,           // server clock − local clock (ms)
  votes: new Map(),    // pid → 1 | -1 | 0
  saved: new Set(),
  posts: new Map(),    // pid → post data (latest seen)
  liked: new Set(),
  view: 0,             // changes on every route change to cancel stale loads
  pending: 0,          // writes in flight
};
let viewSeq = 0;
const feedCache = { hash: null, frag: null, y: 0, view: 0 };
const isAdmin = () => !!state.user && ADMIN_UIDS.includes(state.user.uid);
const nowServer = () => Date.now() + state.offset;

// ---------------------------------------------------------------- helpers
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtNum = (n) => (Math.abs(n) >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
  : Math.abs(n) >= 1e4 ? Math.round(n / 1e3) + 'K'
  : Math.abs(n) >= 1e3 ? (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K' : String(n));
function ago(ts) {
  const ms = ts?.toMillis ? ts.toMillis() : (ts || Date.now());
  const s = Math.max(1, Math.round((nowServer() - ms) / 1000));
  if (s < 60) return 'now';
  const m = Math.round(s / 60); if (m < 60) return m + 'm';
  const h = Math.round(m / 60); if (h < 24) return h + 'h';
  const d = Math.round(h / 24); if (d < 7) return d + 'd';
  const w = Math.round(d / 7); if (d < 30) return w + 'w';
  return new Date(ms).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}
const hotOf = (h0, s) => h0 + 4 * Math.sqrt(Math.max(s, 0)) - 4 * Math.sqrt(Math.max(-s, 0));
const avatar = (photo, name, cls = 'av') => photo
  ? `<img class="${cls}" src="${esc(photo)}" alt="" referrerpolicy="no-referrer" loading="lazy">`
  : `<span class="${cls} av-letter" aria-hidden="true">${esc((name || '?').trim().charAt(0).toUpperCase())}</span>`;
const postUrl = (id) => `${location.origin}${location.pathname}#/p/${id}`;

function toast(msg, kind = '') {
  const t = document.createElement('div');
  t.className = 'toast ' + kind;
  t.textContent = msg;
  $('#toasts').append(t);
  requestAnimationFrame(() => t.classList.add('in'));
  setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 300); }, 3200);
}
function errMsg(e, fallback = 'Something went wrong. Try again.') {
  console.error(e);
  const c = e?.code || '';
  if (c.includes('permission-denied')) return fallback;
  if (c.includes('failed-precondition')) return 'This feed is still being set up. Try again in a few minutes.';
  if (c.includes('unavailable')) return 'You look offline. Check your connection.';
  if (c.includes('resource-exhausted')) return 'MemeKadai hit today\'s free limit. Back tomorrow!';
  return fallback;
}

// ---------------------------------------------------------------- modal
function openModal(html, { onClose, wide = false } = {}) {
  closeModal();
  const root = $('#modalRoot');
  root.innerHTML = `<div class="modal-back"><div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true">
    <button class="icon-btn modal-x" aria-label="Close">✕</button>${html}</div></div>`;
  const back = $('.modal-back', root);
  const close = () => { closeModal(); onClose?.(); };
  back.addEventListener('mousedown', (e) => { if (e.target === back) close(); });
  $('.modal-x', root).addEventListener('click', close);
  root._esc = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', root._esc);
  document.body.classList.add('no-scroll');
  requestAnimationFrame(() => back.classList.add('in'));
  return $('.modal', root);
}
function closeModal() {
  const root = $('#modalRoot');
  if (root._esc) document.removeEventListener('keydown', root._esc);
  root.innerHTML = '';
  document.body.classList.remove('no-scroll');
}
function confirmBox(text, okLabel = 'Delete') {
  return new Promise((res) => {
    const m = openModal(`<h2 class="modal-title">Are you sure?</h2><p class="muted">${esc(text)}</p>
      <div class="modal-actions"><button class="btn btn-ghost" data-r="0">Cancel</button>
      <button class="btn btn-danger" data-r="1">${esc(okLabel)}</button></div>`, { onClose: () => res(false) });
    $$('[data-r]', m).forEach((b) => b.addEventListener('click', () => { closeModal(); res(b.dataset.r === '1'); }));
  });
}

// ---------------------------------------------------------------- auth
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

async function signIn() {
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    const c = e?.code || '';
    if (c === 'auth/popup-blocked' || c === 'auth/operation-not-supported-in-this-environment') {
      return signInWithRedirect(auth, provider);
    }
    if (c === 'auth/popup-closed-by-user' || c === 'auth/cancelled-popup-request') return;
    if (c === 'auth/operation-not-allowed' || c === 'auth/configuration-not-found') {
      toast('Sign-in is not switched on yet. Please try again later.', 'bad'); return;
    }
    if (c === 'auth/unauthorized-domain') { toast('Sign-in isn\'t allowed on this address yet.', 'bad'); return; }
    toast(errMsg(e, 'Could not sign in. Try again.'), 'bad');
  }
}
function needSignIn(why = 'to do that') {
  if (state.user) return false;
  const m = openModal(`<div class="signin-box">
    <div class="signin-art">🛖</div>
    <h2 class="modal-title">Sign in ${esc(why)}</h2>
    <p class="muted">Vote, comment, save and post your own memes. It takes one tap with Google.</p>
    <button class="btn btn-google btn-block" id="gBtn">
      <svg viewBox="0 0 48 48" width="20" height="20"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
      Continue with Google</button>
    <p class="fine">By signing in you agree to the <a href="#/rules">meme rules</a> and <a href="/terms/">terms</a>.</p></div>`);
  $('#gBtn', m).addEventListener('click', () => { closeModal(); signIn(); });
  return true;
}

async function ensureUser(u) {
  const ref = doc(db, 'users', u.uid);
  const name = (u.displayName || 'Meme lover').slice(0, 60);
  const photo = (u.photoURL || '').slice(0, 1000);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      name, photo, createdAt: serverTimestamp(), seenAt: serverTimestamp(),
      lastPostAt: Timestamp.fromMillis(0), lastCommentAt: Timestamp.fromMillis(0),
    });
  } else {
    await updateDoc(ref, { name, photo, seenAt: serverTimestamp() });
  }
  const t0 = Date.now();
  const fresh = await getDoc(ref);
  const seen = fresh.get('seenAt');
  if (seen) state.offset = seen.toMillis() - (t0 + Date.now()) / 2;
}

async function loadMine() {
  state.saved.clear();
  if (!state.user) return;
  try {
    const s = await getDocs(query(collection(db, 'users', state.user.uid, 'saved'), orderBy('at', 'desc'), limit(300)));
    s.forEach((d) => state.saved.add(d.id));
  } catch (e) { console.warn(e); }
  try { state.liked = new Set(JSON.parse(localStorage.getItem('mk-liked-' + state.user.uid) || '[]')); } catch { state.liked = new Set(); }
}
function rememberLikes() {
  try { localStorage.setItem('mk-liked-' + state.user.uid, JSON.stringify([...state.liked].slice(-2000))); } catch {}
}

function renderAccount() {
  const box = $('#account');
  const u = state.user;
  if (!u) { box.innerHTML = '<button class="btn btn-ghost" id="signInBtn">Sign in</button>'; $('#signInBtn').onclick = signIn; return; }
  box.innerHTML = `<button class="acct-btn" id="acctBtn" aria-haspopup="menu" aria-expanded="false" aria-label="Your account">${avatar(u.photoURL, u.displayName)}</button>
    <div class="menu" id="acctMenu" role="menu" hidden>
      <div class="menu-head">${avatar(u.photoURL, u.displayName)}<div><b>${esc(u.displayName || 'You')}</b></div></div>
      <a role="menuitem" href="#/u/${u.uid}">👤 My memes</a>
      <a role="menuitem" href="#/u/${u.uid}/upvoted">⬆️ Upvoted</a>
      <a role="menuitem" href="#/u/${u.uid}/saved">🔖 Saved</a>
      ${isAdmin() ? '<a role="menuitem" href="#/mod">🛡️ Reports queue</a>' : ''}
      <button role="menuitem" id="signOutBtn">↩︎ Sign out</button>
    </div>`;
  const btn = $('#acctBtn'); const menu = $('#acctMenu');
  btn.onclick = (e) => { e.stopPropagation(); const open = menu.hidden; menu.hidden = !open; btn.setAttribute('aria-expanded', String(open)); };
  document.addEventListener('click', () => { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); });
  $('#signOutBtn').onclick = async () => { await signOut(auth); toast('Signed out'); };
}

let firstAuth = true;
onAuthStateChanged(auth, async (u) => {
  const wasFirst = firstAuth; firstAuth = false;
  if (wasFirst && !u) return; // already rendered signed-out
  state.user = u; state.ready = false; state.votes.clear(); state.liked = new Set();
  renderAccount();
  if (u) {
    try { await ensureUser(u); state.ready = true; } catch (e) { console.error(e); }
    await loadMine();
  } else state.saved.clear();
  feedCache.hash = null; feedCache.frag = null;
  refreshForUser();
});

// ---------------------------------------------------------------- media
const mediaCache = new Map(); // pid → object URL (or Promise)
function loadMedia(pid) {
  if (mediaCache.has(pid)) return mediaCache.get(pid);
  const p = (async () => {
    const ref = doc(db, 'media', pid);
    let snap;
    try { snap = await getDocFromCache(ref); } catch { snap = null; }
    if (!snap || !snap.exists()) snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('missing media');
    const bytes = snap.get('data').toUint8Array();
    const url = URL.createObjectURL(new Blob([bytes], { type: snap.get('mime') }));
    mediaCache.set(pid, url);
    return url;
  })();
  mediaCache.set(pid, p);
  p.catch(() => mediaCache.delete(pid));
  return p;
}
const mediaObserver = new IntersectionObserver((entries) => {
  for (const en of entries) {
    if (!en.isIntersecting) continue;
    mediaObserver.unobserve(en.target);
    const box = en.target; const pid = box.dataset.pid;
    Promise.resolve(loadMedia(pid)).then((url) => {
      const img = $('img.meme', box);
      img.onload = () => box.classList.add('loaded');
      img.src = url;
    }).catch(() => box.classList.add('failed'));
  }
}, { rootMargin: '1200px 0px' });

// ---------------------------------------------------------------- post card
function postCard(id, p, { full = false } = {}) {
  const sec = SECTION[p.section] || SECTION.random;
  const v = state.votes.get(id) || 0;
  const tall = !full && p.h / p.w > 2.1;
  const tags = (p.tags || []).map((t) => `<a class="tag" href="#/tag/${encodeURIComponent(t)}">#${esc(t)}</a>`).join('');
  return `<article class="post card" data-id="${id}" id="post-${id}">
    <header class="post-head">
      <a class="sec" href="#/s/${sec.id}"><span>${sec.ic}</span>${esc(sec.name)}</a>
      <span class="dot">·</span><time datetime="${p.createdAt?.toDate?.().toISOString?.() || ''}">${ago(p.createdAt)}</time>
      <span class="dot">·</span><a class="by" href="#/u/${p.uid}">${esc(p.name)}</a>
      <button class="icon-btn more" data-act="more" aria-label="More options" aria-haspopup="menu">⋯</button>
    </header>
    ${full ? `<h1 class="post-title">${esc(p.title)}</h1>` : `<h2 class="post-title"><a href="#/p/${id}">${esc(p.title)}</a></h2>`}
    <div class="media ${tall ? 'tall' : ''} ${p.nsfw ? 'nsfw' : ''}" data-pid="${id}" style="aspect-ratio:${p.w}/${p.h}">
      <a href="#/p/${id}" class="media-link" ${full ? 'tabindex="-1"' : ''} aria-label="${esc(p.title)}"><img class="meme" alt="${esc(p.title)}" width="${p.w}" height="${p.h}" decoding="async"></a>
      ${p.nsfw ? '<button class="nsfw-cover" data-act="reveal"><b>Sensitive meme</b><span>Tap to view</span></button>' : ''}
      ${tall ? '<button class="expand" data-act="expand">Show full meme ↓</button>' : ''}
      <div class="media-fail">Couldn't load this meme. <button class="link" data-act="retry">Retry</button></div>
    </div>
    ${tags ? `<div class="tags">${tags}</div>` : ''}
    <footer class="actions">
      <div class="vote ${v === 1 ? 'up' : v === -1 ? 'down' : ''}">
        <button class="vbtn vup" data-act="up" aria-label="Upvote" aria-pressed="${v === 1}">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 4 4 13h5v7h6v-7h5z" fill="currentColor"/></svg>
        </button>
        <span class="score" aria-label="points">${fmtNum(p.score)}</span>
        <button class="vbtn vdown" data-act="down" aria-label="Downvote" aria-pressed="${v === -1}">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 20 4 11h5V4h6v7h5z" fill="currentColor"/></svg>
        </button>
      </div>
      <a class="act" href="#/p/${id}${full ? '' : '/c'}" aria-label="Comments">
        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M4 5h16v11H9l-5 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
        <span class="cc">${fmtNum(p.commentCount || 0)}</span></a>
      <span class="spacer"></span>
      <button class="act ${state.saved.has(id) ? 'on' : ''}" data-act="save" aria-label="Save" aria-pressed="${state.saved.has(id)}">
        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M6 3h12v18l-6-4-6 4z" fill="${state.saved.has(id) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg></button>
      <button class="act share" data-act="share" aria-label="Share">
        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M14 5l7 7-7 7v-4c-6 0-9 2-11 5 1-6 4-10 11-11z" fill="currentColor"/></svg><span class="hide-xs">Share</span></button>
    </footer>
  </article>`;
}

function hydrate(container) {
  $$('.media:not([data-obs])', container).forEach((m) => { m.dataset.obs = '1'; mediaObserver.observe(m); });
}

async function loadMyVotes(ids) {
  if (!state.user || !state.ready) return; // refreshForUser() runs again once sign-in is complete
  const uid = state.user.uid;
  const want = ids.filter((id) => !state.votes.has(id));
  await Promise.all(want.map(async (id) => {
    try {
      const s = await getDoc(doc(db, 'posts', id, 'votes', uid));
      if (state.user?.uid === uid && !state.votes.has(id)) state.votes.set(id, s.exists() ? s.get('v') : 0);
    } catch (e) { console.warn('vote state', e.code); }
  }));
  for (const id of ids) paintVote(id);
}
function paintVote(id) {
  const p = state.posts.get(id); if (!p) return;
  const v = state.votes.get(id) || 0;
  $$(`article.post[data-id="${id}"]`).forEach((a) => {
    const box = $('.vote', a);
    box.classList.toggle('up', v === 1); box.classList.toggle('down', v === -1);
    $('.vup', a).setAttribute('aria-pressed', String(v === 1));
    $('.vdown', a).setAttribute('aria-pressed', String(v === -1));
    $('.score', a).textContent = fmtNum(p.score);
  });
}

// ---------------------------------------------------------------- post actions
async function vote(id, dir) {
  if (needSignIn('to vote')) return;
  if (!state.ready) return toast('One moment, still signing you in…');
  const p = state.posts.get(id); if (!p) return;
  const before = state.votes.get(id) || 0;
  const after = before === dir ? 0 : dir;
  // optimistic
  const snapshot = { ...p };
  p.up += (after === 1) - (before === 1);
  p.down += (after === -1) - (before === -1);
  p.score = p.up - p.down;
  state.votes.set(id, after); paintVote(id);
  const uid = state.user.uid;
  state.pending++;
  try {
    await runTransaction(db, async (tx) => {
      const pref = doc(db, 'posts', id);
      const vref = doc(db, 'posts', id, 'votes', uid);
      const ps = await tx.get(pref);
      if (!ps.exists()) throw Object.assign(new Error('gone'), { code: 'not-found' });
      const cur = ps.data();
      const vs = await tx.get(vref);
      const b = vs.exists() ? vs.get('v') : 0;
      const a = b === dir ? 0 : dir;
      if (a === b) return;
      const up = cur.up + (a === 1) - (b === 1);
      const down = cur.down + (a === -1) - (b === -1);
      tx.update(pref, { up, down, score: up - down, hot: hotOf(cur.h0, up - down) });
      if (a) tx.set(vref, { v: a, uid, at: serverTimestamp() }); else tx.delete(vref);
      Object.assign(p, { up, down, score: up - down }); state.votes.set(id, a);
    });
    paintVote(id);
  } catch (e) {
    Object.assign(p, snapshot); state.votes.set(id, before); paintVote(id);
    toast(e.code === 'not-found' ? 'That meme was deleted.' : errMsg(e, 'Your vote didn\'t go through. Try again.'), 'bad');
  } finally { state.pending--; }
}

async function toggleSave(id, btn) {
  if (needSignIn('to save memes')) return;
  const ref = doc(db, 'users', state.user.uid, 'saved', id);
  const on = !state.saved.has(id);
  const paint = (v) => $$(`article.post[data-id="${id}"] [data-act="save"]`).forEach((b) => {
    b.classList.toggle('on', v); b.setAttribute('aria-pressed', String(v)); $('path', b).setAttribute('fill', v ? 'currentColor' : 'none');
  });
  on ? state.saved.add(id) : state.saved.delete(id); paint(on);
  state.pending++;
  try {
    if (on) await setDoc(ref, { at: serverTimestamp() }); else await deleteDoc(ref);
    toast(on ? 'Saved to your collection 🔖' : 'Removed from saved');
  } catch (e) {
    on ? state.saved.delete(id) : state.saved.add(id); paint(!on);
    toast(errMsg(e), 'bad');
  } finally { state.pending--; }
}

function share(id) {
  const p = state.posts.get(id); const url = postUrl(id);
  const text = p ? p.title : 'Meme on MemeKadai';
  if (navigator.share && matchMedia('(pointer: coarse)').matches) {
    navigator.share({ title: text, text: text + ' 😂', url }).catch(() => {});
    return;
  }
  const enc = encodeURIComponent;
  const m = openModal(`<h2 class="modal-title">Share this meme</h2>
    <div class="share-grid">
      <a class="share-opt wa" target="_blank" rel="noopener" href="https://wa.me/?text=${enc(text + ' ' + url)}"><span>🟢</span>WhatsApp</a>
      <a class="share-opt tg" target="_blank" rel="noopener" href="https://t.me/share/url?url=${enc(url)}&text=${enc(text)}"><span>✈️</span>Telegram</a>
      <a class="share-opt x" target="_blank" rel="noopener" href="https://x.com/intent/post?url=${enc(url)}&text=${enc(text)}"><span>𝕏</span>X</a>
      <a class="share-opt fb" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${enc(url)}"><span>📘</span>Facebook</a>
    </div>
    <div class="copy-row"><input readonly value="${esc(url)}" aria-label="Link"><button class="btn btn-accent" id="copyBtn">Copy</button></div>`);
  $('#copyBtn', m).onclick = async () => {
    try { await navigator.clipboard.writeText(url); toast('Link copied 📋'); closeModal(); }
    catch { $('input', m).select(); }
  };
}

function moreMenu(id, anchor) {
  $('.pop')?.remove();
  const p = state.posts.get(id); if (!p) return;
  const mine = state.user?.uid === p.uid;
  const pop = document.createElement('div');
  pop.className = 'menu pop'; pop.setAttribute('role', 'menu');
  pop.innerHTML = `
    <button role="menuitem" data-m="copy">🔗 Copy link</button>
    <button role="menuitem" data-m="download">⬇️ Download</button>
    ${mine ? '' : '<button role="menuitem" data-m="report">🚩 Report</button>'}
    ${mine || isAdmin() ? '<button role="menuitem" class="danger" data-m="delete">🗑️ Delete</button>' : ''}`;
  document.body.append(pop);
  const r = anchor.getBoundingClientRect();
  pop.style.top = `${r.bottom + scrollY + 6}px`;
  pop.style.left = `${Math.max(8, Math.min(r.right + scrollX - pop.offsetWidth, innerWidth - pop.offsetWidth - 8))}px`;
  const off = (e) => { if (!pop.contains(e.target)) { pop.remove(); document.removeEventListener('click', off, true); } };
  setTimeout(() => document.addEventListener('click', off, true));
  pop.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-m]'); if (!b) return;
    pop.remove(); document.removeEventListener('click', off, true);
    if (b.dataset.m === 'copy') { try { await navigator.clipboard.writeText(postUrl(id)); toast('Link copied 📋'); } catch { share(id); } }
    if (b.dataset.m === 'download') download(id);
    if (b.dataset.m === 'report') report(id);
    if (b.dataset.m === 'delete') removePost(id);
  });
}

async function download(id) {
  try {
    const url = await loadMedia(id);
    const p = state.posts.get(id);
    const ext = { 'image/gif': 'gif', 'image/jpeg': 'jpg', 'image/png': 'png' }[p?.mime] || 'webp';
    const a = document.createElement('a');
    a.href = url; a.download = `memekadai-${id}.${ext}`; a.click();
  } catch (e) { toast(errMsg(e, 'Download failed.'), 'bad'); }
}

function report(id) {
  if (needSignIn('to report memes')) return;
  const m = openModal(`<h2 class="modal-title">Report this meme</h2>
    <p class="muted">What's wrong with it? Reports are anonymous to the poster.</p>
    <div class="radio-list">${REPORT_REASONS.map(([k, v], i) => `<label class="radio"><input type="radio" name="reason" value="${k}" ${i === 0 ? 'checked' : ''}><span>${v}</span></label>`).join('')}</div>
    <div class="modal-actions"><button class="btn btn-ghost" data-x>Cancel</button><button class="btn btn-danger" id="repBtn">Report</button></div>`);
  $('[data-x]', m).onclick = closeModal;
  $('#repBtn', m).onclick = async () => {
    const reason = $('input[name=reason]:checked', m).value;
    $('#repBtn', m).disabled = true;
    try {
      const b = writeBatch(db);
      b.set(doc(db, 'posts', id, 'reports', state.user.uid), { reason, at: serverTimestamp() });
      b.update(doc(db, 'posts', id), { reports: increment(1) });
      await b.commit();
      closeModal(); toast('Thanks. We\'ll take a look. 🛡️');
    } catch (e) {
      closeModal(); toast(errMsg(e, 'You already reported this meme.'), 'bad');
    }
  };
}

async function removePost(id) {
  if (!(await confirmBox('This meme and its votes will be gone for good.'))) return;
  try {
    const b = writeBatch(db);
    b.delete(doc(db, 'posts', id));
    b.delete(doc(db, 'media', id));
    await b.commit();
    $$(`article.post[data-id="${id}"]`).forEach((a) => a.remove());
    state.posts.delete(id);
    toast('Meme deleted');
    if (location.hash.startsWith('#/p/')) go('#/');
  } catch (e) { toast(errMsg(e, 'Could not delete it.'), 'bad'); }
}

// one delegated listener for every post card
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const art = b.closest('article.post'); const id = art?.dataset.id;
  const act = b.dataset.act;
  if (act === 'upload') { e.preventDefault(); return openUpload(); }
  if (!id) return;
  e.preventDefault();
  if (act === 'up') vote(id, 1);
  else if (act === 'down') vote(id, -1);
  else if (act === 'save') toggleSave(id, b);
  else if (act === 'share') share(id);
  else if (act === 'more') { e.stopPropagation(); moreMenu(id, b); }
  else if (act === 'reveal') b.closest('.media').classList.remove('nsfw');
  else if (act === 'expand') b.closest('.media').classList.remove('tall');
  else if (act === 'retry') { const m = b.closest('.media'); m.classList.remove('failed'); mediaObserver.observe(m); }
});

// ---------------------------------------------------------------- feeds
function feedQuery(f, cursor) {
  const parts = [];
  const c = collection(db, 'posts');
  if (f.kind === 'user') {
    parts.push(where('uid', '==', f.uid), orderBy('createdAt', 'desc'));
  } else if (f.kind === 'search') {
    parts.push(where('kw', 'array-contains', f.q), orderBy('score', 'desc'));
  } else {
    if (f.section) parts.push(where('section', '==', f.section));
    const day = Math.floor(nowServer() / 86400000);
    if (f.sort === 'hot') parts.push(orderBy('hot', 'desc'));
    if (f.sort === 'trending') parts.push(where('dayNum', 'in', [day, day - 1, day - 2]), orderBy('score', 'desc'));
    if (f.sort === 'fresh') parts.push(orderBy('createdAt', 'desc'));
    if (f.sort === 'top') parts.push(orderBy('score', 'desc'));
  }
  if (cursor) parts.push(startAfter(cursor));
  parts.push(limit(PAGE));
  return query(c, ...parts);
}

function visible(p) { return isAdmin() || (p.reports || 0) < HIDE_AT_REPORTS; }

function emptyState(f) {
  const what = f.kind === 'search' ? `No memes match “${esc(f.q)}” yet.`
    : f.kind === 'user' ? (state.user?.uid === f.uid ? 'You haven\'t posted any memes yet.' : 'No memes from this person yet.')
    : f.sort === 'trending' ? 'Nothing trending in the last 3 days. Go make something trend!'
    : 'The shelves are empty. Be the first to stock this kadai!';
  return `<div class="empty card"><div class="empty-art">🛖</div><p>${what}</p>
    <button class="btn btn-accent" data-action="upload">Post a meme</button></div>`;
}

// Generic infinite list. fetchPage(cursor) → { items:[[id,data]], cursor, done }
function infiniteList(list, fetchPage, emptyHtml) {
  const myView = state.view;
  let cursor = null; let done = false; let busy = false; let count = 0;
  const sentinel = document.createElement('div');
  sentinel.className = 'sentinel';
  sentinel.innerHTML = skeleton();
  list.after(sentinel);
  async function more() {
    if (busy || done || myView !== state.view) return;
    busy = true;
    try {
      const page = await fetchPage(cursor);
      if (myView !== state.view) return;
      cursor = page.cursor; done = page.done;
      const fresh = page.items.filter(([id, p]) => p && visible(p));
      fresh.forEach(([id, p]) => state.posts.set(id, p));
      list.insertAdjacentHTML('beforeend', fresh.map(([id, p]) => postCard(id, p)).join(''));
      count += fresh.length;
      hydrate(list);
      loadMyVotes(fresh.map(([id]) => id));
      if (done) sentinel.innerHTML = count ? '<p class="end">You\'ve reached the back of the shop 🛖</p>' : emptyHtml;
      else if (fresh.length === 0) { busy = false; return more(); }
    } catch (e) {
      sentinel.innerHTML = `<p class="end">${esc(errMsg(e, 'Couldn\'t load memes.'))} <button class="link" id="retryFeed">Retry</button></p>`;
      $('#retryFeed', sentinel)?.addEventListener('click', () => { sentinel.innerHTML = skeleton(); busy = false; more(); });
      busy = false; return;
    }
    busy = false;
    // keep filling while the sentinel is still on screen
    const r = sentinel.getBoundingClientRect();
    if (!done && r.top < innerHeight + 1200) more();
  }
  const io = new IntersectionObserver((en) => { if (en[0].isIntersecting) more(); }, { rootMargin: '1200px 0px' });
  io.observe(sentinel);
  more();
}

function postsPager(f) {
  return async (cursor) => {
    const s = await getDocs(feedQuery(f, cursor));
    return { items: s.docs.map((d) => [d.id, d.data()]), cursor: s.docs[s.docs.length - 1], done: s.size < PAGE };
  };
}

function skeleton() {
  return `<div class="card post skel" aria-hidden="true"><div class="sk sk-line w40"></div><div class="sk sk-line w80"></div><div class="sk sk-media"></div></div>`;
}

function sortTabs(base, active) {
  return `<div class="tabs" role="tablist">${SORTS.map((s) =>
    `<a role="tab" class="tab ${s.id === active ? 'on' : ''}" aria-selected="${s.id === active}" href="${base}${s.id}">${s.ic} ${s.name}</a>`).join('')}</div>`;
}

function viewFeed(f) {
  const main = $('#main');
  let head = '';
  if (f.kind === 'search') {
    head = `<div class="feed-head card"><h1>Search: “${esc(f.q)}”</h1><p class="muted">Matching words in titles and #tags, best first.</p></div>`;
  } else if (f.section) {
    const s = SECTION[f.section];
    head = `<div class="feed-head card sec-head"><div class="sec-big">${s.ic}</div><div><h1>${esc(s.name)}</h1>
      <p class="muted">Memes in ${esc(s.name)}</p></div><button class="btn btn-accent" data-action="upload">Post here</button></div>
      ${sortTabs(`#/s/${f.section}/`, f.sort)}`;
  } else {
    head = `<h1 class="sr-only">${SORTS.find((s) => s.id === f.sort).name} memes</h1>${sortTabs('#/', f.sort)}`;
  }
  main.innerHTML = `${head}<div class="feed" id="feed"></div>`;
  main.dataset.feed = location.hash || '#/';
  infiniteList($('#feed'), postsPager(f), emptyState(f));
  setActiveNav(f.section ? 's:' + f.section : f.kind === 'feed' ? f.sort : '');
}

// ---------------------------------------------------------------- single post
async function viewPost(id, jumpToComments) {
  const main = $('#main');
  const myView = state.view;
  main.innerHTML = `<div class="feed">${skeleton()}</div>`;
  let snap;
  try { snap = await getDoc(doc(db, 'posts', id)); } catch (e) {
    main.innerHTML = `<div class="empty card"><p>${esc(errMsg(e, 'Couldn\'t load this meme.'))}</p></div>`; return;
  }
  if (myView !== state.view) return;
  if (!snap.exists()) {
    main.innerHTML = `<div class="empty card"><div class="empty-art">🫥</div><p>This meme is gone. It may have been deleted.</p><a class="btn btn-accent" href="#/">Back to Hot</a></div>`;
    return;
  }
  const p = snap.data(); state.posts.set(id, p);
  document.title = `${p.title} — MemeKadai`;
  main.innerHTML = `<a class="back" href="#/" onclick="if(history.length>1){history.back();return false}">← Back</a>
    <div class="feed">${postCard(id, p, { full: true })}</div>
    <section class="card comments" id="comments" aria-label="Comments">
      <div class="c-head"><h2>${fmtNum(p.commentCount || 0)} comment${p.commentCount === 1 ? '' : 's'}</h2>
        <div class="seg" role="tablist"><button class="on" data-csort="hot">Hot</button><button data-csort="fresh">Fresh</button></div></div>
      <div id="composer"></div>
      <div id="clist" class="clist"><div class="sk sk-line w60"></div><div class="sk sk-line w40"></div></div>
    </section>`;
  hydrate(main);
  loadMyVotes([id]);
  renderComposer($('#composer'), id, '');
  const comments = await loadComments(id);
  if (myView !== state.view) return;
  const list = $('#clist');
  list._comments = comments; list._sort = 'hot';
  list._repaint = () => renderComments(id, list._comments, list._sort);
  list._repaint();
  $$('[data-csort]').forEach((b) => b.addEventListener('click', () => {
    list._sort = b.dataset.csort; $$('[data-csort]').forEach((x) => x.classList.toggle('on', x === b)); list._repaint();
  }));
  if (jumpToComments) $('#comments').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function loadComments(pid) {
  try {
    const s = await getDocs(query(collection(db, 'posts', pid, 'comments'), orderBy('createdAt', 'asc'), limit(300)));
    return s.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) { toast(errMsg(e, 'Couldn\'t load comments.'), 'bad'); return []; }
}

function renderComments(pid, comments, sort) {
  const list = $('#clist'); if (!list) return;
  const tops = comments.filter((c) => !c.parent);
  const kids = (cid) => comments.filter((c) => c.parent === cid);
  const ms = (c) => c.createdAt?.toMillis?.() ?? Date.now();
  tops.sort(sort === 'hot' ? (a, b) => (b.likes - a.likes) || (ms(b) - ms(a)) : (a, b) => ms(b) - ms(a));
  if (!tops.length) { list.innerHTML = '<p class="muted c-empty">No comments yet. Say something funny 😄</p>'; return; }
  list.innerHTML = tops.map((c) => commentHtml(c) + `<div class="replies">${kids(c.id).map(commentHtml).join('')}</div>`).join('');
}
function commentHtml(c) {
  const liked = state.liked.has(c.id);
  const canDel = state.user && (state.user.uid === c.uid || isAdmin());
  return `<div class="cmt" data-cid="${c.id}" data-parent="${c.parent || c.id}">
    <a href="#/u/${c.uid}">${avatar(c.photo, c.name)}</a>
    <div class="cmt-body">
      <div class="cmt-meta"><a class="by" href="#/u/${c.uid}">${esc(c.name)}</a> <span class="muted">· ${ago(c.createdAt)}</span></div>
      <p class="cmt-text">${esc(c.text)}</p>
      <div class="cmt-acts">
        <button class="cact ${liked ? 'on' : ''}" data-cact="like" aria-pressed="${liked}">${liked ? '❤️' : '🤍'} <span>${c.likes || ''}</span></button>
        <button class="cact" data-cact="reply">Reply</button>
        ${canDel ? '<button class="cact" data-cact="del">Delete</button>' : ''}
      </div>
      <div class="reply-slot"></div>
    </div></div>`;
}

function renderComposer(box, pid, parent, prefill = '') {
  if (!state.user) {
    box.innerHTML = `<button class="composer-signin" id="cSign">${avatar('', '?')}<span>Sign in to join the conversation…</span></button>`;
    $('#cSign', box).onclick = () => needSignIn('to comment');
    return;
  }
  box.innerHTML = `<form class="composer">${avatar(state.user.photoURL, state.user.displayName)}
    <div class="composer-in"><textarea maxlength="1000" rows="${parent ? 2 : 2}" placeholder="${parent ? 'Write a reply…' : 'Leave a comment…'}" required>${esc(prefill)}</textarea>
    <div class="composer-row"><span class="muted count">0/1000</span>
    ${parent ? '<button type="button" class="btn btn-ghost btn-sm" data-cancel>Cancel</button>' : ''}
    <button class="btn btn-accent btn-sm" type="submit">${parent ? 'Reply' : 'Post'}</button></div></div></form>`;
  const ta = $('textarea', box); const count = $('.count', box);
  const upd = () => { count.textContent = `${ta.value.length}/1000`; };
  ta.addEventListener('input', upd); upd();
  if (parent) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }
  $('[data-cancel]', box)?.addEventListener('click', () => { box.innerHTML = ''; });
  $('form', box).addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = ta.value.trim(); if (!text) return;
    if (!state.ready) return toast('One moment, still signing you in…');
    const btn = $('button[type=submit]', box); btn.disabled = true;
    const ref = doc(collection(db, 'posts', pid, 'comments'));
    const c = { text, uid: state.user.uid, name: (state.user.displayName || 'Meme lover').slice(0, 60), photo: (state.user.photoURL || '').slice(0, 1000), createdAt: serverTimestamp(), parent, likes: 0 };
    try {
      const b = writeBatch(db);
      b.set(ref, c);
      b.update(doc(db, 'posts', pid), { commentCount: increment(1) });
      b.update(doc(db, 'users', state.user.uid), { lastCommentAt: serverTimestamp() });
      await b.commit();
      const list = $('#clist');
      if (!list._comments) return;
      list._comments.push({ ...c, id: ref.id, createdAt: Timestamp.fromMillis(nowServer()) });
      list._repaint();
      const p = state.posts.get(pid); if (p) { p.commentCount = (p.commentCount || 0) + 1; bumpCommentCount(pid, p.commentCount); }
      if (parent) box.innerHTML = ''; else { ta.value = ''; upd(); }
      $(`.cmt[data-cid="${ref.id}"]`)?.classList.add('flash');
    } catch (e) {
      toast(errMsg(e, 'Slow down a little: one comment every few seconds.'), 'bad');
    } finally { btn.disabled = false; }
  });
}
function bumpCommentCount(pid, n) {
  $$(`article.post[data-id="${pid}"] .cc`).forEach((el) => { el.textContent = fmtNum(n); });
  const h = $('.c-head h2'); if (h) h.textContent = `${fmtNum(n)} comment${n === 1 ? '' : 's'}`;
}

document.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-cact]'); if (!b) return;
  const cmt = b.closest('.cmt'); const cid = cmt.dataset.cid;
  const pid = location.hash.match(/#\/p\/([^/]+)/)?.[1]; if (!pid) return;
  const list = $('#clist'); const comments = list._comments || [];
  const c = comments.find((x) => x.id === cid); if (!c) return;
  const act = b.dataset.cact;
  if (act === 'reply') {
    if (needSignIn('to reply')) return;
    const slot = $('.reply-slot', cmt);
    renderComposer(slot, pid, cmt.dataset.parent, c.parent ? `@${c.name} ` : '');
  }
  if (act === 'like') {
    if (needSignIn('to like comments')) return;
    b.disabled = true;
    try {
      let liked;
      await runTransaction(db, async (tx) => {
        const cref = doc(db, 'posts', pid, 'comments', cid);
        const lref = doc(db, 'posts', pid, 'comments', cid, 'likes', state.user.uid);
        const cs = await tx.get(cref); const ls = await tx.get(lref);
        if (!cs.exists()) throw new Error('gone');
        liked = !ls.exists();
        tx.update(cref, { likes: increment(liked ? 1 : -1) });
        if (liked) tx.set(lref, { at: serverTimestamp() }); else tx.delete(lref);
        c.likes = (cs.get('likes') || 0) + (liked ? 1 : -1);
      });
      liked ? state.liked.add(cid) : state.liked.delete(cid); rememberLikes();
      list._repaint();
    } catch (err) { toast(errMsg(err), 'bad'); b.disabled = false; }
  }
  if (act === 'del') {
    if (!(await confirmBox('Delete this comment?'))) return;
    try {
      const bt = writeBatch(db);
      bt.delete(doc(db, 'posts', pid, 'comments', cid));
      bt.update(doc(db, 'posts', pid), { commentCount: increment(-1) });
      await bt.commit();
      list._comments = comments.filter((x) => x.id !== cid && x.parent !== cid);
      list._repaint();
      const p = state.posts.get(pid); if (p) { p.commentCount = Math.max(0, (p.commentCount || 1) - 1); bumpCommentCount(pid, p.commentCount); }
    } catch (err) { toast(errMsg(err, 'Couldn\'t delete it.'), 'bad'); }
  }
});

// ---------------------------------------------------------------- profile
async function viewUser(uid, tab = 'posts') {
  const main = $('#main');
  const myView = state.view;
  const own = state.user?.uid === uid;
  if (!own && tab !== 'posts') tab = 'posts';
  main.innerHTML = `<div class="card profile"><div class="sk sk-line w40"></div></div>`;
  let u;
  try { u = await getDoc(doc(db, 'users', uid)); } catch (e) { u = null; }
  if (myView !== state.view) return;
  if (!u || !u.exists()) { main.innerHTML = '<div class="empty card"><div class="empty-art">🫥</div><p>We couldn\'t find that person.</p></div>'; return; }
  const d = u.data();
  document.title = `${d.name} — MemeKadai`;
  const tabs = [['posts', 'Memes'], ...(own ? [['upvoted', 'Upvoted'], ['saved', 'Saved']] : [])];
  main.innerHTML = `<div class="card profile">${avatar(d.photo, d.name, 'av av-xl')}
      <div><h1>${esc(d.name)}</h1><p class="muted">In the kadai since ${d.createdAt?.toDate?.().toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) || 'recently'}</p></div></div>
    <div class="tabs">${tabs.map(([k, v]) => `<a class="tab ${k === tab ? 'on' : ''}" href="#/u/${uid}${k === 'posts' ? '' : '/' + k}">${v}</a>`).join('')}</div>
    <div class="feed" id="feed"></div>`;
  main.dataset.feed = location.hash;
  const list = $('#feed');
  if (tab === 'posts') return infiniteList(list, postsPager({ kind: 'user', uid }), emptyState({ kind: 'user', uid }));
  // upvoted / saved: page through pointer docs, then fetch the posts
  const pointerQuery = (cursor) => {
    const base = tab === 'saved'
      ? [collection(db, 'users', uid, 'saved'), orderBy('at', 'desc')]
      : [collectionGroup(db, 'votes'), where('uid', '==', uid), where('v', '==', 1), orderBy('at', 'desc')];
    return query(base[0], ...base.slice(1), ...(cursor ? [startAfter(cursor)] : []), limit(PAGE));
  };
  infiniteList(list, async (cursor) => {
    const s = await getDocs(pointerQuery(cursor));
    const ids = s.docs.map((d) => (tab === 'saved' ? d.id : d.ref.parent.parent.id));
    const posts = await Promise.all(ids.map(async (id) => { try { const p = await getDoc(doc(db, 'posts', id)); return [id, p.exists() ? p.data() : null]; } catch { return [id, null]; } }));
    return { items: posts, cursor: s.docs[s.docs.length - 1], done: s.size < PAGE };
  }, `<div class="empty card"><div class="empty-art">${tab === 'saved' ? '🔖' : '⬆️'}</div><p>${tab === 'saved' ? 'Memes you save show up here.' : 'Memes you upvote show up here.'}</p></div>`);
}

// ---------------------------------------------------------------- moderation
async function viewMod() {
  const main = $('#main');
  if (!isAdmin()) { main.innerHTML = '<div class="empty card"><p>Only shop keepers can see this page.</p></div>'; return; }
  main.innerHTML = `<div class="feed-head card"><h1>🛡️ Reports queue</h1><p class="muted">Memes with reports, most reported first. Memes with ${HIDE_AT_REPORTS}+ reports are hidden from everyone else until you keep them.</p></div><div id="modList" class="feed"></div>`;
  try {
    const s = await getDocs(query(collection(db, 'posts'), where('reports', '>', 0), orderBy('reports', 'desc'), limit(50)));
    const list = $('#modList');
    if (s.empty) { list.innerHTML = '<div class="empty card"><div class="empty-art">✨</div><p>No reports. The shop is clean.</p></div>'; return; }
    for (const d of s.docs) {
      const p = d.data(); state.posts.set(d.id, p);
      const reasons = await getDocs(collection(db, 'posts', d.id, 'reports'));
      const tally = {}; reasons.forEach((r) => { tally[r.get('reason')] = (tally[r.get('reason')] || 0) + 1; });
      list.insertAdjacentHTML('beforeend', `<div class="mod-item" data-id="${d.id}">
        <div class="mod-bar card"><b>${p.reports} report${p.reports > 1 ? 's' : ''}</b>
          <span class="muted">${Object.entries(tally).map(([k, v]) => `${k} ×${v}`).join(' · ')}</span>
          <span class="spacer"></span>
          <button class="btn btn-ghost btn-sm" data-mod="keep">Keep</button>
          <button class="btn btn-danger btn-sm" data-mod="delete">Delete</button></div>
        ${postCard(d.id, p)}</div>`);
    }
    hydrate(list);
    list.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-mod]'); if (!b) return;
      const item = b.closest('.mod-item'); const id = item.dataset.id;
      if (b.dataset.mod === 'delete') { await removePost(id); item.remove(); return; }
      try {
        const bt = writeBatch(db);
        bt.update(doc(db, 'posts', id), { reports: 0 });
        const r = await getDocs(collection(db, 'posts', id, 'reports'));
        r.forEach((x) => bt.delete(x.ref));
        await bt.commit(); item.remove(); toast('Kept. Reports cleared.');
      } catch (err) { toast(errMsg(err), 'bad'); }
    });
  } catch (e) { $('#modList').innerHTML = `<div class="empty card"><p>${esc(errMsg(e))}</p></div>`; }
}

// ---------------------------------------------------------------- rules page
function viewRules() {
  $('#main').innerHTML = `<article class="card prose">
    <h1>Meme rules 🛖</h1>
    <p>MemeKadai is a friendly corner shop. Keep it fun for everyone.</p>
    <h2>Post</h2>
    <ul>
      <li><b>Your own memes, or ones you're allowed to share.</b> Don't repost other people's work as yours. Credit the creator in the title when you can.</li>
      <li><b>Images only</b> (JPG, PNG, WebP or GIF). We shrink big pictures automatically. GIFs must be under 900 KB.</li>
      <li><b>Pick the right section</b> and add up to 5 #tags so people can find it.</li>
      <li><b>Mark it sensitive</b> if it's crude or gross. It gets blurred until someone taps it.</li>
    </ul>
    <h2>Not allowed</h2>
    <ul>
      <li>Nudity, porn or sexual content of any kind, and anything involving minors.</li>
      <li>Hate, slurs or attacks on people for their religion, race, caste, gender or nationality.</li>
      <li>Gore, real violence, self-harm or threats.</li>
      <li>Private info about anyone, or memes made to bully a real, private person.</li>
      <li>Spam, scams, ads and links to them.</li>
    </ul>
    <h2>Reports and removal</h2>
    <p>Use <b>⋯ → Report</b> on any meme. Memes with ${HIDE_AT_REPORTS} or more reports are hidden until a shop keeper reviews them, and anything that breaks these rules is deleted. Accounts that keep breaking them are removed.</p>
    <p>If you own a meme posted here and want it taken down, report it as <b>Stolen / copyright</b> or contact us through <a href="/#contact">anniyan.online</a>. We act on valid requests quickly.</p>
    <p class="muted">See also the <a href="/terms/">terms</a> and <a href="/privacy/">privacy policy</a>.</p>
  </article>`;
  setActiveNav('');
}

// ---------------------------------------------------------------- upload
async function processImage(file) {
  if (!/^image\/(png|jpe?g|webp|gif)$/i.test(file.type)) throw new Error('Pick a JPG, PNG, WebP or GIF image.');
  if (file.size > 25 * 1024 * 1024) throw new Error('That file is over 25 MB. Pick a smaller one.');
  const dims = await new Promise((res, rej) => {
    const img = new Image(); const u = URL.createObjectURL(file);
    img.onload = () => { res({ w: img.naturalWidth, h: img.naturalHeight, img }); };
    img.onerror = () => rej(new Error('That image couldn\'t be opened.'));
    img.src = u;
  });
  if (file.type === 'image/gif' && file.size <= MAX_MEDIA) {
    return { bytes: new Uint8Array(await file.arrayBuffer()), mime: 'image/gif', w: dims.w, h: dims.h, note: 'Animated GIF kept as is.' };
  }
  let note = file.type === 'image/gif' ? 'GIF was too big to keep animated (900 KB max), so it was turned into a still image.' : '';
  let bmp;
  try { bmp = await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch { bmp = dims.img; }
  const sw = bmp.width; const sh = bmp.height;
  let scale = Math.min(1, MAX_W / sw, 11000 / sh);
  for (let pass = 0; pass < 6; pass++) {
    const w = Math.max(1, Math.round(sw * scale)); const h = Math.max(1, Math.round(sh * scale));
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bmp, 0, 0, w, h);
    for (const q of [0.86, 0.78, 0.68, 0.58]) {
      let blob = await new Promise((r) => cv.toBlob(r, 'image/webp', q));
      if (!blob || blob.type !== 'image/webp') blob = await new Promise((r) => cv.toBlob(r, 'image/jpeg', q));
      if (blob.size <= TARGET_MEDIA || (q === 0.58 && blob.size <= MAX_MEDIA)) {
        return { bytes: new Uint8Array(await blob.arrayBuffer()), mime: blob.type, w, h, note };
      }
    }
    scale *= 0.8;
  }
  throw new Error('That image is too big even after shrinking. Try a smaller one.');
}

function keywords(title, tags) {
  const words = (title.toLowerCase().match(/[\p{L}\p{N}]+/gu) || []).filter((w) => w.length >= 2);
  return [...new Set([...tags, ...words])].slice(0, 30);
}
function parseTags(s) {
  return [...new Set((s.toLowerCase().match(/[\p{L}\p{N}_]+/gu) || []).map((t) => t.slice(0, 24)))].slice(0, 5);
}

function openUpload(presetSection) {
  if (needSignIn('to post memes')) return;
  const sec = presetSection || (location.hash.match(/#\/s\/([^/]+)/)?.[1]) || '';
  const m = openModal(`<h2 class="modal-title">Post a meme</h2>
    <form id="upForm" class="upform">
      <label class="drop" id="drop" tabindex="0">
        <input type="file" id="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden>
        <div class="drop-empty"><div class="drop-ic">🖼️</div><b>Drop an image, paste it, or tap to choose</b><span class="muted">JPG, PNG, WebP or GIF</span></div>
        <img id="preview" alt="Preview" hidden>
      </label>
      <p class="muted small" id="imgNote"></p>
      <label class="field"><span>Title <em class="count" id="tCount">0/140</em></span>
        <input id="title" maxlength="140" required placeholder="Say something funny about it"></label>
      <div class="row2">
        <label class="field"><span>Section</span>
          <select id="section" required><option value="">Choose…</option>
          ${SECTIONS.map((s) => `<option value="${s.id}" ${s.id === sec ? 'selected' : ''}>${s.ic} ${esc(s.name)}</option>`).join('')}</select></label>
        <label class="field"><span>Tags <em>up to 5</em></span><input id="tags" placeholder="cricket, monday, relatable"></label>
      </div>
      <label class="check"><input type="checkbox" id="nsfw"> <span>Sensitive (crude or gross): blur it until tapped</span></label>
      <label class="check"><input type="checkbox" id="agree" required> <span>I made this or am allowed to share it, and it follows the <a href="#/rules" target="_blank">meme rules</a>.</span></label>
      <div class="modal-actions"><button type="button" class="btn btn-ghost" data-x>Cancel</button>
        <button class="btn btn-accent" id="postBtn" type="submit" disabled>Post meme</button></div>
    </form>`, { wide: true });
  let processed = null;
  const fileIn = $('#file', m); const drop = $('#drop', m); const prev = $('#preview', m);
  const note = $('#imgNote', m); const postBtn = $('#postBtn', m); const title = $('#title', m);
  const check = () => { postBtn.disabled = !(processed && title.value.trim() && $('#section', m).value && $('#agree', m).checked); };
  title.addEventListener('input', () => { $('#tCount', m).textContent = `${title.value.length}/140`; check(); });
  $('#section', m).addEventListener('change', check); $('#agree', m).addEventListener('change', check);
  $('[data-x]', m).onclick = closeModal;
  async function take(file) {
    if (!file) return;
    note.textContent = 'Getting it ready…'; note.className = 'muted small';
    processed = null; check();
    try {
      processed = await processImage(file);
      prev.src = URL.createObjectURL(new Blob([processed.bytes], { type: processed.mime }));
      prev.hidden = false; drop.classList.add('has');
      note.textContent = `${processed.w}×${processed.h} · ${Math.round(processed.bytes.length / 1024)} KB${processed.note ? ' · ' + processed.note : ''}`;
      if (!title.value) title.focus();
    } catch (e) { note.textContent = e.message; note.className = 'small bad-text'; prev.hidden = true; drop.classList.remove('has'); }
    check();
  }
  fileIn.addEventListener('change', () => take(fileIn.files[0]));
  drop.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileIn.click(); } });
  ['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', (e) => take(e.dataTransfer.files[0]));
  const onPaste = (e) => { const f = [...(e.clipboardData?.files || [])].find((x) => x.type.startsWith('image/')); if (f) take(f); };
  document.addEventListener('paste', onPaste);
  const stopPaste = new MutationObserver(() => { if (!document.body.contains(m)) { document.removeEventListener('paste', onPaste); stopPaste.disconnect(); } });
  stopPaste.observe($('#modalRoot'), { childList: true });

  $('#upForm', m).addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!processed) return;
    if (!state.ready) return toast('One moment, still signing you in…');
    postBtn.disabled = true; postBtn.textContent = 'Posting…';
    const tags = parseTags($('#tags', m).value);
    const t = title.value.trim().slice(0, 140);
    const h0 = nowServer() / 3600000;
    const ref = doc(collection(db, 'posts'));
    const data = {
      title: t, section: $('#section', m).value, tags, kw: keywords(t, tags), nsfw: $('#nsfw', m).checked,
      uid: state.user.uid, name: (state.user.displayName || 'Meme lover').slice(0, 60), photo: (state.user.photoURL || '').slice(0, 1000),
      createdAt: serverTimestamp(), h0, hot: h0, dayNum: Math.floor(h0 / 24),
      up: 0, down: 0, score: 0, commentCount: 0, reports: 0, w: processed.w, h: processed.h, mime: processed.mime,
    };
    try {
      const b = writeBatch(db);
      b.set(doc(db, 'media', ref.id), { data: Bytes.fromUint8Array(processed.bytes), mime: processed.mime, uid: state.user.uid });
      b.set(ref, data);
      b.update(doc(db, 'users', state.user.uid), { lastPostAt: serverTimestamp() });
      await b.commit();
      mediaCache.set(ref.id, URL.createObjectURL(new Blob([processed.bytes], { type: processed.mime })));
      closeModal();
      toast('Your meme is live! 🎉', 'good');
      go(`#/p/${ref.id}`);
      gtag?.('event', 'post_meme', { section: data.section });
    } catch (err) {
      postBtn.disabled = false; postBtn.textContent = 'Post meme';
      note.className = 'small bad-text';
      note.textContent = errMsg(err, 'Couldn\'t post. You can post one meme a minute, so wait a bit and try again.');
    }
  });
}

// ---------------------------------------------------------------- nav, router
function buildNav() {
  $('#sectionLinks').innerHTML = SECTIONS.map((s) => `<a class="side-link" data-nav="s:${s.id}" href="#/s/${s.id}"><span class="ic">${s.ic}</span>${esc(s.name)}</a>`).join('');
  $('#railSections').innerHTML = SECTIONS.map((s) => `<a class="chip" href="#/s/${s.id}">${s.ic} ${esc(s.name)}</a>`).join('');
}
function setActiveNav(key) {
  $$('.side-link').forEach((a) => a.classList.toggle('on', a.dataset.nav === key));
}
function go(hash) { if (location.hash === hash) route(); else location.hash = hash; }

function stashFeed() {
  const main = $('#main');
  if (!main.dataset.feed) return;
  const frag = document.createDocumentFragment();
  while (main.firstChild) frag.append(main.firstChild);
  Object.assign(feedCache, { hash: main.dataset.feed, frag, y: scrollY, view: state.view });
  main.removeAttribute('data-feed');
}
function restoreFeed() {
  const main = $('#main');
  main.innerHTML = '';
  main.append(feedCache.frag);
  main.dataset.feed = feedCache.hash;
  state.view = feedCache.view;
  const y = feedCache.y;
  feedCache.hash = null; feedCache.frag = null;
  repaintAll();
  requestAnimationFrame(() => window.scrollTo(0, y));
}
// Bring vote, save and comment-count UI in line with state (after sign-in or coming back)
function repaintAll() {
  for (const a of $$('#main article.post')) {
    const id = a.dataset.id; const p = state.posts.get(id);
    if (!p) { a.remove(); continue; }
    paintVote(id);
    const on = state.saved.has(id);
    const sb = $('[data-act="save"]', a);
    if (sb) { sb.classList.toggle('on', on); sb.setAttribute('aria-pressed', String(on)); $('path', sb).setAttribute('fill', on ? 'currentColor' : 'none'); }
    $$('.cc', a).forEach((el) => { el.textContent = fmtNum(p.commentCount || 0); });
  }
}
function refreshForUser() {
  const h = location.hash;
  if (/^#\/(u|mod)/.test(h)) return route();
  const ids = $$('#main article.post').map((a) => a.dataset.id);
  repaintAll();
  loadMyVotes(ids);
  const pid = h.match(/^#\/p\/([^/]+)/)?.[1];
  if (pid && $('#composer')) { renderComposer($('#composer'), pid, ''); $('#clist')?._repaint?.(); }
}

function route() {
  closeMenus();
  const hash = location.hash || '#/';
  const cameBack = feedCache.hash === hash && feedCache.frag;
  stashFeed();
  if (cameBack) { restoreFeed(); setActiveNavFor(hash); return; }
  state.view = ++viewSeq;
  const h = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  const [a, b, c] = h.split('/');
  document.title = 'MemeKadai — Fresh memes, every day | Anniyan';
  window.scrollTo(0, 0);
  if (!a || SORTS.some((s) => s.id === a)) viewFeed({ kind: 'feed', sort: a || 'hot' });
  else if (a === 's' && SECTION[b]) viewFeed({ kind: 'feed', section: b, sort: SORTS.some((s) => s.id === c) ? c : 'hot' });
  else if (a === 'p' && b) viewPost(b, c === 'c');
  else if (a === 'u' && b) { viewUser(b, c || 'posts'); setActiveNav(''); }
  else if (a === 'tag' && b) { viewFeed({ kind: 'search', q: b.toLowerCase() }); }
  else if (a === 'search' && b) { viewFeed({ kind: 'search', q: b.toLowerCase() }); }
  else if (a === 'mod') { viewMod(); setActiveNav(''); }
  else if (a === 'rules') viewRules();
  else if (a === 'upload') { viewFeed({ kind: 'feed', sort: 'hot' }); setTimeout(() => openUpload(), 50); }
  else $('#main').innerHTML = '<div class="empty card"><div class="empty-art">🤷</div><p>Nothing on this shelf.</p><a class="btn btn-accent" href="#/">Back to Hot</a></div>';
  gtag?.('event', 'page_view', { page_path: location.pathname + location.hash });
}

function setActiveNavFor(hash) {
  const [a, b] = hash.replace(/^#\/?/, '').split('/');
  setActiveNav(a === 's' ? 's:' + b : SORTS.some((s) => s.id === a) ? a : !a ? 'hot' : '');
}

function closeMenus() {
  document.body.classList.remove('side-open');
  $('#scrim').hidden = true; $('#menuBtn').setAttribute('aria-expanded', 'false');
  $('.pop')?.remove();
}

// ---------------------------------------------------------------- boot
buildNav();
window.addEventListener('hashchange', route);
$('#uploadBtn').addEventListener('click', () => openUpload());
document.addEventListener('click', (e) => { if (e.target.closest('[data-action="upload"]')) { e.preventDefault(); openUpload(); } });
$('#searchForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const q = ($('#searchInput').value.toLowerCase().match(/[\p{L}\p{N}_]+/u) || [])[0];
  if (q) go(`#/search/${encodeURIComponent(q)}`);
  $('#searchInput').blur();
});
const toggleTheme = () => {
  const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = t;
  $('meta[name=theme-color]').content = t === 'dark' ? '#0b0c10' : '#f6f4ef';
  try { localStorage.setItem('mk-theme', t); } catch {}
};
$('#themeBtn').addEventListener('click', toggleTheme);
document.querySelector('[data-theme-toggle]').addEventListener('click', toggleTheme);
$('#menuBtn').addEventListener('click', () => {
  const open = !document.body.classList.contains('side-open');
  document.body.classList.toggle('side-open', open);
  $('#scrim').hidden = !open; $('#menuBtn').setAttribute('aria-expanded', String(open));
});
$('#scrim').addEventListener('click', closeMenus);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { $('.pop')?.remove(); if (document.body.classList.contains('side-open')) closeMenus(); } });
renderAccount();

// J / K to move between memes, U / D to vote on the one at the top
document.addEventListener('keydown', (e) => {
  if (e.target.closest('input, textarea, select, [contenteditable]') || e.metaKey || e.ctrlKey || e.altKey || $('#modalRoot').innerHTML) return;
  const posts = $$('#main article.post'); if (!posts.length) return;
  const top = 72;
  const idx = posts.findIndex((p) => p.getBoundingClientRect().bottom > top + 8);
  if (e.key === 'j' || e.key === 'k') {
    const t = posts[Math.max(0, Math.min(posts.length - 1, idx + (e.key === 'j' ? (posts[idx]?.getBoundingClientRect().top > top + 4 ? 0 : 1) : -1)))];
    if (t) window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - top, behavior: 'smooth' });
  }
  if ((e.key === 'u' || e.key === 'd') && posts[idx]) vote(posts[idx].dataset.id, e.key === 'u' ? 1 : -1);
});

// first paint before auth resolves
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
route();

if (EMU) {
  window.__mk = {
    async signInAs(uid, name) {
      await signInWithCredential(auth, GoogleAuthProvider.credential(JSON.stringify({ sub: uid, email: `${uid}@example.com`, email_verified: true, name })));
    },
    state,
  };
}
