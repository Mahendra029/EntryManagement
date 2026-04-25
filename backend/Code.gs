/**
 * Google Apps Script Backend for QR Check-In/Out (One Row Per Guest)
 */

const FOLDER_NAME = "Guest_Selfies";
const SHEET_NAME = "Guest Log";

function triggerAuthorization() {
  getFolder(FOLDER_NAME);
  console.log("Authorization Successful!");
}

function doGet(e) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
  setupHeaders(sheet);

  const id = e.parameter.id;
  const name = e.parameter.name || "Guest";
  const action = e.parameter.action;

  // New Action: Check if guest is still "In"
  if (action === "check_status") {
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == id) {
        return ContentService.createTextOutput(JSON.stringify({ status: data[i][5] }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "NotFound" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (!id) {
    return HtmlService.createHtmlOutput("<h2 style='color:red; font-family: sans-serif;'>Error: Missing ID</h2>");
  }

  const data = sheet.getDataRange().getValues();
  let foundRowIndex = -1;
  let currentStatus = "";
  let selfieLink = "";

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      foundRowIndex = i + 1;
      currentStatus = data[i][5];
      selfieLink = data[i][2];
      break;
    }
  }

  const timestamp = new Date();
  const displayTime = Utilities.formatDate(timestamp, "GMT+5:30", "MM/dd/yyyy HH:mm:ss");
  const uiTime = Utilities.formatDate(timestamp, "GMT+5:30", "MMM d, yyyy HH:mm:ss");

  if (foundRowIndex === -1) {
    sheet.appendRow([id, name, "", displayTime, "", "In"]);
    return renderResponse("Entry Recorded", "Welcome, " + name + "!", "#10b981", uiTime, "");
  }

  if (currentStatus === "In") {
    sheet.getRange(foundRowIndex, 5).setValue(displayTime);
    sheet.getRange(foundRowIndex, 6).setValue("Out");
    return renderResponse("Exit Recorded", "Goodbye, " + name + "!", "#3b82f6", uiTime, selfieLink);
  } else {
    sheet.getRange(foundRowIndex, 4).setValue(displayTime);
    sheet.getRange(foundRowIndex, 5).setValue("");
    sheet.getRange(foundRowIndex, 6).setValue("In");
    return renderResponse("Entry Recorded", "Welcome, " + name + "!", "#10b981", uiTime, selfieLink);
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.action === 'upload_selfie') {
      const folder = getFolder(FOLDER_NAME);
      const contentType = data.image.split(",")[0].split(":")[1].split(";")[0];
      const bytes = Utilities.base64Decode(data.image.split(",")[1]);
      const blob = Utilities.newBlob(bytes, contentType, data.name + "_" + data.id + ".jpg");
      
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      const fileUrl = file.getUrl();

      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
      sheet.appendRow([data.id, data.name, fileUrl, "", "", "Registered"]);
      
      return ContentService.createTextOutput(JSON.stringify({ status: "success", url: fileUrl }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function setupHeaders(sheet) {
  const headers = ["ID", "Guest Name", "Selfie", "Entry Time", "Exit Time", "Status"];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, 6).setFontWeight("bold").setBackground("#f3f4f6");
  }
}

function getFolder(name) {
  const folders = DriveApp.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(name);
}

function renderResponse(title, message, color, time, photo) {
  const photoHtml = photo ? `<img src="${photo.replace("open?", "uc?export=view&").replace("/file/d/", "/uc?export=view&id=").split("/view")[0]}" style="width:120px; height:120px; border-radius:1.5rem; object-fit:cover; margin-bottom:1rem; border:4px solid ${color}; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">` : "";
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f8fafc; }
          .card { background: white; padding: 2.5rem; border-radius: 2.5rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); text-align: center; max-width: 90%; width: 350px; border-top: 12px solid ${color}; }
          h1 { color: #1e293b; margin: 0.5rem 0; font-size: 1.6rem; }
          p { color: #64748b; margin-bottom: 2rem; font-size: 1.1rem; }
          .time { font-size: 0.85rem; color: #94a3b8; padding-top: 1.5rem; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="card">
          ${photoHtml}
          <h1>${title}</h1>
          <p>${message}</p>
          <div class="time">Recorded at: ${time} (IST)</div>
        </div>
      </body>
    </html>
  `;
  return HtmlService.createHtmlOutput(html).setTitle(title);
}
