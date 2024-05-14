export default class BackButton extends BaseComponent {
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
      defaults: {},
      // Component inner elements
      innerElements: {

      }
    });

    // Setup the component and run init() function
    this.setup();
  }

  // Component code goes here
  init() {
    this._backButton();
  }

  _backButton() {
    const backButton = document.querySelector('.back-button');

    backButton.addEventListener('click', function (event) {
      event.preventDefault(); 
      history.back(); 
    });
  }


}