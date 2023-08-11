import React, { useRef, useEffect } from "react";
import WebViewer from "@pdftron/webviewer";
import { saveAs } from "file-saver";

import "./App.css";
import { useState } from "react";

function convertFiletoBase64(data) {
  if (data !== null && data !== undefined) {
    const reader = new FileReader();
    const futurePromise = new Promise((resolve, reject) => {
      reader.addEventListener(
        "load",
        () => {
          resolve(reader.result);
        },
        false
      );
      reader.addEventListener(
        "error",
        (event) => {
          reject(event);
        },
        false
      );
      reader.readAsDataURL(data);
    });
    return futurePromise;
  }
}

function base64ToBlob(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; ++i) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new Blob([bytes], { type: "application/pdf" });
}

const App = () => {
  const viewer = useRef(null);
  const [tempInstance, useInstance] = useState(null);
  useEffect(() => {
    if (viewer.current) {
      WebViewer(
        {
          path: "/webviewer/lib",
          initialDoc: "files/PDFTRON_about.pdf",
          fullAPI: true,
          showToolbarControl: true,
          showSideWindowControl: false,
        },
        viewer.current
      )
        .then(async (instance) => {
          const {
            documentViewer,
            PDFNet,
            annotationManager,
            Annotations,
          } = instance.Core;
          const { WidgetFlags } = Annotations;
          useInstance(instance);
          instance.UI.enableFeatures([
            instance.UI.Feature.MultiTab,
            instance.UI.Feature.ThumbnailMerging,
            instance.UI.Feature.Annotations,
          ]);

          // documentViewer.setWatermark({
          //   diagonal: {
          //     fontSize: 25, // or even smaller size
          //     fontFamily: "sans-serif",
          //     color: "red",
          //     opacity: 50, // from 0 to 100
          //     text: "Watermark",
          //   },
          // });
          instance.UI.addEventListener(
            instance.UI.Events.BEFORE_TAB_CHANGED,
            (e) => {
              if (e.detail !== undefined) {
                console.log(e);
              }
            }
          );

          async function testBase64Doc(blob) {
            const convertedBlob = await convertFiletoBase64(blob);
            const base64Data = convertedBlob
              .replace("data:", "")
              .replace(/^.+,/, "");

            const testDoc = await PDFNet.PDFDoc.createFromBuffer(
              Buffer.from(base64Data, "base64")
            );
            console.log(await testDoc.getPageCount());
          }

          async function getAllTabsAsBlob(instance) {
            const { documentViewer } = instance.Core;
            const { TabManager } = instance.UI;
            let blobToUpload = [];
            const allTab = TabManager.getAllTabs();
            console.log(allTab);
            // Change tab to first tab where the document with URL is located
            // TabManager.setActiveTab(0);
            // const firstDocument = documentViewer.getDocument();
            // const firstDocumentArrayBuffer = await firstDocument.getFileData();
            // const arr = new Uint8Array(firstDocumentArrayBuffer);
            // const firstDocumentBlob = new Blob([arr], {
            //   type: "application/pdf",
            // });
            // await testBase64Doc(firstDocumentBlob);
            // blobToUpload.push(firstDocumentBlob);
            // // Change the tab back to where it is supposed to be after getting the blob
            // TabManager.setActiveTab(allTab.length - 1);
            // let counter = 0;
            for (let tab of allTab) {
              // if (counter !== 0) {
              //   blobToUpload.push(tab.src);
              // }
              // counter += 1;
              const tabId = tab.id;
              TabManager.setActiveTab(tabId);
              const activeDocument = documentViewer.getDocument();
              const activeDocumentArrayBuffer = await activeDocument.getFileData();
              const arr = new Uint8Array(activeDocumentArrayBuffer);
              const activeDocumentBlob = new Blob([arr], {
                type: "application/pdf",
              });
              await testBase64Doc(activeDocumentBlob);
              blobToUpload.push(activeDocumentBlob);
            }

            console.log(blobToUpload);
          }

          instance.UI.addEventListener(
            instance.UI.Events.TAB_ADDED,
            async (e) => {
              await getAllTabsAsBlob(instance);
            }
          );

          annotationManager.addEventListener("annotationChanged", (e) => {
            console.log(e);
          });

          documentViewer.addEventListener("documentLoaded", async () => {
            // set flags for multiline and required
            const flags = new WidgetFlags();
            flags.set("Multiline", true);
            flags.set("Required", true);

            // create a form field
            const field = new Annotations.Forms.Field("some text field name", {
              type: "Tx",
              defaultValue: "some placeholder default text value",
              flags,
            });

            // create a widget annotation
            const widgetAnnot = new Annotations.TextWidgetAnnotation(field);

            // set position and size
            widgetAnnot.PageNumber = 1;
            widgetAnnot.X = 100;
            widgetAnnot.Y = 100;
            widgetAnnot.Width = 50;
            widgetAnnot.Height = 20;

            //add the form field and widget annotation
            annotationManager.getFieldManager().addField(field);
            annotationManager.addAnnotation(widgetAnnot);
            annotationManager.drawAnnotationsFromList([widgetAnnot]);
          });
        })
        .catch((err) => console.error(err));
    }
  }, [viewer]);

  async function split() {
    const { documentViewer, annotationManager } = tempInstance.Core;
    const pagesToExtract = [1, 2];
    const annotationList = annotationManager
      .getAnnotationsList()
      .filter((annot) => pagesToExtract.indexOf(annot.PageNumber) > -1);
    const xfdfString = await annotationManager.exportAnnotations({
      annotationList,
    });
    const doc = documentViewer.getDocument();
    const data = await doc.extractPages(pagesToExtract, xfdfString);
    await documentViewer.getDocument().removePages(pagesToExtract);
    const arr = new Uint8Array(data);
    const blob = new Blob([arr], { type: "application/pdf" });
    const options = {
      extension: "pdf",
      setActive: true, // Defaults to true
      saveCurrentActiveTabState: false, // Defaults to true
    };
    tempInstance.UI.TabManager.addTab(blob, options);
  }

  useEffect(() => {});

  return (
    <div className="App">
      <div className="header">
        <h1>Welcome to WebViewer</h1>
        <button onClick={split}>Split</button>
        <button>Add Page</button>
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
