/**
 *  @class
 *  @function MediaWithTabs
 */
if (!customElements.get('main-faq-with-navigation')) {
  class MultiPageWithNavigation extends HTMLElement {
    constructor() {
      super();

    }
    connectedCallback() {
      this.buttons = Array.from(this.querySelectorAll('.main-faq-with-navigation--button'));
      this.faqs = Array.from(this.querySelectorAll('.main-faq-with-navigation--page'));
      this.buttons.forEach((button, i) => {
        button.addEventListener('click', () => {
          this.buttonClick(button, i);
        });
      });
    }
    buttonClick(button, i) {
      [].forEach.call(this.buttons, function(el) {
        el.classList.remove('active');
      });
      button.classList.add('active');
      let header_offset = getComputedStyle(document.documentElement).getPropertyValue('--header-height');
      let faq_top = this.faqs[i].getBoundingClientRect().top + window.scrollY - parseInt(header_offset, 10) - 20;

      window.scrollTo({
        top: faq_top,
        left: 0,
        behavior: "smooth"
      });
    }
  }
  customElements.define('main-faq-with-navigation', MultiPageWithNavigation);
}