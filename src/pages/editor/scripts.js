const { ipcRenderer } = require("electron");

// Elements

const textarea = document.getElementById('text');
const title = document.getElementById('title');


//Set File

ipcRenderer.on('set-file', function (event, data){
    textarea.value = data.content;
    title.innerHTML = data.name + ' | WDEV EDITOR';
});

// Update TextArea
function handleChangeText(){
    ipcRenderer.send('update-content', textarea.value);
}