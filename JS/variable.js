let age = 0; // Age is the measure of how many rounds have passed between the player and the bot

let performance =
{
    // How many times each method has correctly guessed the answer
    // Overall Metrics
    globalFreq: 0,
    histMatrix: 0,

    // Recent Metrics
    localRatio: 0,
    probMatrix: 0,

    // Total number of rounds the player and bot has had
    numberOfRounds: 0
}

let weights =
{
    // Overall Metrics
    globalFreq: 0.3333,

    // Recent Metrics
    localRatio: 0.3333,
    probMatrix: 0.3333
}

let minimumWeight = 0.05;

// The percentage redistributed when a metric fails to get the correct answer. Currently, it is set to 0.1 (10%)
// Mind you, this is going to be 1% of whatever percentage it already is, so if it is 25% currently, we remove 10% of it, which is 2.5%
let redistributionPercentage = 0.01;

// Method Sets
let probMatrix = new ProbMatrix();
let globalFreq = new GlobalFreq();
let localRatio = new LocalRatio();

let inputs = [];

let lastMove = "R"; // Starting input is R because sure


let outputWindow = document.getElementById("output");