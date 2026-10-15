# Library Navigator

영남대학교 법학도서관의 2012년 조감도를 참고한 1층 안내 시제품입니다. 현장 사진과 측량을 대체하지 않습니다.

## 구현

- Three.js 3D 조감도, 드론 시점, 지정된 지점에서의 실내 탐색, 2D 지도, 가상 360도 실내 이미지
- 한국어·영어·중국어·베트남어 인터페이스
- 서명·저자·출판사·등록번호·청구기호 OR 검색, 대출 가능 소장본만 길찾기
- 안내 시작 직전 서버의 상태 확인. 현재 데이터는 시제품 예시입니다.
- D1 서버 저장 문의, 이미지 첨부, 비공개 코드로 조회, 관리자 처리·담당자·답변·내부 메모·이력
- 비공개 코드는 SHA-256 해시로 저장하며 조회 URL의 fragment를 사용해 서버 로그와 referrer에 코드를 보내지 않습니다.
- 관리자 API는 서버에서 권한 확인. 개발 환경에 한해서 Sites의 로컬 로그인 계정을 허용합니다.

## 로컬 실행

Node 22.13 이상. 패키지를 설치한 뒤 `npm run dev`를 실행합니다. 기본 주소는 http://localhost:5173 입니다.

첫 실행의 DB 준비:

1. `npm run build`
2. `node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_sturdy_dagger.sql`
3. `npm run dev`

DB 데이터는 `.wrangler/state`에 보존됩니다. 이미 적용한 migration은 재실행하지 않습니다.

이 컴퓨터의 npm 도구가 PATH에 없으면 `node .sites-runtime/npm-runtime/node_modules/npm/bin/npm-cli.js run dev`로 실행할 수 있습니다.

## 확인

- `node --test tests/catalog.test.mjs`
- `npx tsc --noEmit`
- `npm run build`
- 이용자 문의 접수 → 조회 링크 확인 → `/admin` 개발 로그인 → 상태·답변 저장 → 비공개 조회에서 답변 확인

## 운영 전 필요한 연결

- libs.yu.ac.kr 공식 검색/API 또는 제공받은 데이터와 실시간 대출 상태. 현재 예시 데이터를 실제 정보로 표시하지 않습니다.
- 현재 도면, 정문·입구·통로 사진, 서가 번호와 청구기호 범위. 360도 파노라마는 실제 공간과 일치하는 사진으로 교체합니다.
- 운영 관리자 ID 허용 목록을 서버 환경변수 `ADMIN_USER_IDS`에 쉼표로 설정합니다. 배포 빌드는 로컬 개발 계정을 자동 허용하지 않습니다.
- 이메일 발송은 미연결입니다. 현재 이용자는 접수 직후 제공되는 조회 링크로 답변을 확인합니다.
- 호스팅 신규 생성은 계정의 Site Hosting 사용 한도로 실패했습니다. 로컬 구현과 데이터는 보존됩니다. 한도 해제 후 동일 프로젝트를 등록해 배포합니다.

## 이미지

`public/library-panorama.png`는 내장 ImageGen으로 생성한 가상 실내 이미지입니다. 실제 도서관 촬영 사진이 아닙니다. 프롬프트: “Photorealistic 2:1 equirectangular 360 degree panorama of a Korean university law library, honey oak shelves, burgundy/navy/cream law books, tiled floor, white acoustic ceiling, soft daylight, no people, text or UI.”

실내 사진 모드는 한 지점의 분위기 미리보기이며 3D 이동 경로의 위치 증명으로 사용하지 않습니다. 안내 경로와 단계는 조감도 기반 3D 모델에서 제공합니다.
