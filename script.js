// Initialize matrices when the page loads
document.addEventListener('DOMContentLoaded', () => {
    createMatrix('A', 2, 2);
    createMatrix('B', 2, 2);
    updateUI();
});

// Create matrix input fields
function createMatrix(matrixId, rows, cols) {
    const matrix = document.getElementById(`matrix${matrixId}`);
    matrix.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    matrix.innerHTML = '';

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.value = '0';
            input.dataset.row = i;
            input.dataset.col = j;
            matrix.appendChild(input);
        }
    }
}

// Update UI based on selected operation
function updateUI() {
    const operation = document.getElementById('operation').value;
    const matrixBContainer = document.getElementById('matrixB-container');
    const rowsA = document.getElementById('rowsA');
    const colsA = document.getElementById('colsA');
    const rowsB = document.getElementById('rowsB');
    const colsB = document.getElementById('colsB');

    switch (operation) {
        case 'add':
        case 'subtract':
            matrixBContainer.style.display = 'block';
            rowsB.value = rowsA.value;
            colsB.value = colsA.value;
            break;
        case 'multiply':
            matrixBContainer.style.display = 'block';
            rowsB.value = colsA.value;
            colsB.value = '1';
            break;
        case 'multiply2':
            matrixBContainer.style.display = 'block';
            break;
        case 'solve':
            matrixBContainer.style.display = 'block';
            rowsB.value = rowsA.value;
            colsB.value = '1';
            break;
        case 'transpose':
        case 'determinant':
        case 'inverse':
            matrixBContainer.style.display = 'none';
            break;
    }

    createMatrix('A', parseInt(rowsA.value), parseInt(colsA.value));
    if (matrixBContainer.style.display !== 'none') {
        createMatrix('B', parseInt(rowsB.value), parseInt(colsB.value));
    }
}

// Get matrix values
function getMatrixValues(matrixId) {
    const matrix = document.getElementById(`matrix${matrixId}`);
    const inputs = matrix.getElementsByTagName('input');
    const rows = parseInt(document.getElementById(`rows${matrixId}`).value);
    const cols = parseInt(document.getElementById(`cols${matrixId}`).value);
    const values = [];

    for (let i = 0; i < rows; i++) {
        values[i] = [];
        for (let j = 0; j < cols; j++) {
            values[i][j] = parseFloat(inputs[i * cols + j].value) || 0;
        }
    }
    return values;
}

// Display result matrix
function displayResult(matrix) {
    const result = document.getElementById('result');
    result.style.gridTemplateColumns = `repeat(${matrix[0].length}, 1fr)`;
    result.innerHTML = '';

    matrix.forEach(row => {
        row.forEach(value => {
            const div = document.createElement('div');
            div.textContent = value.toFixed(2);
            div.style.padding = '8px';
            div.style.textAlign = 'center';
            div.style.backgroundColor = '#f8f9fa';
            div.style.borderRadius = '5px';
            result.appendChild(div);
        });
    });
}

// Matrix operations
function addMatrices(a, b) {
    return a.map((row, i) => row.map((val, j) => val + b[i][j]));
}

function subtractMatrices(a, b) {
    return a.map((row, i) => row.map((val, j) => val - b[i][j]));
}

function multiplyMatrix(a, b) {
    return a.map(row => row.map((_, i) => row.reduce((sum, val, j) => sum + val * b[j][i], 0)));
}

function transposeMatrix(matrix) {
    return matrix[0].map((_, i) => matrix.map(row => row[i]));
}

function determinant(matrix) {
    if (matrix.length === 1) return matrix[0][0];
    if (matrix.length === 2) {
        return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    }
    let det = 0;
    for (let i = 0; i < matrix.length; i++) {
        const subMatrix = matrix.slice(1).map(row => row.filter((_, j) => j !== i));
        det += matrix[0][i] * Math.pow(-1, i) * determinant(subMatrix);
    }
    return det;
}

function inverseMatrix(matrix) {
    const det = determinant(matrix);
    if (det === 0) throw new Error('Matrix is not invertible');
    
    if (matrix.length === 2) {
        const [[a, b], [c, d]] = matrix;
        return [
            [d / det, -b / det],
            [-c / det, a / det]
        ];
    }
    
    // For larger matrices, use adjugate method
    const adj = matrix.map((row, i) =>
        row.map((_, j) => {
            const subMatrix = matrix
                .filter((_, r) => r !== i)
                .map(r => r.filter((_, c) => c !== j));
            return Math.pow(-1, i + j) * determinant(subMatrix);
        })
    );
    
    return transposeMatrix(adj).map(row =>
        row.map(val => val / det)
    );
}

function solveEquation(a, b) {
    const det = determinant(a);
    if (det === 0) throw new Error('No unique solution exists');
    
    const aInverse = inverseMatrix(a);
    return multiplyMatrix(aInverse, b);
}

// Main calculation function
function calculate() {
    try {
        const operation = document.getElementById('operation').value;
        const matrixA = getMatrixValues('A');
        let result;

        switch (operation) {
            case 'add':
                result = addMatrices(matrixA, getMatrixValues('B'));
                break;
            case 'subtract':
                result = subtractMatrices(matrixA, getMatrixValues('B'));
                break;
            case 'multiply':
                result = multiplyMatrix(matrixA, getMatrixValues('B'));
                break;
            case 'multiply2':
                result = multiplyMatrix(matrixA, getMatrixValues('B'));
                break;
            case 'solve':
                result = solveEquation(matrixA, getMatrixValues('B'));
                break;
            case 'transpose':
                result = transposeMatrix(matrixA);
                break;
            case 'determinant':
                result = [[determinant(matrixA)]];
                break;
            case 'inverse':
                result = inverseMatrix(matrixA);
                break;
        }

        displayResult(result);
    } catch (error) {
        alert(error.message);
    }
}

// Clear all inputs
function clearAll() {
    const matrices = ['A', 'B'];
    matrices.forEach(matrixId => {
        const matrix = document.getElementById(`matrix${matrixId}`);
        const inputs = matrix.getElementsByTagName('input');
        Array.from(inputs).forEach(input => input.value = '0');
    });
    document.getElementById('result').innerHTML = '';
}

// Add event listeners for matrix size changes
document.getElementById('rowsA').addEventListener('change', () => updateUI());
document.getElementById('colsA').addEventListener('change', () => updateUI());
document.getElementById('rowsB').addEventListener('change', () => updateUI());
document.getElementById('colsB').addEventListener('change', () => updateUI()); 