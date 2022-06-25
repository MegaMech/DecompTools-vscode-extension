// Template literal denoted by the tilda symbol after return. Not a normal quote char.
export function viewGfxDocument() { return `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>
        button {
            font-family: "Segoe WPC", "Segoe UI", sans-serif
            Segoe WPC,Segoe UI,sans-serif;
            background-color: rgb(14, 99, 156);
            border: none;
            color: white;
            font-size: 13px;
            max-width: 300px;
            text-decoration: none;
            box-sizing: border-box;
            display: flex;
            width: 100%;
            padding: 4px;
            text-align: center;
            cursor: pointer;
            justify-content: center;
            align-items: center;
            line-height: 18.2px;
            outline-offset: -1px;
        }
        button:hover {
            background-color: rgb(17, 119, 187);
            cursor: pointer;
        }
        button:focus {
            outline-color: #007fd4;
            outline-width: 1px;
            outline-style: solid;
            opacity: 1 !important;
            outline-offset: 2px !important;
        
        }
        input, textarea {
            font-family: "Segoe WPC", "Segoe UI", sans-serif;
            font-weight: normal;
            font-size: 13px;
            font-feature-settings: "liga" 0, "calt" 0;
            line-height: 20px;
            letter-spacing: 0px;
            margin-bottom: 5px;
            width: 50px;
            background-color: rgb(60, 60, 60);
            border-width: 1px;
            border-style: solid;
            border-color: transparent;
            color: white;
            outline-color: rgb(0, 127, 212) !important;
        }
        textarea {
            width: 100%;
        }
        input {
            height: 20px;
        }
        .gfxdisInput {
            width: 100%;
        }
        </style>
    </head>
<body>
    <div id="gfxcontent">
        <button onclick="run_func(0)" style="margin-bottom: 5px; margin-top: 5px;">Realize Macros</button>
        <textarea style="height: 150px;" id="textbox"></textarea>
        <button onclick="run_func(1)">gfxdis</button>

    
    </div>
</body>

</html>

<script>

const vscode = acquireVsCodeApi();
function run_func(arg) {
    switch(arg) {
        case 0:
            sendMessage('0', 'clicked');
            break;
        case 1:
            sendMessage('1', document.getElementById("textbox").value);
            break;
    }
}
function sendMessage(arg0, arg1) {
    vscode.postMessage({
        command: arg0,
        text: arg1,
    });
}
// Handle the message inside the webview
window.addEventListener('message', event => {

    const message = event.data; // The JSON data our extension sent
    document.getElementById("textbox").value = message;

});
</script>`;
}