// to allow async await using axios
import "regenerator-runtime/runtime";
import axios from "axios";
const getRandomColorSequence = (sequence) => {
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
};
const generateRandomSequence = async (num, max) => {
  try {
    const response = await axios.get(
      `https://www.random.org/integers/?num=${num}&min=0&max=${max}&col=1&base=10&format=plain&rnd=new`
    );

    const randomSequence = response.data;

    console.log(randomSequence);
    return randomSequence;
  } catch (errors) {
    console.error(errors);
  }
};
const getPlacementsCount = (str) => {
  let nums = [];
  let num = 0;
  if (str.toLowerCase() === "easy") {
    num = 3;
  } else if (str.toLowerCase() === "medium") {
    num = 4;
  } else if (str.toLowerCase() === "hard") {
    num = 5;
  }
  while (num > 0) {
    nums.push(num);
    num--;
  }
  return nums;
};
const initGame = () => {};

$(document).ready(() => {
  generateRandomSequence(4, 7);
});
