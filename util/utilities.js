import axios from "axios";
export function renderPlacements(difficulty) {
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
export function handleHint(secret) {
  let indx = globalStore.hintCount;
  const colors = [
    "ff0000ff",
    "ff9900ff",
    "ffff00ff",
    "6aa84fff",
    "0000ffff",
    "9900ffff",
    "ff00ffff",
    "85200cff",
  ];
  if (indx < 3) {
    let unUsedColors = colors.filter((color, i) => {
      return !secret.includes(`#${color}`);
    });
    let id = unUsedColors[indx];
    let button = $(`button#${id}.color-btns`);
    $(button).prop("disabled", true);
    globalStore.hintCount++;
  } else {
    $(`#btn-hint`).prop("disabled", true);
  }
}
export function getRandomColorSequence(sequence) {
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
export async function generateRandomSequence(num, max, duplicatesAllowed) {
  if (!JSON.parse(duplicatesAllowed)) {
    let isUnique = false;
    try {
      while (!isUnique) {
        const response = await axios.get(
          `https://www.random.org/integers/?num=${num}&min=0&max=${max}&col=1&base=10&format=plain&rnd=new`
        );
        const randomSequence = response.data;
        let sequence = await randomSequence.trim().split("\n");
        let uniqueSequence = [...new Set(sequence)];
        if (uniqueSequence.length === sequence.length) {
          isUnique = true;
          const colorSequence = await getRandomColorSequence(sequence);
          return colorSequence;
        }
      }
    } catch (errors) {
      console.error(errors);
    }
  } else {
    try {
      const response = await axios.get(
        `https://www.random.org/integers/?num=${num}&min=0&max=${max}&col=1&base=10&format=plain&rnd=new`
      );
      const randomSequence = response.data;
      let sequence = await randomSequence.trim().split("\n");
      const colorSequence = await getRandomColorSequence(sequence);
      return colorSequence;
    } catch (errors) {
      console.error(errors);
    }
  }
}
export function setGameDifficulty(difficulty) {
  // takes string argument
  let text = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  $(`#difficulty`).text(text);
  let secretLength = renderPlacements(difficulty);
  globalStore.columnIds.forEach((id, i) => {
    let colsPerAttempt = [];
    secretLength.forEach((num, i) => {
      let divId = id + i;
      let $div = $(`<div class="color-cell" id=${divId}>`);
      colsPerAttempt.push($div);
    });

    let $container = $(`<div class="color-cell-container">`);
    $container.append(colsPerAttempt);
    $(`#${id}`).html($container);
    colsPerAttempt = [];
  });
}
export function createInputButtons(secret) {
  const colors = [
    "ff0000ff",
    "ff9900ff",
    "ffff00ff",
    "6aa84fff",
    "0000ffff",
    "9900ffff",
    "ff00ffff",
    "85200cff",
  ];
  let btnArray = [];
  colors.forEach((color, i) => {
    let $button = $(
      `<button id=${color} class="color-btns border rounded-circle border-2 d-flex justify-content-center align-items-center">Press</button>`
    );
    $($button).css("background-color", `#${color}`);
    btnArray.push($button);
  });
  $(`.input-btns-container`).html(btnArray);

  $(`.input-btns-container`).on("click", function (e) {
    if ($($(e.target)).text() === "Press") {
      handleInput(e, secret);
    }
  });
}
export function handleInput(event, secret) {
  if (
    globalStore.colorInputCount < secret.length &&
    globalStore.attemptCount < 10
  ) {
    let selectedColor = event.target.id;
    let colorPlacementId = globalStore.columnIds[globalStore.attemptCount];
    let placementId = colorPlacementId + globalStore.colorInputCount;
    $(`#${placementId}`).css("background-color", `#${selectedColor}`);
    globalStore.colorInputCount++;
    globalStore.selectedColors.push(`#${selectedColor}`);
  }
}
export function handleCheck(
  secret,
  target,
  time,
  intervalId,
  gameMode,
  gameAttempt,
  streakCount
) {
  let btnId = `check-${globalStore.columnIds[globalStore.attemptCount]}`;

  if (
    target.id === btnId &&
    globalStore.colorInputCount === globalStore.selectedColors.length &&
    globalStore.colorInputCount === secret.length
  ) {
    $($(target)).prop("disabled", true);

    // displayFeedback
    const feedback = checkForFeedback(secret, globalStore.selectedColors);
    globalStore.feedbacks.push(feedback);
    $($(target)).html(feedback);

    // check for win
    function checkForMatch(selectedSequence, code) {
      return selectedSequence.every((color, i) => color === code[i]);
    }

    let isDecoded = checkForMatch(globalStore.selectedColors, secret);
    let solutionHtml = displaySolution(secret);
    if (globalStore.attemptCount < 9 && !isDecoded) {
      if (time <= 0) {
        let message = `<p id="result">
        <strong>Attempts:&nbsp;&nbsp;${
          globalStore.attemptCount + 1
        } </strong> <br />
        <strong>Final Time:&nbsp;&nbsp;${
          time && time >= 0 ? time : 0
        } </strong> <br />
        <strong>Hints Used:&nbsp;&nbsp;${globalStore.hintCount} </strong> <br />
        <strong>Final Score:&nbsp;&nbsp;${
          calculateScore(time ? time : 0) >= 0
            ? calculateScore(time ? time : 0)
            : 0
        } </strong> <br />
        <br />
        <strong id="solution">SOLUTION:</strong><br/>
        ${solutionHtml}
      </p>`;
        clearInterval(intervalId);
        showModal(
          "You Lose!",
          message,
          "Play Again",
          "Close",
          reloadPage,
          hideModal
        );
        if (gameMode === "singlePlayer") {
          localStorage.setItem("gameAttempt", `${gameAttempt + 1}`);
          localStorage.setItem("streakCount", `${streakCount + 1}`);
        }
      } else {
        globalStore.attemptCount++;
        globalStore.colorInputCount = 0;
        globalStore.selectedColors = [];
      }
    } else if (isDecoded) {
      let message = `<p id="result">
      <strong>Attempts:&nbsp;&nbsp;${
        globalStore.attemptCount + 1
      } </strong> <br />
      <strong>Final Time:&nbsp;&nbsp;${
        time && time >= 0 ? time : 0
      } </strong> <br />
      <strong>Hints Used:&nbsp;&nbsp;${globalStore.hintCount}</strong> <br />
      <strong>Final Score:&nbsp;&nbsp;${
        calculateScore(time ? time : 0) >= 0
          ? calculateScore(time ? time : 0)
          : 0
      } </strong> <br />
      <br />
      <strong id="solution">SOLUTION:</strong></br>
      ${solutionHtml}
    </p>`;
      clearInterval(intervalId);
      showModal(
        "You Win!",
        message,
        "Play Again",
        "Close",
        reloadPage,
        hideModal
      );
      if (gameMode === "singlePlayer") {
        localStorage.setItem("gameAttempt", `${gameAttempt + 1}`);
        localStorage.setItem("streakCount", `${streakCount + 1}`);
      }
    } else {
      let message = `<p id="result">
      <strong>Attempts:&nbsp;&nbsp;${
        globalStore.attemptCount + 1
      } </strong> <br />
      <strong>Final Time:&nbsp;&nbsp;${
        time && time >= 0 ? time : 0
      } </strong> <br />
      <strong>Hints Used:&nbsp;&nbsp;${globalStore.hintCount} </strong> <br />
      <strong>Final Score:&nbsp;&nbsp;${
        calculateScore(time ? time : 0) >= 0
          ? calculateScore(time ? time : 0)
          : 0
      } </strong> <br />
      <br />
      <strong id="solution">SOLUTION: </strong><br/>
      ${solutionHtml}
    </p>`;
      clearInterval(intervalId);
      showModal(
        "You Lose!",
        message,
        "Play Again",
        "Close",
        reloadPage,
        hideModal
      );
      if (gameMode === "singlePlayer") {
        localStorage.setItem("gameAttempt", `${gameAttempt + 1}`);
        localStorage.setItem("streakCount", "0");
      }
    }
  }
}
export function reloadPage() {
  location.reload();
}
export function checkForFeedback(sequence, enteredSequence) {
  let duplicatesAllowed = localStorage.getItem("duplicatesAllowed")
    ? JSON.parse(localStorage.getItem("duplicatesAllowed"))
    : false;
  if (duplicatesAllowed) {
    let feedback = ["&nbsp;"];
    let cache = {};
    enteredSequence.forEach((val, i) => {
      if (val === sequence[i]) {
        feedback.push(`🔴&nbsp;`);
        cache[val] = true;
      } else if (!cache[val] && sequence.includes(val)) {
        feedback.push(`⚪&nbsp;`);
        cache[val] = true;
      }
    });
    return feedback;
  } else {
    let feedback = ["&nbsp;"];
    enteredSequence.forEach((val, i) => {
      if (val === sequence[i]) {
        feedback.push(`🔴&nbsp;`);
      } else if (sequence.includes(val)) {
        feedback.push(`⚪&nbsp;`);
      }
    });

    return feedback;
  }
}
export function restartGame(
  gameDifficulty,
  gameMode,
  hintsAllowed,
  timer,
  duplicatesAllowed,
  gameAttempt,
  streakCount
) {
  $(`#bg-music`)[0].play();

  let intervalId;
  let time;
  hideModal();
  if (timer && timer !== "none") {
    time = JSON.parse(timer);
    intervalId = setInterval(() => {
      if (time >= 0) {
        $(`#time`).text(time);
        time--;
      }
    }, 1000);
  }

  if (!hintsAllowed) {
    $(`#btn-hint`).prop("disabled", true);
  }
  globalStore.attemptCount = 0;
  globalStore.colorInputCount = 0;
  globalStore.feedbacks = [];
  globalStore.selectedColors = [];
  let codeLength =
    gameDifficulty === "easy" ? 4 : gameDifficulty === "medium" ? 5 : 6;
  generateRandomSequence(codeLength, 7, duplicatesAllowed).then((secret) => {
    // create positions for code in each column based on difficulty
    setGameDifficulty(gameDifficulty);
    // create colored buttons dynamically
    createInputButtons(secret, gameAttempt, streakCount);
    // add click handler to hint button
    $(`#btn-hint`).on("click", function (e) {
      handleHint(secret);
    });
    // attach click handler to the check buttons
    let counter = 0;
    while (counter < 10) {
      let checkId = globalStore.columnIds[counter];
      $(`button#check-${checkId}`).on("click", function (e) {
        handleCheck(
          secret,
          e.target,
          time,
          intervalId,
          gameMode,
          gameAttempt,
          streakCount
        );
      });
      counter++;
    }
  });
}
export function hideModal() {
  $(".modal").hide();
}
export function showModal(
  text,
  html,
  btn1Text,
  btn2Text,
  btn1Handler,
  btn2Handler
) {
  $(".modal-title").text(text);
  $(".modal-body").html($(html));
  $("#replay").text(btn1Text);
  $(".btn-secondary").text(btn2Text);
  $("#replay").on("click", btn1Handler);
  $(".btn-secondary").on("click", btn2Handler);
  $(".btn-close").text("❌");
  $(".btn-close").on("click", function (e) {
    $(".modal").hide();
  });
  $(".modal").show();
}
export function displaySolution(secret) {
  let html = `<div class="display-solution">`;
  secret.forEach((color, i) => {
    let colorDiv = `<div class="color-div" style="background-color: ${color};"></div>`;
    html += colorDiv;
  });
  html += `</div>`;
  return html;
}
export function restartGame2Player(hintsAllowed, timer, secret) {
  $(`#bg-music`)[0].play();

  let intervalId;
  let time;
  hideModal();
  if (timer && timer !== "none") {
    time = JSON.parse(timer);
    intervalId = setInterval(() => {
      if (time >= 0) {
        $(`#time`).text(time);
        time--;
      }
    }, 1000);
  }

  if (!hintsAllowed) {
    $(`#btn-hint`).prop("disabled", true);
  }
  globalStore.attemptCount = 0;
  globalStore.colorInputCount = 0;
  globalStore.feedbacks = [];
  globalStore.selectedColors = [];
  let gameDifficulty =
    secret.length === 4 ? "easy" : secret.length === 5 ? "medium" : "hard";
  // create positions for code in each column based on difficulty
  setGameDifficulty(gameDifficulty);
  // create colored buttons dynamically
  createInputButtons(secret);
  // add click handler to hint button
  $(`#btn-hint`).on("click", function (e) {
    handleHint(secret);
  });
  // attach click handler to the check buttons
  let counter = 0;
  while (counter < 10) {
    let checkId = globalStore.columnIds[counter];
    $(`button#check-${checkId}`).on("click", function (e) {
      handleCheck(secret, e.target, time, intervalId);
    });
    counter++;
  }
}
export function createSecret(hintsAllowed, timer) {
  let colorsHex = {
    red: "#ff0000ff",
    orange: "#ff9900ff",
    green: "#6aa84fff",
    blue: "#0000ffff",
    purple: "#9900ffff",
    pink: "#ff00ffff",
    yellow: "#ffff00ff",
    brown: "#85200cff",
  };
  $(`.modal #color-pick-1`)
    .find("option")
    .each(function (i, opt) {
      if (opt.selected) {
        let selectedColor = $(opt).val();
        if (selectedColor) {
          globalStore.createdSecret.push(colorsHex[selectedColor]);
        }
      }
    });
  $(`.modal #color-pick-2`)
    .find("option")
    .each(function (i, opt) {
      if (opt.selected) {
        let selectedColor = $(opt).val();
        if (selectedColor) {
          globalStore.createdSecret.push(colorsHex[selectedColor]);
        }
      }
    });
  $(`.modal #color-pick-3`)
    .find("option")
    .each(function (i, opt) {
      if (opt.selected) {
        let selectedColor = $(opt).val();
        if (selectedColor) {
          globalStore.createdSecret.push(colorsHex[selectedColor]);
        }
      }
    });
  $(`.modal #color-pick-4`)
    .find("option")
    .each(function (i, opt) {
      if (opt.selected) {
        let selectedColor = $(opt).val();
        if (selectedColor) {
          globalStore.createdSecret.push(colorsHex[selectedColor]);
        }
      }
    });
  $(`.modal #color-pick-5`)
    .find("option")
    .each(function (i, opt) {
      if (opt.selected) {
        let selectedColor = $(opt).val();
        if (selectedColor) {
          globalStore.createdSecret.push(colorsHex[selectedColor]);
        }
      }
    });
  $(`.modal #color-pick-6`)
    .find("option")
    .each(function (i, opt) {
      if (opt.selected) {
        let selectedColor = $(opt).val();
        if (selectedColor) {
          globalStore.createdSecret.push(colorsHex[selectedColor]);
        }
      }
    });
  restartGame2Player(
    hintsAllowed,
    timer,
    globalStore.createdSecret,
    gameAttempt,
    streakCount
  );
}
export function calculateScore(timeLeft) {
  let total =
    1000 -
    100 * globalStore.attemptCount +
    5 * timeLeft -
    100 * globalStore.hintCount;
  return total;
}
export const globalStore = (function initGame() {
  let attemptCount = 0;
  let colorInputCount = 0;
  let selectedColors = [];
  const feedbacks = [];
  let hintCount = 0;
  const createdSecret = [];
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
    feedbacks,
    selectedColors,
    hintCount,
    createdSecret,
  };
})();
