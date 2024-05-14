export default class CreatePDF extends BaseComponent {
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
        this.DownloadPDF();
        this.applyPDFStyles();
    }

    // Botón de descarga para iniciar la creación del PDF
    DownloadPDF() {
        const downloadButton = document.getElementById('downloadButton');
        downloadButton.addEventListener('click', () => {
            this.CreatePDF();
        });
    }

    // Crea el PDF y maneja la lógica
    CreatePDF() {
        const pdfWidth = 1380;
        const pdfHeight = 1600;
        const headerHeight = 174;
        const spaceBelowHeader = 80;
        const footerSpace = 80; // Espacio para el footer
        const pdf = new jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [pdfWidth, pdfHeight]
        });
        console.log('PDF inicializado');
        const containers = document.querySelectorAll('#content-to-capture');
        console.log('Contenedores encontrados:', containers.length);
        let currentPageHeight = headerHeight + spaceBelowHeader;
        const pageHeight = pdf.internal.pageSize.height - footerSpace; // Ajustar la altura de la página para el footer
        const captureWidth = 1260;
        let promiseChain = Promise.resolve();
        const pdfCloneContainer = document.querySelector('.pdf-clone');

        // Inicialmente añade el encabezado
        promiseChain = promiseChain.then(() => this.addHeader(pdf, pdfWidth, headerHeight));
        this.applyPDFStyles();

        containers.forEach((container, index) => {
            Array.from(container.querySelectorAll('.pdf-item')).forEach((heightItem, idx) => {
                promiseChain = promiseChain.then(() => {
                    return new Promise((resolveRow) => {
                        const clone = heightItem.cloneNode(true);
                        clone.classList.add('pdf-style');
                        pdfCloneContainer.appendChild(clone);
                        console.log(`Clon ${idx + 1} de contenedor ${index + 1} preparado para inspección:`, clone.outerHTML);
                        setTimeout(() => {
                            html2canvas(clone, {
                                scale: 2,
                                width: captureWidth
                            }).then(canvas => {
                                pdfCloneContainer.removeChild(clone);
                                const imgData = canvas.toDataURL('image/jpeg');
                                const imgWidth = captureWidth;
                                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                                const marginLeft = (pdfWidth - imgWidth) / 2;
                                if (currentPageHeight + imgHeight > pageHeight) {
                                    pdf.addPage();
                                    // Añadir el encabezado en la nueva página y ajustar currentPageHeight
                                    this.addHeader(pdf, pdfWidth, headerHeight).then(() => {
                                        currentPageHeight = headerHeight + spaceBelowHeader; // Restablecer la altura de la página actual
                                        pdf.addImage(imgData, 'JPEG', marginLeft, currentPageHeight, imgWidth, imgHeight);
                                        currentPageHeight += imgHeight;
                                        resolveRow();
                                    });
                                } else {
                                    pdf.addImage(imgData, 'JPEG', marginLeft, currentPageHeight, imgWidth, imgHeight);
                                    currentPageHeight += imgHeight;
                                    resolveRow();
                                }
                            });
                        }, 0);
                    });
                });
            });
        });
        promiseChain.then(() => {
            pdf.save('test3.pdf');
            console.log('PDF guardado correctamente.');
        }).catch(err => {
            console.error('Error al generar el PDF:', err);
        });
    }

    // Aplica estilos específicos para la generación del PDF
    applyPDFStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .pdf-style .tag span {
                position: relative;
                top: -12px !important;
            }
            .pdf-style h4 {
                position: relative;
                top: -8px !important;
            }
            .pdf-style span.bb-solid {
                border: none !important;
            }
        `;
        document.head.appendChild(style);
        console.log('Estilos PDF aplicados:', style.textContent);
    }

    // Función auxiliar para añadir el encabezado al PDF
    addHeader(pdf, pdfWidth, headerHeight) {
        return new Promise(resolveHeader => {
            const img = new Image();
            img.src = 'header.png';
            img.onload = () => {
                pdf.addImage(img, 'PNG', 0, 0, pdfWidth, headerHeight);
                console.log('Encabezado añadido');
                resolveHeader();
            };
        });
    }
}