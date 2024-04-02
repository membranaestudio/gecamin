window.app = {
	/**
	 * --- Template Options ---
	 */
	options: {
		/**
		 * Header options
		 */
		header: {
			sticky: {
				toggleAttributes: {
					'data-arts-header-logo': 'data-arts-header-sticky-logo',
					'data-arts-color-theme': 'data-arts-header-sticky-color-theme',
					'class': 'data-arts-header-sticky-class'
				},
				toggleReveal: true,
				toggleStickyClass: 'header__bar_sticky',
				toggleRevealingClass: false,
				toggleScrollingDownClass: 'header__bar_scrolling-down'
			},
			observeHeight: true,
			matchMediaAutoCloseOverlay: '(min-width: 992px)'
		},

		/**
		 * Smooth scrolling options
		 */
		smoothScroll: {
			enabled: true,
			duration: 1.2,
			easing: gsap.parseEase('expo.out'),
			useGSAPRaf: true
		},

		/**
		 * Options for components that use virtual scroll
		 */
		virtualScroll: {
			easing: {
				mouse: 0.1,
				touch: 0.06
			},
			speed: {
				mouse: 1,
				touch: 2.5
			},
			maxDelta: {
				mouse: 240,
				touch: 180
			},
			snapDelay: {
				mouse: 0.05,
				touch: 0.6
			}
		},

		/**
		 * Loading screen options
		 */
		preloader: {
			enabled: false,
			timeScale: 1,
			loadingRotation: 90,
			loadingSteps: [
				[20, 40],
				[50, 80],
				[100, 100]
			],
			finalDelay: 0.4,
			finalOffset: '<20%',
			finalRotation: 180,
			toggleLoadClass: 'preloader_loaded',
		},

		
		/**
		 * Photoswipe lightbox
		 */
		gallery: {
			itemsSelector: 'a[href]:not(a[href="#"]):not(a[href*="#"])',
			bgOpacity: 1.0,
			colorTheme: 'dark',
			initialZoomLevel: 'fit',
			secondaryZoomLevel: 2.5,
			maxZoomLevel: 4,
			// "X" (close) button
			close: {
				custom: true,
				label: false,
				labelHover: false,
				cursor: {
					magnetic: 0.25,
					scale: 1.3,
					hideNative: false,
					color: 'var(--color-accent-dark-theme)'
				}
			},
			// Prev & next gallery arrows
			arrows: {
				custom: true,
				cursor: {
					scale: 'current',
					magnetic: 0.25,
					color: 'var(--color-accent-dark-theme)'
				}
			},
			// Images counter in gallery (e.g. "2 / 7")
			counter: {
				custom: true
			},
			// Images captions grabbed from 'data-caption' attribute on <a> link
			// or from "alt" attribute of the currently active image
			captions: true,
			// Media loading indicator
			preloader: {
				custom: true
			},
			// "Zoom" button in top bar
			zoom: false,
		},

		/**
		 * Auto transition to the next portfolio page
		 * at the bottom
		 */
		autoScrollNext: {
			webGL: {
				enabled: false,
				vertices: 16,
			},
			onSceneProgress: {
				speed: 8,
				amplitude: 4,
				segments: 4,
				scalePlane: 1.1,
				scaleTexture: 1,
			},
			onSceneIdle: {
				speed: 4,
				amplitude: 2,
				segments: 4,
				scalePlane: 1,
				scaleTexture: 1.2,
			},
			scrollingClass: 'auto-scroll-next_scrolling',
			completeClass: 'auto-scroll-next_complete',
			toggleHeaderVisibility: true
		},

		/**
		 * Animations options
		 */
		animations: {
			triggerHook: 0.10,
			speed: { // slow down or speed up the animations
				preloader: 1.0,
				onScrollReveal: 1.0,
				overlayMenuOpen: 1.0,
				overlayMenuClose: 1.25,
			},
			curvedMasks: true,
			curvedMasksForceRepaint: true // fix Safari flickering
		},

		/**
		 * SVG shape used for creating "drawing" effect
		 */
		circleTemplate: `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100%" height="100%"><ellipse cx="50%" cy="50%" rx="48%" ry="48%" fill="none"></svg>`,

		/**
		 * Preload components
		 */
		preloadComponents: true
	},

	// Outer content container
	containerEl: document.querySelector('#page-wrapper'),

	// Inner content container
	contentEl: document.querySelector('#page-wrapper__content'),

	init: () => {
		// Verifica si el archivo se está ejecutando localmente y muestra un mensaje de error si es así. 
		app.checkIsLocalFile();

		app.loadPreloader()
			// Carga el preloader de la página y luego inyecta etiquetas de precarga para componentes, archivos y dependencias. 
			.then(() => app.injectPreloadTags())

			//  Carga el desplazamiento suave y el encabezado de la página de manera asíncrona. 
			.then(() => Promise.all([
				app.loadScroll(),
				app.loadHeader()
			]))
			// Inicializa los componentes de la página, cargando solo el primero de ellos.
			.then(() => app.componentsManager.init({
				scope: app.containerEl,
				loadOnlyFirst: true
			})[0])
			//  Inicializa el resto de los componentes de la página. 
			.then(() => Promise.all(app.componentsManager.init({
				scope: app.containerEl
			})))
			//  Realiza un desplazamiento suave a un ancla específica en la página, si se ha proporcionado en la URL. 
			.then(() => app.utilities.scrollToAnchorFromHash())
			//  Inicia la carga perezosa de elementos, carga la interfaz gráfica de usuario (GUI) y actualiza el controlador de desplazamiento. 
			.then(() => {
				app.loadLazy();
				app.loadGUI();
				ScrollTrigger.refresh();
			});
	},

	setup: () => {
		/**
		 * GSAP: turn off console warnings when
		 * attempting to manipulate the null target
		 */
		gsap.config({
			nullTargetWarn: false
		});

		/**
		 * GSAP: register dependant plugins
		 */
		gsap.registerPlugin(DrawSVGPlugin);
		gsap.registerPlugin(ScrollTrigger);
		gsap.registerPlugin(ScrollToPlugin);
		gsap.registerPlugin(MorphSVGPlugin);

		/**
		 * Don't recalculate ScrollTrigger instances
		 * when mobile bottom bar is automatically hiding or showing
		 */
		ScrollTrigger.config({
			ignoreMobileResize: true
		});
	},

	utilities: new Utilities(),

	animations: new Animations(),

	forms: new Forms(),

	hoverEffect: new HoverEffect(),

	assetsManager: new AssetsManager(),

	componentsManager: new ComponentsManager(),

	lazy: null,

	assets: {
		'arts-header': [{
			type: 'script',
			src: './js/vendor/arts-header.min.js',
			id: 'arts-header-js'
		}],
		'arts-fullpage-slider': [{
			type: 'script',
			src: './js/vendor/arts-fullpage-slider.min.js',
			id: 'arts-fullpage-slider-js'
		}],
		'arts-infinite-list': [{
			type: 'script',
			src: './js/vendor/arts-infinite-list/arts-infinite-list.min.js',
			id: 'arts-infinite-list-js'
		}],
		'arts-horizontal-scroll': [{
			type: 'script',
			src: './js/vendor/arts-horizontal-scroll.min.js',
			id: 'arts-horizontal-scroll-js'
		}],
		'arts-parallax': [{
			type: 'script',
			src: './js/vendor/arts-parallax.min.js',
			id: 'arts-parallax-js'
		}],
		'circle-type': [{
			type: 'script',
			src: './js/vendor/circletype.min.js',
			id: 'circle-type-js'
		}],
		'photoswipe': [{
			type: 'script',
			src: './js/vendor/photoswipe.umd.min.js',
			id: 'photoswipe-js'
		}, {
			type: 'script',
			src: './js/vendor/photoswipe-lightbox.umd.min.js',
			id: 'photoswipe-lightbox-js'
		}],
		'lenis': [{
			type: 'script',
			src: './js/vendor/lenis.min.js',
			id: 'lenis-js'
		}],
		'barba': [{
			type: 'script',
			src: './js/vendor/barba.min.js',
			id: 'barba-js'
		}],
		'curtains': [{
			type: 'script',
			src: './js/vendor/curtains.umd.custom.min.js',
			id: 'curtains-js'
		}],
		'pristine': [{
			type: 'script',
			src: './js/vendor/pristine.min.js',
			id: 'pristine-js'
		}],
		'bootstrap-modal': [{
			type: 'script',
			src: './js/vendor/bootstrap-modal.min.js',
			id: 'bootstrap-modal-js'
		}],
		'isotope': [{
			type: 'script',
			src: './js/vendor/isotope.pkgd.min.js',
			id: 'isotope-js'
		}],
		'dat-gui': [{
			type: 'script',
			src: './js/vendor/dat.gui.min.js',
			id: 'dat-gui-js'
		}]
	},

	components: {
		'Preloader': {
			dependencies: [],
			file: './components/Preloader.js'
		},
		'Header': {
			dependencies: ['arts-header'],
			file: './components/Header.js'
		},
		'MenuOverlay': {
			dependencies: ['arts-infinite-list'],
			file: './components/MenuOverlay.js'
		},
		'MenuClassic': {
			dependencies: [],
			file: './components/MenuClassic.js'
		},
		'SliderFullpageBackgroundsMask': {
			dependencies: ['arts-fullpage-slider'],
			files: [{
				type: 'script',
				src: './js/components/SliderFullpageBase.js',
				id: 'slider-fullpage-base-js'
			}],
			file: './components/SliderFullpageBackgroundsMask.js'
		},
		'SliderFullpageBackgroundsSlide': {
			dependencies: ['arts-fullpage-slider'],
			files: [{
				type: 'script',
				src: './js/components/SliderFullpageBase.js',
				id: 'slider-fullpage-base-js'
			}],
			file: './components/SliderFullpageBackgroundsSlide.js'
		},
		'SliderTestimonials': {
			dependencies: ['arts-fullpage-slider'],
			file: './components/SliderTestimonials.js'
		},
		'InfiniteList': {
			dependencies: ['arts-infinite-list'],
			file: './components/InfiniteList.js',
		},
		'CurtainsBase': {
			dependencies: ['curtains'],
			file: './components/CurtainsBase.js'
		},
		'SplitCounter': {
			dependencies: [],
			file: './components/SplitCounter.js',
		},
		'MarqueeHeader': {
			dependencies: ['arts-infinite-list'],
			file: './components/MarqueeHeader.js',
		},
		'MarqueeHeadingsHover': {
			dependencies: ['arts-infinite-list'],
			file: './components/MarqueeHeadingsHover.js',
		},
		'ScreensWall': {
			dependencies: ['arts-infinite-list'],
			file: './components/ScreensWall.js',
		},
		'RotatingButton': {
			dependencies: ['circle-type'],
			file: './components/RotatingButton.js'
		},
		'ArcImages': {
			dependencies: ['arts-infinite-list'],
			file: './components/ArcImages.js'
		},
		'Scroll': {
			dependencies: [],
			file: './components/Scroll.js'
		},
		'Masthead': {
			dependencies: [],
			file: './components/Masthead.js'
		},
		'Content': {
			dependencies: [],
			file: './components/Content.js'
		},
		'Parallax': {
			dependencies: ['arts-parallax'],
			file: './components/Parallax.js'
		},
		'HorizontalScroll': {
			dependencies: ['arts-horizontal-scroll'],
			file: './components/HorizontalScroll.js'
		},
		'PSWP': {
			dependencies: ['photoswipe'],
			file: './components/PSWP.js'
		},
		'GMap': {
			dependencies: [],
			file: './components/Gmap.js'
		},
		'FormAJAX': {
			dependencies: ['pristine', 'bootstrap-modal'],
			file: './components/FormAJAX.js'
		},
		'Grid': {
			dependencies: ['isotope'],
			file: './components/Grid.js'
		},
		'AutoScrollNext': {
			dependencies: [],
			file: './components/AutoScrollNext.js'
		},
		'FixedHeader': {
			dependencies: [],
			file: './components/FixedHeader.js'
		},
		'FixedWall': {
			dependencies: ['arts-infinite-list'],
			file: './components/FixedWall.js'
		},
		'CounterUp': {
			dependencies: [],
			file: './components/CounterUp.js'
		},
		'SliderImages': {
			dependencies: ['arts-infinite-list'],
			file: './components/SliderImages.js'
		},
		'ClickAndHold': {
			dependencies: [],
			file: './components/ClickAndHold.js'
		},
		'Mask': {
			dependencies: [],
			file: './components/Mask.js'
		},
		'Gui': {
			dependencies: ['dat-gui', 'barba'],
			file: './components/Gui.js'
		},
		'MyCustomComponent': {
			dependencies: [],
			file: './components/MyCustomComponent.js'
		}
	},

	checkIsLocalFile: () => {
		if (window.location.protocol === 'file:') {
			const
				labelElement = document.createElement('div'),
				errorMessage = 'Please use a web-server to view this page.',
				helpURL = 'https://docs.artemsemkin.com/asli/html/getting-started/classic-workflow.html',
				helpLabel = 'Learn More';

			labelElement.id = 'localFilesystem';
			labelElement.className = 'text-center';
			labelElement.innerHTML += `<div class="strong mb-4">${errorMessage}</div>`;
			labelElement.innerHTML += `<a class="button button_solid bg-dark-3 ui-element" href="${helpURL}" target="_blank">${helpLabel}</a>`;

			gsap.set(labelElement, {
				position: 'fixed',
				top: '50%',
				left: '50%',
				translateX: '-50%',
				translateY: '-50%',
				zIndex: 99999,
				backgroundColor: '#000',
				color: '#fff',
				fontSize: 18,
				padding: '2em'
			});

			document.body.append(labelElement);

			throw new Error(label);
		}
	},

	loadGUI: () => {
		if (!app.shouldLoadGUI()) {
			return;
		}

		let el = document.querySelector('.js-gui');
		let mq;

		if (!el) {
			el = document.createElement('div');
			el.classList.add('js-gui');

			document.body.appendChild(el);
		}

		if (app.shouldLoadGUI()) {
			mq = window.matchMedia('(min-width: 992px)');

			if (mq.matches) {
				return load({
					matches: true
				});
			} else {
				if (typeof mq.addEventListener === 'function') {
					mq.addEventListener('change', load);
				} else {
					mq.addListener(load);
				}
			}
		} else {
			return load({
				matches: true
			});
		}

		function load(event) {
			if (event && event.matches) {
				if (mq) {
					if (typeof mq.removeEventListener === 'function') {
						mq.removeEventListener('change', this);
					} else {
						mq.removeListener(this);
					}
				}

				return app.componentsManager.loadComponent({
					el,
					loadInnerComponents: false,
					parent: null,
					storage: app.componentsManager.instances.persistent,
					name: 'Gui',
					options: app.options.gui,
				});
			}
		}
	},

	shouldLoadGUI: () => {
		const currentURL = new URL(window.location.href);

		return currentURL.searchParams.has('gui') && currentURL.searchParams.get('gui') !== 'false';
	},

	loadLazy: () => {
		return new Promise((resolve) => {
			app.lazy = new LazyLoad({
				threshold: 800,
				cancel_on_exit: false,
				unobserve_entered: true
			});

			resolve(true);
		});
	},

	loadScroll: (resetPosition = true) => {
		if (app.shouldLoadSmoothScroll()) {
			app.components.Scroll.dependencies.push('lenis');
		}

		return new Promise((resolve) => {
			app.componentsManager.loadComponent({
				el: app.containerEl,
				loadInnerComponents: false,
				parent: null,
				storage: app.componentsManager.instances.persistent,
				name: 'Scroll',
				options: app.options.smoothScroll,
			}).then(resetPosition ? () => app.utilities.scrollTo({
				target: 0,
				delay: 0,
				duration: 0.05,
				cb: () => resolve(true)
			}) : () => resolve(true));
		});
	},

	shouldLoadSmoothScroll() {
		return ScrollTrigger.isTouch !== 1 && app.utilities.isEnabledOption(app.options.smoothScroll);
	},

	

	

	loadHeader: () => {
		const el = document.querySelector('#page-header');

		return app.componentsManager.loadComponent({
			el,
			loadInnerComponents: true,
			storage: app.componentsManager.instances.persistent,
			parent: null,
			options: app.options.header
		});
	},



	shouldNotLoadCursor() {
		return !app.options.cursorFollower || (!!app.options.cursorFollower && !app.options.cursorFollower.enabled);
	},

	shouldLoadCursor() {
		return app.utilities.isEnabledOption(app.options.cursorFollower) && !!app.options.cursorFollower.matchMedia;
	},

	loadPreloader() {
		return new Promise((resolve) => {
			const el = document.querySelector('#js-preloader');

			if (el) {
				if (app.shouldLoadPreloader()) {
					app.componentsManager.loadComponent({
						el,
						loadInnerComponents: true,
						parent: null,
						storage: app.componentsManager.instances.persistent,
						options: app.options.preloader,
					}).then(() => resolve(true));
				} else {
					el.style.display = 'none';

					resolve(true);
				}
			} else {
				resolve(true);
			}
		});
	},

	shouldLoadPreloader() {
		return app.utilities.isEnabledOption(app.options.preloader);
	},

	setLoaded: () => { },

	injectPreloadTags: ({ container } = {
		container: app.containerEl
	}) => {
		return new Promise((resolve) => {
			if (!!app.options.preloadComponents && container instanceof HTMLElement) {
				const nextComponents = [...container.querySelectorAll('[data-arts-component-name]')];
				const rel = 'preload';

				nextComponents.forEach((component) => {
					const
						name = component.getAttribute('data-arts-component-name'),
						dependencies = app.components[name].dependencies,
						src = app.components[name].file.replace('./', './js/'),
						files = app.components[name].files;

					// Preload component file
					app.assetsManager.injectPreload({
						src,
						rel,
					});

					// Preload component files if there are any
					if (files && files.length) {
						files.forEach(({ type, src }) => {
							app.assetsManager.injectPreload({
								src,
								rel,
								as: type
							});
						});
					}

					// Prefetch dependencies if there are any
					if (dependencies && dependencies.length) {
						dependencies.forEach((dep) => {
							if (dep in app.assets) {
								app.assets[dep].forEach(({ type, src }) => {
									app.assetsManager.injectPreload({
										src,
										rel,
										as: type
									});
								});
							}
						});
					}
				});
			}

			resolve(true);
		});
	}
};

app.loaded = new Promise((resolve) => {
	app.setLoaded = resolve;
});
app.setup();
app.init();
