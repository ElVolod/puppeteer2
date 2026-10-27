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
    
      const dayIndex = 1;
      const posterAlt = "Ведьмак постер";
      const time = "17:00";

      beforeEach(async () => {
      await selectDay(page, dayIndex);
      await selectMovieSession(page, posterAlt, time);
      await page.waitForSelector(".buying-scheme__wrapper");
    });

  test("Кнопка забронировать заблокирована, если место уже занято", async () => {
    const { row, chair } = await page.evaluate(() => {
        const freeChair = document.querySelector(".buying-scheme__chair:not(.buying-scheme__chair_taken)");
        if (!freeChair) throw new Error("Нет свободных мест на этот сеанс для теста!");
        const parentRow = freeChair.closest(".buying-scheme__row");
        const rowIndex = Array.from(document.querySelectorAll(".buying-scheme__row")).indexOf(parentRow) + 1;
        const chairIndex = Array.from(parentRow.querySelectorAll(".buying-scheme__chair")).indexOf(freeChair) + 1;
        return { row: rowIndex, chair: chairIndex };
      });

      await selectChair(page, row, chair);
      await page.waitForSelector(".acceptin-button");
      await page.click(".acceptin-button");

      await page.waitForSelector(".ticket__check-title");
      await page.click(".acceptin-button");

      await page.waitForSelector(".ticket__info-qr");

      await page.goto("https://qamid.tmweb.ru/client/index.php", {
        waitUntil: "domcontentloaded",
      });

      await selectDay(page, dayIndex);
      await selectMovieSession(page, posterAlt, time);
      await page.waitForSelector(".buying-scheme__wrapper");

      const specificChairSelector = `.buying-scheme__wrapper .buying-scheme__row:nth-child(${row}) .buying-scheme__chair:nth-child(${chair})`;
      await page.waitForSelector(specificChairSelector);

      const isTaken = await page.$eval(specificChairSelector, (el) => el.classList.contains("buying-scheme__chair_taken"));
      expect(isTaken).toBe(true);
    
      await selectChair(page, row, chair);
      
      const isDisabled = await page.$eval(".acceptin-button", (el) => {
        return el.disabled || el.classList.contains("acceptin-button_disabled") || window.getComputedStyle(el).pointerEvents === "none";
      });
      expect(isDisabled).toBe(true);
    }, 60000);
  });
});
