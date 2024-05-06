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
        });
    }

    DownloadPDF() {
        const downloadButton = document.getElementById('downloadButton');
        downloadButton.addEventListener('click', () => {
            this.CreatePDF();
        });
    }

    CreatePDF() { 
        const pdfWidth = 1200; // Ancho del PDF
        const pdfHeight = 1600; // Alto del PDF
        const headerHeight = 144; // Altura del encabezado
        const spaceBelowHeader = 50; // Espacio debajo del encabezado
        const pdf = new jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [pdfWidth, pdfHeight] // Configurar el tamaño de la página
        });
        const containers = document.querySelectorAll('#content-to-capture');
        let currentPageHeight = headerHeight + spaceBelowHeader; // Iniciar después del encabezado y el espacio
        const pageHeight = pdf.internal.pageSize.height - 30; // 30px para padding
        const captureWidth = 1200; // Ancho de la captura
        let promiseChain = Promise.resolve(); // Iniciar una cadena de promesas

        // Función para agregar el encabezado a cada página
        const addHeader = () => {
            return new Promise(resolveHeader => {
                const img = new Image();
                img.src = 'header.png'; // Asegúrate de que la ruta es correcta
                img.onload = () => {
                    const imgWidth = pdfWidth; // Usar el ancho completo del PDF para el encabezado
                    pdf.addImage(img, 'PNG', 0, 0, imgWidth, headerHeight);
                    resolveHeader();
                };
            });
        };

        // Agregar el encabezado inicial
        promiseChain = promiseChain.then(() => addHeader());

        containers.forEach((container) => {
            Array.from(container.querySelectorAll('.row')).forEach(row => {
                promiseChain = promiseChain.then(() => {
                    return new Promise((resolveRow) => {
                        const clone = row.cloneNode(true);
                        // Procesar cambios de clase y contenido aquí
                        clone.style.maxWidth = captureWidth + 'px';
                        document.body.appendChild(clone);
                        html2canvas(clone, { scale: 2, width: pdfWidth }).then(canvas => {
                            document.body.removeChild(clone);
                            const imgData = canvas.toDataURL('image/png');
                            const imgWidth = captureWidth; // Ancho de la captura original
                            const imgHeight = (canvas.height * imgWidth) / canvas.width;
                            const marginLeft = (pdfWidth - imgWidth) / 2; // Calcular el margen izquierdo para centrar
                            if (currentPageHeight + imgHeight > pageHeight) {
                                pdf.addPage();
                                currentPageHeight = headerHeight + spaceBelowHeader; // Restablecer altura después del encabezado
                                addHeader(); // Agregar encabezado en la nueva página
                            }
                            pdf.addImage(imgData, 'JPEG', marginLeft, currentPageHeight, imgWidth, imgHeight, undefined, 'FAST');
                            currentPageHeight += imgHeight;
                            resolveRow();
                        });
                    });
                });
            });
        });

        promiseChain.then(() => {
            pdf.save('technical_program.pdf'); // Guardar el PDF una vez que todas las promesas se hayan resuelto
        });
    }


    
}