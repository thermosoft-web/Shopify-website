/**
 *  @class
 *  @function TabbedContent
 */
if (!customElements.get('tabbed-content')) {
  class TabbedContent extends HTMLElement {
    static get observedAttributes() {
      return ['selected-index'];
    }

    constructor() {
      super();
    }

    connectedCallback() {
      // ❌ animations disabled
      this.animations_enabled = false;

      this.scroller = this.querySelector('.tabbed-content--scroll');
      this.buttons = Array.from(this.scroller.querySelectorAll('button'));
      this.panels = Array.from(this.querySelectorAll('.tabbed-content--content'));

      this.hasKeyMode =
        this.buttons.some(btn => btn.dataset.id) &&
        this.panels.some(panel => panel.dataset.key);

      /* =========================
         INIT STATE
      ========================== */
      if (this.hasKeyMode) {
        this.activeButton =
          this.buttons.find(btn => btn.classList.contains('active')) ||
          this.buttons[0];

        this.activePanel =
          this.panels.find(panel => panel.classList.contains('active')) ||
          this.panels.find(panel => panel.dataset.key === this.activeButton?.dataset.id);
      } else {
        this.selectedIndex = this.selectedIndex;
      }

      /* =========================
         CLICK HANDLERS
      ========================== */
      this.buttons.forEach((button, index) => {
        button.addEventListener('click', (event) => {
          if (button.classList.contains('instalation-popup-btn')) {
            event.preventDefault();
            event.stopPropagation();
            document.getElementById('ProductPopup-instalation-tab')?.click();
            return;
          }

          if (this.hasKeyMode) {
            this.activateById(button.dataset.id);
          } else {
            this.selectedIndex = index;
          }
        });
      });

      /* =========================
         SHOPIFY DESIGN MODE
      ========================== */
      if (Shopify.designMode) {
        this.addEventListener('shopify:block:select', (event) => {
          if (this.hasKeyMode) {
            this.activateById(event.target.dataset.id);
          } else {
            this.selectedIndex = this.buttons.indexOf(event.target);
          }
        });
      }
    }

    /* =========================
       INDEX MODE
    ========================== */
    get selectedIndex() {
      return parseInt(this.getAttribute('selected-index')) || 0;
    }

    set selectedIndex(index) {
      this.setAttribute('selected-index', index);
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (
        !this.hasKeyMode &&
        name === 'selected-index' &&
        oldValue !== null &&
        oldValue !== newValue
      ) {
        const oldBtn = this.buttons[oldValue];
        const newBtn = this.buttons[newValue];
        const oldPanel = this.panels[oldValue];
        const newPanel = this.panels[newValue];

        oldBtn?.classList.remove('active');
        newBtn?.classList.add('active');

        // ✅ direct switch (no animation)
        oldPanel?.classList.remove('active');
        newPanel?.classList.add('active');
      }
    }

    /* =========================
       KEY MODE
    ========================== */
    activateById(id) {
      if (!id) return;

      const newButton = this.buttons.find(btn => btn.dataset.id === id);
      const newPanel = this.panels.find(panel => panel.dataset.key === id);

      if (!newButton || !newPanel) return;
      if (newPanel === this.activePanel) return;

      this.activeButton?.classList.remove('active');

      // ✅ direct switch (no animation)
      this.activePanel?.classList.remove('active');
      newPanel.classList.add('active');

      newButton.classList.add('active');

      this.activeButton = newButton;
      this.activePanel = newPanel;
    }
  }

  customElements.define('tabbed-content', TabbedContent);
}

/* =========================================================
   Thermostats Setting tab js (UNCHANGED)
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  const tabProgram = document.getElementById("tab-program");
  const tabManual = document.getElementById("tab-manual");
  const tabProduct3 = document.getElementById("tab-product-3");

  const boxProgram = document.querySelector(".thermostats_programmable");
  const boxManual = document.querySelector(".thermostats_manual");
  const boxProduct3 = document.querySelector(".thermostats_product-3");

  function resetTabs() {
    [tabProgram, tabManual, tabProduct3].forEach(tab => {
      tab && tab.classList.remove("active");
    });

    [boxProgram, boxManual, boxProduct3].forEach(box => {
      box && box.classList.remove("tab-active");
    });
  }

  if (tabProgram && boxProgram) {
    tabProgram.classList.add("active");
    boxProgram.classList.add("tab-active");
  }

  if (tabProgram) {
    tabProgram.addEventListener("click", function () {
      resetTabs();
      tabProgram.classList.add("active");
      boxProgram.classList.add("tab-active");
    });
  }

  if (tabManual) {
    tabManual.addEventListener("click", function () {
      resetTabs();
      tabManual.classList.add("active");
      boxManual.classList.add("tab-active");
    });
  }

  if (tabProduct3) {
    tabProduct3.addEventListener("click", function () {
      resetTabs();
      tabProduct3.classList.add("active");
      boxProduct3.classList.add("tab-active");
    });
  }
});


// document.addEventListener("click", function (e) {
//   const tabBtn = e.target.closest(".tabbed-btn");
//   if (!tabBtn) return;

//   setTimeout(() => {
//     let el = tabBtn;

//     // upar sudhi traverse karo jya sudhi scrollable element na male
//     while (el && el !== document.body) {
//       if (el.scrollHeight > el.clientHeight) {
//         el.scrollTop = 0;
//         break;
//       }
//       el = el.parentElement;
//     }

//     // last fallback – window scroll
//     window.scrollTo(0, 0);

//   }, 120);
// });




// document.addEventListener("click", function (e) {
//   const tabBtn = e.target.closest(".tabbed-btn");
//   if (!tabBtn) return;

//   // intentionally empty

// });




document.addEventListener("click", function (e) {
  const tabBtn = e.target.closest(".tabbed-btn");
  if (!tabBtn) return;

  // desktop par kai pan na karo
  if (window.innerWidth > 768) return;

  setTimeout(() => {
    const tabSection =
      tabBtn.closest(".bundle-content--tabs") ||
      document.querySelector(".bundle-content--tabs");

    if (!tabSection) return;

    const headerOffset = 90; // mobile header height pramane adjust karo
    const y =
      tabSection.getBoundingClientRect().top +
      window.scrollY -
      headerOffset;

    window.scrollTo({
      top: y,
      behavior: "auto" // mobile ma instant scroll
    });
  }, 120);
});



