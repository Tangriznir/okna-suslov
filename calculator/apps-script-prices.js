function doGet(e) {
  return doProcess(e);
}

function doPost(e) {
  return doProcess(e);
}

function doProcess(e) {
  try {
    // Получаем данные из любого источника
    var raw = '';
    if (e.parameter && e.parameter.payload) {
      raw = e.parameter.payload;
    } else if (e.postData && e.postData.contents) {
      raw = e.postData.contents;
    }

    if (!raw) {
      return ContentService.createTextOutput(JSON.stringify({status:'error', message:'No data received'}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var data = JSON.parse(raw);
    var ss = SpreadsheetApp.openById('1PPalotyHHyZOUVfcKm_c6__iB8-kVx5gwDBRDUxnJMw');

    // Обновление цен
    if (data.action === 'update_prices') {
      var sheet = ss.getSheetByName('Лист1') || ss.getSheets()[0];
      var values = sheet.getDataRange().getValues();
      var prices = data.prices;
      var updated = 0;

      for (var key in prices) {
        var found = false;
        for (var i = 1; i < values.length; i++) {
          if (values[i][0].toString().trim() === key) {
            sheet.getRange(i + 1, 2).setValue(prices[key]);
            found = true;
            updated++;
            break;
          }
        }
        if (!found) {
          sheet.appendRow([key, prices[key], '']);
          updated++;
        }
      }

      return ContentService.createTextOutput(JSON.stringify({status:'ok', updated:updated}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Обновление конкурентов
    if (data.action === 'update_competitors') {
      var sheet = ss.getSheetByName('Конкуренты');
      if (!sheet) return ContentService.createTextOutput(JSON.stringify({status:'error', message:'Лист не найден'}));
      var values = sheet.getDataRange().getValues();
      var comps = data.competitors;
      var updated = 0;

      comps.forEach(function(c) {
        var found = false;
        for (var i = 1; i < values.length; i++) {
          if (values[i][0].toString().trim() === c.id) {
            sheet.getRange(i+1,2).setValue(c.pricePerM2);
            sheet.getRange(i+1,3).setValue(c.sashExtra||0);
            sheet.getRange(i+1,4).setValue(c.mullionExtra||0);
            sheet.getRange(i+1,5).setValue(c.name||'');
            sheet.getRange(i+1,6).setValue(c.note||'');
            sheet.getRange(i+1,7).setValue(new Date().toISOString().slice(0,10));
            found=true; updated++; break;
          }
        }
        if (!found) {
          sheet.appendRow([c.id,c.pricePerM2,c.sashExtra||0,c.mullionExtra||0,c.name||'',c.note||'',new Date().toISOString().slice(0,10)]);
          updated++;
        }
      });

      return ContentService.createTextOutput(JSON.stringify({status:'ok', updated:updated}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Обновление цен на сайте
    if (data.action === 'update_site_prices') {
      var sheet = ss.getSheetByName('Цены на сайте');
      if (!sheet) return ContentService.createTextOutput(JSON.stringify({status:'error', message:'Лист "Цены на сайте" не найден'}));
      var values = sheet.getDataRange().getValues();
      var prices = data.prices;
      var updated = 0;

      for (var key in prices) {
        for (var i = 1; i < values.length; i++) {
          if (values[i][0].toString().trim() === key) {
            sheet.getRange(i + 1, 2).setValue(prices[key]);
            updated++;
            break;
          }
        }
      }

      return ContentService.createTextOutput(JSON.stringify({status:'ok', updated:updated}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Логирование просчётов
    var sheet = ss.getSheetByName('Просчёты') || ss.getSheets()[0];
    sheet.appendRow([new Date(),data.ip||'',data.type||'',data.size||'',data.glazing||'',data.sashes||'',data.nets||'',data.price||'',data.profit||'',data.extras||'',data.name||'',data.phone||'',data.total||'']);

    return ContentService.createTextOutput(JSON.stringify({status:'ok'})).setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({status:'error', message:err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}
