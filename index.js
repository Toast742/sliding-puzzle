let timerID;
let startTime;
let timer = document.getElementById("timer");

let Timer = {
    start: () => {
        startTime = Date.now();
        timerID = setInterval(() => {
            let delta = new Date(Date.now() - startTime);
            let deltaSeconds = (String(delta.getSeconds()).length === 2) ? delta.getSeconds() : "0" + delta.getSeconds();
            let deltaMilliseconds = (String(delta.getMilliseconds()).length === 3) ? delta.getMilliseconds() : "0" + ((String(delta.getMilliseconds()).length === 2) ? delta.getMilliseconds() : "0" + delta.getMilliseconds());
            if (delta.getHours() - 1 === 0) {
                timer.innerHTML = `${delta.getMinutes()}:${deltaSeconds}.${deltaMilliseconds}`;
            }
            else {
                timer.innerHTML = `${delta.getHours() - 1}:${(String(delta.getMinutes()).length === 2) ? delta.getMinutes() : "0" + delta.getMinutes()}:${deltaSeconds}.${deltaMilliseconds}`;
            }
        }, 10)
    },
    stop: () => {
        let delta = new Date(Date.now() - startTime);
        let deltaSeconds = (String(delta.getSeconds()).length === 2) ? delta.getSeconds() : "0" + delta.getSeconds();
        let deltaMilliseconds = (String(delta.getMilliseconds()).length === 3) ? delta.getMilliseconds() : "0" + ((String(delta.getMilliseconds()).length === 2) ? delta.getMilliseconds() : "0" + delta.getMilliseconds());
        clearInterval(timerID);
        if (delta.getHours() - 1 === 0) {
            timer.innerHTML = `${delta.getMinutes()}:${deltaSeconds}.${deltaMilliseconds}`;
        }
        else {
            timer.innerHTML = `${delta.getHours() - 1}:${(String(delta.getMinutes()).length === 2) ? delta.getMinutes() : "0" + delta.getMinutes()}:${deltaSeconds}.${deltaMilliseconds}`;
        }
    },
    reset: () => {
        timer.innerHTML = "0:00.000";
    }
}

let board = document.getElementById("board");
let slider = document.getElementById("slider");
let sliderText = document.getElementById("slider-text");
let puzzlePieceDivs;
let puzzlePieces = [];
let size;
let firstMove = true;
sliderText.innerHTML = slider.value;

addPuzzlePieces(3);
scramble();

slider.addEventListener("input", () => {            //when the value of the slider changes:
    sliderText.innerHTML = slider.value;            //the slider-text gets updated
    board.replaceChildren();                        //the divs are deleted
    puzzlePieces = [];                              //"puzzlePieces" is emptied
    addPuzzlePieces();                              //new divs are added, "puzzlePieces" gets updated
})

slider.addEventListener("mouseup", scramble);       //scrambles when you let go of the slider

document.addEventListener("keydown", (e) => {       //global hotkeys
    switch (e.key) {
        case "ArrowUp":
            e.preventDefault();         //prevent scrolling
            if (!solved(puzzlePieces) && puzzlePieces.indexOf(0) < puzzlePieces.length - slider.value) execMoveUp();    //executes move, if the board is not already solved and the move is possible
            break;
        case "ArrowDown":
            e.preventDefault();
            if (!solved(puzzlePieces) && puzzlePieces.indexOf(0) >= slider.value) execMoveDown();
            break;
        case "ArrowLeft":
            e.preventDefault();
            if (!solved(puzzlePieces) && (puzzlePieces.indexOf(0) + 1) % slider.value !== 0) execMoveLeft();
            break;
        case "ArrowRight":
            e.preventDefault();
            if (!solved(puzzlePieces) && puzzlePieces.indexOf(0) % slider.value !== 0) execMoveRight();
            break;
        case "r":
            scramble();
            break;
    }
});

function closeKeybinds() {
    let container1 = document.getElementById("container1");
    container1.removeChild(document.getElementById("shortcuts-info"));
}

function addPuzzlePieces() {                    //creates the div elements with the correct size and adds them to the board; adds the number to a seperate array that also contains "0" for the blank puzzle piece
    for (let i = 0; i < Math.pow(slider.value, 2) - 1; i++) {
        board.append(document.createElement("div"));
    }
    puzzlePieceDivs = Array.from(board.children);
    size = 700 / slider.value;
    puzzlePieceDivs.forEach((div, idx) => {
        div.classList.add("puzzle-piece");
        div.style.width = div.style.height = size + "px";
        div.style.top = Math.floor(idx / slider.value) * size + "px";
        div.style.left = idx % slider.value * size + "px";
        div.innerHTML = puzzlePieces[idx] = idx + 1;
        div.style.fontSize = size * 0.4 + "px";
        div.addEventListener("click", puzzlePieceClick);
    });
    puzzlePieces.push(0);
}

function scramble() {
    Timer.stop();
    Timer.reset();
    firstMove = true;
    let temp = [];
    let pieceCount = puzzlePieces.length;
    for (let i = 0; i < pieceCount; i++) {          //Numbers are stored in "temp" in random order
        let rnd = Math.floor(Math.random() * puzzlePieces.length);
        temp[i] = puzzlePieces[rnd];
        puzzlePieces.splice(rnd, 1);
    }
    while (unsolvable(temp) || solved(temp)) {      //while the scramble is either unsolvable or already solved, random numbers are swapped
        let rnd = Math.floor(Math.random() * temp.length);
        let rnd2 = Math.floor(Math.random() * temp.length);
        let a = temp[rnd];
        temp[rnd] = temp[rnd2];
        temp[rnd2] = a;
    }
    puzzlePieces = [...temp];
    for (let i = 0; i < puzzlePieceDivs.length; i++) {          //loops through the still sorted divs to set their position to the scrambled position
        let column = puzzlePieces.indexOf(Number(puzzlePieceDivs[i].innerHTML)) % slider.value;
        let row = Math.floor(puzzlePieces.indexOf(Number(puzzlePieceDivs[i].innerHTML)) / slider.value);
        puzzlePieceDivs[i].style.left = column * size + "px";
        puzzlePieceDivs[i].style.top = row * size + "px";
    }
}

function unsolvable(array) {        //checks if the permutation is solvable with legal moves; https://www.geeksforgeeks.org/check-instance-15-puzzle-solvable/
    if (!!(slider.value % 2)) return !!(inversions(array) % 2);
    return !((!!(inversions(array) % 2) && !(Math.floor(array.indexOf(0) / slider.value) % 2)) || (!(inversions(array) % 2) && !!(Math.floor(array.indexOf(0) / slider.value) % 2)));
}

function solved(array) {            //checks if the permutation is the solved state
    if (!inversions(array) && array[array.length - 1] === 0) return true;
    return false;
}

function inversions(array) {        //returns the number of inversions in the permutation (every number is compared to every other number to see if they are in the correct order)
    let array2 = [...array];
    array2.splice(array2.indexOf(0), 1);
    let inverionsCount = 0;
    for (let i = 0; i < array2.length - 1; i++) {
        for (let k = 0; k < array2.slice(i + 1).length; k++) {
            if (array2[i] > array2[i + 1 + k]) {
                inverionsCount++;
            }
        }
    }
    return inverionsCount;
}

function execMoveUp() {
    if (firstMove) {Timer.start(); firstMove = false;}
    let idxOf0 = puzzlePieces.indexOf(0);           //index of the blank puzzle piece
    let idxOfDiv;
    for (let i = 0; i < puzzlePieceDivs.length; i++) {      //locates the div that will be moved to the blank puzzle piece
        if (puzzlePieceDivs[i].innerHTML == puzzlePieces[idxOf0 + Number(slider.value)]) {
            idxOfDiv = i;
            break;
        }
    }
    puzzlePieceDivs[idxOfDiv].style.top = Number(puzzlePieceDivs[idxOfDiv].style.top.slice(0, -2)) - size + "px";       //moves the div
    puzzlePieces[idxOf0] = puzzlePieces[idxOf0 + Number(slider.value)];             //swaps the number -
    puzzlePieces[idxOf0 + Number(slider.value)] = 0;                                //with the blank space
    if (solved(puzzlePieces)) Timer.stop();
}

function execMoveDown() {
    if (firstMove) {Timer.start(); firstMove = false;}
    let idxOf0 = puzzlePieces.indexOf(0);
    let idxOfDiv;
    for (let i = 0; i < puzzlePieceDivs.length; i++) {
        if (puzzlePieceDivs[i].innerHTML == puzzlePieces[idxOf0 - Number(slider.value)]) {
            idxOfDiv = i;
            break;
        }
    }
    puzzlePieceDivs[idxOfDiv].style.top = Number(puzzlePieceDivs[idxOfDiv].style.top.slice(0, -2)) + size + "px";
    puzzlePieces[idxOf0] = puzzlePieces[idxOf0 - slider.value];
    puzzlePieces[idxOf0 - slider.value] = 0;
    if (solved(puzzlePieces)) Timer.stop();
}

function execMoveLeft() {
    if (firstMove) {Timer.start(); firstMove = false;}
    let idxOf0 = puzzlePieces.indexOf(0);
    let idxOfDiv;
    for (let i = 0; i < puzzlePieceDivs.length; i++) {
        if (puzzlePieceDivs[i].innerHTML == puzzlePieces[idxOf0 + 1]) {
            idxOfDiv = i;
            break;
        }
    }
    puzzlePieceDivs[idxOfDiv].style.left = Number(puzzlePieceDivs[idxOfDiv].style.left.slice(0, -2)) - size + "px";
    puzzlePieces[idxOf0] = puzzlePieces[idxOf0 + 1];
    puzzlePieces[idxOf0 + 1] = 0;
    if (solved(puzzlePieces)) Timer.stop();
}

function execMoveRight() {
    if (firstMove) {Timer.start(); firstMove = false;}
    let idxOf0 = puzzlePieces.indexOf(0);
    let idxOfDiv;
    for (let i = 0; i < puzzlePieceDivs.length; i++) {
        if (puzzlePieceDivs[i].innerHTML == puzzlePieces[idxOf0 - 1]) {
            idxOfDiv = i;
            break;
        }
    }
    puzzlePieceDivs[idxOfDiv].style.left = Number(puzzlePieceDivs[idxOfDiv].style.left.slice(0, -2)) + size + "px";
    puzzlePieces[idxOf0] = puzzlePieces[idxOf0 - 1];
    puzzlePieces[idxOf0 - 1] = 0;
    if (solved(puzzlePieces)) Timer.stop();
}

function puzzlePieceClick() {       //called on Mouse1 click on a puzzle piece
    let idx = puzzlePieces.indexOf(Number(this.innerHTML));     //find index of clicked piece
    if (!solved(puzzlePieces)){
        recursiveClick(idx, "up");  //recursive function that looks for the blank space in the specified direction until it finds it or reaches the edge; then moves all pieces between the blank space and the clicked piece at once
        if (!blankFound) recursiveClick(idx, "down");
        if (!blankFound) recursiveClick(idx, "left");
        if (!blankFound) recursiveClick(idx, "right");
    }
    blankFound = false;
}

let blankFound = false;

function recursiveClick(idx, direction) {
    switch (direction) {
        case "up":
            if (puzzlePieces[idx - slider.value] !== undefined) {
                if (puzzlePieces[idx - slider.value] === 0) {
                    execMoveUp();
                    blankFound = true;
                    return;
                }
                else {
                    recursiveClick(idx - slider.value, "up");
                    if (blankFound) execMoveUp();
                }
            }
            break;
        case "down":
            if (puzzlePieces[idx + Number(slider.value)] !== undefined) {
                if (puzzlePieces[idx + Number(slider.value)] === 0) {
                    execMoveDown();
                    blankFound = true;
                    return;
                }
                else {
                    recursiveClick(idx + Number(slider.value), "down");
                    if (blankFound) execMoveDown();
                }
            }
            break;
        case "left":
            if (Math.floor(idx / slider.value) === Math.floor((idx - 1) / slider.value)) {
                if (puzzlePieces[idx - 1] === 0) {
                    execMoveLeft();
                    blankFound = true;
                    return;
                }
                else {
                    recursiveClick(idx - 1, "left");
                    if (blankFound) execMoveLeft();
                }
            }
            break;
        case "right":
            if (Math.floor(idx / slider.value) === Math.floor((idx + 1) / slider.value)) {
                if (puzzlePieces[idx + 1] === 0) {
                    execMoveRight();
                    blankFound = true;
                    return;
                }
                else {
                    recursiveClick(idx + 1, "right");
                    if (blankFound) execMoveRight();
                }
            }
            break;
    }
}