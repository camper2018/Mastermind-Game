// to allow async await using axios
import "regenerator-runtime/runtime";
import axios from "axios";

const globalStore = (function initGame() {
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

  return {
    columnIds,
    attemptCount,
    colorInputCount,
    feedbacks,
    selectedColors,
  };
})();

function renderPlacements(difficulty) {
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
async function generateRandomSequence(num, max, duplicatesAllowed) {
  console.log("duplicatesAllowed: ", duplicatesAllowed);
  if (!duplicatesAllowed) {
    let isUnique = false;
    try {
      while (!isUnique) {
        const response = await axios.get(
          `https://www.random.org/integers/?num=${num}&min=0&max=${max}&col=1&base=10&format=plain&rnd=new`
        );
        const randomSequence = response.data;
        let sequence = await randomSequence.trim().split("\n");
        console.log("unique:", sequence);
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
function setGameDifficulty(difficulty) {
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
    // $(`#${id}`).append($container);
    $(`#${id}`).html($container);
    colsPerAttempt = [];
  });
}
function createInputButtons(secret) {
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
  $(`.input-btns-container`).html(btnArray);

  $(`.input-btns-container`).on("click", function (e) {
    if ($($(e.target)).text() === "Press") {
      handleInput(e, secret);
    }
  });
}
function handleInput(event, secret) {
  if (
    globalStore.colorInputCount < secret.length &&
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
function handleCheck(secret, target) {
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
    if (globalStore.attemptCount < 9 && !isDecoded) {
      globalStore.attemptCount++;
      globalStore.colorInputCount = 0;
      globalStore.selectedColors = [];
    } else if (isDecoded) {
      let message = `<p id="result">
      <strong>Attempts:&nbsp;&nbsp;${
        globalStore.attemptCount + 1
      } </strong> <br />
      <strong>Final Time:&nbsp;&nbsp;${0} </strong> <br />
      <strong>Hints Used:&nbsp;&nbsp;${0}</strong> <br />
      <strong>Final Score:&nbsp;&nbsp;${0} </strong> <br />
      <br />
      <strong id="solution">SOLUTION:</strong>
    </p>`;
      showModal(
        "You Win!",
        message,
        "Play Again",
        "Close",
        restartGame,
        hideModal
      );
    } else {
      let message = `<p id="result">
      <strong>Attempts:&nbsp;&nbsp;${
        globalStore.attemptCount + 1
      } </strong> <br />
      <strong>Final Time:&nbsp;&nbsp;${0} </strong> <br />
      <strong>Hints Used:&nbsp;&nbsp;${0} </strong> <br />
      <strong>Final Score:&nbsp;&nbsp;${0} </strong> <br />
      <br />
      <strong id="solution">SOLUTION:</strong>
    </p>`;
      showModal(
        "You Lose!",
        message,
        "Play Again",
        "Close",
        reloadPage,
        hideModal
      );
    }
  }
}
function reloadPage() {
  location.reload();
}
function checkForFeedback(sequence, enteredSequence) {
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
function restartGame(
  gameDifficulty,
  gameMode,
  hintsAllowed,
  timer,
  duplicatesAllowed
) {
  $(`#bg-music`)[0].play();

  hideModal();
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
    createInputButtons(secret);
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
}

function hideModal() {
  $(".modal").hide();
}
function showModal(text, html, btn1Text, btn2Text, btn1Handler, btn2Handler) {
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

/************************ Game Starts Here *********************/
// $(document).ready(() => {

$(function () {
  console.log(localStorage);
  let gameDifficulty = localStorage.getItem("gameDifficulty")
    ? localStorage.getItem("gameDifficulty")
    : "easy";

  let hintsAllowed = localStorage.getItem("hintsAllowed") ? true : false;
  let gameMode = localStorage.getItem("gameMode")
    ? localStorage.getItem("gameMode")
    : "singlePlayer";
  let timer = localStorage.getItem("timer")
    ? localStorage.getItem("timer")
    : "none";
  let duplicatesAllowed = !JSON.parse(localStorage.getItem("duplicatesAllowed"))
    ? true
    : false;

  let instructions = `<p>The player tries to decode the code generated by computer or another player.<br>
  The code can be made up of any combination of the colored pegs.<br>
  Each guess is made by placing a row of Code pegs on the unit.<br>
  Then the progress is displayed by pressing the check button associated with that unit.<br><br>
  <Strong> Red Circle: &nbsp;&nbsp;&nbsp;&nbsp&nbsp; Same color in the correct position.</Strong><br>
  <Strong>White Circle: &nbsp;&nbsp;&nbsp; Same color in the wrong position.</Strong>
  <br><br>
  </p>`;
  showModal(
    "GAME INSTRUCTIONS",
    instructions,
    "Play",
    "Cancel",
    () =>
      restartGame(
        gameDifficulty,
        gameMode,
        hintsAllowed,
        timer,
        duplicatesAllowed
      ),
    hideModal
  );
  $(`.settings-btn`).on("click", function (e) {
    let $htmlContent = $(`<form id="modal-form type="submit"">
          <h6>Play Mode:</h6>
          <input
            type="radio"
            class="btn-check"
            name="gameMode"
            id="two-player"
            autocomplete="off"

          />
          <label class="btn btn-secondary" for="two-player"
            >Player Vs Player</label
          >
          <input
            type="radio"
            class="btn-check"
            name="gameMode"
            id="singlePlayer"
            autocomplete="off"
            checked

          />
          <label class="btn btn-dark" for="singlePlayer"
            >Player Vs Computer</label
          >

          <hr />
          <h6>Duplicates:</h6>
          <div class="form-check form-switch">
            <input
              class="form-check-input"
              type="checkbox"
              id="duplicatesAllowed"
            />
            <label class="form-check-label" for="duplicatesAllowed"
              >Allow Duplicates</label
            >
          </div>
          <hr />
          <h6>Difficulty:</h6>
          <input
          type="radio"
          class="btn-check"
          name="difficulty"
          id="easy"
          autocomplete="off"
          checked

          />
          <label class="btn btn-success" for="easy"
            >Easy</label
          >
          <input
            type="radio"
            class="btn-check"
            name="difficulty"
            id="medium"
            autocomplete="off"
          />
          <label class="btn btn-warning" for="medium"
            >Medium</label
          >
          <input
          type="radio"
          class="btn-check"
          name="difficulty"
          id="hard"
          autocomplete="off"
        />
        <label class="btn btn-danger" for="hard"
          >Hard</label
        >
          <hr />
          <h6>Time in Seconds:</h6>
          <input
          type="radio"
          class="btn-check"
          name="time"
          id="none"
          autocomplete="off"
          checked

        />
        <label class="btn btn-success" for="none"
          >No Time</label
        >
        <input
          type="radio"
          class="btn-check"
          name="time"
          id="250"
          autocomplete="off"
        />
        <label class="btn btn-secondary" for="250"
          >250</label
        >
        <input
        type="radio"
        class="btn-check"
        name="time"
        id="500"
        autocomplete="off"
      />
      <label class="btn btn-warning" for="500"
        >500</label
      >
        <input
        type="radio"
        class="btn-check"
        name="time"
        id="1000"
        autocomplete="off"
      />
      <label class="btn btn-danger" for="1000"
        >1000</label
      >
        <hr />
        <h6>Allow Hints</h6>
        <div class="form-check form-switch">
          <input
            class="form-check-input"
            type="checkbox"
            id="hintsAllowed"
          />
          <label class="form-check-label" for="hintsAllowed"
            >Hints</label
          >
        </div>
        <hr />
        <button type="submit" class="btn btn-primary btn-submit">
          Submit
        </button>
      </form>`);
    $(".modal-body").html($htmlContent);
    $(".modal-title").text("Game Settings");
    $(".modal-footer").html($(`<div></div>`));
    $(".modal").show();
    // $(".btn-submit").on("click", function (e) {
    //   e.preventDefault();

    //   let formData = $(`input[type="radio"].form-check`).val(jQuery(this));
    //   $(`#modal-form input`).each((i, field) => {
    //     if (field.checked) {
    //       console.log(field.id);

    //       if (field.id === "singlePlayer" || field.id === "twoPlayer") {
    //         // globalStore.gameMode = field.id;
    //        localStorage.setItem("gameMode", field.id);
    //         console.log("clicked");
    //       }
    //       if (
    //         field.id === "easy" ||
    //         field.id === "medium" ||
    //         field.id === "hard"
    //       ) {
    //         localStorage.setItem("gameDifficulty", field.id);
    //         // globalStore.gameDifficulty = field.id;
    //         if (field.id === "duplicatesAllowed") {
    //           localStorage.setItem("duplicatesAllowed", "true");
    //           // globalStore.duplicatesAllowed = true;
    //         } else {
    //           localStorage.setItem("hintsAllowed", "false");
    //         }
    //         if (
    //           field.id === "none" ||
    //           field.id === "250" ||
    //           field.id === "500" ||
    //           field.id === "1000"
    //         ) {
    //           localStorage.setItem("timer", field.id);
    //           // globalStore.timer = field.id;
    //         }
    //         if (field.id === "hintsAllowed") {
    //           localStorage.setItem("hintsAllowed", "true");

    //           // globalStore.hintsAllowed = true;
    //         } else {
    //           localStorage.setItem("hintsAllowed", "false");
    //         }

    //         gameDifficulty = localStorage.getItem("gameDifficulty");
    //         gameMode = localStorage.getItem("gameMode");
    //         hintsAllowed = localStorage.getItem("hintsAllowed");
    //         timer = localStorage.getItem("timer");
    //         duplicatesAllowed = localStorage.getItem("duplicatesAllowed");
    //         location.reload();
    //         restartGame(
    //           gameDifficulty,
    //           gameMode,
    //           hintsAllowed,
    //           timer,
    //           duplicatesAllowed
    //         );
    //       }
    //     }
    //   });
    // });
    /**************************************** */
  });
  // $(".btn-submit").on("click", function (e) {
  $(`form .modal-form`).on("submit", function (e) {
    e.preventDefault();
    console.log(clicked);
    //   let formData = $(`input[type="radio"].form-check`).val(jQuery(this));
    // $(`#modal-form input`).each((i, field) => {
    $(`.modal-body input`).each((i, field) => {
      console.log("fields:", field.id);
      if (field.checked) {
        console.log("checkedfields:", field.id);
      }
      if (field.id === "singlePlayer" || field.id === "twoPlayer") {
        // globalStore.gameMode = field.id;
        localStorage.setItem("gameMode", field.id);
        console.log(" localStorage: ", localStorage);
      }
      if (field.id === "easy" || field.id === "medium" || field.id === "hard") {
        localStorage.setItem("gameDifficulty", field.id);
        console.log(" localStorage: ", localStorage);
        // globalStore.gameDifficulty = field.id;
      }
      if (field.id === "duplicatesAllowed") {
        localStorage.setItem("duplicatesAllowed", "true");
      } else {
        localStorage.setItem("duplicatesAllowed", "false");
      }
      console.log(" localStorage: ", localStorage);
      if (
        field.id === "none" ||
        field.id === "250" ||
        field.id === "500" ||
        field.id === "1000"
      ) {
        localStorage.setItem("timer", field.id);
        console.log(" localStorage: ", localStorage);
        // globalStore.timer = field.id;
      }
      if (field.id === "hintsAllowed") {
        localStorage.setItem("hintsAllowed", "true");
      } else {
        localStorage.setItem("hintsAllowed", "false");
      }
      console.log(" localStorage: ", localStorage);
      // globalStore.hintsAllowed = true;
    });
    gameDifficulty = localStorage.getItem("gameDifficulty");
    gameMode = localStorage.getItem("gameMode");
    hintsAllowed = localStorage.getItem("hintsAllowed");
    timer = localStorage.getItem("timer");
    duplicatesAllowed = localStorage.getItem("duplicatesAllowed");
    console.log("localStorage:", localStorage);
    // });
    // setTimeOut(function () {
    //   restartGame(
    //     gameDifficulty,
    //     gameMode,
    //     hintsAllowed,
    //     timer,
    //     duplicatesAllowed
    //   );
    // }, 2000);
  });

  //   // $(`#modal-form select`).each((i, field) => {
  //   //   $(field).map((i, option) => {
  //   //     console.log($(option).html());
  //   //   });
  //   // });
  // });
  /********************************************* */
  // $(`.modal-body input`).each((i, field) => {
  //   if (field.checked) {
  //     console.log("fields:", field.id);

  //     if (field.id === "singlePlayer" || field.id === "twoPlayer") {
  //       localStorage.setItem("gameMode", field.id);
  //     }
  //     if (
  //       field.id === "easy" ||
  //       field.id === "medium" ||
  //       field.id === "hard"
  //     ) {
  //       localStorage.setItem("gameDifficulty", field.id);
  //     }
  //     if (field.id === "duplicatesAllowed") {
  //       localStorage.setItem("duplicatesAllowed", "true");
  //     } else {
  //       localStorage.setItem("duplicatesAllowed", "false");
  //     }
  //     if (
  //       field.id === "none" ||
  //       field.id === "250" ||
  //       field.id === "500" ||
  //       field.id === "1000"
  //     ) {
  //       localStorage.setItem("timer", field.id);
  //     }
  //     if (field.id === "hintsAllowed") {
  //       console.log(field.id);
  //       localStorage.setItem("hintsAllowed", "true");
  //     } else {
  //       console.log(field.id);
  //       localStorage.setItem("hintsAllowed", "false");

  //     }
  //   }
  //   console.log("localStorage:", localStorage)
  //   restartGame();
  // });
  /********************************************** */
});

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
