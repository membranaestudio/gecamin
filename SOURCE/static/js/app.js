window.app = {
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
			curvedMasks: false,
			curvedMasksForceRepaint: false // fix Safari flickering
		},

		/**
		 * Preload components
		 */
		preloadComponents: true
	},

	// Contenedor externo
	containerEl: document.querySelector('#page-wrapper'),
	// Contendor interno
	contentEl: document.querySelector('#page-wrapper__content'),


	init: () => {
		app.checkIsLocalFile();

		app.loadPreloader()
			.then(() => app.injectPreloadTags())
			.then(() => Promise.all([
				app.loadScroll(),
				app.loadHeader()
			]))
			.then(() => app.componentsManager.init({
				scope: app.containerEl,
				loadOnlyFirst: true
			})[0])
			.then(() => Promise.all(app.componentsManager.init({
				scope: app.containerEl
			})))
			.then(() => {
				app.loadLazy();
				ScrollTrigger.refresh();
			});
	},

	setup: () => {
		// GSAP: desactiva advertencias en elementos nulos

		gsap.config({
			nullTargetWarn: false
		});

		// GSAP: registrar dependencias
		gsap.registerPlugin(DrawSVGPlugin);
		gsap.registerPlugin(ScrollTrigger);
		gsap.registerPlugin(ScrollToPlugin);
		gsap.registerPlugin(MorphSVGPlugin);

		// SrollTrigger: En dispositivos mobiles no recalcula altura si aparece o desaparece la barra inferior
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
		'arts-infinite-list': [{
			type: 'script',
			src: './js/vendor/arts-infinite-list/arts-infinite-list.min.js',
			id: 'arts-infinite-list-js'
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
		'swipper': [{
			type: 'script',
			src: './js/vendor/swiper.min.js',
			id: 'swiper-js'
		}],
		'jspdf': [{
			type: 'script',
			src: './js/vendor/jspdf.umd.min.js',
			id: 'jspdf-js'
		}],
		'html2canvas': [{
			type: 'script',
			src: './js/vendor/html2canvas.min.js',
			id: 'html2canvas-js'
		}],


		
	},

	components: {
		'Header': {
			dependencies: ['arts-header'],
			file: './components/header/Header.js'
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
			file: './components/content/Content.js'
		},
		'Parallax': {
			dependencies: ['arts-parallax'],
			file: './components/Parallax.js'
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
		'Swipper': {
			dependencies: ['swipper'],
			file: './components/swiper/Swiper.js'
		},
		'CountDown': {
			dependencies: [],
			file: './components/countdown/CountDown.js'
		},
		'Tabs': {
			dependencies: [],
			file: './components/tabs/Tabs.js'
		},
		'MoveResposive': {
			dependencies: [],
			file: './components/moveResponsive/moveReponsive.js'
		},
		'Accordion': {
			dependencies: [],
			file: './components/accordion/Accordion.js'
		},
		'AccordionProgram': {
			dependencies: [],
			file: './components/accordionProgram/AccordionProgram.js'
		},
		'CreatePDF': {
			dependencies: ['jspdf', 'html2canvas'],
			file: './components/accordionProgram/CreatePDF.js'
		},
		'BackButton': {
			dependencies: [],
			file: './components/mobileProgram/BackButton.js'
		},
		'MyCustomComponent': {
			dependencies: [],
			file: './components/myCustomComponent/MyCustomComponent.js'
		}
	},

	// Verifica si la app se está ejecutando localmente.
	checkIsLocalFile: () => {
		if (window.location.protocol === 'file:') {
			const
				labelElement = document.createElement('div'),
				errorMessage = 'Utilice un servidor web para ver esta página.';

			labelElement.id = 'localFilesystem';
			labelElement.className = 'text-center';
			labelElement.innerHTML += `<div class="strong mb-4">${errorMessage}</div>`;
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

	// Lazy Loading
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

	// Deslazamiento a una sección especifica : Lenis
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
				duration: 0.05
			}) : null).then(() => resolve(true));
		});
	},

	// Determina si esta o no activo smooth scroll : Lenis
	shouldLoadSmoothScroll() {
		return ScrollTrigger.isTouch !== 1 && app.utilities.isEnabledOption(app.options.smoothScroll);
	},

	// Header 
	loadHeader: () => {
		const el = document.querySelector('#page-header');
		return app.componentsManager.loadComponent({
			el,
			loadInnerComponents: true,
			storage: app.componentsManager.instances.persistent,
			parent: null,
			name: 'Header',
			options: app.options.header
		});
	},

	// / Lugar para crear preloader
	loadPreloader() {
		return new Promise((resolve) => {
			resolve(true);
		});
	},

	// Maneja carga de componentes
	injectPreloadTags: ({
		container
	} = {
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
						files.forEach(({
							type,
							src
						}) => {
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
								app.assets[dep].forEach(({
									type,
									src
								}) => {
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


app.setup();
app.init();