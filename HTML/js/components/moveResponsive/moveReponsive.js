export default class MoveResponsive extends BaseComponent {
  constructor({
    name,
    loadInnerComponents,
    parent,
    element
  }) {
    super({
      name,
      loadInnerComponents,
      parent,
      element,
      // Component default options
      defaults: {
        initContent: '.move-init',
        finishContent: '.move-finish',
        screenWidth: 991,
      }
    });

    // Setup the component and run init() function
    this.setup();

  }

  // Component code goes here
  init() {
    this.isMoveResponsive();
  }


  isMoveResponsive() {
    const initContent = this.element.querySelector(this.options.initContent);
    const finishContent = this.element.querySelector(this.options.finishContent);
    if (!initContent || !finishContent) {
      return
    } else {
      this.moveHTML();
      // window.addEventListener('resize', () => {
      //  this.moveHTML();
      // });
    }
  }

  moveHTML() {
    const screenWidth = window.innerWidth;
    const initContent = this.element.querySelector(this.options.initContent);
    const finishContent = this.element.querySelector(this.options.finishContent);
    const initDisplayStyle = window.getComputedStyle(initContent).display;
    const finishDisplayStyle = window.getComputedStyle(finishContent).display;

    if (screenWidth < this.options.screenWidth) {
      initContent.style.display = 'none';
      finishContent.style.display = 'block';
      finishContent.setAttribute('data-arts-os-animation-name', 'animatedJumpScale');
      while (initContent.firstChild) {
        finishContent.appendChild(initContent.firstChild);
      }

    } else {
      initContent.style.display = 'block';
      finishContent.style.display = 'none';
      while (finishContent.firstChild) {
        initContent.appendChild(finishContent.firstChild);
      }
    }



  }








}