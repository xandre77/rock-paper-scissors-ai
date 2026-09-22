// ==========================================
// TEACHABLE MACHINE MODEL
// ==========================================


const MODEL_URL =
    "https://teachablemachine.withgoogle.com/models/hcGbnZzau/";


let model;
let webcam;

let maxPredictions;

let currentPrediction = "";

let playerScore = 0;
let aiScore = 0;
let drawScore = 0;


// ==========================================
// START GAME
// ==========================================

async function startGame() {

    const result = document.getElementById("result");

    try {

        result.innerText = "Loading AI model...";

        // Check that TensorFlow.js is loaded
        if (typeof tf === "undefined") {
            throw new Error(
                "TensorFlow.js did not load."
            );
        }

        // Check that Teachable Machine is loaded
        if (typeof tmImage === "undefined") {
            throw new Error(
                "Teachable Machine library did not load."
            );
        }

        console.log("TensorFlow.js loaded:", tf.version.tfjs);
        console.log("Teachable Machine loaded.");

        // ------------------------------------------
        // LOAD TEACHABLE MACHINE MODEL
        // ------------------------------------------

        const modelURL =
            MODEL_URL + "model.json";

        const metadataURL =
            MODEL_URL + "metadata.json";

        console.log("Model URL:", modelURL);
        console.log("Metadata URL:", metadataURL);

        model = await tmImage.load(
            modelURL,
            metadataURL
        );

        maxPredictions =
            model.getTotalClasses();

        console.log(
            "Model loaded successfully."
        );

        console.log(
            "Number of classes:",
            maxPredictions
        );

        // ------------------------------------------
        // START WEBCAM
        // ------------------------------------------

        result.innerText =
            "Requesting camera access...";

        const flip = true;

        webcam = new tmImage.Webcam(
            400,
            400,
            flip
        );

        await webcam.setup();

        await webcam.play();

        document
            .getElementById("webcam-container")
            .innerHTML = "";

        document
            .getElementById("webcam-container")
            .appendChild(webcam.canvas);

        // ------------------------------------------
        // ENABLE GAME
        // ------------------------------------------

        document.getElementById(
            "start-button"
        ).disabled = true;

        document.getElementById(
            "play-button"
        ).disabled = false;

        result.innerText =
            "Show Rock, Paper, or Scissors!";

        // Start prediction loop
        window.requestAnimationFrame(loop);

    } catch (error) {

        console.error(
            "FULL ERROR:",
            error
        );

        result.innerText =
            "ERROR: " + error.message;

        document.getElementById(
            "start-button"
        ).disabled = false;
    }
}


// ==========================================
// CONTINUOUS CAMERA LOOP
// ==========================================

async function loop() {

    webcam.update();

    await predict();

    window.requestAnimationFrame(loop);
}


// ==========================================
// AI PREDICTION
// ==========================================

async function predict() {

    const prediction =
        await model.predict(webcam.canvas);

    let highestProbability = 0;
    let bestClass = "";

    for (let i = 0; i < maxPredictions; i++) {

        const probability =
            prediction[i].probability;

        const className =
            prediction[i].className;

        if (probability > highestProbability) {

            highestProbability = probability;

            bestClass = className;
        }
    }

    // Only accept predictions with reasonable confidence
    if (highestProbability >= 0.70) {

        currentPrediction =
            bestClass.toLowerCase();

        updatePlayerMove(
            currentPrediction
        );

    } else {

        currentPrediction = "";

        document.getElementById(
            "player-move"
        ).innerText = "Show your hand";
    }
}


// ==========================================
// DISPLAY PLAYER MOVE
// ==========================================

function updatePlayerMove(move) {

    const element =
        document.getElementById("player-move");

    if (move.includes("rock")) {

        element.innerText = " Rock";

    } else if (move.includes("paper")) {

        element.innerText = " Paper";

    } else if (move.includes("scissor")) {

        element.innerText = " Scissors";

    }
}


// ==========================================
// PLAY ROUND
// ==========================================

function playRound() {

    if (!currentPrediction) {

        document.getElementById("result").innerText =
            "Show your hand first!";

        return;
    }

    const playerMove =
        normalizeMove(currentPrediction);

    if (!playerMove) {

        document.getElementById("result").innerText =
            "Could not recognize your move.";

        return;
    }

    // Random AI move
    const choices = [
        "rock",
        "paper",
        "scissors"
    ];

    const aiMove =
        choices[
            Math.floor(
                Math.random() * choices.length
            )
        ];

    displayAIMove(aiMove);

    const result =
        determineWinner(
            playerMove,
            aiMove
        );

    displayResult(result);
}


// ==========================================
// NORMALIZE MODEL OUTPUT
// ==========================================

function normalizeMove(move) {

    move = move.toLowerCase();

    if (move.includes("rock")) {
        return "rock";
    }

    if (move.includes("paper")) {
        return "paper";
    }

    if (move.includes("scissor")) {
        return "scissors";
    }

    return null;
}


// ==========================================
// DISPLAY AI MOVE
// ==========================================

function displayAIMove(move) {

    const element =
        document.getElementById("ai-move");

    if (move === "rock") {

        element.innerText = " Rock";

    } else if (move === "paper") {

        element.innerText = " Paper";

    } else {

        element.innerText = " Scissors";
    }
}


// ==========================================
// DETERMINE WINNER
// ==========================================

function determineWinner(
    player,
    ai
) {

    if (player === ai) {

        drawScore++;

        updateScores();

        return "DRAW! ";
    }

    if (

        (player === "rock" &&
            ai === "scissors")

        ||

        (player === "paper" &&
            ai === "rock")

        ||

        (player === "scissors" &&
            ai === "paper")

    ) {

        playerScore++;

        updateScores();

        return "YOU WIN! ";
    }

    aiScore++;

    updateScores();

    return "AI WINS! ";
}


// ==========================================
// DISPLAY RESULT
// ==========================================

function displayResult(result) {

    document.getElementById(
        "result"
    ).innerText = result;
}


// ==========================================
// UPDATE SCORE
// ==========================================

function updateScores() {

    document.getElementById(
        "player-score"
    ).innerText = playerScore;

    document.getElementById(
        "ai-score"
    ).innerText = aiScore;

    document.getElementById(
        "draw-score"
    ).innerText = drawScore;
}
