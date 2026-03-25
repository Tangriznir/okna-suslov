// Google Apps Script — вставить в Приложение к договору
// (Расширения → Apps Script → вставить код → Выполнить → fixReferences)
//
// Что делает:
// 1. Создаёт лист "Прайс" с IMPORTRANGE из "Общий прайс лист"
// 2. Заменяет все формулы [1]Лист1! → Прайс!

function fixReferences() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // URL прайс-листа
  var priceUrl = 'https://docs.google.com/spreadsheets/d/1kBahD7TZxWJ-CEk1shGovgG6ZmcqENdj7Dj-G7HNchI/edit';
  var priceId = '1kBahD7TZxWJ-CEk1shGovgG6ZmcqENdj7Dj-G7HNchI';

  // 1. Создаём лист "Прайс" если его нет
  var priceSheet = ss.getSheetByName('Прайс');
  if (!priceSheet) {
    priceSheet = ss.insertSheet('Прайс');
    // Импортируем все данные из прайс-листа
    priceSheet.getRange('A1').setFormula('=IMPORTRANGE("' + priceId + '", "Лист1!A1:Q158")');
    SpreadsheetApp.flush();
    Logger.log('Создан лист "Прайс" с IMPORTRANGE. ВАЖНО: разреши доступ к данным!');
  }

  // 2. Заменяем ссылки в формулах на всех листах
  var sheets = ss.getSheets();
  var totalFixed = 0;

  for (var s = 0; s < sheets.length; s++) {
    var sheet = sheets[s];
    if (sheet.getName() === 'Прайс') continue; // не трогаем сам лист Прайс

    var range = sheet.getDataRange();
    var formulas = range.getFormulas();
    var changed = false;

    for (var i = 0; i < formulas.length; i++) {
      for (var j = 0; j < formulas[i].length; j++) {
        var f = formulas[i][j];
        if (f && f.indexOf('[1]') !== -1) {
          // Заменяем [1]Лист1! → Прайс!
          var newF = f.replace(/\[1\]Лист1!/g, 'Прайс!');
          // Также на случай [1]Лист1 без !
          newF = newF.replace(/\[1\]Лист1/g, 'Прайс');
          if (newF !== f) {
            formulas[i][j] = newF;
            changed = true;
            totalFixed++;
          }
        }
      }
    }

    if (changed) {
      // Записываем формулы обратно
      // Нужно пройти по каждой ячейке, т.к. setFormulas перезапишет все
      for (var i = 0; i < formulas.length; i++) {
        for (var j = 0; j < formulas[i].length; j++) {
          if (formulas[i][j] && formulas[i][j].indexOf('Прайс!') !== -1) {
            sheet.getRange(i + 1, j + 1).setFormula(formulas[i][j]);
          }
        }
      }
      Logger.log('Лист "' + sheet.getName() + '": исправлено формул');
    }
  }

  Logger.log('Готово! Исправлено формул: ' + totalFixed);
  Logger.log('ВАЖНО: Открой лист "Прайс" и нажми "Разрешить доступ" если увидишь такую кнопку!');
}
