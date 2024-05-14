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
    const initContents = this.element.querySelectorAll('.js-move-responsive ' + this.options.initContent);
    const finishContents = this.element.querySelectorAll('.js-move-responsive ' + this.options.finishContent);

    if (!initContents.length || !finishContents.length) {
      return;
    } else {
      initContents.forEach((initContent, index) => {
        const finishContent = finishContents[index];
        this.moveHTML(initContent, finishContent);
      });
      // window.addEventListener('resize', () => {
      //  this.moveHTML();
      // });
    }
  }

  moveHTML(initContent, finishContent) {
    const screenWidth = window.innerWidth;
    const initDisplayStyle = window.getComputedStyle(initContent).display;
    const finishDisplayStyle = window.getComputedStyle(finishContent).display;

    if (screenWidth < this.options.screenWidth) {
      initContent.style.display = 'none';
      finishContent.style.display = 'block';
      finishContent.setAttribute('data-arts-os-animation-name', 'animatedJump');
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