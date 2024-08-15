// The base unit of a probability
class ProbUnit
{
    constructor(R = 0, P = 0, S = 0)
    {
        this.R = R;
        this.P = P;
        this.S = S;
    }

    normalize()
    {
        const total = this.R + this.P + this.S;
        
        // Handle case where total is zero to avoid division by zero
        if (total === 0)
        {
            return new ProbUnit(0, 0, 0);
        }

        const normalized = new ProbUnit(this.R / total, this.P / total, this.S / total);
        return normalized;
    }

    combine(units = [], weights = [])
    {
        // Get the weight for the current unit (this); default to 1 if not provided
        const selfWeight = weights[0] || 1;

        // Clone and normalize this object
        const combined = this.clone();
        combined.R *= selfWeight;
        combined.P *= selfWeight;
        combined.S *= selfWeight;

        // Add the probabilities from each provided unit with their respective weight
        units.forEach((unit, index) =>
        {
            // Normalize the unit before adding
            const normalizedUnit = unit.clone().normalize();

            // Get the weight for this unit; default to 1 if not provided
            const weight = weights[index + 1] || 1;

            // Add the weighted probabilities to the combined unit
            combined.R += normalizedUnit.R * weight;
            combined.P += normalizedUnit.P * weight;
            combined.S += normalizedUnit.S * weight;
        });

        // Normalize the combined unit
        return combined.normalize();
    }

    clone()
    {
        return new ProbUnit(this.R, this.P, this.S);
    }
}


class ProbMatrix
{
    constructor()
    {
        this.matrix =
        {
            R: new ProbUnit(),
            P: new ProbUnit(),
            S: new ProbUnit()
        }
    }

    // Adds a transition from previousMove to currentMove
    addTransition(previousMove, currentMove)
    {
        if (!this.matrix[previousMove]) return;
        this.matrix[previousMove][currentMove]++;
    }

    // Get the probability of the next move based on the previous move
    getFrequencies(previousMove)
    {
        const unit = this.matrix[previousMove];
        if (!unit) return new ProbUnit(); // Return the default if no data

        // Clone and Normalize
        const probabilities = unit.clone();
        probabilities.normalize();

        return probabilities;
    }
}

class GlobalFreq
{
    constructor()
    {
        this.counts = new ProbUnit();
    }

    addMove(move)
    {
        this.counts[move]++;
    }

    normalize()
    {
        return this.counts.normalize();
    }
}

class LocalRatio
{
    //!WARNING!//  This class has a dependency on a global variable: age
    constructor()
    {
        this.data = [];
        this.maxAge = 0;
    }

    // Add a move to the local ratio
    addMove(move)
    {
        move.toUpperCase();

        if (['R', 'P', 'S'].includes(move))
        {
            this.data.push(move);
            if (age > this.maxAge)
            {
                this.data.shift();
            }
        }

        else
        {
            console.warn("Invalid Move in Local Ratio! Move: " + move);
        }
    }

    getFrequencies()
    {
        const freqs = boilArray(this.data);

        return new ProbUnit(
            freqs['R'] || 0,
            freqs['P'] || 0,
            freqs['S'] || 0
        )
    }
}
