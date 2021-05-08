const { app, BrowserWindow, Menu, dialog, ipcMain, shell} = require('electron');
const fs = require('fs');
const path = require('path');


// Janela principal
var mainWindow = null;

async function createWindow(){
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences:{
            nodeIntegration:true,
            contextIsolation: false,
        }
    });

    await mainWindow.loadFile('src/pages/editor/index.html');

    //mainWindow.webContents.openDevTools();

    createNewFile();

    ipcMain.on('update-content', function(event, data){
        file.content = data;
    });
}

//Arquivo

var file = {};

//Criar novo Arquivo

function createNewFile(){
    file = {
        name:'novo arquivo.txt',
        content:'',
        saved:false,
        path: app.getPath('documents')+'/novo arquivo.txt'
    }

    mainWindow.webContents.send('set-file', file);
}

//Escrever Arquivo
function writeFile(filePath){
    try{
        fs.writeFile(filePath, file.content, function(error){
            // erro
            if (error) throw error;

            // Arquivo salvo

            file.path = filePath;
            file.saved = true;
            file.name = path.basename(filePath);

            mainWindow.webContents.send('set-file', file);

        });
    }catch(e){
        console.log(e);
    }
} 

// Ler Arquivo

function readFile(filePath){
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (e) {
        console.log(e);
        return '';
    }
}

//Save As

async function saveFileAs(){
    let dialogFile = await dialog.showSaveDialog({
        defaultPath: file.path,
        filters:[
            {
                name:'Arquivo de texto',
                extensions:['txt']
            }
        ]
    });
    
    if (dialogFile.canceled){
        return false;
    }

    writeFile(dialogFile.filePath);
    
}

//Save File

function saveFile(){
    
    if (file.saved){
        return writeFile(file.path);
    }

    return saveFileAs();

}

//Abrir Arquivo

async function openFile(){
    let dialogFile = await dialog.showOpenDialog({
        defaultPath: file.path,
        filters:[
            {
                name:'Arquivo de texto',
                extensions:['txt']
            }
        ],
    });

    if (dialogFile.canceled){
        return false;
    }

    file = {
        name: path.basename(dialogFile.filePaths[0]),
        content: readFile(dialogFile.filePaths[0]),
        saved: true,
        path:dialogFile.filePaths[0]
    }

    mainWindow.webContents.send('set-file', file);
}


//template Menu

const templateMenu = [
    {
        label: 'Arquivo',
        submenu:[
            {
                label:'Novo',
                accelerator:'CmdOrCtrl+N',
                click(){
                    createNewFile();
                }
                
            },
            {
                label:'Abrir',
                accelerator:'CmdOrCtrl+O',
                click(){
                    openFile();
                }
            },
            {
                label:'Salvar',
                accelerator:'CmdOrCtrl+S',
                click(){
                    saveFile();
                }
            },
            {
                label:'Salvar como',
                accelerator:'CmdOrCtrl+Shift+S',
                click(){
                    saveFileAs();
                }
            },
            {
                label:'Fechar',
                accelerator:'CmdOrCtrl+Q',
                role:process.platform === 'darwin' ? 'close' : 'quit'
            },
        ]
    },
    {
        label:'Editar',
        submenu:[
            {
                label:'Desfazer',
                role:'undo'
            },
            {
                label:'Refazer',
                role:'redo'
            },
            {
                type: 'separator'
            },
            {
                label:'Copiar',
                role:'copy'
            },
            {
                label:'Cortar',
                role:'cut'
            },
            {
                label:'Colar',
                role:'paste'
            },
        ]
    },
    {
        label:'Ajuda',
        submenu:[
            {
                label:'GIT Hub do desenvolvedor',
                click(){
                    shell.openExternal('https://github.com/felipevoliveira?tab=repositories');
                }
            },
        ]
    }
];

// Menu

const menu = Menu.buildFromTemplate(templateMenu);
Menu.setApplicationMenu(menu);

app.whenReady().then(createWindow);