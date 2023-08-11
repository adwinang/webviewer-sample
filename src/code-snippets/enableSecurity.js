// documentViewer.addEventListener("documentLoaded", async () => {
//   await PDFNet.initialize();
//   console.log("loaded");
//   const viewerDoc = documentViewer.getDocument();
//   console.log(viewerDoc.getType());
//   let doc = null;
//   if (viewerDoc.getType() === "office") {
//     const xfdfString = await annotationManager.exportAnnotations();
//     const data = await viewerDoc.getFileData({
//       // saves the document with annotations in it
//       xfdfString,
//       downloadType: "pdf",
//     });
//     doc = await PDFNet.PDFDoc.createFromBuffer(data);
//   } else doc = await viewerDoc.getPDFDoc();
//   const customHandler = await PDFNet.SecurityHandler.createDefault();
//   // Set a new password required to open a document
//   const user_password = "test";
//   customHandler.changeUserPasswordUString(user_password);
//   // Set Permissions
//   customHandler.setPermission(
//     PDFNet.SecurityHandler.Permission.e_print,
//     false
//   );
//   customHandler.setPermission(
//     PDFNet.SecurityHandler.Permission.e_extract_content,
//     true
//   );
//   // Note: document takes the ownership of newHandler.
//   doc.setSecurityHandler(customHandler);
//   console.log("Saving modified file...");
//   const docbuf = await doc.saveMemoryBuffer(
//     PDFNet.SDFDoc.SaveOptions.e_linearized
//   );
//   const arr = new Uint8Array(docbuf);
//   const blob = new Blob([arr], { type: "application/pdf" });
//   // Function to save file. In this case we can use file-saver library
//   saveAs(blob, "secured.pdf");
// });
