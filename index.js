// to allow async await using axios
import "regenerator-runtime/runtime";
import axios from "axios";

const globalStore = (function initGame() {
  let gameDifficulty = "medium";
  let numericSecret;
  let attemptCount = 0;
  let colorInputCount = 0;
  let selectedColors = [];
  const feedbacks = [];
  let gameover = false;
  let sequenceLength = getPlacementsCount(gameDifficulty).length;
  const columnIds = [
    "r1c1",
    "r1c2",
    "r2c1",
    "r2c2",
    "r3c1",
    "r3c2",
    "r4c1",
    "r4c2",
    "r5c1",
    "r5c2",
  ];

  return {
    columnIds,
    attemptCount,
    colorInputCount,
    gameDifficulty,
    numericSecret,
    feedbacks,
    selectedColors,
    gameover,
    sequenceLength,
  };
})();
// globalStore.sequenceLength = getPlacementsCount(
//   globalStore.gameDifficulty
// ).length;
// let sequenceLength = getPlacementsCount(globalStore.gameDifficulty).length;
function getPlacementsCount(difficulty) {
  let nums = [];
  let num = 0;
  if (difficulty.toLowerCase() === "easy") {
    num = 3;
  } else if (difficulty.toLowerCase() === "medium") {
    num = 4;
  } else if (difficulty.toLowerCase() === "hard") {
    num = 5;
  }
  while (num >= 0) {
    nums.push(num);
    num--;
  }
  return nums;
}
function getRandomColorSequence(sequence) {
  const colors = [
    "#ff0000ff",
    "#ff9900ff",
    "#ffff00ff",
    "#6aa84fff",
    "#0000ffff",
    "#9900ffff",
    "#ff00ffff",
    "#85200cff",
  ];
  const colorSequence = sequence.map((number, i) => {
    return colors[Number(number)];
  });
  return colorSequence;
}
async function generateRandomSequence(num, max) {
  try {
    const response = await axios.get(
      `https://www.random.org/integers/?num=${num}&min=0&max=${max}&col=1&base=10&format=plain&rnd=new`
    );

    const randomSequence = response.data;
    let sequence = await randomSequence.trim().split("\n");
    const colorSequence = await getRandomColorSequence(sequence);
    // return randomSequence;
    console.log(colorSequence);
    return await colorSequence;
  } catch (errors) {
    console.error(errors);
  }
}
function setGameDifficulty(difficulty) {
  // takes string argument

  let secretLength = getPlacementsCount(difficulty);
  globalStore.columnIds.forEach((id, i) => {
    let colsPerAttempt = [];
    secretLength.forEach((num, i) => {
      let divId = id + i;
      let $div = $(`<div class="color-cell" id=${divId}>`);
      colsPerAttempt.push($div);
    });

    let $container = $(`<div class="color-cell-container">`);
    $container.append(colsPerAttempt);
    $(`#${id}`).append($container);
    colsPerAttempt = [];
  });
}
function createInputButtons() {
  const colors = [
    "#ff0000ff",
    "#ff9900ff",
    "#ffff00ff",
    "#6aa84fff",
    "#0000ffff",
    "#9900ffff",
    "#ff00ffff",
    "#85200cff",
  ];
  let btnArray = [];
  colors.forEach((color, i) => {
    let $button = $(
      `<button id=${color} class="color-btns border rounded-circle border-2 d-flex justify-content-center align-items-center">Press</button>`
    );
    $($button).css("background-color", color);
    btnArray.push($button);
  });
  $(`.input-btns-container`).append(btnArray);

  $(`.input-btns-container`).on("click", function (e) {
    handleInput(e);
  });
}
function handleInput(event) {
  if (
    globalStore.colorInputCount < globalStore.sequenceLength &&
    globalStore.attemptCount < 10
  ) {
    let selectedColor = event.target.id;
    let colorPlacementId = globalStore.columnIds[globalStore.attemptCount];
    let placementId = colorPlacementId + globalStore.colorInputCount;
    $(`#${placementId}`).css("background-color", selectedColor);
    globalStore.colorInputCount++;
    globalStore.selectedColors.push(selectedColor);
  }
}
function checkForFeedback(sequence, enteredSequence) {
  const feedback = enteredSequence.map((val, i) => {
    if (val === sequence[i]) {
      return `👍`;
    } else if (sequence.includes(val)) {
      return `🧐`;
    } else {
      return `👎`;
    }
  });
  return feedback;
}

$(document).ready(() => {
  generateRandomSequence(4, 7).then((secret) => {
    // create positions for code in each column based on difficulty
    setGameDifficulty(globalStore.gameDifficulty);
    // create colored buttons dynamically
    createInputButtons();
    // attach click handler to the check buttons
    let counter = 0;
    while (counter < 10) {
      let checkId = globalStore.columnIds[counter];
      $(`button#check-${checkId}`).on("click", function (e) {
        console.log("e.target", e.target);
        handleCheck(secret, e.target);
      });
      counter++;
    }
  });
});
function handleCheck(secret, target) {
  let id = `check-${globalStore.columnIds[globalStore.attemptCount]}`;

  if (
    target.id === id &&
    globalStore.colorInputCount === globalStore.sequenceLength
  ) {
    $($(target)).prop("disabled", true);

    // displayFeedback
    const feedback = checkForFeedback(secret, globalStore.selectedColors);
    globalStore.feedbacks.push(feedback);

    // Add feedback emoticons after each attempt.
    let divId = globalStore.columnIds[globalStore.attemptCount];
    $(`#${divId}`)
      .children()
      .each((i, child) => {
        $(child)
          .children()
          .each((i, colorDiv) => {
            let $feedback = $(`<center><h1>${feedback[i]}</h1></center>`);
            $(colorDiv).append($feedback);
          });
      });
    if (globalStore.attemptCount < 10) {
      globalStore.attemptCount++;
      globalStore.colorInputCount = 0;
    } else {
      // game over
    }
  }
}
function calculateScore() {
  // based on number of attempts used
  // based on number of hints used (optional)
  // based on difficulty level
  // based on time left
}
function displayResult() {
  // alert or another page to show score or win or loose status.
  // 10 attempts used  or time finished ----loose.
  // 8+ attempts used ---- you survived.
  // 6+ attempts used ---- well played.
  // 4+ attempts used ---- you are brilliant
  // 2+ attempts used ---- you are super hero!
}
function restart() {
  // change hint to play again
  // reset all global variables.
}
