export default class AccordionProgram extends BaseComponent {
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
            element
        });
        this.setup();
    }

    init() {
        this.accordionProgram();
    }

    accordionProgram() {
        const accordionBtns = document.querySelectorAll(".accordion__button");
        accordionBtns.forEach((accordionBtn) => {
            accordionBtn.onclick = function () {
                const accordionItem = accordionBtn.closest(".accordion__item");
                accordionItem.classList.toggle("is-open");
                let content = accordionBtn.nextElementSibling;
                if (content.style.maxHeight) {
                    content.style.maxHeight = null;
                } else {
                    content.style.maxHeight = content.scrollHeight + "px";
                }
            };
            const accordionItem = accordionBtn.closest(".accordion__item");
            if (accordionItem.classList.contains("is-open")) {
                let content = accordionBtn.nextElementSibling;
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    }

}