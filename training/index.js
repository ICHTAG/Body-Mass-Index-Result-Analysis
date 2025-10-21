const button = document.getElementById("btn");
const result = document.getElementById("result");


function updateResult() {
    const heightEL = document.getElementById("height").value / 100;
    const weightEL = document.getElementById("weight").value;
    const bmi = weightEL / (heightEL * heightEL);
    result.value = bmi;
}
button.addEventListener("click", updateResult)