import React, { useRef, useEffect, useState } from "react";
import WebViewer from "@pdftron/webviewer";

import "./App.css";

const App = () => {
  const viewer = useRef(null);
  const [webViewerInstance, useInstance] = useState();
  const [currentFormField, useFormField] = useState();
  const [currentFormFieldValue, useFormFieldValue] = useState();

  useEffect(() => {
    if (viewer.current) {
      WebViewer(
        {
          path: "/webviewer/lib",
          initialDoc: "files/form-1040.pdf",
          fullAPI: true,
        },
        viewer.current
      )
        .then(async (instance) => {
          useInstance(instance);
          const { annotationManager } = instance.Core;
          annotationManager.addEventListener(
            "fieldChanged",
            async (field, value) => {
              console.log(`Field changed: ${field.name}, ${value}`);
              useFormField(field);
              useFormFieldValue(value);
            }
          );
        })
        .catch((err) => console.error(err));
    }
  }, [viewer]);

  async function addPage() {
    const {
      documentViewer,
      annotationManager,
      Annotations,
    } = webViewerInstance.Core;
    const doc = documentViewer.getDocument();
    const { WidgetFlags } = Annotations;

    const width = 612;
    const height = 792;
    const totalPage = documentViewer.getPageCount();
    console.log(totalPage);
    const newPageValue = totalPage + 1;
    await doc.insertBlankPages([newPageValue], width, height);
    console.log(currentFormField);

    const flags = new WidgetFlags();
    flags.set("Multiline", true);

    // create a form field
    const field = new Annotations.Forms.Field(`Continuation`, {
      type: "Tx",
      value: currentFormFieldValue,
      flags,
    });

    currentFormField.setValue(`Continued in Page ${newPageValue}`);

    // Create a text annotation
    const border = 10;
    var widgetAnnot = new Annotations.TextWidgetAnnotation(field);
    widgetAnnot.PageNumber = newPageValue; // Page number
    widgetAnnot.X = border; // X coordinate in points
    widgetAnnot.Y = border; // Y coordinate in points
    widgetAnnot.Width = width - border; // Width of the annotation
    widgetAnnot.Height = height - border; // Height of the annotation
    widgetAnnot.font = new Annotations.Font({ name: "Helvetica", size: 16 });

    annotationManager.getFieldManager().addField(field);
    // Add the annotation to the first page
    annotationManager.addAnnotation(widgetAnnot);
    // Refresh the annotation manager to apply changes
    annotationManager.drawAnnotationsFromList([widgetAnnot]);
  }

  return (
    <div className="App">
      <div className="header">
        <button onClick={addPage}>Add Page</button>
      </div>
      <div ref={viewer} class="webviewer"></div>
    </div>
  );
};

export default App;
