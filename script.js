// =====================
// VARIABLES GLOBALES
// =====================
let grafica = null;
let cientifica = null;
let metodoActual = null;

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
            columnas = ["Iteración","xi","f(xi)","f'(xi)","Er%"];
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

    if (tipo === "biseccion" || tipo === "reglaFalsa") {
        grupoA.style.display = "block";
        grupoB.style.display = "block";
    }

    if (tipo === "newton") {
        grupoX0.style.display = "block";
    }
}

// =====================
// MENU
// =====================
document.querySelectorAll(".menu-item").forEach(btn => {
    btn.addEventListener("click", function (e) {

        let text = this.innerText.toLowerCase();

        if (text.includes("bisección")) {
            metodoActual = "biseccion";
            crearTabla("biseccion");
            mostrarInputs("biseccion");
        }

        if (text.includes("regla falsa")) {
            metodoActual = "reglaFalsa";
            crearTabla("reglaFalsa");
            mostrarInputs("reglaFalsa");
        }

        if (text.includes("newton")) {
            metodoActual = "newton";
            crearTabla("newton");
            mostrarInputs("newton");
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

    console.log("Desmos listo ✅");

    // Vincular científica → gráfica
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
// LATEX → JS
// =====================
function convertirLatexAJS(latex) {

    let expr = latex;

    expr = expr.replace(/\\left|\\right/g, '');
    expr = expr.replace(/\\frac{([^}]*)}{([^}]*)}/g, '($1)/($2)');
    expr = expr.replace(/\\sqrt{([^}]*)}/g, 'Math.sqrt($1)');
    expr = expr.replace(/e\^{([^}]*)}/g, 'Math.exp($1)');

    expr = expr.replace(/\\sin\(([^)]*)\)/g, 'Math.sin($1)');
    expr = expr.replace(/\\cos\(([^)]*)\)/g, 'Math.cos($1)');
    expr = expr.replace(/\\tan\(([^)]*)\)/g, 'Math.tan($1)');
    expr = expr.replace(/\\ln\(([^)]*)\)/g, 'Math.log($1)');

    expr = expr.replace(/\\sin\s*([a-zA-Z0-9]+)/g, 'Math.sin($1)');
    expr = expr.replace(/\\cos\s*([a-zA-Z0-9]+)/g, 'Math.cos($1)');
    expr = expr.replace(/\\tan\s*([a-zA-Z0-9]+)/g, 'Math.tan($1)');
    expr = expr.replace(/\\ln\s*([a-zA-Z0-9]+)/g, 'Math.log($1)');

    expr = expr.replace(/\^/g, '**');

    expr = expr.replace(/(\d)(x)/g, '$1*$2');
    expr = expr.replace(/(\d)\(/g, '$1*(');
    expr = expr.replace(/\)(\d)/g, ')*$1');
    expr = expr.replace(/x\(/g, 'x*(');

    return expr;
}

// =====================
// EVALUAR FUNCIÓN
// =====================
function evaluarFuncion(expr, x) {
    try {
        let val = Function("x", "return " + expr)(x);
        if (!isFinite(val)) return NaN;
        return val;
    } catch {
        return NaN;
    }
}

// =====================
// DERIVADA NUMÉRICA
// =====================
function derivadaNumerica(expr, x) {
    let h = 1e-6;
    let f1 = evaluarFuncion(expr, x + h);
    let f2 = evaluarFuncion(expr, x - h);

    if (isNaN(f1) || isNaN(f2)) return NaN;

    return (f1 - f2) / (2 * h);
}

// =====================
// BISECCIÓN
// =====================
function metodoBiseccion(latex, a, b) {

    const tbody = document.querySelector("#tabla-iteraciones tbody");
    tbody.innerHTML = "";

    let expr = convertirLatexAJS(latex);

    let fa = evaluarFuncion(expr, a);
    let fb = evaluarFuncion(expr, b);

    if (isNaN(fa) || isNaN(fb) || fa * fb > 0) {
        alert("Intervalo inválido");
        return;
    }

    let c, fc, error = 100;

    for (let i = 1; i <= 50; i++) {

        let c_old = c;

        c = (a + b) / 2;
        fc = evaluarFuncion(expr, c);

        if (i > 1) {
            error = Math.abs((c - c_old) / c) * 100;
        }

        tbody.innerHTML += `
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

        if (Math.abs(fc) < 1e-6 || error < 1e-6) break;

        if (fa * fc < 0) {
            b = c; fb = fc;
        } else {
            a = c; fa = fc;
        }
    }
}

// =====================
// REGLA FALSA
// =====================
function metodoReglaFalsa(latex, a, b) {

    const tbody = document.querySelector("#tabla-iteraciones tbody");
    tbody.innerHTML = "";

    let expr = convertirLatexAJS(latex);

    let fa = evaluarFuncion(expr, a);
    let fb = evaluarFuncion(expr, b);

    if (isNaN(fa) || isNaN(fb) || fa * fb > 0) {
        alert("Intervalo inválido");
        return;
    }

    let c, fc, error = 100;

    for (let i = 1; i <= 50; i++) {

        let c_old = c;

        c = b - (fb * (a - b)) / (fa - fb);
        fc = evaluarFuncion(expr, c);

        if (i > 1) {
            error = Math.abs((c - c_old) / c) * 100;
        }

        tbody.innerHTML += `
            <tr>
                <td>${i}</td>
                <td>${a.toFixed(6)}</td>
                <td>${b.toFixed(6)}</td>
                <td>${fa.toFixed(6)}</td>
                <td>${fb.toFixed(6)}</td>
                <td>${c.toFixed(6)}</td>
                <td>${fc.toFixed(6)}</td>
                <td>${i === 1 ? "-" : error.toFixed(4)}</td>
            </tr>
        `;

        if (Math.abs(fc) < 1e-6 || error < 1e-6) break;

        if (fa * fc < 0) {
            b = c; fb = fc;
        } else {
            a = c; fa = fc;
        }
    }
}

// =====================
// NEWTON-RAPHSON
// =====================
function metodoNewton(latex, x0) {

    const tbody = document.querySelector("#tabla-iteraciones tbody");
    tbody.innerHTML = "";

    let expr = convertirLatexAJS(latex);

    let xi = x0;
    let error = 100;

    for (let i = 1; i <= 50; i++) {

        let fxi = evaluarFuncion(expr, xi);
        let dfxi = derivadaNumerica(expr, xi);

        if (isNaN(fxi) || isNaN(dfxi) || dfxi === 0) {
            alert("Error en cálculo (derivada o función)");
            return;
        }

        let xi_next = xi - (fxi / dfxi);

        if (i > 1) {
            error = Math.abs((xi_next - xi) / xi_next) * 100;
        }

        tbody.innerHTML += `
            <tr>
                <td>${i}</td>
                <td>${xi.toFixed(6)}</td>
                <td>${fxi.toFixed(6)}</td>
                <td>${dfxi.toFixed(6)}</td>
                <td>${i === 1 ? "-" : error.toFixed(4)}</td>
            </tr>
        `;

        if (Math.abs(fxi) < 1e-6 || error < 1e-6) break;

        xi = xi_next;
    }
}

// =====================
// BOTÓN ITERAR
// =====================
document.getElementById("btn-iterar").addEventListener("click", () => {

    let estado = cientifica.getState();

    if (!estado.expressions || estado.expressions.list.length === 0) {
        alert("Escribe una función");
        return;
    }

    let latex = estado.expressions.list[0].latex;

    if (!latex.includes("x")) {
        alert("La función debe tener x");
        return;
    }

    if (metodoActual === "biseccion" || metodoActual === "reglaFalsa") {

        let a = parseFloat(document.getElementById("input-a").value);
        let b = parseFloat(document.getElementById("input-b").value);

        if (isNaN(a) || isNaN(b)) {
            alert("Ingresa valores válidos");
            return;
        }

        if (metodoActual === "biseccion") {
            metodoBiseccion(latex, a, b);
        }

        if (metodoActual === "reglaFalsa") {
            metodoReglaFalsa(latex, a, b);
        }
    }

    if (metodoActual === "newton") {

        let x0 = parseFloat(document.getElementById("input-x0").value);

        if (isNaN(x0)) {
            alert("Ingresa x0");
            return;
        }

        metodoNewton(latex, x0);
    }
});
