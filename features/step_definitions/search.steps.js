const puppeteer = require("puppeteer");
const chai = require("chai");
const expect = chai.expect;
const {
  Given,
  When,
  Then,
  Before,
  After,
  setDefaultTimeout,
} = require("@cucumber/cucumber");

const { selectDay, selectMovieSession, selectChair } = require("../../commands.js");

setDefaultTimeout(60000);

let browser;
let page;
let savedRow;
let savedChair;
const ACCEPT_BUTTON = ".acceptin-button";
const BASE_URL = "https://qamid.tmweb.ru/client/index.php";

Before(async () => {
  browser = await puppeteer.launch({ headless: false, defaultViewport: null });
  page = await browser.newPage();
});

After(async () => {
  if (page) await page.close();
  if (browser) await browser.close();
});

Given("I am on the cinema homepage", async () => {
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
});

When("I select day {int}, movie {string} and time {string}", async (dayIndex, movie, time) => {
  await selectDay(page, dayIndex);
  await selectMovieSession(page, movie, time);
});

When("I book any available seat", async () => {
  await page.waitForSelector(".buying-scheme__wrapper");
  
  const { row, chair } = await page.evaluate(() => {
    const freeChair = document.querySelector(".buying-scheme__chair:not(.buying-scheme__chair_taken)");
    if (!freeChair) throw new Error("Нет свободных мест на этот сеанс!");
    const parentRow = freeChair.closest(".buying-scheme__row");
    const rowIndex = Array.from(document.querySelectorAll(".buying-scheme__row")).indexOf(parentRow) + 1;
    const chairIndex = Array.from(parentRow.querySelectorAll(".buying-scheme__chair")).indexOf(freeChair) + 1;
    return { row: rowIndex, chair: chairIndex };
  });

  await selectChair(page, row, chair);
  await page.waitForSelector(ACCEPT_BUTTON);
  await page.click(ACCEPT_BUTTON);
});

Then("I should see the confirmation text {string}", async (expectedText) => {
  await page.waitForSelector(".ticket__check-title");
  const titleText = await page.$eval(".ticket__check-title", (el) => el.textContent);
  expect(titleText).to.include(expectedText);
});

When("I buy a ticket for an available seat to get a QR code", async () => {
  await page.waitForSelector(".buying-scheme__wrapper");
  
  const { row, chair } = await page.evaluate(() => {
    const freeChair = document.querySelector(".buying-scheme__chair:not(.buying-scheme__chair_taken)");
    if (!freeChair) throw new Error("Нет свободных мест на этот сеанс для теста!");
    const parentRow = freeChair.closest(".buying-scheme__row");
    const rowIndex = Array.from(document.querySelectorAll(".buying-scheme__row")).indexOf(parentRow) + 1;
    const chairIndex = Array.from(parentRow.querySelectorAll(".buying-scheme__chair")).indexOf(freeChair) + 1;
    return { row: rowIndex, chair: chairIndex };
  });

  savedRow = row;
  savedChair = chair;

  await selectChair(page, savedRow, savedChair);
  await page.waitForSelector(ACCEPT_BUTTON);
  await page.click(ACCEPT_BUTTON);

  await page.waitForSelector(".ticket__check-title");
  await page.click(ACCEPT_BUTTON);

  await page.waitForSelector(".ticket__info-qr");
});

When("I return to the same movie session", async () => {
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
});

Then("this seat should be displayed as taken", async () => {
  const specificChairSelector = `.buying-scheme__wrapper .buying-scheme__row:nth-child(${savedRow}) .buying-scheme__chair:nth-child(${savedChair})`;
  await page.waitForSelector(specificChairSelector);

  const isTaken = await page.$eval(specificChairSelector, (el) => el.classList.contains("buying-scheme__chair_taken"));
  expect(isTaken).to.be.true;
});

Then("the booking button should be disabled", async () => {
  await selectChair(page, savedRow, savedChair);
  
  const isDisabled = await page.$eval(ACCEPT_BUTTON, (el) => {
    return el.disabled || el.classList.contains("acceptin-button_disabled") || window.getComputedStyle(el).pointerEvents === "none";
  });
  expect(isDisabled).to.be.true;
});