const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const ioHook = require("iohook");
const fs = require("fs");

let mainWindow;

//TODO: let users choose this in a settings file
let recordKeyCode = 164;
let stopKeyCode = 96;

let recording = false;

let inputs = "";

function createWindow() {
  app.commandLine.appendSwitch("disable-web-security");

  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,

    //node integration being true allows react to import electron modules
    //web security being false allows electron to access local files while in dev mode
    webPreferences: {
      nodeIntegration: true,
      webSecurity: !isDev
    }
  });

  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );
  if (isDev) {
    // Open the DevTools.
    BrowserWindow.addDevToolsExtension(
      "C:Users\\lpkar\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 1\\Extensions\\fmkadmapgofadopljbjfkapdkoienihi\\4.7.0_0"
    );
    mainWindow.webContents.openDevTools();
  }
  mainWindow.on("closed", () => (mainWindow = null));
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on("add", async (event, args) => {
  openSound().then(filepath => {
    event.sender.send("filepath" + args.id, filepath);
  });
});

ipcMain.on("export", async (event, args) => {
  saveFile(args);
});

ipcMain.on("import", async event => {
  openFile()
    .then(file => {
      event.sender.send("load", file);
    })
    .catch(err => {
      //ERR_INVALID_ARG_TYPE is thrown when the user doesn't select a file
      if (!err.code.localeCompare("ERR_INVALID_ARG_TYPE") === 0) {
        console.error(err);
      }
    });
});

//enables global keyboard input capture
ioHook.on("keydown", event => {
  userKeyDown(event);
});
ioHook.on("keyup", event => {
  userKeyUp(event);
});
ioHook.start();

function userKeyDown(event) {
  //if the record key is pressed down
  if (event.rawcode === recordKeyCode && !recording) {
    recording = true;
  } else if (recording && event.rawcode !== recordKeyCode) {
    //Only allow numpad keys
    if (96 <= event.rawcode && event.rawcode <= 105) {
      //adds offset for numpad keys
      inputs += String.fromCharCode(event.rawcode - 48);
    }
  } else if (!recording && event.rawcode === stopKeyCode) {
    mainWindow.webContents.send("stop");
  }
}

function userKeyUp(event) {
  //when the record key is not being held down
  if (event.rawcode === recordKeyCode) {
    recording = false;

    //sends the input to the soundboard
    mainWindow.webContents.send("binding", inputs);
    //wipes the gathered inputs
    inputs = "";
  }
}

async function openSound() {
  //open a file dialog
  const files = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: [
      {
        name: "Audio",
        extensions: ["mp3", "mp4", "wav"]
      },
      {
        name: "All",
        extensions: ["*"]
      }
    ]
  });

  //returns the filepath
  if (files) {
    let filepath = files.filePaths[0];

    var filename = filepath.replace(/^.*[\\\/]/, "");

    let file = {
      filename: filename,
      filepath: filepath
    };

    return file;
  } else {
    //if there are no files
    return;
  }
}

async function saveFile(args) {
  //TODO: check if file exists in current directory

  let selection = await dialog.showSaveDialog(mainWindow, {
    filters: [
      {
        name: "Soundboard",
        extensions: ["JSON"]
      },
      {
        name: "Soundboard",
        extensions: ["txt"]
      },
      {
        name: "All",
        extensions: ["*"]
      }
    ]
  });

  fs.writeFileSync(selection.filePath, args);

  fs.exists(selection.filePath, exists => {
    //TODO: add success and error feedback to user

    if (exists) {
    } else {
    }
  });
}

async function openFile() {
  //open a file dialog
  const files = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: [
      {
        name: "Soundboard",
        extensions: ["JSON", "txt"]
      }
    ]
  });

  //returns the filepath
  if (files) {
    return JSON.parse(fs.readFileSync(files.filePaths[0]));
  } else {
    //if there are no files
    return;
  }
}
