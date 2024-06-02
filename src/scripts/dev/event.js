(function () {
  "use strict";

  const reserveForm = document.querySelector("#js-reserve-form");

  const submitBtn = reserveForm.querySelector("#js-submit");

  const redTableCount = reserveForm.querySelector("#js-red-table-count");
  const redTableCost = reserveForm.querySelector("#js-red-table-sum");

  const blackTableCount = reserveForm.querySelector("#js-black-table-count");
  const blackTableCost = reserveForm.querySelector("#js-black-table-sum");

  const totalCost = reserveForm.querySelector("#js-total-sum");

  const tables = reserveForm.querySelectorAll(".scene__table");
  const checks = reserveForm.querySelectorAll(".js-reserve");

  submitBtn.classList.add("btn--disabled");

  const changeTableCount = (table, tableCount) => {
    if (table.checked === true) {
      tableCount.textContent = Number(tableCount.textContent) + 1;
    } else {
      tableCount.textContent = Number(tableCount.textContent) - 1;
    }
  };
  const changeCost = (tableCost, tableCount) => {
    tableCost.innerHTML =
      Number(tableCount.textContent) *
      tableCount.getAttribute("data-price").valueOf();
  };
  const changeTotalCost = () => {
    totalCost.innerHTML =
      Number(redTableCount.textContent) *
        Number(redTableCount.getAttribute("data-price").valueOf()) +
      Number(blackTableCount.textContent) *
        Number(blackTableCount.getAttribute("data-price").valueOf());
  };
  const changeTableToSelected = (table) => {
    if (table.classList.contains("scene__table--red")) {
      table
        .querySelector(".scene__table-group")
        .classList.toggle("scene__table-group-active--red");
    } else {
      table
        .querySelector(".scene__table-group")
        .classList.toggle("scene__table-group-active");
    }
    table
      .querySelector(".scene__table-num")
      .classList.toggle("scene__table-num--active");
    changeTotalCost();
  };

  const selectTable = (name) => {
    changeTableToSelected(
      Array.from(tables).find((table) => table.getAttribute("id") === name)
    );
  };

  const cheackTotalCost = () => {
    console.log(totalCost.innerHTML);
    if (totalCost.innerHTML.trim() === "0")
      submitBtn.classList.add("btn--disabled");
    else submitBtn.classList.remove("btn--disabled");
  };

  checks.forEach((item) => {
    item.addEventListener("change", function onChange(e) {
      if (item.classList.contains("check--red")) {
        changeTableCount(e.target, redTableCount);
        changeCost(redTableCost, redTableCount);
      } else {
        changeTableCount(e.target, blackTableCount);
        changeCost(blackTableCost, blackTableCount);
      }
      changeTotalCost();
      selectTable(item.getAttribute("name"));
      cheackTotalCost();
    });
  });

  tables.forEach((item) => {
    item.addEventListener("click", function onClick(e) {
      changeTableToSelected(item);
      const check = Array.from(checks).find(
        (check) => check.getAttribute("name") === item.getAttribute("id")
      );
      check.checked = !check.checked;
      if (item.classList.contains("scene__table--red")) {
        changeTableCount(check, redTableCount);
        changeCost(redTableCost, redTableCount);
      } else {
        changeTableCount(check, blackTableCount);
        changeCost(blackTableCost, blackTableCount);
      }
      changeTotalCost();
      cheackTotalCost();
    });
  });

  totalCost.addEventListener("change", function onChange(e) {});
})();
