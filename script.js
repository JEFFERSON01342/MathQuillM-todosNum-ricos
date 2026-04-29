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
    }

    let fila = "<tr>";
    columnas.forEach(col => fila += `<th>${col}</th>`);
    fila += "</tr>";

    thead.innerHTML = fila;
}

// =====================
// INPUTS DINÁMICOS
// =====================
function mostrarInputs(tipo) {

    const grupoA = document.getElementById("input-a-group");
    const grupoB = document.getElementById("input-b-group");
    const grupoX0 = document.getElementById("input-x0-group");

    grupoA.style.display = "none";
    grupoB.style.display = "none";
    grupoX0.style.display = "none";

    if (tipo === "biseccion") {
        grupoA.style.display = "block";
        grupoB.style.display = "block";
    }
}

// =====================
// MENU
// =====================
document.querySelectorAll(".menu-item").forEach(btn => {
    btn.addEventListener("click", function (e) {

        let text = this.innerText.toLowerCase();

        if (text.includes("bisección")) {
            crearTabla("biseccion");
            mostrarInputs("biseccion");
        }

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

    grafica = Desmos.GraphingCalculator(
        document.getElementById("grafica"),
        {
            keypad: false,
            expressions: false,
            settingsMenu: false,
            zoomButtons: true
        }
    );

    cientifica = Desmos.ScientificCalculator(
        document.getElementById("cientifica")
    );

    // Vincular gráfica
    cientifica.observeEvent('change', function () {

        let estado = cientifica.getState();

        if (estado.expressions && estado.expressions.list.length > 0) {
            let latex = estado.expressions.list[0].latex;

            if (latex && latex.includes("x")) {
                grafica.setExpression({
                    id: 'funcion',
                    latex: latex
                });
            }
        }
    });
});

// =====================
// CONVERTIR LATEX → JS
// =====================
function convertirLatexAJS(latex) {

    let expr = latex;

    expr = expr.replace(/\\cdot/g, '*');
    expr = expr.replace(/\\left|\\right/g, '');
    expr = expr.replace(/\\frac{([^}]*)}{([^}]*)}/g, '($1)/($2)');
    expr = expr.replace(/\^/g, '**');

    expr = expr.replace(/\\sin/g, 'Math.sin');
    expr = expr.replace(/\\cos/g, 'Math.cos');
    expr = expr.replace(/\\tan/g, 'Math.tan');
    expr = expr.replace(/\\ln/g, 'Math.log');
    expr = expr.replace(/\\sqrt{([^}]*)}/g, 'Math.sqrt($1)');

    return expr;
}

// =====================
// EVALUAR FUNCIÓN
// =====================
function evaluarFuncion(expr, x) {
    try {
        return Function("x", "return " + expr)(x);
    } catch {
        return NaN;
    }
}

// =====================
// MÉTODO BISECCIÓN
// =====================
function metodoBiseccion(latex, a, b) {

    const tbody = document.querySelector("#tabla-iteraciones tbody");
    tbody.innerHTML = "";

    let expr = convertirLatexAJS(latex);

    let fa = evaluarFuncion(expr, a);
    let fb = evaluarFuncion(expr, b);

    if (fa * fb > 0) {
        alert("No hay cambio de signo en el intervalo");
        return;
    }

    let c, fc;
    let error = 100;

    for (let i = 1; i <= 20; i++) {

        let c_old = c;

        c = (a + b) / 2;
        fc = evaluarFuncion(expr, c);

        if (i > 1) {
            error = Math.abs((c - c_old) / c) * 100;
        }

        let fila = `
            <tr>
                <td>${i}</td>
                <td>${a.toFixed(6)}</td>
                <td>${c.toFixed(6)}</td>
                <td>${b.toFixed(6)}</td>
                <td>${fa.toFixed(6)}</td>
                <td>${fc.toFixed(6)}</td>
                <td>${fb.toFixed(6)}</td>
                <td>${i === 1 ? "-" : Math.abs(c - c_old).toFixed(6)}</td>
                <td>${i === 1 ? "-" : error.toFixed(4)}</td>
            </tr>
        `;

        tbody.innerHTML += fila;

        if (Math.abs(fc) < 0.0001 || error < 0.0001) {
            break;
        }

        if (fa * fc < 0) {
            b = c;
            fb = fc;
        } else {
            a = c;
            fa = fc;
        }
    }
}

// =====================
// BOTÓN ITERAR
// =====================
document.getElementById("btn-iterar").addEventListener("click", () => {

    let a = parseFloat(document.getElementById("input-a").value);
    let b = parseFloat(document.getElementById("input-b").value);

    if (isNaN(a) || isNaN(b)) {
        alert("Ingresa valores válidos");
        return;
    }

    let estado = cientifica.getState();

    if (!estado.expressions || estado.expressions.list.length === 0) {
        alert("Escribe una función");
        return;
    }

    let latex = estado.expressions.list[0].latex;

    if (!latex.includes("x")) {
        alert("Debe contener x");
        return;
    }

    metodoBiseccion(latex, a, b);
});
