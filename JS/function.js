// Variables to track game outcomes
let winCount = 0;
let tieCount = 0;
let loseCount = 0;

// Function to update bot's accuracy
function updateAccuracy()
{
    const totalGames = winCount + tieCount + loseCount;
    const accuracy = totalGames > 0 ? (winCount / totalGames * 100).toFixed(2) + '%' : '0%';
    document.getElementById('accuracy').textContent = 'Bot Accuracy: ' + accuracy;
}

// Function to display results and update tracking variables
function display(result)
{
    result = result.toLowerCase();
    switch (result)
    {
        case "win":
            // The bot has won against the evil human
            winCount++;
            outputWindow.style.backgroundColor = "lime";
            outputWindow.innerHTML = "b o t . w i n s";
            break;
        case "tie":
            // The bot has tied with the human
            tieCount++;
            outputWindow.style.backgroundColor = "yellow";
            outputWindow.innerHTML = "t  i  e";
            break;
        case "lose":
            // This iteration of the bot has failed its blood line
            loseCount++;
            outputWindow.style.backgroundColor = "gray";
            outputWindow.innerHTML = "p l a y e r . wins";
            break;
    }
    updateAccuracy(); // Update accuracy after each result
}

function win(answer, rps)
{
    // Define a mapping of winning conditions
    const winConditions =
    {
        'R': 'S', // Rock beats Scissors
        'S': 'P', // Scissors beats Paper
        'P': 'R'  // Paper beats Rock
    };

    answer = invertRPS(answer);

    // Check if the answer and rps are the same
    if (answer === rps)
    {
        return display('tie');
    }

    // Determine if the answer beats rps
    if (winConditions[answer] === rps)
    {
        return display('win');
    }

    // Otherwise, it must be a loss
    return display('lose');
}

function invertRPS(input)
{
    // Convert input to uppercase to handle case insensitivity
    input = input.toUpperCase();

    // Use a switch statement to determine the inverted result
    switch (input)
    {
        case "R":
            return "P"; // Rock is beaten by Paper
        case "P":
            return "S"; // Paper is beaten by Scissors
        case "S":
            return "R"; // Scissors is beaten by Rock
        default:
            console.warn("Invalid input: " + input);
            return null; // Return null or handle the invalid input case as needed
    }
}

// Other functions (boilArray, playerInput, Predictor, redistribute, findGreatestPos) remain the same.



// Takes an array and returns the percentage of how much each occurrence showed up. Like it gets the jist, or boils down the array.
function boilArray(arr)
{
    let counts = {};
    let percentages = {}
    let total = arr.length;

    // Count occurrences of each string
    arr.forEach(item =>
    {
        counts[item] = (counts[item] || 0) + 1;
    })

    for (let key in counts)
    {
        percentages[key] = counts[key] / total;
    }

    return percentages;
}


function playerInput(rps)
{
    rps.toUpperCase();
    if(!["R", "P", "S"].includes(rps))
    {
        console.warn("Input is invalid. Input R, P, or S");
        return console.error("Fatal Error");
    }

    Predictor(rps);
}

function Predictor(rps)
{
    // Get the frequencies from the three methods
    let a = localRatio.getFrequencies();
    let b = probMatrix.getFrequencies(lastMove);
    let c = globalFreq.counts;

    // Combine the results from all methods
    let combinedProbUnit = a.combine([b, c], [weights.localRatio, weights.probMatrix, weights.globalFreq]);

    combinedProbUnit = combinedProbUnit.normalize();

    let answer = findGreatestPos(combinedProbUnit);

    localRatio.addMove(rps);
    globalFreq.addMove(rps);
    probMatrix.addTransition(lastMove, rps);

    lastMove = rps;
    inputs.push(rps);

    win(answer, rps);
    console.log("Overall Answer: " + answer)
    redistribute(a, b, c, rps);
    
}

function redistribute(local, global, prob, input)
{
    // Find the greatest positions for each method
    const localGuess = findGreatestPos(local);
    const globalGuess = findGreatestPos(global);
    const probGuess = findGreatestPos(prob);

    console.log("Indv. Answer: " + `LG: ${localGuess}, GG: ${globalGuess}, PM: ${probGuess}`)

    // Initialize success flags for each method
    let localSuccess = (localGuess === input);
    let globalSuccess = (globalGuess === input);
    let probSuccess = (probGuess === input);

    // Initialize total success count
    let successCount = (localSuccess ? 1 : 0) + (globalSuccess ? 1 : 0) + (probSuccess ? 1 : 0);

    // If no method succeeded, do nothing
    if (successCount === 0 || successCount === 3)
    {
        console.log("No Redistribution")
        return;
    }

    // Calculate the total amount to redistribute
    let totalRedistribution = redistributionPercentage * (3 - successCount);

    // Adjust weights based on success
    if (localSuccess)
    {
        weights.localRatio += totalRedistribution / successCount;
    }
    else
    {
        weights.localRatio -= redistributionPercentage;
    }

    if (globalSuccess)
    {
        weights.globalFreq += totalRedistribution / successCount;
    }
    else
    {
        weights.globalFreq -= redistributionPercentage;
    }

    if (probSuccess)
    {
        weights.probMatrix += totalRedistribution / successCount;
    }
    else
    {
        weights.probMatrix -= redistributionPercentage;
    }

    // Ensure weights remain within valid bounds (e.g., non-negative)
    weights.localRatio = Math.max(0, weights.localRatio);
    weights.probMatrix = Math.max(0, weights.probMatrix);
    weights.globalFreq = Math.max(0, weights.globalFreq);

    console.log(weights);

    return weights;
}

function findGreatestPos(probUnit)
{
    let { R, P, S } = probUnit; // Input is NaN!

    // Create an array of the values
    let values = [{ move: "R", value: R }, { move: "P", value: P }, { move: "S", value: S }];

    // Find the maximum value among R, P, S
    let maxValue = Math.max(R, P, S);

    // Filter the values array to get only the moves with the maximum value
    let bestMoves = values.filter(item => item.value === maxValue);

    // Randomly select one of the best moves in case of a tie
    let selectedMove = bestMoves[Math.floor(Math.random() * bestMoves.length)].move;

    return selectedMove;
}