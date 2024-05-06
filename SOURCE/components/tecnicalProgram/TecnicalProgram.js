export default class TecnicalProgram extends BaseComponent {
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
        });
        this.setup();
    }
    init() {
        this.accordionProgram();
        this.DownloadPDF();
        this.applyPDFStyles()

    }

    accordionProgram() {
        const accordionBtns = document.querySelectorAll(".accordion-button");
        accordionBtns.forEach((accordion) => {
            accordion.onclick = function () {
                this.classList.toggle("is-open");
                let content = this.nextElementSibling;
                if (content.style.maxHeight) {
                    content.style.maxHeight = null;
                } else {
                    content.style.maxHeight = content.scrollHeight + "px";
                }
            };
            // Abrir el elemento que tiene la clase "is-open" al cargar la página  
            if (accordion.classList.contains("is-open")) {
                let content = accordion.nextElementSibling;
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    }

    DownloadPDF() {
        const downloadButton = document.getElementById('downloadButton');
        downloadButton.addEventListener('click', () => {
            this.CreatePDF();
        });
    }


    CreatePDF() {
        const pdfWidth = 1380;
        const pdfHeight = 1600;
        const headerHeight = 174;
        const spaceBelowHeader = 80;
        const pdf = new jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [pdfWidth, pdfHeight]
        });
        console.log('PDF inicializado');
        const containers = document.querySelectorAll('#content-to-capture');
        console.log('Contenedores encontrados:', containers.length);
        let currentPageHeight = headerHeight + spaceBelowHeader;
        const pageHeight = pdf.internal.pageSize.height - 30;
        const captureWidth = 1300;
        let promiseChain = Promise.resolve();

        const addHeader = () => {
            return new Promise(resolveHeader => {
                const img = new Image();
                img.src = 'header.png';
                img.onload = () => {
                    pdf.addImage(img, 'PNG', 0, 0, pdfWidth, headerHeight);
                    console.log('Encabezado añadido');
                    resolveHeader();
                };
            });
        };

        promiseChain = promiseChain.then(() => addHeader());
        this.applyPDFStyles();

        containers.forEach((container, index) => {
            Array.from(container.querySelectorAll('.height-item')).forEach((heightItem, idx) => {
                promiseChain = promiseChain.then(() => {
                    return new Promise((resolveRow) => {
                        const clone = heightItem.cloneNode(true);
                        clone.classList.add('pdf-style');
                        document.body.appendChild(clone);
                        console.log(`Clon ${idx + 1} de contenedor ${index + 1} preparado para inspección, por favor revise en el navegador:`, clone.outerHTML);

                        setTimeout(() => {
                            html2canvas(clone, {
                                scale: 2,
                                width: captureWidth
                            }).then(canvas => {
                                document.body.removeChild(clone);
                                const imgData = canvas.toDataURL('image/jpeg'); // Asegúrate de que el formato coincida
                                const imgWidth = captureWidth;
                                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                                const marginLeft = (pdfWidth - imgWidth) / 2;

                                if (currentPageHeight + imgHeight > pageHeight) {
                                    pdf.addPage();
                                    currentPageHeight = headerHeight + spaceBelowHeader;
                                    console.log('Nueva página añadida');
                                }

                                pdf.addImage(imgData, 'JPEG', marginLeft, currentPageHeight, imgWidth, imgHeight);
                                currentPageHeight += imgHeight;
                                resolveRow();
                            });
                        }, 5000);
                    });
                });
            });
        });

        promiseChain.then(() => {
            pdf.save('technical_program2.pdf');
            console.log('PDF guardado correctamente.');
        }).catch(err => {
            console.error('Error al generar el PDF:', err);
        });
    }


    applyPDFStyles() {
        const style = document.createElement('style');
        style.textContent = `
        .pdf-style .tag span {
            position: relative;
            top: -12px !important;
        }
        .pdf-style p {
            font-size: 18px !important;
            line-height: 1.4 !important;
        }
        .pdf-style.height-item {
            border-bottom: 5px solid red !important
        }
        
    `;
        document.head.appendChild(style);
        console.log('Estilos PDF aplicados:', style.textContent); // Mostrar los estilos aplicados en la consola
    }



}