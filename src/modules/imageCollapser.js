// imageCollapser.js — Collapse large/all images in posts

export default {
  id: 'imageCollapser', name: 'Image Collapser',
  description: 'Collapses large images in posts. Click the placeholder to expand.',
  category: 'Layout & Reading', defaultEnabled: true,

  HEIGHT_LIMIT: 200,
  _observer: null,

  async init(api) {
    this.HEIGHT_LIMIT = api.settings?.imageCollapseHeight || 200;
    this._processAll();
    this._observer = new MutationObserver(() => this._processAll());
    this._observer.observe(document.body, { childList: true, subtree: true });
  },

  destroy() {
    this._observer?.disconnect();
    document.querySelectorAll('.btt-img-placeholder').forEach(p => {
      const img = p._bttImg;
      if (img) { img.classList.remove('btt-img-collapsed'); p.replaceWith(img); }
    });
    this._observer = null;
  },

  _processAll() {
    document.querySelectorAll('td.td_headerandpost img, .post img').forEach(img => {
      if (img.dataset.bttImgDone) return;
      img.dataset.bttImgDone = '1';
      img.addEventListener('load', () => this._maybeCollapse(img));
      if (img.complete) this._maybeCollapse(img);
    });
  },

  _maybeCollapse(img) {
    if (img.naturalHeight <= this.HEIGHT_LIMIT && img.naturalWidth <= 600) return;
    const domain = (() => { try { return new URL(img.src).hostname; } catch { return img.src.slice(0,30); } })();
    const ph = document.createElement('span');
    ph.className = 'btt-img-placeholder';
    ph._bttImg = img;
    ph.innerHTML = `🖼 Image from <strong>${domain}</strong> — click to expand`;
    img.classList.add('btt-img-collapsed');
    img.insertAdjacentElement('beforebegin', ph);
    ph.addEventListener('click', () => {
      img.classList.remove('btt-img-collapsed');
      ph.remove();
    });
  },

  renderDashboardPanel(container) {
    container.innerHTML = `<div class="btt-panel"><p>Collapses images taller than ${this.HEIGHT_LIMIT}px. A placeholder shows the source domain. Click to reveal the image.</p></div>`;
  },
};
