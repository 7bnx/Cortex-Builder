"use strict";
const vscode = acquireVsCodeApi();
(function () {
  function loadConfig() {
    const elem = document.getElementById('pdf-viewer-config')
    if (elem) {
      return JSON.parse(elem.getAttribute('data-config'))
    }
    throw new Error('Could not load configuration.')
  }

  window.addEventListener('load', function () {
    const config = loadConfig()
    PDFViewerApplication.open(config.path)
    PDFViewerApplication.initializedPromise.then(() => {
      const defaults = config.defaults
      const optsOnLoad = () => {
        PDFViewerApplication.pdfViewer.currentScaleValue = defaults.scale

        PDFViewerApplication.eventBus.off('documentloaded', optsOnLoad)
      }
      PDFViewerApplication.eventBus.on('documentloaded', optsOnLoad)

      PDFViewerApplication.eventBus.on("pagesinit", function() {
        PDFViewerApplication.pdfSidebar.setInitialView(2); // to outline
        PDFViewerApplication.pdfSidebar.switchView(0, true); // hide
        PDFViewerApplication.page = defaults.page;
      });

      PDFViewerApplication.eventBus.on("pagechanging", function() {
        vscode.postMessage({command: 'page_changed', name: config.path, page: PDFViewerApplication.page});
      });

      PDFViewerApplication.eventBus.on("scalechanging", function() {
        vscode.postMessage({command: 'scale_changed', name: config.path, scale: PDFViewerApplication.pdfViewer.currentScaleValue});
      });

    })

    window.addEventListener('message', function () {
      window.PDFViewerApplication.open(config.path)
    });
  }, { once: true });


  window.onerror = function () {
    const msg = document.createElement('body')
    msg.innerText = 'An error occurred while loading the file. Please open it again.'
    document.body = msg
  }
}());
