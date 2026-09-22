// Генерация PDF из скрытого DOM-узла с составом заказа:
// html2canvas-pro рендерит узел в canvas (поддерживает oklch/lab из
// современных CSS-палитр, в отличие от классического html2canvas),
// jsPDF укладывает картинку в A4-страницы и сохраняет файл.
// ВАЖНО: узел на момент вызова должен быть в DOM и видим для рендера
// (component рендерит его постоянно, скрывая off-screen).
// Библиотеки тянутся динамическим import() — попадают в отдельный
// чанк и не грузятся, пока пользователь не нажмёт «Сохранить в PDF».

export async function exportElementToPdf(element: HTMLElement, fileName: string): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas-pro'),
    import('jspdf'),
  ])

  const canvas = await html2canvas(element, {
    scale: 2, // чёткий текст на retina и в зуме
    backgroundColor: '#ffffff',
    useCORS: true,
  })

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  // Вписываем ширину canvas в ширину A4 (с полями 24pt) с сохранением пропорций.
  const margin = 24
  const imgWidth = pageWidth - margin * 2

  // Длинный заказ режется на несколько страниц: canvas рисуется
  // постранично смещением источника.
  const sliceHeightPt = pageHeight - margin * 2
  const pxPerPt = canvas.width / imgWidth
  const sliceHeightPx = sliceHeightPt * pxPerPt

  let renderedPx = 0
  let page = 0
  while (renderedPx < canvas.height) {
    const sliceCanvas = document.createElement('canvas')
    const sliceH = Math.min(sliceHeightPx, canvas.height - renderedPx)
    sliceCanvas.width = canvas.width
    sliceCanvas.height = sliceH
    const ctx = sliceCanvas.getContext('2d')
    if (!ctx) break
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height)
    ctx.drawImage(canvas, 0, renderedPx, canvas.width, sliceH, 0, 0, canvas.width, sliceH)

    if (page > 0) pdf.addPage()
    const sliceImgHeight = (sliceH * imgWidth) / canvas.width
    pdf.addImage(
      sliceCanvas.toDataURL('image/jpeg', 0.92),
      'JPEG',
      margin,
      margin,
      imgWidth,
      sliceImgHeight,
    )

    renderedPx += sliceH
    page += 1
  }

  pdf.save(fileName)
}
