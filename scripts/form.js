/**
 * 세미나 신청 폼 제출 처리
 * 
 * Google Apps Script 설정 방법:
 * 1. Google Sheets 생성 및 "응답 시트" 시트명 지정
 * 2. Google Apps Script 편집기 열기 (Extensions > Apps Script)
 * 3. 아래 코드를 입력:
 * 
 * function doPost(e) {
 *   var sheet = SpreadsheetApp.openById('YOUR_SHEET_ID').getSheetByName('응답 시트');
 *   var data = JSON.parse(e.postData.contents);
 *   sheet.appendRow([new Date(), data.name, data.phone, data.question || '']);
 *   return ContentService.createTextOutput(JSON.stringify({success: true}))
 *     .setMimeType(ContentService.MimeType.JSON);
 * }
 * 
 * 4. Deploy > New Deployment > Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. 배포 URL을 아래 GOOGLE_APPS_SCRIPT_URL에 입력
 */

// Google Apps Script Web App URL
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxpH3b-AxoDZ7-DJ_zexsNGbESPqCyXcMAQZg8hbi5G2qdWl6kC1hb-QuSYAX-Q4_Ck/exec';

/**
 * 전화번호를 010-XXXX-XXXX 형식으로 정규화
 * @param {string} phone - 입력된 전화번호
 * @returns {string} 정규화된 전화번호 (010-XXXX-XXXX)
 */
function normalizePhoneNumber(phone) {
    // 숫자만 추출
    const digits = phone.replace(/[^0-9]/g, '');
    
    // 빈 값 처리
    if (!digits) return '';
    
    // 국가코드 제거 (82로 시작하는 경우)
    let phoneNumber = digits;
    if (phoneNumber.startsWith('82')) {
        phoneNumber = '0' + phoneNumber.substring(2);
    }
    
    // 길이에 따라 처리
    if (phoneNumber.length === 11) {
        // 010XXXXXXXX 형식
        if (phoneNumber.startsWith('010')) {
            return phoneNumber.substring(0, 3) + '-' + phoneNumber.substring(3, 7) + '-' + phoneNumber.substring(7);
        }
        // 011, 016, 017, 018, 019 등
        if (phoneNumber.startsWith('01')) {
            return phoneNumber.substring(0, 3) + '-' + phoneNumber.substring(3, 7) + '-' + phoneNumber.substring(7);
        }
    } else if (phoneNumber.length === 10) {
        // 10XXXXXXXX 형식 (앞자리 0이 빠진 경우)
        if (phoneNumber.startsWith('10')) {
            return '010-' + phoneNumber.substring(2, 6) + '-' + phoneNumber.substring(6);
        }
        // 02, 031, 032 등 지역번호
        if (phoneNumber.startsWith('02')) {
            return phoneNumber.substring(0, 2) + '-' + phoneNumber.substring(2, 6) + '-' + phoneNumber.substring(6);
        }
        if (phoneNumber.startsWith('0')) {
            return phoneNumber.substring(0, 3) + '-' + phoneNumber.substring(3, 6) + '-' + phoneNumber.substring(6);
        }
    } else if (phoneNumber.length === 9) {
        // 10XXXXXXX 형식 (앞자리 0이 빠진 경우)
        if (phoneNumber.startsWith('10')) {
            return '010-' + phoneNumber.substring(2, 5) + '-' + phoneNumber.substring(5);
        }
    }
    
    // 기본 처리: 11자리 이상이면 앞 11자리만 사용
    if (phoneNumber.length >= 11) {
        phoneNumber = phoneNumber.substring(0, 11);
        if (phoneNumber.startsWith('010')) {
            return phoneNumber.substring(0, 3) + '-' + phoneNumber.substring(3, 7) + '-' + phoneNumber.substring(7);
        }
    }
    
    // 변환 실패 시 원본 반환 (유효성 검사에서 걸러짐)
    return phone;
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('seminar-form');
    const formMessage = document.getElementById('form-message');
    
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // 입력값 가져오기
        const name = document.getElementById('name').value.trim();
        let phone = document.getElementById('phone').value.trim();
        const question = document.getElementById('question').value.trim();
        
        // 세션 선택 가져오기
        const sessionCheckboxes = document.querySelectorAll('input[name="session"]:checked');
        const sessions = Array.from(sessionCheckboxes).map(cb => cb.value);
        
        // 유효성 검사
        if (!name) {
            showMessage('이름을 입력해주세요.', 'error');
            document.getElementById('name').focus();
            return;
        }
        
        if (!phone) {
            showMessage('연락처를 입력해주세요.', 'error');
            document.getElementById('phone').focus();
            return;
        }
        
        if (sessions.length === 0) {
            showMessage('참여하실 세션을 최소 1개 이상 선택해주세요.', 'error');
            return;
        }
        
        // 전화번호 정규화
        phone = normalizePhoneNumber(phone);
        
        // 정규화된 전화번호 유효성 검사 (010-XXXX-XXXX 형식)
        const phoneRegex = /^010-\d{4}-\d{4}$/;
        if (!phoneRegex.test(phone)) {
            showMessage('올바른 연락처 형식을 입력해주세요. (예: 010-1234-5678)', 'error');
            document.getElementById('phone').focus();
            return;
        }
        
        // 정규화된 전화번호를 입력 필드에 반영
        document.getElementById('phone').value = phone;
        
        // Google Apps Script URL 확인
        if (GOOGLE_APPS_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
            showMessage('Google Apps Script URL이 설정되지 않았습니다. 관리자에게 문의해주세요.', 'error');
            console.error('Google Apps Script URL을 설정해주세요.');
            return;
        }
        
        // 제출 버튼 비활성화
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = '전송 중...';
        
        try {
            // 데이터 준비
            const formData = {
                name: name,
                phone: phone,
                session: sessions.join(', '), // 선택된 세션들을 쉼표로 구분하여 저장
                question: question || ''
            };
            
            // Google Apps Script로 POST 요청
            // Google Apps Script Web App은 CORS를 지원하지 않으므로 no-cors 모드 사용
            const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // CORS 이슈 방지를 위해 no-cors 사용
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            // no-cors 모드에서는 response를 읽을 수 없으므로 항상 성공으로 처리
            // 실제 성공 여부와 문자 발송 결과는 Google Apps Script 실행 로그에서 확인 필요
            console.log('폼 제출 완료 (응답 확인 불가 - no-cors 모드)');
            showMessage('신청이 접수되었습니다. 행사 전 안내문을 발송드릴 예정입니다.', 'success');
            
            // 버튼 텍스트를 "신청완료"로 변경
            submitButton.textContent = '신청완료';
            submitButton.disabled = true;
            submitButton.classList.remove('hover:bg-[#003A8D]', 'hover:shadow-xl', 'hover:-translate-y-1');
            submitButton.classList.add('bg-green-600', 'cursor-not-allowed');
            
            // 폼 리셋
            form.reset();
            
        } catch (error) {
            console.error('폼 제출 오류:', error);
            showMessage('신청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'error');
            // 에러 발생 시 버튼 원래 상태로 복구
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });
    
    /**
     * 메시지 표시 함수
     * @param {string} message - 표시할 메시지
     * @param {string} type - 메시지 타입 ('success' | 'error')
     */
    function showMessage(message, type) {
        formMessage.textContent = message;
        formMessage.className = '';
        
        if (type === 'success') {
            formMessage.classList.add('bg-green-100', 'text-green-800', 'border', 'border-green-300');
        } else {
            formMessage.classList.add('bg-red-100', 'text-red-800', 'border', 'border-red-300');
        }
        
        formMessage.classList.remove('hidden');
        
        // 성공 메시지는 5초 후 자동 숨김
        if (type === 'success') {
            setTimeout(() => {
                formMessage.classList.add('hidden');
            }, 5000);
        }
        
        // 메시지 영역으로 스크롤
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});

