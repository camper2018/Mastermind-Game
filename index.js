// to allow async await using axios
import "regenerator-runtime/runtime";

import {
  reloadPage,
  restartGame,
  hideModal,
  showModal,
  createSecret,
} from "./util/utilities";

$(function () {
  let gameDifficulty = localStorage.getItem("gameDifficulty")
    ? localStorage.getItem("gameDifficulty")
    : "easy";

  let hintsAllowed;
  if (localStorage.getItem("hintsAllowed")) {
    hintsAllowed = JSON.parse(localStorage.getItem("hintsAllowed"));
  } else {
    hintsAllowed = "false";
  }

  let gameMode = localStorage.getItem("gameMode")
    ? localStorage.getItem("gameMode")
    : "singlePlayer";
  let timer = localStorage.getItem("timer")
    ? localStorage.getItem("timer")
    : "none";

  let duplicatesAllowed;
  if (localStorage.getItem("duplicatesAllowed")) {
    duplicatesAllowed = localStorage.getItem("duplicatesAllowed");
  } else {
    duplicatesAllowed = "false";
  }
  let gameAttempt = localStorage.getItem("gameAttempt")
    ? Number(localStorage.getItem("gameAttempt"))
    : 0;
  let streakCount = localStorage.getItem("streakCount")
    ? Number(localStorage.getItem("streakCount"))
    : 0;
  if (gameMode === "twoPlayer") {
    // show modal to create code/secret
    let title = `CREATE YOUR SECRET.....PLAYER-1 .`;
    let modal2HTML = `<div>
      <h5>Select colors from the options below: </h5>
      <p>You can create 4 color combination (Easy), 5 colors combination (Medium) or 6 colors combination (Hard).<p>
      <div class="form-group">
      <label for="color-pick-1">Pick Your First Color</label>
      <select class="form-control" id="color-pick-1">
        <option  value="red">Red</option>
        <option  value="orange">Orange</option>
        <option  value="yellow">Yellow</option>
        <option  value="green">Green</option>
        <option  value="blue">Blue</option>
        <option  value="purple">Purple</option>
        <option  value="pink">Pink</option>
        <option  value="brown">Brown</option>

      </select>
      <label for="color-pick-2">Pick Your Second Color</label>
      <select class="form-control" id="color-pick-2">
      <option value="red">Red</option>
      <option value="orange">Orange</option>
      <option value="yellow">Yellow</option>
      <option value="green">Green</option>
      <option value="blue">Blue</option>
      <option value="purple">Purple</option>
      <option value="pink">Pink</option>
      <option value="brown">Brown</option>
      </select>
      <label for="color-pick-3">Pick Your Third Color</label>
      <select class="form-control" id="color-pick-3">
      <option value="red">Red</option>
        <option value="orange">Orange</option>
        <option value="yellow">Yellow</option>
        <option value="green">Green</option>
        <option value="blue">Blue</option>
        <option value="purple">Purple</option>
        <option value="pink">Pink</option>
        <option value="brown">Brown</option>
      </select>
      <label for="color-pick-4">Pick Your Fourth Color</label>
      <select class="form-control" id="color-pick-4">
      <option value="red">Red</option>
      <option value="orange">Orange</option>
      <option value="yellow">Yellow</option>
      <option value="green">Green</option>
      <option value="blue">Blue</option>
      <option value="purple">Purple</option>
      <option value="pink">Pink</option>
      <option value="brown">Brown</option>
      </select>
      <label for="color-pick-5">Pick Your Fifth Color</label>
      <select class="form-control" id="color-pick-5">
      <option selected value="">None</option>
      <option value="red">Red</option>
        <option value="orange">Orange</option>
        <option value="yellow">Yellow</option>
        <option value="green">Green</option>
        <option value="blue">Blue</option>
        <option value="purple">Purple</option>
        <option value="pink">Pink</option>
        <option value="brown">Brown</option>
      </select>
      <label for="color-pick-6">Pick Your First Color</label>
      <select class="form-control" id="color-pick-6">
        <option selected value="">None</option>
        <option value="red">Red</option>
        <option value="orange">Orange</option>
        <option value="yellow">Yellow</option>
        <option value="green">Green</option>
        <option value="blue">Blue</option>
        <option value="purple">Purple</option>
        <option value="pink">Pink</option>
        <option value="brown">Brown</option>
      </select>
      </div>
    </div>`;

    showModal(
      title,
      modal2HTML,
      "Create Secret",
      "Cancel",
      () => createSecret(hintsAllowed, timer),
      hideModal
    );
  } else {
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
          duplicatesAllowed,
          gameAttempt,
          streakCount
        ),
      hideModal
    );
  }
  let html1 = `Games Played: ${
    localStorage.getItem("gameAttempt")
      ? localStorage.getItem("gameAttempt")
      : "0"
  }`;

  $(`#gameAttempt`).html(html1);
  let html2 = `Win Streak:  ${
    localStorage.getItem("streakCount")
      ? localStorage.getItem("streakCount")
      : "0"
  }`;

  $(`#streakCount`).text(html2);
  $(`.settings-btn`).on("click", function (e) {
    let $htmlContent = $(`<form id="modal-form" >
      <h6>Play Mode:</h6>
        <input
        type="radio"
        class="btn-check"
        name="gameMode"
        id="twoPlayer"
        autocomplete="off"

    />
    <label class="btn btn-secondary" for="twoPlayer"
      >Player Vs Player</label
    >
    <input
      type="radio"
      class="btn-check"
      name="gameMode"
      id="singlePlayer"
      autocomplete="off"


    />
    <label class="btn btn-dark" for="singlePlayer"
      >Player Vs Computer</label
    >

    <hr />
    <h6>Duplicates:</h6>
    <input
    type="radio"
    class="btn-check"
    name="duplicates"
    id="duplicatesAllowed"
    autocomplete="off"

  />
  <label class="btn btn-outline-info" for="duplicatesAllowed"
    >Allow</label
  >
  <input
    type="radio"
    class="btn-check"
    name="duplicates"
    id="no-duplicates"
    autocomplete="off"


  />
  <label class="btn btn-outline-dark" for="no-duplicates"
    >Not Allowed</label
  >
    <hr />
    <h6>Difficulty:</h6>
    <input
    type="radio"
    class="btn-check"
    name="difficulty"
    id="easy"
    autocomplete="off"


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


  />
  <label class="btn btn-info" for="none"
    >No Time</label
  >
  <input
    type="radio"
    class="btn-check"
    name="time"
    id="250"
    autocomplete="off"
  />
  <label class="btn btn-success" for="250"
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
  <input
  type="radio"
  class="btn-check"
  name="hints"
  id="hintsAllowed"
  autocomplete="off"

/>
<label class="btn btn-secondary" for="hintsAllowed"
  >Hints</label
>
<input
  type="radio"
  class="btn-check"
  name="hints"
  id="no-hints"
  autocomplete="off"


/>
<label class="btn btn-dark" for="no-hints"
  >No Hints</label
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
    // ******************Adding Here *********************

    $(".btn-submit").on("click", function (e) {
      e.preventDefault();

      $(`.modal-body input`).each((i, field) => {
        if (field.checked) {
          if (field.id === "singlePlayer" || field.id === "twoPlayer") {
            localStorage.setItem("gameMode", field.id);
          }
          if (
            field.id === "easy" ||
            field.id === "medium" ||
            field.id === "hard"
          ) {
            localStorage.setItem("gameDifficulty", field.id);
          }

          if (
            field.id === "none" ||
            field.id === "250" ||
            field.id === "500" ||
            field.id === "1000"
          ) {
            localStorage.setItem("timer", field.id);
          }

          if (field.id === "duplicatesAllowed") {
            localStorage.setItem("duplicatesAllowed", "true");
          }
          if (field.id === "no-duplicates") {
            localStorage.setItem("duplicatesAllowed", "false");
          }
          if (field.id === "hintsAllowed") {
            localStorage.setItem("hintsAllowed", "true");
          }
          if (field.id === "no-hints") {
            localStorage.setItem("hintsAllowed", "false");
          }
        }
      });

      restartGame(
        gameDifficulty,
        gameMode,
        hintsAllowed,
        timer,
        duplicatesAllowed,
        gameAttempt,
        streakCount
      );

      $(`.modal`).hide();
      reloadPage();
    });
  });
});
