export default class Swipper extends BaseComponent {
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
            defaults: {
                slidesPerView: 1,
                spaceBetween: 0,
                centeredSlides: false,
                autoplay: false,
                breakpoints: {},
                loop: false,
                grabCursor: false,
                autoHeight: false,
                lazy: false,

            },
            innerElements: {
                swippers: '.swiper',
                pagination: '.swiper-pagination',
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
                scrollbar: ".swiper-scrollbar"
            }
        });

        this.setup();
    }

    init() {
        this.swipers = []
        this.elements.swippers.forEach(element => {
            this.swipers.push(new Swiper(element, {
                slidesPerView: this.options.slidesPerView,
                spaceBetween: this.options.spaceBetween,
                centeredSlides: this.options.centeredSlides,
                loop: this.options.loop,
                autoplay: this.options.autoplay,
                breakpoints: this.options.breakpoints,
                autoHeight: this.options.autoHeight,
                grabCursor: this.options.grabCursor,
                lazy: this.options.lazy,
                pagination: {
                    el: this.elements.pagination,
                    clickable: true
                },
                navigation: {
                    nextEl: this.elements.nextEl,
                    prevEl: this.elements.prevEl,
                },
                scrollbar: {
                    el: this.elements.scrollbar.length ? this.elements.scrollbar[0] : null,
                },
            }))
        });

    }
}