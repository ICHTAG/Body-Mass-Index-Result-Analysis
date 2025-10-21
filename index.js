const resultEL = document.getElementById("BMI");
const buttonEL = document.getElementById("btn");
const weightConditionEL = document.getElementById("weightCondition");

function updateResult() {
    const heightEL = document.getElementById("height").value / 100;
    const weightEL = document.getElementById("weight").value;

    const Result = weightEL / (heightEL * heightEL);
    resultEL.value = Result;
    if (Result > 25 && Result < 30) {
        weightConditionEL.style.color = `red`
        weightConditionEL.innerText = "over weight"
    } else if (Result < 25 && Result >= 18.5) {
        weightConditionEL.style.color = `green`
        weightConditionEL.innerText = "You are in a good condition."
    } else if (Result <= 18.5) {
        weightConditionEL.style.color = `RED`
        weightConditionEL.innerText = "You are under weight."
    } else if (Result >= 30) {
        weightConditionEL.style.color = `darkRED`
        weightConditionEL.innerText = "You got Obesity level.please get aquented with your physician quickly!!!"
    }


}
buttonEL.addEventListener("click", updateResult)