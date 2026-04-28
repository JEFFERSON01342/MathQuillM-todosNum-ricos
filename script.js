// =====================
// SIDEBAR
// =====================
document.getElementById("toggleBtn").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("collapsed");
});

// =====================
// TABLA DINÁMICA
// =====================
function crearTabla(tipo) {

    const thead = document.querySelector("#tabla-iteraciones thead");
    const tbody = document.querySelector("#tabla-iteraciones tbody");

    thead.innerHTML = "";
    tbody.innerHTML = "";

    let columnas = [];

    switch (tipo) {

        case "biseccion":
            columnas = ["Iteración","a","c","b","f(a)","f(c)","f(b)","f(a)*f(c)","Ea","Er%"];
            break;

        case "reglaFalsa":
            columnas = ["Iteración","a","b","f(a)","f(b)","c","f(c)","f(a)*f(c)","Er%"];
            break;

        case "newton":
            columnas = ["Iteración","Ci","f(Ci)","f'(Ci)","Er%"];
            break;

        case "secante":
            columnas = ["xi-1","xi","f(xi-1)","f(xi)","xi+1","Er%"];
            break;

        case "puntoFijo":
            columnas = ["Iteración","xi","g(xi)","Er%"];
            break;
    }

    // Crear encabezado
    let fila = "<tr>";
    columnas.forEach(col => {
        fila += `<th>${col}</th>`;
    });
    fila += "</tr>";

    thead.innerHTML = fila;
}

// =====================
// MENU + DETECCIÓN MÉTODO
// =====================
document.querySelectorAll(".menu-item").forEach(btn => {
    btn.addEventListener("click", function (e) {

        let text = this.textContent.toLowerCase();

        // ACTIVAR TABLA SEGÚN MÉTODO
        if (text.includes("bisección")) crearTabla("biseccion");
        if (text.includes("regla falsa")) crearTabla("reglaFalsa");
        if (text.includes("newton")) crearTabla("newton");
        if (text.includes("secante")) crearTabla("secante");
        if (text.includes("punto fijo")) crearTabla("puntoFijo");

        let parent = this.parentElement;

        // BOTÓN ACTIVO
        document.querySelectorAll(".menu-item").forEach(b => b.classList.remove("active-btn"));
        this.classList.add("active-btn");

        // SUBMENUS
        if (parent.classList.contains("has-submenu")) {

            e.stopPropagation();

            let siblings = parent.parentElement.querySelectorAll(":scope > .has-submenu");
            siblings.forEach(el => {
                if (el !== parent) el.classList.remove("active");
            });

            parent.classList.toggle("active");
        }
    });
});

// =====================
// MATHQUILL
// =====================
var MQ = MathQuill.getInterface(2);

var mathField = MQ.MathField(document.getElementById("math-field"), {
    handlers: {
        edit: function () {
            let latex = mathField.latex();

            document.getElementById("latex-output").textContent = latex;

            document.getElementById("math-preview").innerHTML = `\\(${latex}\\)`;

            MathJax.typeset();
        }
    }
});

// =====================
// BOTONES TOOLBAR
// =====================
function insertCmd(cmd) {
    mathField.cmd(cmd);
    mathField.focus();
}

function insertText(text) {
    mathField.write(text);
    mathField.focus();
}

function clearMath() {
    mathField.latex('');
}
