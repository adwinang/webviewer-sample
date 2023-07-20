import React, { useRef, useEffect } from "react";
import WebViewer from "@pdftron/webviewer";
import { saveAs } from "file-saver";

import "./App.css";

const App = () => {
  const viewer = useRef(null);
  useEffect(() => {
    if (viewer.current) {
      WebViewer(
        {
          path: "/webviewer/lib",
          initialDoc: "/files/PLAN_CREATION_TEMPLATE.xlsx",
          fullAPI: true,
          showToolbarControl: true,
          showSideWindowControl: false,
        },
        viewer.current
      )
        .then(async (instance) => {
          const { documentViewer, PDFNet, annotationManager } = instance.Core;
          documentViewer.addEventListener("documentLoaded", async () => {
            await PDFNet.initialize();
            console.log("loaded");
            const viewerDoc = documentViewer.getDocument();
            console.log(viewerDoc.getType());

            let doc = null;
            if (viewerDoc.getType() === "office") {
              const xfdfString = await annotationManager.exportAnnotations();
              const data = await viewerDoc.getFileData({
                // saves the document with annotations in it
                xfdfString,
                downloadType: "pdf",
              });
              doc = await PDFNet.PDFDoc.createFromBuffer(data);
            } else doc = await viewerDoc.getPDFDoc();

            const customHandler = await PDFNet.SecurityHandler.createDefault();

            // Set a new password required to open a document
            const user_password = "test";
            customHandler.changeUserPasswordUString(user_password);

            // Set Permissions
            customHandler.setPermission(
              PDFNet.SecurityHandler.Permission.e_print,
              false
            );
            customHandler.setPermission(
              PDFNet.SecurityHandler.Permission.e_extract_content,
              true
            );

            // Note: document takes the ownership of newHandler.
            doc.setSecurityHandler(customHandler);

            console.log("Saving modified file...");

            const docbuf = await doc.saveMemoryBuffer(
              PDFNet.SDFDoc.SaveOptions.e_linearized
            );
            const arr = new Uint8Array(docbuf);
            const blob = new Blob([arr], { type: "application/pdf" });

            // Function to save file. In this case we can use file-saver library
            saveAs(blob, "secured.pdf");
          });
          documentViewer.setWatermark({
            diagonal: {
              fontSize: 25, // or even smaller size
              fontFamily: "sans-serif",
              color: "red",
              opacity: 50, // from 0 to 100
              text: "Watermark",
            },
          });
        })
        .catch((err) => console.error(err));
    }
  }, [viewer]);

  return (
    <div className="App">
      <div className="header">
        <h1>Welcome to WebViewer</h1>
      </div>
      <div ref={viewer} class="webviewer"></div>
      {/* <ModalFileViewer
        isOpen={open}
        onClose={handleClose}
        file={"files/PDFTRON_about.pdf"}
      /> */}
    </div>
  );
};

export default App;
