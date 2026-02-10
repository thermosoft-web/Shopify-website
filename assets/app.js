if (typeof debounce === 'undefined') {
  function debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }
}
var dispatchCustomEvent = function dispatchCustomEvent(eventName) {
  var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var detail = {
    detail: data
  };
  var event = new CustomEvent(eventName, data ? detail : null);
  document.dispatchEvent(event);
};
window.recentlyViewedIds = [];

/**
 *  @class
 *  @function Quantity
 */
if (!customElements.get('quantity-selector')) {
  class QuantityInput extends HTMLElement {
    constructor() {
      super();
      this.input = this.querySelector('.qty');
      this.step = this.input.getAttribute('step');
      this.changeEvent = new Event('change', {
        bubbles: true
      });
      // Create buttons
      this.subtract = this.querySelector('.minus');
      this.add = this.querySelector('.plus');

      // Add functionality to buttons
      this.subtract.addEventListener('click', () => this.change_quantity(-1 * this.step));
      // this.add.addEventListener('click', () => this.change_quantity(1 * this.step));

      this.add.addEventListener('click', () => {
        // 1️⃣ Increase quantity
        this.change_quantity(1 * this.step);

        // 2️⃣ Find parent
        const parent = this.add.parentElement;
        console.log(parent, 'parent');

        if (!parent) return;

        // 3️⃣ Check siblings for .quick-add-btn.added
        const siblings = Array.from(parent.parentElement.children).filter(
          el => el !== parent
        );
        console.log(siblings, 'siblings');

        siblings.forEach(sibling => {
          const addedBtn = sibling.querySelector('.quick-add-button.added');
          if (addedBtn) {
            addedBtn.classList.remove('added');
          }
        });
      });


      this.validateQtyRules();
    }
    connectedCallback() {
      this.classList.add('buttons_added');
    }
    change_quantity(change) {
      // Get current value
      let quantity = Number(this.input.value);

      // Ensure quantity is a valid number
      if (isNaN(quantity)) quantity = 1;

      // Check for min & max
      if (this.input.getAttribute('min') > (quantity + change)) {
        return;
      }
      if (this.input.getAttribute('max')) {
        if (this.input.getAttribute('max') < (quantity + change)) {
          return;
        }
      }

      // Change quantity
      quantity += change;

      // Ensure quantity is always a number
      quantity = Math.max(quantity, 1);

      // Output number
      this.input.value = quantity;

      this.input.dispatchEvent(this.changeEvent);

      this.validateQtyRules();
    }
    validateQtyRules() {
      const value = parseInt(this.input.value);
      if (this.input.min) {
        const min = parseInt(this.input.min);
        this.subtract.classList.toggle('disabled', value <= min);
      }
      if (this.input.max) {
        const max = parseInt(this.input.max);
        this.add.classList.toggle('disabled', value >= max);
      }
    }
  }
  customElements.define('quantity-selector', QuantityInput);
}

/**
 *  @class
 *  @function ArrowSubMenu
 */
class ArrowSubMenu {

  constructor(self) {
    this.submenu = self.parentNode.querySelector('.sub-menu');
    this.arrow = self;
    // Add functionality to buttons
    self.addEventListener('click', (e) => this.toggle_submenu(e));
  }

  toggle_submenu(e) {
    e.preventDefault();
    let submenu = this.submenu;

    if (!submenu.classList.contains('active')) {
      submenu.classList.add('active');

    } else {
      submenu.classList.remove('active');
      this.arrow.blur();
    }
  }
}
let arrows = document.querySelectorAll('.thb-arrow');
arrows.forEach((arrow) => {
  new ArrowSubMenu(arrow);
});

/**
 *  @class
 *  @function ProductCard
 */
if (!customElements.get('product-card')) {
  class ProductCard extends HTMLElement {
    constructor() {
      super();
      this.swatches = this.querySelector('.product-card-swatches');
      this.image = this.querySelector('.product-featured-image-link .product-primary-image');
      this.additional_images = this.querySelectorAll('.product-secondary-image');
      this.additional_images_nav = this.querySelectorAll('.product-secondary-images-nav li');
      this.quick_add = this.querySelector('.product-card--add-to-cart-button-simple');
    }
    connectedCallback() {
      if (this.swatches) {
        this.enableSwatches(this.swatches, this.image);
      }
      if (this.additional_images) {
        this.enableAdditionalImages();
      }
      if (this.quick_add) {
        this.enableQuickAdd();
      }
    }
    enableAdditionalImages() {
      let image_length = this.additional_images.length;
      let images = this.additional_images;
      let nav = this.additional_images_nav;
      let image_container = this.querySelector('.product-featured-image');
      const mousemove = function (e) {
        let l = e.offsetX;
        let w = this.getBoundingClientRect().width;
        let prc = l / w;
        let sel = Math.floor(prc * image_length);
        let selimg = images[sel];
        images.forEach((image, index) => {
          if (image.classList.contains('hover')) {
            image.classList.remove('hover');
            if (nav.length) {
              nav[index].classList.remove('active');
            }
          }
        });
        if (selimg) {
          if (!selimg.classList.contains('hover')) {
            selimg.classList.add('hover');
            if (nav.length) {
              nav[sel].classList.add('active');
            }
          }
        }

      };
      const mouseleave = function (e) {
        images.forEach((image, index) => {
          image.classList.remove('hover');
          if (nav.length) {
            nav[index].classList.remove('active');
          }
        });
      };
      if (image_container) {
        image_container.addEventListener('touchstart', mousemove, {
          passive: true
        });
        image_container.addEventListener('touchmove', mousemove, {
          passive: true
        });
        image_container.addEventListener('touchend', mouseleave, {
          passive: true
        });
        image_container.addEventListener('mouseenter', mousemove, {
          passive: true
        });
        image_container.addEventListener('mousemove', mousemove, {
          passive: true
        });
        image_container.addEventListener('mouseleave', mouseleave, {
          passive: true
        });
      }

      images.forEach(function (image) {
        window.addEventListener('load', (event) => {
          lazySizes.loader.unveil(image);
        });
      });
    }
    enableSwatches(swatches, image) {
      let swatch_list = swatches.querySelectorAll('.product-card-swatch'),
        org_srcset = image ? image.dataset.srcset : '';

      swatch_list.forEach((swatch, index) => {
        window.addEventListener('load', (event) => {
          let image = new Image();
          image.srcset = swatch.dataset.srcset;
          lazySizes.loader.unveil(image);
        });
        swatch.addEventListener('mouseover', function () {

          [].forEach.call(swatch_list, function (el) {
            el.classList.remove('active');
          });
          if (image) {
            if (swatch.dataset.srcset) {
              image.setAttribute('srcset', swatch.dataset.srcset);
            } else {
              image.setAttribute('srcset', org_srcset);
            }
          }

          swatch.classList.add('active');
        });
        swatch.addEventListener('click', function (evt) {
          window.location.href = this.dataset.href;
          evt.preventDefault();
        });
      });
    }
    enableQuickAdd() {
      this.quick_add.addEventListener('click', this.quickAdd.bind(this));
    }

    quickAdd(evt) {
      evt.preventDefault();
      if (this.quick_add.disabled) {
        return;
      }
      this.quick_add.classList.add('loading');
      this.quick_add.setAttribute('aria-disabled', true);

      const config = {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/javascript'
        }
      };

      let formData = new FormData(this.form);

      formData.append('id', this.quick_add.dataset.productId);
      formData.append('quantity', 1);
      formData.append('sections', this.getSectionsToRender().map((section) => section.section));
      formData.append('sections_url', window.location.pathname);

      config.body = formData;

      fetch(`${theme.routes.cart_add_url}`, config)
        .then((response) => response.json())
        .then((response) => {
          if (response.status) {
            return;
          }
          this.renderContents(response);

          dispatchCustomEvent('cart:item-added', {
            product: response.hasOwnProperty('items') ? response.items[0] : response
          });
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          this.quick_add.classList.remove('loading');
          this.quick_add.removeAttribute('aria-disabled');
        });

      return false;
    }
    getSectionsToRender() {
      return [{
        id: 'Cart',
        section: 'main-cart',
        selector: '.thb-cart-form'
      },
      {
        id: 'Cart-Drawer',
        section: 'cart-drawer',
        selector: '.cart-drawer'
      },
      {
        id: 'cart-drawer-toggle',
        section: 'cart-bubble',
        selector: '.thb-item-count'
      },
      {
        id: 'cart-drawer-toggle-mobile',
        section: 'cart-bubble',
        selector: '.thb-item-count'
      }];
    }
    renderContents(parsedState) {
      this.getSectionsToRender().forEach((section => {
        if (!document.getElementById(section.id)) {
          return;
        }
        const elementToReplace = document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
        elementToReplace.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);

        if (typeof Cart !== 'undefined') {
          new Cart().renderContents(parsedState);
        }
        if (section.id === 'Cart-Drawer') {
          document.getElementById('Cart-Drawer')?.removeProductEvent();
        }
      }));

      if (document.getElementById('Cart-Drawer')) {
        document.getElementById('Cart-Drawer').open();
      }

    }
    getSectionInnerHTML(html, selector = '.shopify-section') {
      return new DOMParser()
        .parseFromString(html, 'text/html')
        .querySelector(selector).innerHTML;
    }
  }
  customElements.define('product-card', ProductCard);
}

/**
 *  @class
 *  @function ProductCardSmall
 */
if (!customElements.get('product-card-small')) {
  class ProductCardSmall extends HTMLElement {
    constructor() {
      super();

      this.quick_add_enabled = this.classList.contains('quick-add-to-card--true');
      this.button = this.querySelector('button');
      this.id = this.dataset.id;
      this.url = this.dataset.url;
    }
    connectedCallback() {
      if (this.quick_add_enabled) {
        this.setEventListeners();
      }
    }
    setEventListeners() {
      this.button.addEventListener('click', this.addToCart.bind(this));
    }
    getSectionsToRender() {
      return [{
        id: 'Cart',
        section: 'main-cart',
        selector: '.thb-cart-form'
      },
      {
        id: 'Cart-Drawer',
        section: 'cart-drawer',
        selector: '.cart-drawer'
      },
      {
        id: 'cart-drawer-toggle',
        section: 'cart-bubble',
        selector: '.thb-item-count'
      },
      {
        id: 'cart-drawer-toggle-mobile',
        section: 'cart-bubble',
        selector: '.thb-item-count'
      }];
    }

    addToCart() {
      this.button.classList.add('loading');
      if (!this.quick_add_enabled) {
        // quick view
      }
      this.button.setAttribute('aria-disabled', true);

      const config = {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/javascript'
        }
      };

      let formData = new FormData(this.form);

      formData.append('id', this.id);
      formData.append('quantity', 1);
      formData.append('sections', this.getSectionsToRender().map((section) => section.section));
      formData.append('sections_url', window.location.pathname);

      config.body = formData;

      fetch(`${theme.routes.cart_add_url}`, config)
        .then((response) => response.json())
        .then((response) => {
          if (response.status) {
            return;
          }

          this.renderContents(response);

          dispatchCustomEvent('cart:item-added', {
            product: response.hasOwnProperty('items') ? response.items[0] : response
          });
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          this.button.classList.remove('loading');
          this.button.removeAttribute('aria-disabled');
        });
    }
    renderContents(parsedState) {
      this.getSectionsToRender().forEach((section => {
        if (!document.getElementById(section.id)) {
          return;
        }
        const elementToReplace = document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
        elementToReplace.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);

        if (typeof Cart !== 'undefined') {
          new Cart().renderContents(parsedState);
        }
      }));
      if (document.getElementById('Cart-Drawer')) {
        document.getElementById('Cart-Drawer').open();
      }
    }
    getSectionInnerHTML(html, selector = '.shopify-section') {
      return new DOMParser()
        .parseFromString(html, 'text/html')
        .querySelector(selector).innerHTML;
    }
  }
  customElements.define('product-card-small', ProductCardSmall);
}

/**
 *  @class
 *  @function PanelClose
 */
class PanelClose extends HTMLElement {

  constructor() {
    super();

    let cc = document.querySelector('.click-capture');

    // Button click
    this.addEventListener('click', (e) => this.close_panel(e));

    // ESC key close
    document.addEventListener('keyup', (e) => {
      if (!e.code || e.code.toUpperCase() !== 'ESCAPE') return;

      document.querySelectorAll('.side-panel').forEach((panel) => {

        const isCompareOpen = document.querySelector('.compare-drawer.active');

        if (document.body.classList.contains('open-cc--product')) {
          document.body.classList.remove('open-cc--product');

          setTimeout(() => {
            const productDrawer = document.querySelector('#Product-Drawer-Content');
            if (productDrawer) productDrawer.innerHTML = '';
          }, 260);

        } else {
          if (panel.classList.contains('cart-drawer')) {
            const cartToggle = document.getElementById('cart-drawer-toggle');
            if (cartToggle) cartToggle.focus();
          }

          // ⛔ compare drawer active hoy to open-cc remove na karo
          if (!isCompareOpen) {
            document.body.classList.remove('open-cc');
          }
        }

        panel.classList.remove('active');
      });
    });

    // Click capture (overlay click)
    if (cc) {
      cc.addEventListener('click', (e) => {
        let panel = document.querySelector('.side-panel.active');
        const isCompareOpen = document.querySelector('.compare-drawer.active');

        if (panel) {
          panel.classList.remove('active');

          // ⛔ compare drawer active hoy to open-cc remove na karo
          if (!isCompareOpen) {
            document.body.classList.remove('open-cc');
          }
        }
      });
    }
  }

  close_panel(e) {
    e.preventDefault();

    let panel = e.target.closest('.side-panel');
    if (!panel) return;

    panel.classList.remove('active');

    const isCompareOpen = document.querySelector('.compare-drawer.active');

    if (document.body.classList.contains('open-cc--product')) {
      document.body.classList.remove('open-cc--product');

      setTimeout(() => {
        const productDrawer = document.querySelector('#Product-Drawer-Content');
        if (productDrawer) productDrawer.innerHTML = '';
      }, 260);

    } else {
      // ⛔ compare drawer active hoy to open-cc remove na karo
      if (!isCompareOpen) {
        document.body.classList.remove('open-cc');
      }
    }
  }
}

customElements.define('side-panel-close', PanelClose);


/**
 *  @class
 *  @function CartDrawer
 */
if (!customElements.get('cart-drawer')) {
  class CartDrawer extends HTMLElement {

    constructor() {
      super();
    }

    connectedCallback() {
      let button = document.getElementById('cart-drawer-toggle');
      let buttonMobile = document.getElementById('cart-drawer-toggle-mobile');


      // Add functionality to buttons
      button?.addEventListener('click', (e) => {
        e.preventDefault();
        document.body.classList.add('open-cc');
        this.classList.add('active');
        this.focus();
        dispatchCustomEvent('cart-drawer:open');
      });
      
      buttonMobile?.addEventListener('click', (e) => {
        e.preventDefault();
        document.body.classList.add('open-cc');
        this.classList.add('active');
        this.focus();
        dispatchCustomEvent('cart-drawer:open');
      });

      this.debouncedOnChange = debounce((event) => {
        this.onChange(event);
      }, 300);

      document.addEventListener('cart:refresh', (event) => {
        this.refresh();
      });

      this.addEventListener('change', this.debouncedOnChange.bind(this));

      this.removeProductEvent();
    }
    onChange(event) {
      if (event.target.classList.contains('qty')) {
        this.updateQuantity(event.target.dataset.index, event.target.value);
      }
    }
    removeProductEvent() {
      let removes = this.querySelectorAll('.remove');

      removes.forEach((remove) => {
        remove.addEventListener('click', (event) => {
          this.updateQuantity(event.target.dataset.index, '0');

          event.preventDefault();
        });
      });
    }
    getSectionsToRender() {
      return [{
        id: 'Cart-Drawer',
        section: 'cart-drawer',
        selector: '.cart-drawer'
      },
      {
        id: 'cart-drawer-toggle',
        section: 'cart-bubble',
        selector: '.thb-item-count'
      },
      {
        id: 'cart-drawer-toggle-mobile',
        section: 'cart-bubble',
        selector: '.thb-item-count'
      }];
    }
    getSectionInnerHTML(html, selector) {
      return new DOMParser()
        .parseFromString(html, 'text/html')
        .querySelector(selector).innerHTML;
    }
    updateQuantity(line, quantity) {
      this.querySelector(`#CartDrawerItem-${line}`).classList.add('thb-loading');
      const body = JSON.stringify({
        line,
        quantity,
        sections: this.getSectionsToRender().map((section) => section.section),
        sections_url: window.location.pathname
      });

      dispatchCustomEvent('line-item:change:start', {
        quantity: quantity
      });
      fetch(`${theme.routes.cart_change_url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': `application/json`
        },
        ...{
          body
        }
      })
        .then((response) => {
          return response.text();
        })
        .then((state) => {
          const parsedState = JSON.parse(state);

          this.getSectionsToRender().forEach((section => {
            const elementToReplace = document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);

            if (parsedState.sections) {
              elementToReplace.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
            }
          }));

          this.removeProductEvent();
          dispatchCustomEvent('line-item:change:end', {
            quantity: quantity,
            cart: parsedState
          });
          this.querySelector(`#CartDrawerItem-${line}`)?.classList.remove('thb-loading');
        });
    }
    open() {
      document.body.classList.add('open-cc');
      this.classList.add('active');
      dispatchCustomEvent('cart-drawer:open');
    }
    refresh() {
      let sections = 'cart-drawer,cart-bubble';
      fetch(`${window.location.pathname}?sections=${sections}`)
        .then((response) => {
          return response.text();
        })
        .then((state) => {
          const parsedState = JSON.parse(state);

          this.getSectionsToRender().forEach((section => {
            console.log('section--',section.selector);
            const elementToReplace = document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
            console.log('elementToReplace--',elementToReplace);
            elementToReplace.innerHTML = this.getSectionInnerHTML(parsedState[section.section], section.selector);
          }));

          this.removeProductEvent();
        });
    }
  }
  customElements.define('cart-drawer', CartDrawer);
}

/**
 *  @class
 *  @function FooterMenuToggle
 */
class FooterMenuToggle {
  constructor() {
    let _this = this;
    // resize on initial load
    document.querySelectorAll(".thb-widget-title.collapsible").forEach((button) => {
      button.addEventListener("click", (e) => {
        button.classList.toggle('active');
      });
    });
  }
}

/**
 *  @class
 *  @function CustomSelect
 */
if (!customElements.get('custom-select')) {
  class CustomSelect extends HTMLElement {
    constructor() {
      super();
      this.detailsements = {
        form: this.closest('form'),
        input: this.querySelector('input'),
        button: this.querySelector('.custom-select--button'),
        panel: this.querySelector('.custom-select--list'),
      };
      this.autoClose = this.dataset.autoClose;
      this.detailsements.button.addEventListener('click', this.toggleSelector.bind(this));
      this.detailsements.button.addEventListener('focusout', this.closeSelector.bind(this));
      this.addEventListener('keyup', this.onContainerKeyUp.bind(this));

      this.detailsements.panel.querySelectorAll('button').forEach(item => item.addEventListener('click', this.onItemClick.bind(this)));
    }

    hidePanel() {
      this.detailsements.button.setAttribute('aria-expanded', 'false');
      this.classList.remove('custom-select--active');
    }

    onContainerKeyUp(event) {
      if (event.code.toUpperCase() !== 'ESCAPE') return;

      this.hidePanel();
      this.detailsements.button.focus();
    }

    onItemClick(event) {
      event.preventDefault();
      this.detailsements.input.value = event.currentTarget.dataset.value;
      this.detailsements.input.dispatchEvent(new Event('change'));
      this.detailsements.button.querySelector('.custom-select--text').textContent = event.currentTarget.textContent;
      if (this.detailsements.form) {
        this.detailsements.form.dispatchEvent(new Event('input'));
      }
      if (this.autoClose) {
        this.classList.remove('custom-select--active');
      }
    }

    toggleSelector(event) {
      event.preventDefault();
      this.classList.toggle('custom-select--active');
      if (this.classList.contains('custom-select--active')) {
        this.detailsements.button.focus();
        this.detailsements.button.setAttribute('aria-expanded', (this.detailsements.button.getAttribute('aria-expanded') === 'false').toString());
      } else {
        this.hidePanel();
      }
    }

    closeSelector(event) {
      const shouldClose = event.relatedTarget && event.relatedTarget.classList.contains('custom-select--button');
      if (event.relatedTarget === null || shouldClose) {
        this.hidePanel();
      }
    }
  }
  customElements.define('custom-select', CustomSelect);
}
/**
 *  @class
 *  @function LocalizationForm
 */
if (!customElements.get('localization-form')) {
  class LocalizationForm extends HTMLElement {
    constructor() {
      super();
      this.form = this.querySelector('form');
      this.inputs = this.form.querySelectorAll('input[name="locale_code"], input[name="country_code"]');
      this.debouncedOnSubmit = debounce((event) => {
        this.onSubmitHandler(event);
      }, 200);
      this.inputs.forEach(item => item.addEventListener('change', this.debouncedOnSubmit.bind(this)));
    }
    onSubmitHandler(event) {
      if (this.form) this.form.submit();
    }
  }
  customElements.define('localization-form', LocalizationForm);
}

/**
 *  @class
 *  @function SidePanelContentTabs
 */
if (!customElements.get('side-panel-content-tabs')) {
  class SidePanelContentTabs extends HTMLElement {
    constructor() {
      super();
      this.buttons = this.querySelectorAll('button');
      this.panels = this.parentElement.querySelectorAll('.side-panel-content--tab-panel');
    }
    connectedCallback() {
      this.setupButtonObservers();
    }
    disconnectedCallback() {

    }
    setupButtonObservers() {
      this.buttons.forEach((item, i) => {
        item.addEventListener('click', (e) => {
          this.toggleActiveClass(i);
          e.preventDefault();
        });
      });
    }
    toggleActiveClass(i) {
      this.buttons.forEach((button) => {
        button.classList.remove('tab-active');
      });
      this.buttons[i].classList.add('tab-active');

      this.panels.forEach((panel) => {
        panel.classList.remove('tab-active');
      });
      this.panels[i].classList.add('tab-active');
    }
  }

  customElements.define('side-panel-content-tabs', SidePanelContentTabs);
}

/**
 *  @class
 *  @function CollapsibleRow
 */
if (!customElements.get('collapsible-row')) {
  // https://css-tricks.com/how-to-animate-the-details-element/
  class CollapsibleRow extends HTMLElement {
    constructor() {
      super();

      this.details = this.querySelector('details');
      this.summary = this.querySelector('summary');
      this.content = this.querySelector('.collapsible__content');

      // Store the animation object (so we can cancel it if needed)
      this.animation = null;
      // Store if the element is closing
      this.isClosing = false;
      // Store if the element is expanding
      this.isExpanding = false;
    }
    connectedCallback() {
      this.setListeners();
    }
    setListeners() {
      if(this.querySelector('summary')){
        this.querySelector('summary').addEventListener('click', (e) => this.onClick(e));
      }
    }
    instantClose() {
      this.tl.timeScale(10).reverse();
    }
    animateClose() {
      this.tl.timeScale(3).reverse();
    }
    animateOpen() {
      this.tl.timeScale(1).play();
    }
    onClick(e) {
      // Stop default behaviour from the browser
      e.preventDefault();
      // Add an overflow on the <details> to avoid content overflowing
      this.details.style.overflow = 'hidden';
      // Check if the element is being closed or is already closed
      if (this.isClosing || !this.details.open) {
        this.open();
        // Check if the element is being openned or is already open
      } else if (this.isExpanding || this.details.open) {
        this.shrink();
      }
    }
    shrink() {
      // Set the element as "being closed"
      this.isClosing = true;

      // Store the current height of the element
      const startHeight = `${this.details.offsetHeight}px`;
      // Calculate the height of the summary
      const endHeight = `${this.summary.offsetHeight}px`;

      // If there is already an animation running
      if (this.animation) {
        // Cancel the current animation
        this.animation.cancel();
      }

      // Start a WAAPI animation
      this.animation = this.details.animate({
        // Set the keyframes from the startHeight to endHeight
        height: [startHeight, endHeight]
      }, {
        duration: 250,
        easing: 'ease'
      });

      // When the animation is complete, call onAnimationFinish()
      this.animation.onfinish = () => this.onAnimationFinish(false);
      // If the animation is cancelled, isClosing variable is set to false
      this.animation.oncancel = () => this.isClosing = false;
    }

    open() {
      // Apply a fixed height on the element
      this.details.style.height = `${this.details.offsetHeight}px`;
      // Force the [open] attribute on the details element
      this.details.open = true;
      // Wait for the next frame to call the expand function
      window.requestAnimationFrame(() => this.expand());
    }

    expand() {
      // Set the element as "being expanding"
      this.isExpanding = true;
      // Get the current fixed height of the element
      const startHeight = `${this.details.offsetHeight}px`;
      // Calculate the open height of the element (summary height + content height)
      const endHeight = `${this.summary.offsetHeight + this.content.offsetHeight}px`;

      // If there is already an animation running
      if (this.animation) {
        // Cancel the current animation
        this.animation.cancel();
      }

      // Start a WAAPI animation
      this.animation = this.details.animate({
        // Set the keyframes from the startHeight to endHeight
        height: [startHeight, endHeight]
      }, {
        duration: 400,
        easing: 'ease-out'
      });
      // When the animation is complete, call onAnimationFinish()
      this.animation.onfinish = () => this.onAnimationFinish(true);
      // If the animation is cancelled, isExpanding variable is set to false
      this.animation.oncancel = () => this.isExpanding = false;
    }

    onAnimationFinish(open) {
      // Set the open attribute based on the parameter
      this.details.open = open;
      // Clear the stored animation
      this.animation = null;
      // Reset isClosing & isExpanding
      this.isClosing = false;
      this.isExpanding = false;
      // Remove the overflow hidden and the fixed height
      this.details.style.height = this.details.style.overflow = '';
    }
  }
  customElements.define('collapsible-row', CollapsibleRow);
}

/**
 *  @class
 *  @function ProductRecommendations
 */
class ProductRecommendations extends HTMLElement {
  constructor() {
    super();

  }
  fetchProducts() {
    fetch(this.dataset.url)
      .then(response => response.text())
      .then(text => {
        const html = document.createElement('div');
        html.innerHTML = text;
        const recommendations = html.querySelector('product-recommendations');

        if (recommendations && recommendations.innerHTML.trim().length) {
          this.innerHTML = recommendations.innerHTML;
        }

        this.classList.add('product-recommendations--loaded');

      })
      .catch(e => {
        console.error(e);
      });
  }
  connectedCallback() {
    this.fetchProducts();
  }
}

customElements.define('product-recommendations', ProductRecommendations);

/**
 *  @class
 *  @function QuickView
 */
if (!customElements.get('quick-view')) {
  class QuickView extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
      this.cc = document.querySelector('.click-capture--product');
      this.drawer = document.getElementById('Product-Drawer');
      this.body = document.body;
      this.button = this.querySelector('.product-card--add-to-cart-button');
      if (this.button) {
        this.button.addEventListener('click', (e) => {
          e.stopPropagation();
        });
      }
      this.addEventListener('click', this.setupEventListener.bind(this));
      this.cc.addEventListener('click', this.setupCCEventListener.bind(this));

    }
    setupCCEventListener(e) {
      this.body.classList.remove('open-cc--product');
      this.drawer.classList.remove('active');

      setTimeout(() => {
        this.drawer.querySelector('#Product-Drawer-Content').innerHTML = '';
      }, 260);

    }
    setupEventListener(e) {
      e.preventDefault();
      let productHandle = this.dataset.productHandle,
        href = `${theme.routes.root_url}/products/${productHandle}?view=quick-view`;

      // remove double `/` in case shop might have /en or language in URL
      href = href.replace('//', '/');
      if (!href || !productHandle) {
        return;
      }
      if (this.classList.contains('loading')) {
        return;
      }
      this.classList.add('loading');
      fetch(href, {
        method: 'GET'
      })
        .then((response) => {
          this.classList.remove('loading');
          return response.text();
        })
        .then(text => {
          const sectionInnerHTML = new DOMParser()
            .parseFromString(text, 'text/html')
            .querySelector('#Product-Drawer-Content').innerHTML;

          this.renderQuickview(sectionInnerHTML, href, productHandle);

        });
    }
    renderQuickview(sectionInnerHTML, href, productHandle) {
      if (sectionInnerHTML) {

        this.drawer.querySelector('#Product-Drawer-Content').innerHTML = sectionInnerHTML;

        let js_files = this.drawer.querySelector('#Product-Drawer-Content').querySelectorAll('script');

        if (js_files.length > 0) {
          var head = document.getElementsByTagName('head')[0];
          js_files.forEach((js_file, i) => {
            let script = document.createElement('script');
            script.src = js_file.src;
            head.appendChild(script);
          });
        }

        setTimeout(() => {
          if (Shopify && Shopify.PaymentButton) {
            Shopify.PaymentButton.init();
          }
          if (window.ProductModel) {
            window.ProductModel.loadShopifyXR();
          }
        }, 300);



        this.body.classList.add('open-cc--product');
        this.drawer.classList.add('active');

        this.drawer.querySelector('.side-panel-close').focus();

        setTimeout(() => {
          let slider = this.drawer.querySelector('#Product-Slider');

          slider.reInit();
          window.dispatchEvent(new Event('resize'));
        }, 100);

        dispatchCustomEvent('quick-view:open', {
          productUrl: href,
          productHandle: productHandle
        });

        addIdToRecentlyViewed(productHandle);
      }
    }
  }
  customElements.define('quick-view', QuickView);
}

/**
 *  @class
 *  @function AnimatedMarkers
 */
class AnimatedMarkers {

  constructor() {
    this.markers = document.querySelectorAll('.svg-marker path');
    this.animations_enabled = document.body.classList.contains('animations-true') && typeof gsap !== 'undefined';

    if (this.animations_enabled && this.markers.length) {
      this.setupEventListeners();
    }
  }
  setupEventListeners() {
    this.markers.forEach((marker, i) => {
      gsap.from(marker, {
        duration: 1,
        ease: 'power4.inOut',
        drawSVG: "0%",
        scrollTrigger: {
          trigger: marker,
          start: 'top 70%',
          end: 'bottom 80%'
        }
      });
    });
  }

}

/**
 *  @function addIdToRecentlyViewed
 */
function addIdToRecentlyViewed(handle) {

  if (!handle) {
    let product = document.querySelector('.thb-product-detail');

    if (product) {
      handle = product.dataset.handle;
    }
  }
  if (!handle) {
    return;
  }
  if (window.localStorage) {
    let recentIds = window.localStorage.getItem('recently-viewed');
    if (recentIds != 'undefined' && recentIds != null) {
      window.recentlyViewedIds = JSON.parse(recentIds);
    }
  }
  // Remove current product if already in recently viewed array
  var i = window.recentlyViewedIds.indexOf(handle);

  if (i > -1) {
    window.recentlyViewedIds.splice(i, 1);
  }

  // Add id to array
  window.recentlyViewedIds.unshift(handle);

  if (window.localStorage) {
    window.localStorage.setItem('recently-viewed', JSON.stringify(window.recentlyViewedIds));
  }
}

document.addEventListener('DOMContentLoaded', () => {

  if (typeof AnimatedMarkers !== 'undefined') {
    new AnimatedMarkers();
  }
  if (typeof FooterMenuToggle !== 'undefined') {
    new FooterMenuToggle();
  }
});
document.addEventListener('click', function(e) {
  const banner = e.target.closest('.video-banner-image');
  if (banner) {
    const parent = banner.closest('.video-section--container');
    if (parent) {
      parent.classList.add('playvideo');

      // find video inside the parent and play it
      const video = parent.querySelector('video');
      if (video) {
        video.play().catch(err => {
          console.warn('Video playback prevented:', err);
        });
      }
    }
  }
});

// const stepItems = document.querySelectorAll('.call-step-item');
// const stepContents = document.querySelectorAll('.call-step-content');

// function activateStep(index) {
//   // Deactivate all
//   stepItems.forEach(el => el.classList.remove('active'));
//   stepContents.forEach(el => el.classList.remove('active'));

//   // Activate new step + content
//   const item = stepItems[index];
//   const step = item.dataset.step;
//   item.classList.add('active');

//   const target = document.querySelector(`.call-step-content[data-cont="${step}"]`);
//   if (target) target.classList.add('active');
// }

// // Handle tab click
// stepItems.forEach((item, i) => {
//   item.addEventListener('click', () => {
//     activateStep(i);
//   });
// });

// // Handle all "Next" buttons dynamically
// document.addEventListener('click', (e) => {
//   if (e.target.closest('.next-step-btn')) {
//     const activeIndex = [...stepItems].findIndex(el => el.classList.contains('active'));
//     if (activeIndex < stepItems.length - 1) {
//       activateStep(activeIndex + 1);
//     }
//   }
// });

document.addEventListener("DOMContentLoaded", function () {
  const popup = document.getElementById("splitPopup");
  const cookieName = "split_popup_seen";
  const days = 7;

  function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = name + "=" + value + ";expires=" + d.toUTCString() + ";path=/";
  }

  function getCookie(name) {
    const cname = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(cname) === 0) {
        return c.substring(cname.length, c.length);
      }
    }
    return "";
  }

  if (!getCookie(cookieName)) {
    if(popup){
      popup.style.display = "flex";
    }
  }

  document.querySelectorAll(".split").forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const href = this.getAttribute("href");

      popup.style.display = "none";
      setCookie(cookieName, "true", days);

      if (this.classList.contains("right")) {
        const updateLogoLink = () => {
          const headerLogo = document.querySelector(".header--inner .logolink");
          if (headerLogo) {
            headerLogo.href = "https://thermosoftonline.myshopify.com/pages/professional";
          } else {
            setTimeout(updateLogoLink, 200);
          }
        };
        updateLogoLink();
        localStorage.setItem("professional", "professional_page");
      }

      setTimeout(() => {
        if (href && href !== "#") window.location.href = href;
      }, 200);
    });
  });

  
  if (localStorage.getItem("professional")) {
    document.querySelector(".header--inner .logolink").setAttribute('href','/pages/professional');
  }
});



function setEqualHeights() {
  // ===== Equal height for .product_info_column rows =====
  const productInfoBlocks = document.querySelectorAll('.product_info');
  if (productInfoBlocks.length) {
    const firstColumns = productInfoBlocks[0].querySelectorAll('.product_info_column');
    const rowCount = firstColumns.length;

    for (let i = 0; i < rowCount; i++) {
      let maxHeight = 0;

      // Find tallest column in this row
      productInfoBlocks.forEach(block => {
        const columns = block.querySelectorAll('.product_info_column');
        if (columns[i]) {
          columns[i].style.minHeight = ''; // reset first
          const h = columns[i].offsetHeight;
          if (h > maxHeight) maxHeight = h;
        }
      });

      // Apply max height to all in this row
      productInfoBlocks.forEach(block => {
        const columns = block.querySelectorAll('.product_info_column');
        if (columns[i]) {
          columns[i].style.minHeight = maxHeight + 'px';
        }
      });
    }
  }

  // ===== Equal height for .heating-system_content .h6 titles =====
  const heatingTitles = document.querySelectorAll('.heating-system_content .h6');
  if (heatingTitles.length) {
    let maxTitleHeight = 0;

    // find max height
    heatingTitles.forEach(title => {
      title.style.minHeight = ''; // reset before measure
      const h = title.offsetHeight;
      if (h > maxTitleHeight) maxTitleHeight = h;
    });

    // apply equal height
    heatingTitles.forEach(title => {
      title.style.minHeight = maxTitleHeight + 'px';
    });
  }
}

// Run on load
setEqualHeights();

// Run again on resize (with debounce)
window.addEventListener('resize', () => {
  // clearTimeout(window._equalHeightTimer);
  // window._equalHeightTimer = setTimeout(setEqualHeights, 150);
});


document.addEventListener("DOMContentLoaded", function () {
  const slider = document.querySelector(".logo-list--inner.swipe-on-mobile");
  if (!slider) return;

  if (!window.matchMedia("(max-width: 767px)").matches) return;

  // Duplicate content only once
  if (!slider.classList.contains("is-cloned")) {
    slider.innerHTML += slider.innerHTML;
    slider.classList.add("is-cloned");
  }

  let speed = 1; // iOS ma thodu vadhu smooth
  let maxScroll = slider.scrollWidth / 2;

  setInterval(function () {
    slider.scrollLeft += speed;

    if (slider.scrollLeft >= maxScroll) {
      slider.scrollLeft = 0;
    }
  }, 16); // ~60fps
});






document.addEventListener("DOMContentLoaded", function () {
  const cards = document.querySelectorAll(".heating-systems-inner");

  cards.forEach(card => {
    const content = card.querySelector(".heating-systems-content .rte");
    const btn = card.querySelector(".heating-systems-button .read-more-btn");

    if (!btn) return;

    if (!content || !content.textContent.trim()) {
      btn.style.opacity = "0";
      btn.style.visibility = "hidden";
      return;
    }

    btn.addEventListener("click", function () {
      content.classList.toggle("expanded");

      btn.textContent = content.classList.contains("expanded")
        ? "Read less"
        : "Read more";
    });
  });
});



  document.addEventListener("DOMContentLoaded", function () {
  const titles = document.querySelectorAll(".heating-systems-content .title");
  if (!titles.length) return;

  titles.forEach(t => t.style.height = 'auto');

  let maxHeight = 0;
  titles.forEach(t => {
    if (t.offsetHeight > maxHeight) {
      maxHeight = t.offsetHeight;
    }
  });

  titles.forEach(t => t.style.height = maxHeight + "px");
});



(function () {
  function setupReadMore() {
    var sections = document.querySelectorAll('.rtm.rtm--readmore');
    if (!sections.length) return;

    sections.forEach(function (root) {
      var content = root.querySelector('.rtm__content');
      var btn = root.querySelector('.rtm__toggle');
      var more = root.querySelector('.rtm__more');
      var less = root.querySelector('.rtm__less');
      if (!content || !btn) return;

      var lineHeight = parseFloat(getComputedStyle(content).lineHeight);
      var maxHeight = lineHeight * 5; // 4 lines

      content.classList.remove('is-collapsed');
      content.classList.remove('is-expanded');
      var fullHeight = content.scrollHeight;

      if (fullHeight <= maxHeight) {
        btn.style.display = 'none';
        more.hidden = true;
        less.hidden = true;
        content.classList.remove('is-expanded');
        content.classList.remove('is-collapsed');
      } else {
        btn.style.display = 'inline-flex';
        more.hidden = false;
        less.hidden = true;
        content.classList.add('is-collapsed');
      }

      content.classList.add('is-collapsed');

      btn.addEventListener('click', function (e) {
         e.preventDefault();
        e.stopImmediatePropagation();
        console.log('111');
        var collapsed = content.classList.contains('is-collapsed');
        if (collapsed) {
          content.classList.remove('is-collapsed');
          content.classList.add('is-expanded');
          more.hidden = true;
          less.hidden = false;
        } else {
          content.classList.remove('is-expanded');
          content.classList.add('is-collapsed');
          more.hidden = false;
          less.hidden = true;
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", setupReadMore);

  window.addEventListener("resize", function () {
    setupReadMore();
  });
})();




document.addEventListener("DOMContentLoaded", function () {
  initializeProductActions();
  setupEventDelegation();
});

/* ---------------- INITIALIZE EXISTING PRODUCTS ---------------- */

function initializeProductActions() {
  document.querySelectorAll(".product-actions").forEach(function (wrapper) {
    if (wrapper.dataset.initialized) return;

    const qtyInput = wrapper.querySelector(".quantity__input");
    const minusBtn = wrapper.querySelector(".minus");
    const plusBtn  = wrapper.querySelector(".plus");
    const quickAddBtn = wrapper.querySelector(".quick-add-btn");

    if (!qtyInput || !minusBtn || !plusBtn || !quickAddBtn) return;

    wrapper.dataset.initialized = "true";

    minusBtn.type = "button";
    plusBtn.type = "button";
    qtyInput.setAttribute("min", "0");

    updateProductState(wrapper);

    qtyInput.addEventListener("input", function () {
      let value = qtyInput.value;
      if (value !== '') qtyInput.value = parseInt(value) || 0;
      updateProductState(wrapper);
    });

    qtyInput.addEventListener("change", function () {
      updateProductState(wrapper);
    });
  });
}

/* ---------------- EVENT DELEGATION ---------------- */

function setupEventDelegation() {
  document.addEventListener(
    "click",
    function (e) {
      /* PLUS */
      if (e.target.classList.contains("plus") && e.target.tagName === "BUTTON") {
        const wrapper = e.target.closest(".product-actions");
        const qtyInput = wrapper?.querySelector(".quantity__input");
        if (!wrapper || !qtyInput) return;

        e.preventDefault();
        e.stopImmediatePropagation();

        qtyInput.value = (parseInt(qtyInput.value) || 0) + 1;
        updateProductState(wrapper);
        return false;
      }

      /* MINUS */
      if (e.target.classList.contains("minus") && e.target.tagName === "BUTTON") {
        const wrapper = e.target.closest(".product-actions");
        const qtyInput = wrapper?.querySelector(".quantity__input");
        if (!wrapper || !qtyInput) return;

        e.preventDefault();
        e.stopImmediatePropagation();

        let qty = parseInt(qtyInput.value) || 0;
        qtyInput.value = qty > 0 ? qty - 1 : 0;
        updateProductState(wrapper);
        return false;
      }

      /* QUICK ADD */
      if (e.target.classList.contains("quick-add-btn") && e.target.tagName === "BUTTON") {
        const btn = e.target;
        const wrapper = btn.closest(".product-actions");

        // Save original state
        const originalText = btn.textContent;
        const hadAddedClass = btn.classList.contains("added");
        const wasDisabled = btn.hasAttribute("disabled");

        // Added state
        btn.classList.add("added");
        btn.textContent = "Added";

        setTimeout(() => {
          // 🔓 Remove added FIRST
          if (!hadAddedClass) {
            btn.classList.remove("added");
          }

          // Restore text
          btn.textContent = originalText;

          // Restore disabled EXACT
          if (wasDisabled) {
            btn.setAttribute("disabled", "disabled");
          } else {
            btn.removeAttribute("disabled");
          }

          // 🔁 FORCE resync with qty AFTER restore
          if (wrapper) {
            updateProductState(wrapper);
          }
        }, 5000);
      }

    },
    true
  );

  document.addEventListener("input", function (e) {
    if (!e.target.classList.contains("quantity__input")) return;
    const wrapper = e.target.closest(".product-actions");
    if (wrapper) updateProductState(wrapper);
  });

  document.addEventListener("change", function (e) {
    if (!e.target.classList.contains("quantity__input")) return;
    const wrapper = e.target.closest(".product-actions");
    if (wrapper) updateProductState(wrapper);
  });
}

/* ---------------- STATE HANDLER (SAFE) ---------------- */

function updateProductState(wrapper) {
  const qtyInput = wrapper.querySelector(".quantity__input");
  const minusBtn = wrapper.querySelector(".minus");
  const quickAddBtn = wrapper.querySelector(".quick-add-btn");

  if (!qtyInput || !minusBtn || !quickAddBtn) return;

  // ⛔ DO NOT override while Added state active
  if (quickAddBtn.classList.contains("added")) return;

  let qty = parseInt(qtyInput.value);
  if (isNaN(qty) || qty < 0) {
    qty = 0;
    // qtyInput.value = 0;   // Default 0 
  }

  if (qty > 0) {
    quickAddBtn.removeAttribute("disabled");
    minusBtn.classList.remove("disabled");
  } else {
    quickAddBtn.setAttribute("disabled", "disabled");
    minusBtn.classList.add("disabled");
  }
}

/* ---------------- FOR DYNAMIC CONTENT ---------------- */

function refreshProductActions() {
  initializeProductActions();
}








document.addEventListener('click', function (event) {
  const btn = event.target.closest('.quick-add-button');
  if (!btn) return;

  event.preventDefault();
  event.stopImmediatePropagation();

  const actions = btn.closest('.product-actions');
  if (!actions) return;

  const variantInput = actions.querySelector('.wc_variant_id');
  const qtyInput = actions.querySelector('.quantity__input');
  if (!variantInput || !qtyInput) return;

  const variant_id = variantInput.value;
  const var_quantity = parseInt(qtyInput.value, 10);
  if (!variant_id || var_quantity <= 0) return;

  const time = new Date().toISOString();

  /* 🔑 base item */
  const item = {
    id: variant_id,
    quantity: var_quantity
  };

  /* ✅ ONLY outside-sow template */
  if (document.body.classList.contains('template-collection-outside-sow')) {
    item.properties = {
      // 'Sold by the Ft.': var_quantity,
      '_time': time
    };
  }

  const formData = {
    items: [item]
  };

  fetch(`${window.Shopify.routes.root}cart/add.js`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(formData)
  })
  .then(res => {
    if (!res.ok) throw new Error('Add to cart failed');
    return res.json();
  })
  .then(() => {  
    qtyInput.value = 0;

    const cartDrawer = document.querySelector('cart-drawer');
    if (cartDrawer) {
      cartDrawer.refresh?.();
      cartDrawer.open?.();
    } else {
      window.location.href = '/cart';
    }
  })
  .catch(err => console.error(err));
});





// document.addEventListener("click", function (e) {
//   const checkbox = e.target;

//   if (
//     checkbox.tagName !== "INPUT" ||
//     checkbox.type !== "checkbox" ||
//     !checkbox.closest("facet-filters-form")
//   ) {
//     return;
//   }

//   const name = checkbox.name;
//   if (!name) return;

//   // Shopify internal logic pachi run thase
//   requestAnimationFrame(() => {
//     document
//       .querySelectorAll(
//         `facet-filters-form input[type="checkbox"][name="${CSS.escape(name)}"]`
//       )
//       .forEach(cb => {
//         if (cb !== checkbox) cb.checked = false;
//       });
//   });
// });




document.addEventListener("DOMContentLoaded", equalizeHeatingContent);
window.addEventListener("resize", equalizeHeatingContent);

function equalizeHeatingContent() {
  const contents = document.querySelectorAll(".heating-systems-content");

  if (!contents.length) return;

  contents.forEach(el => {
    el.style.height = "auto";
  });

  let maxHeight = 0;
  contents.forEach(el => {
    maxHeight = Math.max(maxHeight, el.offsetHeight);
  });

  contents.forEach(el => {
    el.style.height = maxHeight + "px";
  });
}


// === compare js =====
document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.querySelector(".compare-toggle");
  const counter = document.querySelector(".compare-counter");

  if (!toggle || !counter) return;

  function updateCompareToggle() {
    const count = parseInt(counter.textContent.trim(), 10) || 0;

    if (count === 0) {
      toggle.style.display = "none";
    } else {
      toggle.style.display = "";
    }
  }

  updateCompareToggle();

  const observer = new MutationObserver(updateCompareToggle);
  observer.observe(counter, {
    childList: true,
    characterData: true,
    subtree: true
  });
});




