/**
 *  @class
 *  @function Pagination
 */

if (!customElements.get('pagination-theme')) {
  class Pagination extends HTMLElement {
    constructor() {
      super();
      const id = this.dataset.section;
      this.button = this.querySelector('.load-more');
      this.grid = document.querySelector('[data-id=' + id + ']');
      this.animations_enabled =
        document.body.classList.contains('animations-true') &&
        typeof gsap !== 'undefined';
      this.i = 2;
    }

    connectedCallback() {
      if (this.classList.contains('pagination-type--loadmore')) {
        this.loadMore();
      }

      if (this.classList.contains('pagination-type--infinite')) {
        this.infinite();
      }

      if (this.dataset.type === 'paginated') {
        this.paginated();
      }
    }

    /* ------------------------------
      EXISTING FUNCTIONS (UNCHANGED)
    -------------------------------- */

    addUrlParam(search, key) {
      var newParam = key + '=' + this.i,
        params = '?' + newParam;

      if (search) {
        params = search.replace(
          new RegExp('([?&])' + key + '[^&]*'),
          '$1' + newParam
        );

        if (params === search) {
          params += '&' + newParam;
        }
      }
      return params;
    }

    loadMore() {
      let base = this;
      this.button.addEventListener('click', function () {
        base.loadProducts();
        this.blur();
        return false;
      });
    }

    infinite() {
      let base = this;
      base.observer = new IntersectionObserver(
        function (entries) {
          if (entries[0].intersectionRatio === 1) {
            base.loadProducts();
          }
        },
        { threshold: [0, 1] }
      );
      base.observer.observe(base);
    }

    loadProducts() {
      let base = this,
        url =
          document.location.pathname +
          base.addUrlParam(document.location.search, 'page');

      if (base.getAttribute('loading')) return;

      base.i++;
      base.setAttribute('loading', true);

      fetch(url)
        .then(res => res.text())
        .then(html => {
          base.renderProducts(html, url);
          dispatchCustomEvent('pagination:page-changed', { url });
        });
    }

    renderProducts(html, url) {
      let base = this,
        grid_to_replace = new DOMParser()
          .parseFromString(html, 'text/html')
          .getElementById('product-grid');

      if (!grid_to_replace) return;

      let products = grid_to_replace.querySelectorAll('.column');
      products.forEach(p => base.grid.appendChild(p));

      base.removeAttribute('loading');
    }

    /* ------------------------------
      PAGINATED AJAX LOGIC (ANCHORS)
    -------------------------------- */

    paginated() {
      const base = this;
      const links = this.querySelectorAll(
        '.page a, .prev a, .next a'
      );

      if (!links.length) return;

      links.forEach(link => {
        link.addEventListener('click', function (e) {
          e.preventDefault();

          const url = this.getAttribute('href');
          if (!url || base.getAttribute('loading')) return;

          base.setAttribute('loading', true);

          fetch(url)
            .then(res => res.text())
            .then(html => {
              base.renderPaginatedProducts(html, url);
              history.pushState({}, '', url);

              dispatchCustomEvent('pagination:page-changed', {
                url: url
              });
            });
        });
      });
    }

    renderPaginatedProducts(html, url) {
      const base = this;
      const doc = new DOMParser().parseFromString(html, 'text/html');

      const newGrid = doc.getElementById('product-grid');
      const newPagination = doc.querySelector('pagination-theme');

      /* ✅ GET NEW LABEL */
      const newLabel = doc.querySelector('[data-pagination-label]');
      const currentLabel = document.querySelector('[data-pagination-label]');

      if (!newGrid) {
        base.removeAttribute('loading');
        return;
      }

      /* ✅ REPLACE PRODUCTS */
      base.grid.innerHTML = '';
      newGrid.querySelectorAll('.column').forEach(p => {
        base.grid.appendChild(p);
      });

      /* ✅ UPDATE LABEL (Show X – Y out of Z) */
      if (newLabel && currentLabel) {
        currentLabel.innerHTML = newLabel.innerHTML;
      }

      /* ✅ REPLACE PAGINATION (keeps current page correct) */
      if (newPagination) {
        base.innerHTML = newPagination.innerHTML;
      }

      base.removeAttribute('loading');

      /* ✅ RE-BIND PAGINATION */
      base.paginated();
    }

  }

  customElements.define('pagination-theme', Pagination);
}
