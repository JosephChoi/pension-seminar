/**
 * Google Apps Script 코드
 * 세미나 신청 폼 데이터를 Google Sheets에 저장하는 스크립트
 * 
 * 스프레드시트 정보:
 * - 파일 이름: 연금저축 세미나 응답시트
 * - 시트 이름: 응답시트
 * - 스프레드시트 ID: 1J1gSYMaMcxOrGRu2yoDdtwV7H37rE63OzPohtSZzHTY
 * 
 * 사용 방법:
 * 1. Google Sheets에서 Extensions > Apps Script 메뉴를 선택합니다
 * 2. 아래 코드를 복사하여 붙여넣습니다
 * 3. 저장 후 Deploy > New Deployment를 선택합니다
 * 4. Type을 "Web app"으로 선택합니다
 * 5. Execute as: Me
 * 6. Who has access: Anyone
 * 7. Deploy 버튼을 클릭합니다
 * 8. 생성된 Web App URL을 복사하여 form.js의 GOOGLE_APPS_SCRIPT_URL에 입력합니다
 */

function doPost(e) {
  try {
    // 스프레드시트 ID
    var SPREADSHEET_ID = '1J1gSYMaMcxOrGRu2yoDdtwV7H37rE63OzPohtSZzHTY';
    
    // 시트 이름
    var SHEET_NAME = '응답시트';
    
    // 스프레드시트 열기
    var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    // 시트가 없으면 생성
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      // 헤더 추가
      sheet.appendRow(['Timestamp', '이름', '연락처', '참여 세션', '궁금한 사항']);
      // 헤더 스타일링
      var headerRange = sheet.getRange(1, 1, 1, 5);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#004AAD');
      headerRange.setFontColor('#FFFFFF');
      // 열 너비 자동 조정
      sheet.autoResizeColumns(1, 5);
    }
    
    // 기존 시트에 헤더가 없는 경우 (기존 데이터 마이그레이션)
    var headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    var headerValues = headerRow.getValues()[0];
    var hasSessionColumn = false;
    for (var i = 0; i < headerValues.length; i++) {
      if (headerValues[i] === '참여 세션') {
        hasSessionColumn = true;
        break;
      }
    }
    
    // 헤더가 4개 컬럼만 있는 경우 (기존 형식) - 헤더 업데이트
    if (headerValues.length === 4 && !hasSessionColumn) {
      sheet.insertColumnAfter(3); // 연락처 다음에 컬럼 추가
      sheet.getRange(1, 4).setValue('참여 세션');
      sheet.getRange(1, 1, 1, 5).setFontWeight('bold');
      sheet.getRange(1, 1, 1, 5).setBackground('#004AAD');
      sheet.getRange(1, 1, 1, 5).setFontColor('#FFFFFF');
      sheet.autoResizeColumns(1, 5);
    }
    
    // POST 데이터 파싱
    var postData = JSON.parse(e.postData.contents);
    
    // 현재 시간
    var timestamp = new Date();
    
    // 데이터 배열 생성
    var rowData = [
      timestamp,
      postData.name || '',
      postData.phone || '',
      postData.session || '',
      postData.question || ''
    ];
    
    // 시트에 데이터 추가
    sheet.appendRow(rowData);
    
    // 성공 응답 반환
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: '신청이 접수되었습니다.'
    }))
    .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // 에러 처리
    Logger.log('Error: ' + error.toString());
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 테스트 함수 (선택사항)
 * 스크립트가 제대로 작동하는지 확인할 때 사용합니다
 */
function testDoPost() {
  var mockEvent = {
    postData: {
      contents: JSON.stringify({
        name: '테스트 사용자',
        phone: '010-1234-5678',
        question: '테스트 질문입니다.'
      })
    }
  };
  
  var result = doPost(mockEvent);
  Logger.log(result.getContent());
}

