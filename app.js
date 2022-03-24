const tileDisplay = document.querySelector('.tile-container')
const keyboard = document.querySelector('.key-container')
const messageDisplay = document.querySelector('.message-container')

let wordle

const getWordle = () => {
    fetch('http://localhost:8000/word')
        .then(response => response.json())
        .then(json => {
            console.log(json)
            wordle = json.toUpperCase()
        })
        .catch(err => console.log(err))
}
getWordle()

const keys = [
    'Q',
    'W',
    'E',
    'R',
    'T',
    'Y',
    'U',
    'I',
    'O',
    'P',
    'A',
    'S',
    'D',
    'F',
    'G',
    'H',
    'J',
    'K',
    'L',
    'ENTER',
    'Z',
    'X',
    'C',
    'V',
    'B',
    'N',
    'M',
    '«',
]

const guessRows = [
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', '']
]

let currentRow = 0
let currentTile = 0
let isGameOver = false

// getting an id for each tile
// loops each row
guessRows.forEach((guessRow, guessRowIndex) => {
    const rowElement = document.createElement('div')
    rowElement.setAttribute('id', 'guessRow-' + guessRowIndex)

    // loops each tile
    guessRow.forEach((guess, guessIndex) => {
        const tileElement = document.createElement('div')
        tileElement.setAttribute('id', 'guessRow-' + guessRowIndex + '-tile-' + guessIndex)
        tileElement.classList.add('tile')
        rowElement.append(tileElement)
    })
    tileDisplay.append(rowElement)
})

// loops all elements of keys and creates a button
// then append them to the keyboard container
keys.forEach(key => {
    const buttonElement = document.createElement('button')
    buttonElement.textContent = key
    buttonElement.setAttribute('id',key)
    buttonElement.addEventListener('click', () => handleClick(key))
    keyboard.append(buttonElement)
} )

const handleClick = (letter) => {
    if (!isGameOver) {
        console.log('clicked', letter)
        if (letter == '«') {
            deleteLetter()
            console.log('guessRows', guessRows)
            return
        }
        if (letter == 'ENTER') {
            checkRow()
            console.log('check row')
            return
        }
        addLetter(letter)
        console.log('guessRows', guessRows)
    }
}

const addLetter = (letter) => {
    if (currentTile < 5 && currentRow < 6) {
        // gets specific tile through the id
        const tile = document.getElementById('guessRow-' + currentRow + '-tile-' + currentTile)
        // adds letter to the interface
        tile.textContent = letter
        // adds letter to the backend matrix
        guessRows[currentRow][currentTile] = letter
        tile.setAttribute('data', letter)
        currentTile++
    }
}

const deleteLetter = () => {
    if (currentTile > 0) {
        currentTile--
        const tile = document.getElementById('guessRow-' + currentRow + '-tile-' + currentTile)
        tile.textContent = ''
        guessRows[currentRow][currentTile] = ''
        tile.setAttribute('data', '')
    }
}

const checkRow = () => {
    // strcat all the letters (tiles) in the row
    const guess = guessRows[currentRow].join('')
    if (currentTile > 4) {
        fetch(`http://localhost:8000/check/?word=${guess}`)
            .then(response => response.json())
            .then(json => {
                if (json == 'Entry word not found') {
                    showMessage('Invalid word!')
                    return
                } else {
                    console.log('guess is ' + guess, 'wordle is ' + wordle)
                    flipTile()
                    if (wordle == guess) {
                        showMessage('Good job! :)')
                        isGameOver = true
                        return
                    } else {
                        if (currentRow >= 5) {
                            isGameOver = true
                            showMessage('Game over :(')
                            return
                        } else {
                            currentRow++
                            currentTile = 0
                        }
                    }
                }
            }).catch(err => console.log(err))
    }
}

const showMessage = (message) => {
    const messageElement = document.createElement('p')
    messageElement.textContent = message
    messageDisplay.append(messageElement)
    setTimeout(() => messageDisplay.removeChild(messageElement), 2000)
}

const addColorToKey = (keyLetter, color) => {
    const key = document.getElementById(keyLetter)
    key.classList.add(color)
}

const flipTile = () => {
    // returns a list of the tiles of the respective row
    const rowTiles = document.querySelector('#guessRow-' + currentRow).childNodes
    let checkWordle = wordle
    const guess = []

    // 1st loop through each tile to get all the letters and setup grey as default
    rowTiles.forEach((tile) => {
        // struct "guess" with each -letter- and respective -color- of the row
        guess.push({letter: tile.getAttribute('data'), color: 'grey-overlay'})
    })

    // loop through the gathered letters
    guess.forEach((guess, index) => {
        if (guess.letter == wordle[index]) {
            guess.color = 'green-overlay'
            // deletes letters already analysed
            checkWordle = checkWordle.replace(guess.letter, '')
        }
    })

    // after green checks for yellow letters
    // the same letter can appear twice p.e. green in one spot and yellow in another
    guess.forEach(guess => {
        // this time no need to loop, just check  if the letter exists in the word
        if (checkWordle.includes(guess.letter)) {
            guess.color = 'yellow-overlay'
            checkWordle = checkWordle.replace(guess.letter, '')
        }
    })
    // One last loop to assign the colors and for the flip animation of every tile
    rowTiles.forEach((tile, index) => {
        setTimeout(() => {
            tile.classList.add('flip')
            tile.classList.add(guess[index].color)
            addColorToKey(guess[index].letter, guess[index].color)
        }, 500 * index)
    })
}
