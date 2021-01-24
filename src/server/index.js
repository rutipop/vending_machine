/* eslint-disable */
const express = require("express");

const app = express();
const coinCollection = [10, 10, 10, 10];
const coinDict = [1, 5, 10, 25];

app.use(express.static("dist"));
app.use(express.json());
app.listen(process.env.PORT || 8080, () =>
  console.log(`Listening on port ${process.env.PORT || 8080}!`)
);

//-----------------------------------------------------------------------------------------
/**
 * accepting and adding coins into machines coin inventory
 * @param  {int Array} inputCoins coins to add
 */
function addCoins(inputCoins) {
  for (let i = 0; i < coinCollection.length; i++) {
    coinCollection[i] += inputCoins[i];
  }
  return coinCollection;
}

//-----------------------------------------------------------------------------------------
/**
 * checking if machine has proper change to return
 * @param  {int Array} inputCoins coins that were inserted by the user
 * @param  {int} change change sum to return
 */
function manageChange(inputCoins, change) {
  // temporerly adding the inserted coins:
  const tempCoinCollection = [];
  for (let i = 0; i < coinCollection.length; i++) {
    tempCoinCollection.push(coinCollection[i] + inputCoins[i]);
  }

  let changeArray = [0, 0, 0, 0];
  let curChange = change;

  // iterating and preparing the change array in descending order of coins value:
  for (let i = coinCollection.length; i >= 0; i--) {
    let temp = tempCoinCollection[i];
    if (change >= coinDict[i]) {
      // continue until you can't return more coins from this kind:
      while (temp * coinDict[i] > curChange) {
        temp -= 1;
      }
      changeArray[i] = temp;
      curChange -= coinDict[i] * temp;
    }
  }

  // add the inserted coins if you found propper change:
  if (!changeArray.every(item => item === 0)) {
    addCoins(inputCoins);
  }
  // remove the change from the coin inventory:
  for (let j = 0; j < coinCollection.length; j++) {
    coinCollection[j] -= changeArray[j];
  }
  return changeArray;
}

//-----------------------------------------------------------------------------------------
/**
 * POST REQUESTS:
 */
app.post("/api/addCoins", (req, res) => {
  res.send({ coinCollection: addCoins(req.body) });
});

app.post("/api/manageChange", (req, res) => {
  res.send({
    changeCollection: manageChange(req.body.insertedCoins, req.body.change),
    coinCollection
  });
});
