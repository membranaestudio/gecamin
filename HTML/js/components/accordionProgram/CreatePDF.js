export default class CreatePDF extends BaseComponent {
    constructor({ name, loadInnerComponents, parent, element }) {
        super({ name, loadInnerComponents, parent, element });
        this.setup();
    }

    async init() {
        this.DownloadPDF();
        this.applyPDFStyles();
    }

    DownloadPDF() {
        const downloadButton = document.getElementById('downloadButton');
        const pdfMessage = document.querySelector('.pdfMessage');
        pdfMessage.style.display = 'none';
        downloadButton.addEventListener('click', async () => {
            console.log('Inicio del proceso de descarga del PDF');
            downloadButton.style.display = 'none';
            pdfMessage.style.display = 'block';
            try {
                await this.CreatePDF();
                console.log('PDF generado y listo para descargar');
            } catch (err) {
                console.error('Error al generar el PDF:', err);
            } finally {
                downloadButton.style.display = 'flex';
                pdfMessage.style.display = 'none';
                console.log('Proceso de descarga del PDF completado');
            }
        });
    }

    async CreatePDF() {
        const pdfWidth = 1380;
        const pdfHeight = 1800;
        const headerHeight = 174;
        const spaceBelowHeader = 80;
        const footerSpace = 80;
        const pdf = new jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [pdfWidth, pdfHeight]
        });
        console.log('PDF inicializado');
        const containers = document.querySelectorAll('#content-to-capture');
        console.log('Contenedores encontrados:', containers.length);
        let currentPageHeight = headerHeight + spaceBelowHeader;
        const pageHeight = pdf.internal.pageSize.height - footerSpace;
        const captureWidth = 1260;
        const pdfCloneContainer = document.querySelector('.pdf-clone');

        await this.addHeader(pdf, pdfWidth, headerHeight);
        this.applyPDFStyles();

        for (const [index, container] of containers.entries()) {
            if (index > 0) {
                pdf.addPage();
                currentPageHeight = headerHeight + spaceBelowHeader;
                await this.addHeader(pdf, pdfWidth, headerHeight);
            }
            for (const [idx, heightItem] of Array.from(container.querySelectorAll('.pdf-item')).entries()) {
                const clone = heightItem.cloneNode(true);
                clone.classList.add('pdf-style');
                pdfCloneContainer.appendChild(clone);
                console.log(`Clon ${idx + 1} de contenedor ${index + 1} preparado para inspección`);
                let additionalSpace = 0;
                if (clone.classList.contains('accordion__button')) {
                    additionalSpace = 60;
                } else if (clone.classList.contains('accordion__finish')) {
                    additionalSpace = 140;
                } else if (clone.classList.contains('pdf-space-3')) {
                    additionalSpace = 0;
                }

                const canvas = await html2canvas(clone, { scale: 1.5, width: captureWidth,  windowWidth: captureWidth });
                pdfCloneContainer.removeChild(clone);
                const imgData = canvas.toDataURL('image/jpeg');
                const imgWidth = captureWidth;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                const marginLeft = (pdfWidth - imgWidth) / 2;

                if (currentPageHeight + imgHeight + additionalSpace > pageHeight) {
                    pdf.addPage();
                    await this.addHeader(pdf, pdfWidth, headerHeight);
                    currentPageHeight = headerHeight + spaceBelowHeader;
                }

                pdf.addImage(imgData, 'JPEG', marginLeft, currentPageHeight, imgWidth, imgHeight);
                currentPageHeight += imgHeight;
                currentPageHeight += additionalSpace;
            }
        }

        pdf.save('test4.pdf');
        console.log('PDF guardado correctamente.');
    }

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

    async addHeader(pdf, pdfWidth, headerHeight) {
        const img = new Image();
        img.src = 'header.png';
        await new Promise(resolve => {
            img.onload = () => {
                pdf.addImage(img, 'PNG', 0, 0, pdfWidth, headerHeight);
                console.log('Encabezado añadido');
                resolve();
            };
        });
    }
}