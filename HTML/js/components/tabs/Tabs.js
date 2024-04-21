export default class Tabs extends BaseComponent {
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
      innerElements: {
        tabs: '[data-tab]'
      }
    });

    this.setup();
  }

  init() {
    this.tl = gsap.TimeLine;
    this.elements.contents = [];
    this.elements.tabs.forEach(tab => {
      const contentId = tab.getAttribute('data-tab');
      const contentElement = document.getElementById(contentId);
      this.elements.contents.push(contentElement);
      tab.addEventListener('click', this.showTab.bind(this));
    });

    this.elements.tabs[0].classList.add('active');
    this.elements.contents.forEach((content, index) => {
      if (index !== 0) {
        content.classList.add('d-none');
      }
    });

    this.current = this.elements.contents[0];
  }

  showTab({
    currentTarget
  }) {
    this.elements.tabs.forEach(tab => tab.classList.remove('active'));
    currentTarget.classList.add('active');

    const tl = gsap.timeline({
      defaults: {
        duration: 0.2
      }
    });

    const content = document.getElementById(currentTarget.getAttribute('data-tab'));

    tl.to(this.current, {
      y: '100px',
      autoAlpha: 0,
      onComplete: () => {
        this.current.classList.add("d-none");
        this.current = content;
        content.classList.remove("d-none");
      }
    });

    tl.set(content, {
      y: '100px',
      autoAlpha: 0,
    });

    tl.to(content, {
      y: '0',
      autoAlpha: 1,
    });
  }
}