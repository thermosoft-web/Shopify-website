/**
 *  @class
 *  @function MaxHeight
 */
if (!customElements.get('max-height')) {
  class MaxHeight extends HTMLElement {
    constructor() {
      super();
      this.content = this.querySelector('.max-height--inner-content');
      this.toggle = this.querySelector('.max-height--toggle');

      this.max = this.dataset.max;
      this.mobMax = this.dataset.mobMax; // 👈 mobile max
    }

    connectedCallback() {
      this.toggle.addEventListener('click', this.onClick.bind(this));
      window.addEventListener('resize', this.checkVisible.bind(this));

      this.checkVisible();
    }

    getCurrentMax() {
      // mobile screen
      if (window.innerWidth < 768 && this.mobMax) {
        return parseInt(this.mobMax, 10);
      }
      // desktop
      return parseInt(this.max, 10);
    }

    checkVisible() {
      const currentMax = this.getCurrentMax();

      if (this.content.offsetHeight > currentMax) {
        this.showToggle();
      } else {
        this.hideToggle();
        this.classList.remove('max-height--enabled');
      }
    }

    showToggle() {
      this.classList.add('max-height--active');
    }

    hideToggle() {
      this.classList.remove('max-height--active');
    }

    onClick() {
      this.classList.toggle('max-height--enabled');
    }
  }

  customElements.define('max-height', MaxHeight);
}
