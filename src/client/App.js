/* eslint-disable */

import React, { Component } from "react";
import "./app.css";

let curInsertedmONEY = [0, 0, 0, 0];
const delayTime = 3000;

//-----------------------------------------------------------------------------------------

export default class App extends Component {
  state = {
    insertedMoney: 0,
    msg: "",
    pennyChange: 0,
    nickelChange: 0,
    dimeChange: 0,
    quarterChange: 0,
    bottleDeliverClasses: "bottle_deliver bottle_deliver_hidden"
  };

  //-----------------------------------------------------------------------------------------
  /**
   * click handler after the user inserts a coin
   * @param  {int} coinValue money value of the inserted coin
   */
  handleCoinInsertion = coinValue => {
    this.setState({ msg: "" });
    if (coinValue === 1) curInsertedmONEY[0]++;
    if (coinValue === 5) curInsertedmONEY[1]++;
    if (coinValue === 10) curInsertedmONEY[2]++;
    if (coinValue === 25) curInsertedmONEY[3]++;
    this.setState({ insertedMoney: this.state.insertedMoney + coinValue });
  };

  //-----------------------------------------------------------------------------------------
  /**
   * click handler after the user cancels- he gets his money back:
   */
  handleCancel = () => {
    let cancelMsg = "Bye Bye";
    if (this.state.insertedMoney > 0) {
      cancelMsg += "- take your money back";
    }
    this.setState({ insertedMoney: 0 });
    curInsertedmONEY = [0, 0, 0, 0];
    this.setPopupMsg(cancelMsg);
  };

  //-----------------------------------------------------------------------------------------
  /**
   * show the bottle in the proper window of the machine
   * called after the payment is complited and the user can take his drink
   */
  setPopupDrink = () => {
    this.setState({
      bottleDeliverClasses: "bottle_deliver bottle_deliver_shown"
    });
    setTimeout(() => {
      this.setState({
        bottleDeliverClasses: "bottle_deliver bottle_deliver_hidden"
      });
    }, delayTime);
  };

  //-----------------------------------------------------------------------------------------
  /**
   * show popup msg in the info screen
   * @param  {String} popMsg message text to show
   */
  setPopupMsg = popMsg => {
    this.setState({
      msg: popMsg
    });
    setTimeout(() => {
      this.setState({
        msg: ""
      });
    }, delayTime);
  };

  //-----------------------------------------------------------------------------------------
  /**
   * update the change list that the user has
   * @param  {int Array} changeList array of amount of each coin to return
   */
  setPopupChange = changeList => {
    this.setState({
      pennyChange: changeList[0],
      nickelChange: changeList[1],
      dimeChange: changeList[2],
      quarterChange: changeList[3]
    });
    setTimeout(() => {
      this.setState({
        pennyChange: 0,
        nickelChange: 0,
        dimeChange: 0,
        quarterChange: 0
      });
    }, delayTime);
  };

  //-----------------------------------------------------------------------------------------
  /**
   * manipulate the machine after a drink is selected:
   * navigate threw 3 situations: input is too low/ input is accurate/ user needs change
   * after category detection-> send to server for business manipulation and wait for his
   * response to update the user:
   * @param  {String} selectedDrink name of selected drink
   */
  handleDrinkSelection = selectedDrink => {
    const drinksDict = { coke: 25, pepsi: 35, soda: 45 };
    const curInput = this.state.insertedMoney;
    const drinkVal = drinksDict[selectedDrink];
    this.setState({ msg: "" });
    if (curInput < drinkVal) {
      // input is too low- show proper message:
      this.setPopupMsg(`you need to add: ${drinkVal - curInput}¢`);
    } else if (curInput === drinkVal) {
      // input is accurate- update the server and give the user his drink:
      this.setPopupMsg("enjoy!");
      this.setPopupDrink();
      // tell the server to add the inserted coins to his inventory:
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(curInsertedmONEY)
      };
      fetch("/api/addCoins", options)
        .then(res => res.json())
        .then(ans => console.log(ans.coinCollection));
      // reset user input:
      curInsertedmONEY = [0, 0, 0, 0];
      this.setState({ insertedMoney: 0 });
    } else if (curInput > drinkVal) {
      // input is too high- check with the server if he has change for the user :
      // if so- give the user his change and drink,
      // else- ask user to insert diffrent coins and return his money
      const changeInput = {
        insertedCoins: curInsertedmONEY,
        change: curInput - drinkVal
      };
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(changeInput)
      };
      let changeList;
      fetch("/api/manageChange", options)
        .then(res => res.json())
        .then(result => {
          changeList = result.changeCollection;
        })
        .then(ans => {
          this.setPopupChange(changeList);
          if (changeList.every(item => item === 0)) {
            // no suitable change!
            this.setPopupMsg("sorry, i dont have change for you");
          } else {
            this.setPopupMsg(`get your change: ${curInput - drinkVal}¢`);
            this.setPopupDrink();
          }
        });
      // reset user input:
      curInsertedmONEY = [0, 0, 0, 0];
      this.setState({ insertedMoney: 0 });
    }
  };

  //-----------------------------------------------------------------------------------------
  //
  // ------------------------------------RENDER HTML-----------------------------------------
  //
  //-----------------------------------------------------------------------------------------

  render() {
    const { insertedMoney } = this.state;
    return (
      <React.Fragment>
        <h1>
          Stranded in the desert? <br />
          Well, it's your lucky day
        </h1>
        <div className="vending-machine">
          <div className="row">
            <div className="products-col col-md-4">
              <button
                onClick={() => this.handleDrinkSelection("coke")}
                className="drink_btn"
                type="button"
              >
                <img
                  className="drink_icon"
                  alt="drink"
                  src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE2LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCINCgkgd2lkdGg9IjQxNi44NjNweCIgaGVpZ2h0PSI0MTYuODYzcHgiIHZpZXdCb3g9IjAgMCA0MTYuODYzIDQxNi44NjMiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQxNi44NjMgNDE2Ljg2MzsiDQoJIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPGc+DQoJPGc+DQoJCTxnPg0KCQkJPHBhdGggZD0iTTE0MS42MTgsMjU2LjIxM2wxLjA5Myw2Ljk4OGwyLjY3NS0wLjY5OGM0LjUxOS0xLjE3OSw5LjI5LTEuNzc2LDE0LjE4LTEuNzc2YzIxLjI5NywwLDQ0LjA5NSwxMS41MjksNTguMDg5LDI5LjM4OA0KCQkJCWMxMi40MjksMTUuNjQ3LDI5LjE5NiwyNS41MTQsNDguNDk0LDI4LjUyOGwyLjg5NiwwLjQ1MWwtMC4wMS0yLjkyOWMtMC4wNTctMjAuMDEzLDMuMTM1LTQwLjM0Myw2LjIyMS02MC4wMDMNCgkJCQljMC43NDgtNC43NjksMS41MjEtOS42OTMsMi4yMzctMTQuNTQ5YzQuNTI5LTMwLjczLDEuNjEzLTU5Ljg1MS04LjkxNS04OS4wMjFjLTEuMTYzLTMuMjI4LTIuMzQtNi40NDctMy41MTUtOS42NjMNCgkJCQljLTEzLjE0Ni0zNS45OC0yNS41NjQtNjkuOTc4LTE4LjgzMy0xMDkuMzk2YzQuMjU2LTMuNjM2LDYuNjc3LTguODU0LDYuNjc3LTE0LjQ3QzI1Mi45MDcsOC41NTEsMjQ0LjM1NCwwLDIzMy44NDQsMGgtNTAuODINCgkJCQljLTEwLjUxMiwwLTE5LjA2Myw4LjU1Mi0xOS4wNjMsMTkuMDYzYzAsNS42MTUsMi40MjEsMTAuODM0LDYuNjc2LDE0LjQ3YzYuNzMyLDM5LjQxOC01LjY4OCw3My40MTUtMTguODMzLDEwOS4zOTYNCgkJCQljLTEuMTc1LDMuMjE2LTIuMzUxLDYuNDM2LTMuNTE0LDkuNjYyYy0xMC41MjksMjkuMTcyLTEzLjQ0NSw1OC4yOTItOC45MTYsODkuMDIzDQoJCQkJQzE0MC4wOTEsMjQ2LjQ4NCwxNDAuODY3LDI1MS40MywxNDEuNjE4LDI1Ni4yMTN6IE0xOTguMjU2LDQwLjgyOWgyMC4zNTFjLTMuOTIsNDEuMzA1LDkuMDU0LDc2LjgwOSwyMS42MDUsMTExLjE3MmwwLjUsMS4zNzENCgkJCQljMC45OTUsMi43MjcsMS45OTEsNS40NTcsMi45OCw4LjIwMWMyLjA0OSw1LjY3NCwzLjc4NSwxMS40NzMsNS4xNzksMTcuMjc3aC04MC44ODNjMS4zOTUtNS44MDksMy4xMzQtMTEuNjEsNS4xODMtMTcuMjg5DQoJCQkJYzAuOTg1LTIuNzMzLDEuOTgtNS40NjIsMi45NzYtOC4xODhsMC41MDEtMS4zNzFDMTg5LjIwMywxMTcuNjM5LDIwMi4xNzYsODIuMTM0LDE5OC4yNTYsNDAuODI5eiIvPg0KCQkJPHBhdGggZD0iTTI3Ny44NzMsMzY2Ljg5NmMtMy44ODYtMTAuMTkxLTYuNDIyLTIwLjY3My03Ljc1Ni0zMi4wNDFsLTAuMzEtMi42MzJsLTIuNjA3LDAuNDYxDQoJCQkJYy0zLjI5MywwLjU4LTYuNzE4LDAuODczLTEwLjE3OSwwLjg3M2MtMTkuMTA3LDAtMzkuNDk5LTkuMTMzLTUzLjIxNC0yMy44MzRjLTIuMTY2LTIuMzE5LTQuMjY5LTQuNzM5LTYuMzAxLTcuMDgNCgkJCQljLTYuNDExLTcuMzgxLTEzLjA0LTE1LjAxMi0yMi40MTktMjAuMzE2Yy04LjAyMy00LjU0OS0xNy4zMy03LjIzOS0yNy42Ni03Ljk5N2wtMy4wOC0wLjIyN2wwLjQyMSwzLjA2DQoJCQkJYzMuOTEyLDI4LjQ3LDUuOTE5LDU5LjA0NC01Ljc3OSw4OS43MzVjLTQuMjU4LDExLjE5LTQuMDM2LDIxLjM4MSwwLjY0MiwyOS40NjdjNS4zMzksOS4yMjksMTYuMDE2LDE1LjM2MiwzMC44NzQsMTcuNzM3DQoJCQkJYzkuNDYyLDEuNTE5LDIzLjE4OSwyLjIyOCwzMS4zOTEsMi42NDhjMi45MzIsMC4xNSwxMC4xNDEsMC4xNSwxMy4wNzIsMGM4LjIwMS0wLjQyNCwyMS45My0xLjEzMywzMS4zOTEtMi42NDgNCgkJCQljMTQuODU4LTIuMzc1LDI1LjUzNi04LjUwOCwzMC44NzUtMTcuNzM3QzI4MS45MSwzODguMjc5LDI4Mi4xMzIsMzc4LjA5LDI3Ny44NzMsMzY2Ljg5NnoiLz4NCgkJPC9nPg0KCTwvZz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjwvc3ZnPg0K"
                />
                COKE 25
              </button>
              <button
                onClick={() => this.handleDrinkSelection("pepsi")}
                className="drink_btn"
                type="button"
              >
                <img
                  className="drink_icon"
                  alt="drink"
                  src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE2LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCINCgkgd2lkdGg9IjQxNi44NjNweCIgaGVpZ2h0PSI0MTYuODYzcHgiIHZpZXdCb3g9IjAgMCA0MTYuODYzIDQxNi44NjMiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQxNi44NjMgNDE2Ljg2MzsiDQoJIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPGc+DQoJPGc+DQoJCTxnPg0KCQkJPHBhdGggZD0iTTE0MS42MTgsMjU2LjIxM2wxLjA5Myw2Ljk4OGwyLjY3NS0wLjY5OGM0LjUxOS0xLjE3OSw5LjI5LTEuNzc2LDE0LjE4LTEuNzc2YzIxLjI5NywwLDQ0LjA5NSwxMS41MjksNTguMDg5LDI5LjM4OA0KCQkJCWMxMi40MjksMTUuNjQ3LDI5LjE5NiwyNS41MTQsNDguNDk0LDI4LjUyOGwyLjg5NiwwLjQ1MWwtMC4wMS0yLjkyOWMtMC4wNTctMjAuMDEzLDMuMTM1LTQwLjM0Myw2LjIyMS02MC4wMDMNCgkJCQljMC43NDgtNC43NjksMS41MjEtOS42OTMsMi4yMzctMTQuNTQ5YzQuNTI5LTMwLjczLDEuNjEzLTU5Ljg1MS04LjkxNS04OS4wMjFjLTEuMTYzLTMuMjI4LTIuMzQtNi40NDctMy41MTUtOS42NjMNCgkJCQljLTEzLjE0Ni0zNS45OC0yNS41NjQtNjkuOTc4LTE4LjgzMy0xMDkuMzk2YzQuMjU2LTMuNjM2LDYuNjc3LTguODU0LDYuNjc3LTE0LjQ3QzI1Mi45MDcsOC41NTEsMjQ0LjM1NCwwLDIzMy44NDQsMGgtNTAuODINCgkJCQljLTEwLjUxMiwwLTE5LjA2Myw4LjU1Mi0xOS4wNjMsMTkuMDYzYzAsNS42MTUsMi40MjEsMTAuODM0LDYuNjc2LDE0LjQ3YzYuNzMyLDM5LjQxOC01LjY4OCw3My40MTUtMTguODMzLDEwOS4zOTYNCgkJCQljLTEuMTc1LDMuMjE2LTIuMzUxLDYuNDM2LTMuNTE0LDkuNjYyYy0xMC41MjksMjkuMTcyLTEzLjQ0NSw1OC4yOTItOC45MTYsODkuMDIzDQoJCQkJQzE0MC4wOTEsMjQ2LjQ4NCwxNDAuODY3LDI1MS40MywxNDEuNjE4LDI1Ni4yMTN6IE0xOTguMjU2LDQwLjgyOWgyMC4zNTFjLTMuOTIsNDEuMzA1LDkuMDU0LDc2LjgwOSwyMS42MDUsMTExLjE3MmwwLjUsMS4zNzENCgkJCQljMC45OTUsMi43MjcsMS45OTEsNS40NTcsMi45OCw4LjIwMWMyLjA0OSw1LjY3NCwzLjc4NSwxMS40NzMsNS4xNzksMTcuMjc3aC04MC44ODNjMS4zOTUtNS44MDksMy4xMzQtMTEuNjEsNS4xODMtMTcuMjg5DQoJCQkJYzAuOTg1LTIuNzMzLDEuOTgtNS40NjIsMi45NzYtOC4xODhsMC41MDEtMS4zNzFDMTg5LjIwMywxMTcuNjM5LDIwMi4xNzYsODIuMTM0LDE5OC4yNTYsNDAuODI5eiIvPg0KCQkJPHBhdGggZD0iTTI3Ny44NzMsMzY2Ljg5NmMtMy44ODYtMTAuMTkxLTYuNDIyLTIwLjY3My03Ljc1Ni0zMi4wNDFsLTAuMzEtMi42MzJsLTIuNjA3LDAuNDYxDQoJCQkJYy0zLjI5MywwLjU4LTYuNzE4LDAuODczLTEwLjE3OSwwLjg3M2MtMTkuMTA3LDAtMzkuNDk5LTkuMTMzLTUzLjIxNC0yMy44MzRjLTIuMTY2LTIuMzE5LTQuMjY5LTQuNzM5LTYuMzAxLTcuMDgNCgkJCQljLTYuNDExLTcuMzgxLTEzLjA0LTE1LjAxMi0yMi40MTktMjAuMzE2Yy04LjAyMy00LjU0OS0xNy4zMy03LjIzOS0yNy42Ni03Ljk5N2wtMy4wOC0wLjIyN2wwLjQyMSwzLjA2DQoJCQkJYzMuOTEyLDI4LjQ3LDUuOTE5LDU5LjA0NC01Ljc3OSw4OS43MzVjLTQuMjU4LDExLjE5LTQuMDM2LDIxLjM4MSwwLjY0MiwyOS40NjdjNS4zMzksOS4yMjksMTYuMDE2LDE1LjM2MiwzMC44NzQsMTcuNzM3DQoJCQkJYzkuNDYyLDEuNTE5LDIzLjE4OSwyLjIyOCwzMS4zOTEsMi42NDhjMi45MzIsMC4xNSwxMC4xNDEsMC4xNSwxMy4wNzIsMGM4LjIwMS0wLjQyNCwyMS45My0xLjEzMywzMS4zOTEtMi42NDgNCgkJCQljMTQuODU4LTIuMzc1LDI1LjUzNi04LjUwOCwzMC44NzUtMTcuNzM3QzI4MS45MSwzODguMjc5LDI4Mi4xMzIsMzc4LjA5LDI3Ny44NzMsMzY2Ljg5NnoiLz4NCgkJPC9nPg0KCTwvZz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjwvc3ZnPg0K"
                />
                PEPSI 35
              </button>
              <button
                onClick={() => this.handleDrinkSelection("soda")}
                className="drink_btn"
                type="button"
              >
                <img
                  className="drink_icon"
                  alt="drink"
                  src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE2LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCINCgkgd2lkdGg9IjQxNi44NjNweCIgaGVpZ2h0PSI0MTYuODYzcHgiIHZpZXdCb3g9IjAgMCA0MTYuODYzIDQxNi44NjMiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQxNi44NjMgNDE2Ljg2MzsiDQoJIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPGc+DQoJPGc+DQoJCTxnPg0KCQkJPHBhdGggZD0iTTE0MS42MTgsMjU2LjIxM2wxLjA5Myw2Ljk4OGwyLjY3NS0wLjY5OGM0LjUxOS0xLjE3OSw5LjI5LTEuNzc2LDE0LjE4LTEuNzc2YzIxLjI5NywwLDQ0LjA5NSwxMS41MjksNTguMDg5LDI5LjM4OA0KCQkJCWMxMi40MjksMTUuNjQ3LDI5LjE5NiwyNS41MTQsNDguNDk0LDI4LjUyOGwyLjg5NiwwLjQ1MWwtMC4wMS0yLjkyOWMtMC4wNTctMjAuMDEzLDMuMTM1LTQwLjM0Myw2LjIyMS02MC4wMDMNCgkJCQljMC43NDgtNC43NjksMS41MjEtOS42OTMsMi4yMzctMTQuNTQ5YzQuNTI5LTMwLjczLDEuNjEzLTU5Ljg1MS04LjkxNS04OS4wMjFjLTEuMTYzLTMuMjI4LTIuMzQtNi40NDctMy41MTUtOS42NjMNCgkJCQljLTEzLjE0Ni0zNS45OC0yNS41NjQtNjkuOTc4LTE4LjgzMy0xMDkuMzk2YzQuMjU2LTMuNjM2LDYuNjc3LTguODU0LDYuNjc3LTE0LjQ3QzI1Mi45MDcsOC41NTEsMjQ0LjM1NCwwLDIzMy44NDQsMGgtNTAuODINCgkJCQljLTEwLjUxMiwwLTE5LjA2Myw4LjU1Mi0xOS4wNjMsMTkuMDYzYzAsNS42MTUsMi40MjEsMTAuODM0LDYuNjc2LDE0LjQ3YzYuNzMyLDM5LjQxOC01LjY4OCw3My40MTUtMTguODMzLDEwOS4zOTYNCgkJCQljLTEuMTc1LDMuMjE2LTIuMzUxLDYuNDM2LTMuNTE0LDkuNjYyYy0xMC41MjksMjkuMTcyLTEzLjQ0NSw1OC4yOTItOC45MTYsODkuMDIzDQoJCQkJQzE0MC4wOTEsMjQ2LjQ4NCwxNDAuODY3LDI1MS40MywxNDEuNjE4LDI1Ni4yMTN6IE0xOTguMjU2LDQwLjgyOWgyMC4zNTFjLTMuOTIsNDEuMzA1LDkuMDU0LDc2LjgwOSwyMS42MDUsMTExLjE3MmwwLjUsMS4zNzENCgkJCQljMC45OTUsMi43MjcsMS45OTEsNS40NTcsMi45OCw4LjIwMWMyLjA0OSw1LjY3NCwzLjc4NSwxMS40NzMsNS4xNzksMTcuMjc3aC04MC44ODNjMS4zOTUtNS44MDksMy4xMzQtMTEuNjEsNS4xODMtMTcuMjg5DQoJCQkJYzAuOTg1LTIuNzMzLDEuOTgtNS40NjIsMi45NzYtOC4xODhsMC41MDEtMS4zNzFDMTg5LjIwMywxMTcuNjM5LDIwMi4xNzYsODIuMTM0LDE5OC4yNTYsNDAuODI5eiIvPg0KCQkJPHBhdGggZD0iTTI3Ny44NzMsMzY2Ljg5NmMtMy44ODYtMTAuMTkxLTYuNDIyLTIwLjY3My03Ljc1Ni0zMi4wNDFsLTAuMzEtMi42MzJsLTIuNjA3LDAuNDYxDQoJCQkJYy0zLjI5MywwLjU4LTYuNzE4LDAuODczLTEwLjE3OSwwLjg3M2MtMTkuMTA3LDAtMzkuNDk5LTkuMTMzLTUzLjIxNC0yMy44MzRjLTIuMTY2LTIuMzE5LTQuMjY5LTQuNzM5LTYuMzAxLTcuMDgNCgkJCQljLTYuNDExLTcuMzgxLTEzLjA0LTE1LjAxMi0yMi40MTktMjAuMzE2Yy04LjAyMy00LjU0OS0xNy4zMy03LjIzOS0yNy42Ni03Ljk5N2wtMy4wOC0wLjIyN2wwLjQyMSwzLjA2DQoJCQkJYzMuOTEyLDI4LjQ3LDUuOTE5LDU5LjA0NC01Ljc3OSw4OS43MzVjLTQuMjU4LDExLjE5LTQuMDM2LDIxLjM4MSwwLjY0MiwyOS40NjdjNS4zMzksOS4yMjksMTYuMDE2LDE1LjM2MiwzMC44NzQsMTcuNzM3DQoJCQkJYzkuNDYyLDEuNTE5LDIzLjE4OSwyLjIyOCwzMS4zOTEsMi42NDhjMi45MzIsMC4xNSwxMC4xNDEsMC4xNSwxMy4wNzIsMGM4LjIwMS0wLjQyNCwyMS45My0xLjEzMywzMS4zOTEtMi42NDgNCgkJCQljMTQuODU4LTIuMzc1LDI1LjUzNi04LjUwOCwzMC44NzUtMTcuNzM3QzI4MS45MSwzODguMjc5LDI4Mi4xMzIsMzc4LjA5LDI3Ny44NzMsMzY2Ljg5NnoiLz4NCgkJPC9nPg0KCTwvZz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjwvc3ZnPg0K"
                />
                SODA 45
              </button>
              <div className="drink_deliver">
                <img
                  className={this.state.bottleDeliverClasses}
                  alt="drink"
                  src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE2LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCINCgkgd2lkdGg9IjQxNi44NjNweCIgaGVpZ2h0PSI0MTYuODYzcHgiIHZpZXdCb3g9IjAgMCA0MTYuODYzIDQxNi44NjMiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQxNi44NjMgNDE2Ljg2MzsiDQoJIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPGc+DQoJPGc+DQoJCTxnPg0KCQkJPHBhdGggZD0iTTE0MS42MTgsMjU2LjIxM2wxLjA5Myw2Ljk4OGwyLjY3NS0wLjY5OGM0LjUxOS0xLjE3OSw5LjI5LTEuNzc2LDE0LjE4LTEuNzc2YzIxLjI5NywwLDQ0LjA5NSwxMS41MjksNTguMDg5LDI5LjM4OA0KCQkJCWMxMi40MjksMTUuNjQ3LDI5LjE5NiwyNS41MTQsNDguNDk0LDI4LjUyOGwyLjg5NiwwLjQ1MWwtMC4wMS0yLjkyOWMtMC4wNTctMjAuMDEzLDMuMTM1LTQwLjM0Myw2LjIyMS02MC4wMDMNCgkJCQljMC43NDgtNC43NjksMS41MjEtOS42OTMsMi4yMzctMTQuNTQ5YzQuNTI5LTMwLjczLDEuNjEzLTU5Ljg1MS04LjkxNS04OS4wMjFjLTEuMTYzLTMuMjI4LTIuMzQtNi40NDctMy41MTUtOS42NjMNCgkJCQljLTEzLjE0Ni0zNS45OC0yNS41NjQtNjkuOTc4LTE4LjgzMy0xMDkuMzk2YzQuMjU2LTMuNjM2LDYuNjc3LTguODU0LDYuNjc3LTE0LjQ3QzI1Mi45MDcsOC41NTEsMjQ0LjM1NCwwLDIzMy44NDQsMGgtNTAuODINCgkJCQljLTEwLjUxMiwwLTE5LjA2Myw4LjU1Mi0xOS4wNjMsMTkuMDYzYzAsNS42MTUsMi40MjEsMTAuODM0LDYuNjc2LDE0LjQ3YzYuNzMyLDM5LjQxOC01LjY4OCw3My40MTUtMTguODMzLDEwOS4zOTYNCgkJCQljLTEuMTc1LDMuMjE2LTIuMzUxLDYuNDM2LTMuNTE0LDkuNjYyYy0xMC41MjksMjkuMTcyLTEzLjQ0NSw1OC4yOTItOC45MTYsODkuMDIzDQoJCQkJQzE0MC4wOTEsMjQ2LjQ4NCwxNDAuODY3LDI1MS40MywxNDEuNjE4LDI1Ni4yMTN6IE0xOTguMjU2LDQwLjgyOWgyMC4zNTFjLTMuOTIsNDEuMzA1LDkuMDU0LDc2LjgwOSwyMS42MDUsMTExLjE3MmwwLjUsMS4zNzENCgkJCQljMC45OTUsMi43MjcsMS45OTEsNS40NTcsMi45OCw4LjIwMWMyLjA0OSw1LjY3NCwzLjc4NSwxMS40NzMsNS4xNzksMTcuMjc3aC04MC44ODNjMS4zOTUtNS44MDksMy4xMzQtMTEuNjEsNS4xODMtMTcuMjg5DQoJCQkJYzAuOTg1LTIuNzMzLDEuOTgtNS40NjIsMi45NzYtOC4xODhsMC41MDEtMS4zNzFDMTg5LjIwMywxMTcuNjM5LDIwMi4xNzYsODIuMTM0LDE5OC4yNTYsNDAuODI5eiIvPg0KCQkJPHBhdGggZD0iTTI3Ny44NzMsMzY2Ljg5NmMtMy44ODYtMTAuMTkxLTYuNDIyLTIwLjY3My03Ljc1Ni0zMi4wNDFsLTAuMzEtMi42MzJsLTIuNjA3LDAuNDYxDQoJCQkJYy0zLjI5MywwLjU4LTYuNzE4LDAuODczLTEwLjE3OSwwLjg3M2MtMTkuMTA3LDAtMzkuNDk5LTkuMTMzLTUzLjIxNC0yMy44MzRjLTIuMTY2LTIuMzE5LTQuMjY5LTQuNzM5LTYuMzAxLTcuMDgNCgkJCQljLTYuNDExLTcuMzgxLTEzLjA0LTE1LjAxMi0yMi40MTktMjAuMzE2Yy04LjAyMy00LjU0OS0xNy4zMy03LjIzOS0yNy42Ni03Ljk5N2wtMy4wOC0wLjIyN2wwLjQyMSwzLjA2DQoJCQkJYzMuOTEyLDI4LjQ3LDUuOTE5LDU5LjA0NC01Ljc3OSw4OS43MzVjLTQuMjU4LDExLjE5LTQuMDM2LDIxLjM4MSwwLjY0MiwyOS40NjdjNS4zMzksOS4yMjksMTYuMDE2LDE1LjM2MiwzMC44NzQsMTcuNzM3DQoJCQkJYzkuNDYyLDEuNTE5LDIzLjE4OSwyLjIyOCwzMS4zOTEsMi42NDhjMi45MzIsMC4xNSwxMC4xNDEsMC4xNSwxMy4wNzIsMGM4LjIwMS0wLjQyNCwyMS45My0xLjEzMywzMS4zOTEtMi42NDgNCgkJCQljMTQuODU4LTIuMzc1LDI1LjUzNi04LjUwOCwzMC44NzUtMTcuNzM3QzI4MS45MSwzODguMjc5LDI4Mi4xMzIsMzc4LjA5LDI3Ny44NzMsMzY2Ljg5NnoiLz4NCgkJPC9nPg0KCTwvZz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjwvc3ZnPg0K"
                />
              </div>
            </div>
            <div className="cash-col col-md-6">
              <div className="feedback_screen">
                input: {insertedMoney}
                <br />
                <p>{this.state.msg}</p>
              </div>
              <div className="row">
                <div className=" coins_col col-sm-3">
                  <button
                    onClick={() => this.handleCoinInsertion(1)}
                    className="coin_btn"
                    type="button"
                  >
                    1¢
                  </button>
                  <button
                    onClick={() => this.handleCoinInsertion(5)}
                    className="coin_btn"
                    type="button"
                  >
                    5¢
                  </button>
                  <button
                    onClick={() => this.handleCoinInsertion(10)}
                    className="coin_btn"
                    type="button"
                  >
                    10¢
                  </button>
                  <button
                    onClick={() => this.handleCoinInsertion(25)}
                    className="coin_btn"
                    type="button"
                  >
                    25¢
                  </button>
                  <button
                    type="button"
                    onClick={this.handleCancel}
                    className="coin_btn cancel_btn"
                  >
                    CANCEL
                  </button>
                </div>
                <div className="change_screen_col col-sm-7">
                  <p>
                    {" "}
                    your change: <br /> <br />
                    {this.state.pennyChange} penny (1¢)
                    <br />
                    {this.state.nickelChange} nickel (5¢)
                    <br />
                    {this.state.dimeChange} dime (10¢)
                    <br />
                    {this.state.quarterChange} quarter (25¢)
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="left_wheel" />
          <div className="right_wheel" />
        </div>
      </React.Fragment>
    );
  }
}
