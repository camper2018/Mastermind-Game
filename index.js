// to allow async await using axios
import "regenerator-runtime/runtime";
import axios from "axios";
const globalStore = (function initGame() {
  let gameDifficulty = "hard";
  let numericSecret;
  let attemptCount = 0;
  let colorInputCount = 0;
  let selectedColors = [];
  const feedbacks = [];
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
  let sequenceLength = getPlacementsCount(gameDifficulty).length;
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
    console.log("sequence:", sequence);
    const colorSequence = sequence.map((number, i) => {
      return colors[Number(number)];
    });
    return colorSequence;
  }
  const generateRandomSequence = async (num, max) => {
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
  };
  function setGameDifficulty(difficulty) {
    // takes string argument

    let secretLength = getPlacementsCount(difficulty);
    columnIds.forEach((id, i) => {
      let colsPerAttempt = [];
      secretLength.forEach((num, i) => {
        let divId = id + i;
        let $div = $(`<div class="color-cell" id=${divId}>`);
        colsPerAttempt.push($div);
      });
      let $button = $(
        `<button id="check-${id}" class="check-btn">Check</button>`
      );
      colsPerAttempt.push($button);
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
    if (colorInputCount < sequenceLength) {
      let selectedColor = event.target.id;
      let colorPlacementId = columnIds[attemptCount];
      let placementId = colorPlacementId + colorInputCount;
      $(`#${placementId}`).css("background-color", selectedColor);
      colorInputCount++;
      selectedColors.push(selectedColor);
    }
  }
  function handleCheck(secret, target) {
    // $($(target)).prop("disabled", true);
    $($(target)).css("display", "none");
    // checkForFeedback
    // function checkForFeedback(sequence, enteredSequence) {
    //   const feedback = {};
    //   const matched = enteredSequence.filter(
    //     (color, i) => color === sequence[i]
    //   );
    //   const mispositioned = enteredSequence.filter((color, i) =>
    //     sequence.includes(color)
    //   );
    //   feedback.matched = matched;
    //   feedback.mispositioned = mispositioned;
    //   return feedback;
    // }
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
    // displayFeedback
    const feedback = checkForFeedback(secret, selectedColors);
    globalStore.feedbacks.push(feedback);

    let divId = columnIds[attemptCount];
    $(`#${divId}`)
      .children()
      .each((i, child) => {
        $(child)
          .children()
          .each((i, colorDiv) => {
            $(colorDiv).text(feedback[i]);
          });
      });
    attemptCount++;
    colorInputCount = 0;
  }
  return {
    columnIds,
    attemptCount,
    sequenceLength,
    colorInputCount,
    gameDifficulty,
    numericSecret,
    feedbacks,
    getRandomColorSequence,
    generateRandomSequence,
    getPlacementsCount,
    setGameDifficulty,
    createInputButtons,
    handleInput,
    handleCheck,
  };
})();

$(document).ready(() => {
  globalStore.generateRandomSequence(4, 7).then((secret) => {
    // create positions for code in each column based on difficulty
    globalStore.setGameDifficulty("easy");
    // create colored buttons dynamically
    globalStore.createInputButtons();
    // while (globalStore.attemptCount <= 10) {
    let checkId = globalStore.columnIds[globalStore.attemptCount];
    console.log(checkId);
    $(`#check-${checkId}`).on("click", (e) => {
      let target = e.target;

      globalStore.handleCheck(secret, target, counter);
      console.log(globalStore.attemptCount);
    });
    // }
  });
});
