import WebViewer from "@pdftron/webviewer";

WebViewer({
  path: "/webviewer/lib",
  initialDoc: "/files/WebviewerDemoDoc-Annotated.pdf",
  fullAPI: true,
  // viewer.current
}).then(async (instance) => {
  const { annotationManager, Annotations } = instance.Core;
  annotationManager.promoteUserToAdmin();

  annotationManager.addEventListener(
    "annotationChanged",
    async (annotations, _action, _info) => {
      annotations.forEach((annot) => {
        console.log(annot);
        if (
          annot instanceof Annotations.RectangleAnnotation &&
          annot.ToolName === "SignatureFormFieldCreateTool"
        ) {
          // Annotation type is a rectangle if the signature form field is not applied
          console.log(annot);
        }
        if (annot instanceof Annotations.SignatureWidgetAnnotation) {
          // Once the Annotation is applied, the annotation will become a SignatureWidget
          console.log(annot);
        }
      });
    }
  );
});
