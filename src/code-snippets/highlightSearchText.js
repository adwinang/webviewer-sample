import WebViewer from "@pdftron/webviewer";

WebViewer({
  path: "/webviewer/lib",
  initialDoc: "/files/WebviewerDemoDoc-Annotated.pdf",
  fullAPI: true,
  // viewer.current
}).then(async (instance) => {
  const { annotationManager, Annotations, documentViewer } = instance.Core;

  documentViewer.addEventListener("documentLoaded", async () => {
    const doc = documentViewer.getDocument();
    const searchText = "into an\napplication";
    const pageNumber = 2;
    doc.loadPageText(pageNumber).then((text) => {
      console.log(text);
      let textStartIndex = 0;
      let textIndex;
      const annotationPromises = [];

      // find the position of the searched text and add text highlight annotation at that location
      while ((textIndex = text.indexOf(searchText, textStartIndex)) > -1) {
        textStartIndex = textIndex + searchText.length;
        // gets quads for each of the characters from start to end index. Then,
        // resolve the annotation and return.
        // see https://docs.apryse.com/api/web/Core.Document.html#getTextPosition__anchor
        const annotationPromise = doc
          .getTextPosition(pageNumber, textIndex, textIndex + searchText.length)
          // eslint-disable-next-line no-loop-func
          .then((quads) => {
            const annotation = new Annotations.TextHighlightAnnotation();
            annotation.Author = annotationManager.getCurrentUser();
            annotation.PageNumber = pageNumber;
            annotation.Quads = quads;
            annotation.StrokeColor = new Annotations.Color(0, 255, 255);
            return annotation;
          });
        annotationPromises.push(annotationPromise);
        // Wait for all annotations to be resolved.
        Promise.all(annotationPromises).then((annotations) => {
          annotationManager.addAnnotations(annotations);
          annotationManager.selectAnnotations(annotations);
        });
      }
    });
  });
});
