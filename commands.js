module.exports = {

//выбираем день в календаре
  async selectDay(page, dayIndex) {
    await page.waitForSelector('.page-nav__day');
    const days = await page.$$('.page-nav__day');
    await days[dayIndex].click();
},

// находим нужный фильм по постеру и кликаем на время сеанса
async selectMovieSession(page, posterAlt, time) {
    await page.waitForSelector('.movie');
    const sessionSelector = `xpath///img[@alt='${posterAlt}']/ancestor::section//a[contains(text(), '${time}')]`;
    await page.waitForSelector(sessionSelector);
    await page.click(sessionSelector);
  },

// выбираем конкретное место
async selectChair(page, row, chair) {
    const chairSelector = `.buying-scheme__wrapper .buying-scheme__row:nth-child(${row}) .buying-scheme__chair:nth-child(${chair})`;
    await page.waitForSelector(chairSelector);
    await page.click(chairSelector);
  }
};
