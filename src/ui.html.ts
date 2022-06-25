// Template literal denoted by the tilda symbol after return. Not a normal quote char.
export function viewDocument() { return `
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Decomp Tools</title>
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

    <button id="startButton" onclick="run_func(0)">Begin Decomp!</button>
    <div id="content" style="display: none;">
        <input value="500" id="findFuncLengthInput" type="number"></input> bytes<br>
        <button onclick="run_func(1)">Find small funcs</button>
        <pre><code class="language-c" id="data"></code></pre>
        <br>
        <input class="gfxdisInput" id="gfxdisFile" placeholder="Binary File"></input><br>
        <input class="gfxdisInput" id="gfxdisSym" placeholder="Symbol Name"></input><br>
        <input class="gfxdisInput" id="gfxdisOffset" placeholder="Start Offset"></input>
        <button onclick="run_func(2)" style="margin-bottom: 5px;">gfxdis</button>

    
    </div>
</body>

<script>

const vscode = acquireVsCodeApi();
function run_func(button) {
    switch(button) {
        case 0:
            sendMessage(
                "0",
                "clicked"
            );
            document.getElementById("startButton").style.display = "none";
            document.getElementById("content").style.display = "block";
            break;
        case 1:
            sendMessage(
                "1",
                document.getElementById("findFuncLengthInput").value,
            );
            break;
        case 2:
            sendMessage(
                "2",
                JSON.stringify(
                    [
                        document.getElementById("gfxdisFile").value,
                        document.getElementById("gfxdisOffset").value,
                        document.getElementById("gfxdisSym").value
                    ]),
            );
            break;
        case 3:
            sendMessage(
                "3",
                JSON.stringify(
                    [
                        document.getElementById("arraydsmFile").value,
                        document.getElementById("arraydsmOffset").value,
                        document.getElementById("arraydsmSym").value
                    ]),
            );
    }
}
function sendMessage(arg0, arg1) {
    vscode.postMessage({
        command: arg0,
        text: arg1,
    });
}
// Handle the message inside the webview
window.addEventListener("message", event => {

    const message = event.data; // The JSON data our extension sent

});
</script>
</html>`;
}