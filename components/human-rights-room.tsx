"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ExternalLink,
  Globe2,
  Search,
} from "lucide-react";
import type { Language } from "../lib/catalog";
import HumanRightsGame from "./human-rights-game";
import "./human-rights-room.css";

type ResourceKind = "foundation" | "education" | "children";
type Resource = {
  id: string;
  kind: ResourceKind;
  source: string;
  url: string;
  title: Record<Language, string>;
  summary: Record<Language, string>;
};

const resources: Resource[] = [
  {
    id: "udhr-ko",
    kind: "foundation",
    source: "OHCHR Library",
    url: "https://searchlibrary.ohchr.org/record/17780?ln=en",
    title: {
      ko: "세계인권선언 한국어 번역자료",
      en: "Universal Declaration of Human Rights · Korean",
      zh: "《世界人权宣言》韩文译本",
      vi: "Tuyên ngôn Quốc tế Nhân quyền · tiếng Hàn",
    },
    summary: {
      ko: "유엔 인권최고대표사무소 도서관에서 제공하는 한국어 번역 자료와 열람 형식입니다.",
      en: "Korean translation and available formats from the OHCHR Library record.",
      zh: "联合国人权高专办图书馆提供的韩文译本及可用阅读格式。",
      vi: "Bản dịch tiếng Hàn và các định dạng đọc từ thư viện OHCHR.",
    },
  },
  {
    id: "udhr",
    kind: "foundation",
    source: "OHCHR",
    url: "https://europe.ohchr.org/universal-declaration-human-rights",
    title: {
      ko: "세계인권선언",
      en: "Universal Declaration of Human Rights",
      zh: "世界人权宣言",
      vi: "Tuyên ngôn Quốc tế Nhân quyền",
    },
    summary: {
      ko: "선언문, 여러 언어 번역, 오디오와 교육 자료를 살펴볼 수 있습니다.",
      en: "Read the declaration and explore translations, audio, and learning resources.",
      zh: "阅读宣言，并查看多语种译本、音频和学习资料。",
      vi: "Đọc tuyên ngôn và xem bản dịch, âm thanh cùng tài liệu học tập.",
    },
  },
  {
    id: "education",
    kind: "education",
    source: "국가인권위원회 인권교육센터",
    url: "https://edu.humanrights.go.kr/academy/contents/bbsContentsList.do",
    title: {
      ko: "인권교육 교재·교육자료실",
      en: "Human Rights Education Materials",
      zh: "人权教育教材与资料室",
      vi: "Tài liệu giáo dục về quyền con người",
    },
    summary: {
      ko: "국가인권위원회가 공개한 교육 교재와 영상 자료를 주제별로 찾아봅니다.",
      en: "Browse educational materials and videos published by Korea’s National Human Rights Commission.",
      zh: "按主题浏览韩国国家人权委员会发布的教育教材和视频。",
      vi: "Tìm tài liệu và video giáo dục do Ủy ban Nhân quyền Quốc gia Hàn Quốc công bố.",
    },
  },
  {
    id: "crc",
    kind: "children",
    source: "UNICEF",
    url: "https://www.unicef.org/child-rights-convention/convention-text",
    title: {
      ko: "아동권리협약 원문",
      en: "Convention on the Rights of the Child",
      zh: "《儿童权利公约》全文",
      vi: "Công ước về Quyền trẻ em",
    },
    summary: {
      ko: "유니세프에서 협약 전문과 내려받기 자료를 제공합니다.",
      en: "The full convention text and downloads from UNICEF.",
      zh: "联合国儿童基金会提供的公约全文及下载资料。",
      vi: "Toàn văn công ước và tài liệu tải xuống từ UNICEF.",
    },
  },
  {
    id: "crc-easy",
    kind: "children",
    source: "UNICEF",
    url: "https://www.unicef.org/child-rights-convention/convention-text-childrens-version",
    title: {
      ko: "어린이를 위한 아동권리협약",
      en: "Children’s version of the Convention",
      zh: "儿童版《儿童权利公约》",
      vi: "Phiên bản Công ước dành cho trẻ em",
    },
    summary: {
      ko: "아동이 이해하기 쉬운 표현으로 협약 내용을 소개합니다.",
      en: "A child-friendly explanation of the convention.",
      zh: "以儿童易懂的方式介绍公约内容。",
      vi: "Giải thích công ước bằng cách diễn đạt dễ hiểu với trẻ em.",
    },
  },
];

const copy: Record<Language, Record<string, string>> = {
  ko: {
    back: "도서관 길찾기", eyebrow: "법학도서관 · 인권자료실", title: "사람의 존엄을 배우는 책과 자료", intro: "인권의 기준이 된 문서와 공식 교육 자료를 모았습니다. 자료를 읽고, 도서관 현장도 360도로 둘러보세요.",
    tour: "도서관 현장 둘러보기", tourHelp: "마우스로 둘러보고 ↑/W 또는 화면의 이동 버튼을 길게 눌러 걸어가세요.", photo: "현장 파노라마", photoCount: "지점", prev: "뒤쪽 지점", next: "앞쪽 지점", moveForward: "앞으로 이동", moveBack: "뒤로 이동", turnLeft: "왼쪽 보기", turnRight: "오른쪽 보기", photoNote: "현장 촬영 사진입니다. 서가별 자료 위치나 현재 소장 여부를 나타내지는 않습니다.", viewGame: "3D 걷기", viewPhoto: "360° 사진", gameKeys: "WASD로 걷기 · ←→ 회전 · 마우스로 둘러보기", gameNote: "제공된 파노라마를 참고해 만든 근사 3D 모형입니다. 실제 구조와 치수는 다를 수 있습니다.", resetPosition: "시작 위치로 돌아가기",
    collection: "공식 자료에서 읽는 인권", collectionHelp: "공공기관과 국제기구가 공개한 원문·교육 자료로 연결합니다.", search: "자료 제목이나 기관 검색", all: "전체", foundation: "기본 문서", education: "교육 자료", children: "아동 권리", noResults: "자료를 찾지 못했습니다.", open: "원문 보기", source: "자료 제공 기관", result: "개 자료", language: "언어", linkNote: "링크를 누르면 자료 제공 기관의 웹사이트가 새 창으로 열립니다.", backTop: "길찾기로 돌아가기", library: "네북케이터", tip: "이 자료실은 공개된 참고 자료를 모아 안내합니다. 최신 법령 해석이나 법률 상담을 대신하지 않습니다.", keys: "마우스로 보기 · ↑/W 길게 눌러 걷기 · ←→ 방향 전환 · +/− 확대", loading: "360도 사진을 불러오는 중입니다.", photoError: "사진을 불러오지 못했습니다. 다른 사진을 선택해 주세요.", noticeTitle: "자료 이용 안내",
  },
  en: {
    back: "Library guide", eyebrow: "Law Library · Human Rights Resources", title: "Books and sources for learning about human dignity", intro: "A starting point for foundational human rights documents and official learning materials. Read a source, then look around the library in 360°.",
    tour: "Look around the library", tourHelp: "Drag to look. Hold ↑/W or the on-screen walk buttons to keep moving.", photo: "Library panorama", photoCount: "stop", prev: "Previous stop", next: "Next stop", moveForward: "Walk forward", moveBack: "Walk back", turnLeft: "Turn left", turnRight: "Turn right", photoNote: "These are on-site photographs. They do not identify shelf locations or current holdings.", viewGame: "Walk in 3D", viewPhoto: "360° photos", gameKeys: "WASD to walk · ←→ turn · drag to look around", gameNote: "An approximate 3D model based on the supplied panoramas; layout and dimensions may differ from the real library.", resetPosition: "Return to start",
    collection: "Human rights, through public sources", collectionHelp: "Links to primary texts and learning materials published by public bodies and international organizations.", search: "Search titles or institutions", all: "All", foundation: "Foundational texts", education: "Education", children: "Children’s rights", noResults: "No sources found.", open: "Open source", source: "Provided by", result: "sources", language: "Language", linkNote: "Links open the source institution’s website in a new tab.", backTop: "Return to library guide", library: "Nebookator", tip: "This page gathers public reference materials. It is not legal advice or an interpretation of current law.", keys: "Drag to look · Hold ↑/W to walk · ←→ turn · +/− zoom", loading: "Loading the 360° photo…", photoError: "The photo could not be loaded. Choose another one.", noticeTitle: "Using these sources",
  },
  zh: {
    back: "图书馆导航", eyebrow: "法学图书馆 · 人权资料室", title: "从书籍与资料中认识人的尊严", intro: "汇集人权基础文件与官方教育资料。阅读资料后，也可以通过360度照片浏览图书馆。",
    tour: "浏览图书馆现场", tourHelp: "拖动以环视；按住 ↑/W 或屏幕上的移动按钮即可连续行走。", photo: "现场全景", photoCount: "个位置", prev: "上一个位置", next: "下一个位置", moveForward: "向前移动", moveBack: "向后移动", turnLeft: "向左转", turnRight: "向右转", photoNote: "这些是现场拍摄的照片，不表示具体书架位置或当前馆藏情况。", viewGame: "3D行走", viewPhoto: "360°照片", gameKeys: "WASD行走 · ←→转向 · 拖动环视", gameNote: "根据全景照片制作的近似3D模型；布局和尺寸可能与实际不同。", resetPosition: "返回起点",
    collection: "通过公开资料阅读人权", collectionHelp: "链接至公共机构和国际组织发布的原文与教育资料。", search: "搜索资料名称或机构", all: "全部", foundation: "基础文件", education: "教育资料", children: "儿童权利", noResults: "没有找到资料。", open: "查看原文", source: "资料来源", result: "项资料", language: "语言", linkNote: "点击后将在新标签页打开资料提供机构的网站。", backTop: "返回图书馆导航", library: "Nebookator", tip: "本资料室汇集公开参考资料，不构成法律意见或对现行法律的解释。", keys: "拖动环视 · 按住 ↑/W 连续行走 · ←→转向 · +/−缩放", loading: "正在加载360度照片…", photoError: "无法加载照片，请选择其他照片。", noticeTitle: "资料使用说明",
  },
  vi: {
    back: "Hướng dẫn thư viện", eyebrow: "Thư viện Luật · Tài liệu Nhân quyền", title: "Sách và tài liệu giúp tìm hiểu phẩm giá con người", intro: "Tập hợp các văn kiện nền tảng về nhân quyền và tài liệu giáo dục chính thức. Hãy đọc tài liệu và tham quan thư viện qua ảnh 360°.",
    tour: "Tham quan thư viện", tourHelp: "Kéo để nhìn quanh; giữ ↑/W hoặc nút di chuyển trên màn hình để tiếp tục đi.", photo: "Ảnh toàn cảnh", photoCount: "điểm", prev: "Điểm trước", next: "Điểm tiếp", moveForward: "Đi về phía trước", moveBack: "Đi lùi", turnLeft: "Quay trái", turnRight: "Quay phải", photoNote: "Đây là ảnh chụp tại thư viện; ảnh không cho biết vị trí kệ sách hay tình trạng tài liệu hiện có.", viewGame: "Đi bộ 3D", viewPhoto: "Ảnh 360°", gameKeys: "WASD để đi · ←→ xoay · kéo để nhìn quanh", gameNote: "Mô hình 3D gần đúng dựa trên ảnh toàn cảnh; bố cục và kích thước có thể khác thực tế.", resetPosition: "Quay lại điểm bắt đầu",
    collection: "Tìm hiểu nhân quyền qua nguồn công khai", collectionHelp: "Liên kết đến văn bản gốc và tài liệu học tập do cơ quan công và tổ chức quốc tế công bố.", search: "Tìm theo tên tài liệu hoặc cơ quan", all: "Tất cả", foundation: "Văn kiện nền tảng", education: "Giáo dục", children: "Quyền trẻ em", noResults: "Không tìm thấy tài liệu.", open: "Mở tài liệu", source: "Đơn vị cung cấp", result: "tài liệu", language: "Ngôn ngữ", linkNote: "Liên kết sẽ mở trang web của đơn vị cung cấp trong thẻ mới.", backTop: "Quay lại hướng dẫn thư viện", library: "Nebookator", tip: "Trang này tập hợp tài liệu tham khảo công khai; không thay thế tư vấn pháp lý hoặc giải thích luật hiện hành.", keys: "Kéo để nhìn · Giữ ↑/W để đi liên tục · ←→ xoay · +/− thu phóng", loading: "Đang tải ảnh 360°…", photoError: "Không thể tải ảnh. Hãy chọn ảnh khác.", noticeTitle: "Lưu ý khi sử dụng tài liệu",
  },
};

const categories: ResourceKind[] = ["foundation", "education", "children"];
const basePath = import.meta.env.BASE_URL || "/";
const panoramaPath = (name: string) => basePath + "human-rights-panorama/" + name;
// Follow the original capture sequence from the entrance into the library,
// skipping repeated viewpoints along the way.
const walkRoute = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 17, 19, 21, 22, 23, 25, 26, 27, 28, 29];
const photoFiles = walkRoute.map((number, index) => ({
  src: panoramaPath("panorama-" + String(number).padStart(2, "0") + ".jpg"),
  yaw: index < 11 ? Math.PI : 0,
}));

function PanoramaViewer({ src, initialYaw, label, keys, loading, error, moveForward, moveBack, turnLeft, turnRight, onWalk }: { src: string; initialYaw: number; label: string; keys: string; loading: string; error: string; moveForward: string; moveBack: string; turnLeft: string; turnRight: string; onWalk: (direction: number) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const onWalkRef = useRef(onWalk);
  onWalkRef.current = onWalk;
  const movementTimerRef = useRef<number | null>(null);
  const startWalkRef = useRef<(direction: number) => void>(() => {});
  const stopWalkRef = useRef<() => void>(() => {});
  const sourceRef = useRef(src);
  sourceRef.current = src;
  const sphereRef = useRef<import("three").Mesh | null>(null);
  const textureRef = useRef<import("three").Texture | null>(null);
  const loadPhotoRef = useRef<(source: string) => void>(() => {});
  const loadRequestRef = useRef(0);
  const loadedSourceRef = useRef("");
  const viewRef = useRef({ yaw: initialYaw, pitch: 0, fov: 76 });
  const turnRef = useRef((direction: number) => {});
  const alignViewRef = useRef<(yaw: number) => void>(() => {});
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  startWalkRef.current = (direction) => {
    if (movementTimerRef.current !== null) return;
    onWalkRef.current(direction);
    movementTimerRef.current = window.setInterval(() => onWalkRef.current(direction), 1100);
  };
  stopWalkRef.current = () => {
    if (movementTimerRef.current === null) return;
    window.clearInterval(movementTimerRef.current);
    movementTimerRef.current = null;
  };

  useEffect(() => {
    let cancelled = false;
    const inputEvents = new AbortController();
    let frame = 0;
    let renderer: import("three").WebGLRenderer | undefined;
    let scene: import("three").Scene | undefined;
    let camera: import("three").PerspectiveCamera | undefined;
    let sphere: import("three").Mesh | undefined;
    let observer: ResizeObserver | undefined;
    let canvas: HTMLCanvasElement | undefined;
    let { yaw, pitch, fov } = viewRef.current;
    let lastX = 0;
    let lastY = 0;
    const pointers = new Map<number, { x: number; y: number }>();
    let pinchDistance = 0;

    const init = async () => {
      try {
        const THREE = await import("three");
        const element = host.current;
        if (cancelled || !element) return;

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 1100);
        renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
        element.appendChild(renderer.domElement);
        canvas = renderer.domElement;
        const material = new THREE.MeshBasicMaterial({ side: THREE.BackSide });
        sphere = new THREE.Mesh(new THREE.SphereGeometry(500, 64, 40), material);
        sphereRef.current = sphere;
        sphere.scale.x = -1;
        scene.add(sphere);

        const look = () => {
          if (!camera) return;
          viewRef.current = { yaw, pitch, fov };
          const cp = Math.cos(pitch);
          camera.fov = fov;
          camera.updateProjectionMatrix();
          camera.lookAt(Math.sin(yaw) * cp, Math.sin(pitch), -Math.cos(yaw) * cp);
        };
        const resize = () => {
          if (!element || !renderer || !camera) return;
          const width = element.clientWidth;
          const height = element.clientHeight;
          renderer.setSize(width, height, false);
          camera.aspect = width / Math.max(height, 1);
          camera.updateProjectionMatrix();
          look();
        };
        const onDown = (event: PointerEvent) => {
          element.focus({ preventScroll: true });
          pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
          canvas?.setPointerCapture(event.pointerId);
          lastX = event.clientX;
          lastY = event.clientY;
          if (pointers.size === 2) {
            const [a, b] = [...pointers.values()];
            pinchDistance = Math.hypot(a.x - b.x, a.y - b.y);
          }
        };
        const onMove = (event: PointerEvent) => {
          if (!pointers.has(event.pointerId)) return;
          if (pointers.size > 1) {
            pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
            const [a, b] = [...pointers.values()];
            const distance = Math.hypot(a.x - b.x, a.y - b.y);
            if (pinchDistance) fov = Math.max(38, Math.min(90, fov + (pinchDistance - distance) * 0.06));
            pinchDistance = distance;
          } else {
            yaw -= (event.clientX - lastX) * 0.004;
            pitch = Math.max(-1.35, Math.min(1.35, pitch + (event.clientY - lastY) * 0.004));
            pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
          }
          lastX = event.clientX;
          lastY = event.clientY;
          look();
        };
        const onUp = (event: PointerEvent) => {
          pointers.delete(event.pointerId);
          pinchDistance = 0;
        };
        const onWheel = (event: WheelEvent) => {
          event.preventDefault();
          fov = Math.max(38, Math.min(90, fov + event.deltaY * 0.035));
          look();
        };
        const onKey = (event: KeyboardEvent) => {
          const delta = 0.12;
          if (event.key === "ArrowLeft") yaw -= delta;
          else if (event.key === "ArrowRight") yaw += delta;
          else if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") { event.preventDefault(); startWalkRef.current(1); return; }
          else if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") { event.preventDefault(); startWalkRef.current(-1); return; }
          else if (event.key === "+" || event.key === "=") fov = Math.max(38, fov - 5);
          else if (event.key === "-") fov = Math.min(90, fov + 5);
          else return;
          event.preventDefault();
          look();
        };
        const onKeyUp = (event: KeyboardEvent) => {
          if (["arrowup", "arrowdown", "w", "s"].includes(event.key.toLowerCase())) stopWalkRef.current();
        };
        const onWindowBlur = () => stopWalkRef.current();

        canvas.addEventListener("pointerdown", onDown);
        canvas.addEventListener("pointermove", onMove);
        canvas.addEventListener("pointerup", onUp);
        canvas.addEventListener("pointercancel", onUp);
        canvas.addEventListener("wheel", onWheel, { passive: false });
        element.addEventListener("keydown", onKey);
        window.addEventListener("keyup", onKeyUp, { signal: inputEvents.signal });
        window.addEventListener("blur", onWindowBlur, { signal: inputEvents.signal });
        turnRef.current = (direction) => { yaw += direction * 0.28; look(); };
        alignViewRef.current = (nextYaw) => { yaw = nextYaw; pitch = 0; look(); };
        observer = new ResizeObserver(resize);
        observer.observe(element);
        resize();
        const loader = new THREE.TextureLoader();
        const loadPhoto = (nextSrc: string) => {
          const requestId = ++loadRequestRef.current;
          loader.load(nextSrc, (loaded) => {
            if (cancelled || requestId !== loadRequestRef.current || !sphereRef.current) {
              loaded.dispose();
              return;
            }
            loaded.colorSpace = THREE.SRGBColorSpace;
            const activeSphere = sphereRef.current;
            (activeSphere.material as import("three").MeshBasicMaterial).map = loaded;
            (activeSphere.material as import("three").MeshBasicMaterial).needsUpdate = true;
            textureRef.current?.dispose();
            textureRef.current = loaded;
            loadedSourceRef.current = nextSrc;
            setState("ready");
          }, undefined, () => {
            if (!cancelled && requestId === loadRequestRef.current) setState("error");
          });
        };
        loadPhotoRef.current = loadPhoto;
        loadPhoto(sourceRef.current);
        const draw = () => {
          if (cancelled || !renderer || !scene || !camera) return;
          frame = requestAnimationFrame(draw);
          renderer.render(scene, camera);
        };
        draw();
      } catch {
        if (!cancelled) setState("error");
      }
    };

    setState("loading");
    void init();
    return () => {
      cancelled = true;
      stopWalkRef.current();
      inputEvents.abort();
      cancelAnimationFrame(frame);
      observer?.disconnect();
      loadRequestRef.current += 1;
      loadPhotoRef.current = () => {};
      textureRef.current?.dispose();
      textureRef.current = null;
      sphereRef.current = null;
      sphere?.geometry.dispose();
      (sphere?.material as import("three").Material | undefined)?.dispose();
      renderer?.dispose();
      if (canvas?.parentElement) canvas.parentElement.removeChild(canvas);
    };
  }, []);

  useEffect(() => {
    if (src === loadedSourceRef.current || !sphereRef.current) return;
    setState("loading");
    alignViewRef.current(initialYaw);
    loadPhotoRef.current(src);
  }, [src, initialYaw]);

  return (
    <div className="hr-panorama-stage" ref={host} tabIndex={0} aria-label={label} data-state={state}>
      {state === "loading" && !loadedSourceRef.current && <div className="hr-viewer-state">{loading}</div>}
      {state === "error" && <div className="hr-viewer-state">{error}</div>}
      <span className="hr-viewer-label"><Camera size={14} /> 360°</span>
      <div className="hr-walk-controls" aria-label={label}>
        <button type="button" aria-label={turnLeft} title={turnLeft} onClick={() => turnRef.current(-1)}><ChevronLeft size={17} /></button>
        <button type="button" aria-label={moveBack} title={moveBack} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); startWalkRef.current(-1); }} onPointerUp={() => stopWalkRef.current()} onPointerCancel={() => stopWalkRef.current()} onLostPointerCapture={() => stopWalkRef.current()} onClick={(event) => { if (event.detail === 0) onWalk(-1); }}><ChevronDown size={17} /></button>
        <button type="button" className="hr-walk-forward" aria-label={moveForward} title={moveForward} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); startWalkRef.current(1); }} onPointerUp={() => stopWalkRef.current()} onPointerCancel={() => stopWalkRef.current()} onLostPointerCapture={() => stopWalkRef.current()} onClick={(event) => { if (event.detail === 0) onWalk(1); }}><ChevronUp size={19} /></button>
        <button type="button" aria-label={turnRight} title={turnRight} onClick={() => turnRef.current(1)}><ChevronRight size={17} /></button>
      </div>
      <span className="hr-viewer-help">{keys}</span>
    </div>
  );
}

export default function HumanRightsRoom({
  lang,
  onLanguageChange,
  onBack,
}: {
  lang: Language;
  onLanguageChange: (language: Language) => void;
  onBack: () => void;
}) {
  const t = copy[lang];
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<ResourceKind | "all">("all");
  const [photoIndex, setPhotoIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"game" | "photo">("game");
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase(lang);
    return resources.filter((resource) => {
      const categoryMatches = kind === "all" || resource.kind === kind;
      const text = [resource.title[lang], resource.summary[lang], resource.source].join(" ").toLocaleLowerCase(lang);
      return categoryMatches && (!term || text.includes(term));
    });
  }, [kind, lang, query]);
  const currentPhoto = photoFiles[photoIndex];
  useEffect(() => {
    const previousTitle = document.title;
    document.title = t.title + " | 네북케이터";
    return () => { document.title = previousTitle; };
  }, [t.title]);
  const changePhoto = (direction: number) => {
    setPhotoIndex((current) => Math.max(0, Math.min(photoFiles.length - 1, current + direction)));
  };

  return (
    <main className="hr-page">
      <header className="hr-header">
        <a href={import.meta.env.BASE_URL} className="hr-brand" onClick={(event) => { event.preventDefault(); onBack(); }}>
          <span className="hr-brand-mark"><BookOpen size={19} /></span>
          <span><strong>{t.library}</strong><small>영남대학교 법학도서관</small></span>
        </a>
        <nav className="hr-crumb" aria-label="현재 위치"><span>네북케이터</span><ChevronRight size={14} /><strong>{t.eyebrow.split(" · ").at(-1)}</strong></nav>
        <div className="hr-header-actions">
          <label className="hr-language"><Globe2 size={15} /><span className="sr-only">{t.language}</span><select aria-label={t.language} value={lang} onChange={(event) => onLanguageChange(event.target.value as Language)}><option value="ko">한국어</option><option value="en">English</option><option value="zh">中文</option><option value="vi">Tiếng Việt</option></select></label>
          <button className="hr-back" onClick={onBack}><ArrowLeft size={15} />{t.back}</button>
        </div>
      </header>

      <div className="hr-content">
        <section className="hr-hero" aria-labelledby="hr-title">
          <div className="hr-hero-copy">
            <p className="hr-eyebrow"><span />{t.eyebrow}</p>
            <h1 id="hr-title">{t.title}</h1>
            <p className="hr-intro">{t.intro}</p>
            <a className="hr-scroll-link" href="#hr-sources"><BookOpen size={16} />{t.collection}<ArrowRight size={15} /></a>
          </div>
          <div className="hr-photo-card">
            <div className="hr-photo-heading"><div><span>{t.tour}</span><strong>{(viewMode === "game" ? t.viewGame : t.photo) + " " + String(photoIndex + 1).padStart(2, "0")}</strong></div><div className="hr-photo-actions"><div className="hr-view-mode-switch" role="group" aria-label={t.tour}><button type="button" className={viewMode === "game" ? "active" : ""} aria-pressed={viewMode === "game"} onClick={() => setViewMode("game")}>{t.viewGame}</button><button type="button" className={viewMode === "photo" ? "active" : ""} aria-pressed={viewMode === "photo"} onClick={() => setViewMode("photo")}>{t.viewPhoto}</button></div>{viewMode === "photo" && <div className="hr-photo-arrows"><button aria-label={t.prev} disabled={photoIndex===0} onClick={() => changePhoto(-1)}><ChevronLeft size={18} /></button><button aria-label={t.next} disabled={photoIndex===photoFiles.length-1} onClick={() => changePhoto(1)}><ChevronRight size={18} /></button></div>}</div></div>
            {viewMode === "game" ? <HumanRightsGame label={t.viewGame} keys={t.gameKeys} moveForward={t.moveForward} moveBack={t.moveBack} turnLeft={t.turnLeft} turnRight={t.turnRight} resetLabel={t.resetPosition} initialIndex={photoIndex} onVisit={setPhotoIndex} /> : <PanoramaViewer src={currentPhoto.src} initialYaw={currentPhoto.yaw} label={t.photo + " " + (photoIndex + 1)} keys={t.keys} loading={t.loading} error={t.photoError} moveForward={t.moveForward} moveBack={t.moveBack} turnLeft={t.turnLeft} turnRight={t.turnRight} onWalk={changePhoto} />}
            <div className="hr-walk-route" role="progressbar" aria-label={t.tour} aria-valuemin={1} aria-valuemax={photoFiles.length} aria-valuenow={photoIndex+1}>
              <span className="hr-walk-route-fill" style={{ width: `${(photoIndex/(photoFiles.length-1))*100}%` }} />
              <span className="hr-walk-route-stop hr-walk-route-start" />
              <span className="hr-walk-route-stop hr-walk-route-current" style={{ left: `${(photoIndex/(photoFiles.length-1))*100}%` }} />
              <span className="hr-walk-route-stop hr-walk-route-end" />
            </div>
            <div className="hr-photo-caption"><span>{viewMode === "game" ? t.gameKeys : t.tourHelp}</span><span>{photoIndex + 1} / {photoFiles.length} {t.photoCount}</span></div>
            <p className="hr-photo-note">{viewMode === "game" ? t.gameNote : t.photoNote}</p>
          </div>
        </section>

        <section className="hr-sources" id="hr-sources" aria-labelledby="hr-sources-title">
          <div className="hr-section-heading"><div><p className="hr-eyebrow"><span />{t.eyebrow.split(" · ").at(-1)}</p><h2 id="hr-sources-title">{t.collection}</h2><p>{t.collectionHelp}</p></div><div className="hr-resource-count"><strong>{filtered.length.toString().padStart(2, "0")}</strong><span>{t.result}</span></div></div>
          <div className="hr-browse-tools">
            <label className="hr-search"><Search size={17} /><span className="sr-only">{t.search}</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} /></label>
            <div className="hr-filters" role="group" aria-label={t.collection}>{(["all", ...categories] as const).map((category) => <button key={category} className={kind === category ? "active" : ""} aria-pressed={kind === category} onClick={() => setKind(category)}>{t[category]}</button>)}</div>
          </div>
          <div className="hr-resource-list">
            {filtered.length ? filtered.map((resource, index) => <article className="hr-resource-row" key={resource.id}>
              <span className="hr-resource-index">{String(index + 1).padStart(2, "0")}</span>
              <div className="hr-resource-main"><div className="hr-resource-meta"><span>{t[resource.kind]}</span><span>{resource.source}</span></div><h3>{resource.title[lang]}</h3><p>{resource.summary[lang]}</p></div>
              <a className="hr-resource-open" href={resource.url} target="_blank" rel="noreferrer"><span>{t.open}</span><ArrowUpRight size={17} /></a>
            </article>) : <div className="hr-empty"><Search size={19} /><p>{t.noResults}</p></div>}
          </div>
          <p className="hr-link-note"><ExternalLink size={13} />{t.linkNote}</p>
        </section>

        <aside className="hr-note"><span>{t.noticeTitle}</span><p>{t.tip}</p><a href="https://libs.yu.ac.kr/" target="_blank" rel="noreferrer">영남대학교 법학도서관 <ExternalLink size={13} /></a></aside>
      </div>
      <footer className="hr-footer"><span>네북케이터 · 영남대학교 법학도서관 안내 프로젝트</span><button onClick={onBack}>{t.backTop}<ArrowRight size={14} /></button></footer>
    </main>
  );
}
