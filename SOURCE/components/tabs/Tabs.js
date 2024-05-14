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

	
		this.tl = gsap.timeline;
		this.elements.contents = [];
		this.elements.tabs.forEach(tab => {
			const contentId = tab.getAttribute('data-tab');
			const contentElement = document.getElementById(contentId);
			if (contentElement) {
				this.elements.contents.push(contentElement);
			}
			tab.addEventListener('click', this.showTab.bind(this));
		});

		if (this.elements.contents.length > 0) {
			this.elements.tabs[0].classList.add('active');
			this.elements.contents.forEach((content, index) => {
				if (index !== 0) {
					content.classList.add('d-none');
				}
			});
			this.current = this.elements.contents[0];
		}
		
		this.checkHashAndActivateTab();
	






	}

	showTab({
		currentTarget
	}) {
		this.activateTab(currentTarget);
	}

	activateTab(tabElement) {
		this.elements.tabs.forEach(tab => tab.classList.remove('active'));
		tabElement.classList.add('active');
		const content = document.getElementById(tabElement.getAttribute('data-tab'));

		if (content) {
			const tl = gsap.timeline({
				defaults: {
					duration: 0.2
				}
			});

			if (this.current) {
				tl.to(this.current, {
					y: '100px',
					autoAlpha: 0,
					onComplete: () => {
						this.current.classList.add("d-none");
						this.current = content;
						content.classList.remove("d-none");
					}
				});
			}

			tl.set(content, {
				y: '100px',
				autoAlpha: 0,
			});

			tl.to(content, {
				y: '0',
				autoAlpha: 1,
			});
		} else {
			console.warn(`No content: ${tabElement.getAttribute('data-tab')}`);
		}

		window.location.hash = tabElement.getAttribute('data-tab');
	}

	checkHashAndActivateTab() {
		const hash = window.location.hash;
		if (hash) {
			const tabElement = this.elements.tabs.find(tab => `#${tab.getAttribute('data-tab')}` === hash);
			if (tabElement) {
				this.activateTab(tabElement);
			}
		}
	}

}