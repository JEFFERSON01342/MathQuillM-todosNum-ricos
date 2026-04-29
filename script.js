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
            columnas = ["Iteración","a","c","b","f(a)","f(c)","f(b)","Ea","Er%"];
            break;

        case "reglaFalsa":
            columnas = ["Iteración","a","b","f(a)","f(b)","c","f(c)","Er%"];
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

    let fila = "<tr>";
    columnas.forEach(col => fila += `<th>${col}</th>`);
    fila += "</tr>";

    thead.innerHTML = fila;
}

// =====================
// MENU
// =====================
document.querySelectorAll(".menu-item").forEach(btn => {
    btn.addEventListener("click", function (e) {

        let text = this.innerText.toLowerCase();

        if (text.includes("bisección")) crearTabla("biseccion");
        if (text.includes("regla falsa")) crearTabla("reglaFalsa");
        if (text.includes("newton")) crearTabla("newton");
        if (text.includes("secante")) crearTabla("secante");
        if (text.includes("punto fijo")) crearTabla("puntoFijo");

        document.querySelectorAll(".menu-item").forEach(b => b.classList.remove("active-btn"));
        this.classList.add("active-btn");

        let parent = this.parentElement;

        if (parent.classList.contains("has-submenu")) {
            e.stopPropagation();
            parent.classList.toggle("active");
        }
    });
});

// =====================
// DESMOS
// =====================
let grafica = null;
let cientifica = null;

window.addEventListener("load", function () {

    if (typeof Desmos === "undefined") {
        alert("Error cargando Desmos");
        return;
    }

    // =====================
    // GRAFICADOR (SIN PANEL IZQUIERDO)
    // =====================
    grafica = Desmos.GraphingCalculator(
        document.getElementById("grafica"),
        {
            keypad: false,
            expressions: false,   // 🔴 oculta panel izquierdo
            settingsMenu: false,
            zoomButtons: true
        }
    );

    // =====================
    // CALCULADORA CIENTÍFICA
    // =====================
    cientifica = Desmos.ScientificCalculator(
        document.getElementById("cientifica")
    );

    console.log("Desmos cargado correctamente ✅");

    // =====================
    // VINCULAR CIENTÍFICA → GRÁFICA
    // =====================
    cientifica.observeEvent('change', function () {

        let estado = cientifica.getState();

        if (
            estado.expressions &&
            estado.expressions.list.length > 0
        ) {
            let latex = estado.expressions.list[0].latex;

            // Solo grafica si hay variable x
            if (latex && latex.includes("x")) {
                grafica.setExpression({
                    id: 'funcion',
                    latex: latex
                });
            }
        }
    });

});
