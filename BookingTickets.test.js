const { selectDay, selectMovieSession, selectChair } = require("./commands"); // Если файл лежит в той же папке

describe("Кинотеатр 'ИдёмВКино' — Тестирование бронирования билетов", () => {
let page;
const ACCEPT_BUTTON = ".acceptin-button";

beforeEach(async () => {
  jest.setTimeout(60000);
  page = await browser.newPage();
  await page.goto("https://qamid.tmweb.ru/client/index.php", {
    waitUntil: "domcontentloaded",
  });
});

afterEach(async () => {
  await page.close();
});

  // test 1
  test("Успешное бронирование на случайный фильм на сегодня", async () => {
    const dayIndex = 0; // Сегодня
    const posterAlt = "Достать ножи постер";
    const time = "23:59";
    
    await selectDay(page, dayIndex);
    await selectMovieSession(page, posterAlt, time);
    
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

    await page.waitForSelector(".ticket__check-title");
    const titleText = await page.$eval(".ticket__check-title", (el) => el.textContent);
    expect(titleText).toContain("Вы выбрали билеты:");
  }, 60000);

  // test 2
  test("Успешное бронирование билета на фильм 'Need for Speed' на завтра", async () => {
    const dayIndex = 1; // Завтра
    const posterAlt = "Need for Speed: Жажда скорости (2014) постер";
    const time = "12:00";
    
    await selectDay(page, dayIndex);
    await selectMovieSession(page, posterAlt, time);
    
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

    await page.waitForSelector(".ticket__check-title");
    const titleText = await page.$eval(".ticket__check-title", (el) => el.textContent);
    expect(titleText).toContain("Вы выбрали билеты:");
  }, 60000);

  // test 3
  describe("Проверка заблокированного места", () => {
    beforeEach(async () => {
      const dayIndex = 0;
      const posterAlt = "Достать ножи постер";
      const time = "23:59";

      await selectDay(page, dayIndex);
      await selectMovieSession(page, posterAlt, time);
      await page.waitForSelector(".buying-scheme__wrapper");
    });

  test("Кнопка забронировать заблокирована, если место уже занято", async () => {
    const takenChairSelector = ".buying-scheme__chair_taken";

    // Ищем на схеме зала кресло, которое уже серого цвета (занято)
    const isTakenPlaceExists = await page.$(takenChairSelector);
    
    if (isTakenPlaceExists) {
      await page.click(takenChairSelector);
      
      const isDisabled = await page.$eval(".acceptin-button", (el) => el.disabled);
      expect(isDisabled).toBe(true);
    } else {
      
      const isDisabledWithoutSelection = await page.$eval(".acceptin-button", (el) => el.disabled);
      expect(isDisabledWithoutSelection).toBe(true);
    }
   }, 60000);
  });
});
