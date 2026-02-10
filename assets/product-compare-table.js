/**
 *  @class
 *  @function ProductCompareTable
 */
if (!customElements.get('product-compare-table')) {
  class ProductCompareTable extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.container = this.querySelector('.compare-lightbox--data');
      this.addEventListeners();
    }

    addEventListeners() {
      this.addEventListener('render-product-compare-modal', this.renderTable.bind(this));
    }

    renderTable() {
      this.classList.add('loading');
      this.handles = this.getCompareHandles();
      this.fetchProducts();
      setupReadMore();
    }

    getSelectedProducts() {
      return JSON.parse(window.localStorage.getItem('compare-products-vision')) || [];
    }
    getCompareHandles() {
      const {
        searchParams
      } = new URL(window.location);
      const handles = searchParams.get('compare');

      if (typeof handles === 'string' && handles !== '') {
        return handles.split(',');
      }

      return [];
    }
    async fetchProducts() {
      let compareProducts = this.getSelectedProducts(),
        returnHtml = '',
        returnArray = [];

      await Promise.all(compareProducts.map(async (product) => {
        await fetch(`${product.url}?view=compare`, {
          method: 'GET'
        }).then((response) => {
          return response.text();
        }).then((response) => {
          returnArray[product.id] = this.getSectionInnerHTML(response, '.compare-lightbox--data');
        });
      })).finally(() => {
        this.classList.remove('loading');
      });
      compareProducts.forEach((product, i) => {
        returnHtml += returnArray[product.id];
      });
      this.container.style.setProperty('--columns', compareProducts.length);
      this.container.innerHTML = returnHtml;
      setupReadMore();
      this.equalHeights();
    }
    getSectionInnerHTML(html, selector) {
      return new DOMParser()
        .parseFromString(html, 'text/html')
        .querySelector(selector).innerHTML;
    }
    equalHeights() {
      for (let i = 0; i < 10; i++) {
        this.equalizeTableRowHeightAcrossTables(i);
      }
      setupReadMore();
    }
    equalizeTableRowHeightAcrossTables(rowPosition) {
      const tables = this.container.querySelectorAll('.compare-lightbox--table');

      // Initialize an array to hold the heights of rows at the specified position
      const heights = [];

      // Iterate over each table
      tables.forEach(table => {
        const rows = table.querySelectorAll('.compare-lightbox--row');

        // Ensure the row at the specified position exists
        if (rows.length > rowPosition) {
          const rowHeight = rows[rowPosition].clientHeight;

          // If this is the first table, store the row height
          if (heights.length === 0) {
            heights[rowPosition] = rowHeight;
          } else {
            // If there is already a row height stored for this position,
            // check if the current row height is greater, and update if necessary
            if (rowHeight > heights[rowPosition]) {
              heights[rowPosition] = rowHeight;
            }
          }
        }
      });
      // Set the height of rows at the specified position in all tables to the maximum height found
      tables.forEach(table => {
        const rows = table.querySelectorAll('.compare-lightbox--row');
        if (rows.length > rowPosition) {
          rows[rowPosition].style.height = heights[rowPosition] + 'px';
        }
      });
    }
  }
  customElements.define('product-compare-table', ProductCompareTable);
}


(function () {
  window.setupReadMore = function () {
    var sections = document.querySelectorAll('.rtm.rtm--readmore');
    if (!sections.length) return;

    sections.forEach(function (root) {
      var content = root.querySelector('.rtm__content');
      var btn = root.querySelector('.rtm__toggle');
      var more = root.querySelector('.rtm__more');
      var less = root.querySelector('.rtm__less');
      if (!content || !btn) return;

      var lineHeight = parseFloat(getComputedStyle(content).lineHeight);
      var maxHeight = lineHeight * 5;

      content.classList.remove('is-collapsed', 'is-expanded');
      var fullHeight = content.scrollHeight;

      if (fullHeight <= maxHeight) {
        btn.style.display = 'none';
        more.hidden = true;
        less.hidden = true;
        return;
      }

      btn.style.display = 'inline-flex';
      more.hidden = false;
      less.hidden = true;
      content.classList.add('is-collapsed');

      btn.onclick = function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        console.log('222');
        var collapsed = content.classList.contains('is-collapsed');
        content.classList.toggle('is-collapsed', !collapsed);
        content.classList.toggle('is-expanded', collapsed);
        more.hidden = collapsed;
        less.hidden = !collapsed;
      };
    });
  };

  document.addEventListener('DOMContentLoaded', window.setupReadMore);
  window.addEventListener('resize', window.setupReadMore);
})();