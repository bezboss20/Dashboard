import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Language = 'ko' | 'en' | 'ja' | 'ch' | 'es';

export const LANGUAGE_STORAGE_KEY = 'medical-radar-language';

type DictionaryEntry = {
  key: string;            // existing translation key
  ko: string;             // Korean
  en: string;             // English
  ja: string;             // Japanese
  ch: string;             // Simplified Chinese
  es: string;             // Spanish
};

/**
 * IMPORTANT TRANSLATION GUIDELINE (per request)
 * - If an existing term is already a commonly used daily-life / OS-style wording in that language,
 *   keep it as-is conceptually.
 * - If an existing term is unnatural / rarely used in real apps, adjust to what native users actually see.
 *
 * NOTE:
 * This file is a refactor-only drop-in that preserves APIs (`t`, `getLocalizedText`) and behavior,
 * while moving to a single array-based dictionary + O(1) lookup maps built once.
 */
const dictionary: DictionaryEntry[] = [
  // ---------------------------------------------------------------------------
  // Dashboard
  // ---------------------------------------------------------------------------
  { key: 'dashboard.totalPatients', ko: '전체 환자 수', en: 'Total Patients', ja: '全患者数', ch: '患者总数', es: 'Total de Pacientes', },
  { key: 'dashboard.activeAlerts', ko: '현재 알람', en: 'Active Alerts', ja: '現在のアラート', ch: '当前警报', es: 'Alertas Activas', },
  { key: 'dashboard.criticalPatients', ko: '위급 환자', en: 'Critical Patients', ja: '危篤患者', ch: '危重患者', es: 'Pacientes Críticos', },
  { key: 'dashboard.devicesConnected', ko: '연결된 장비', en: 'Devices Connected', ja: '接続デバイス', ch: '已连接设备', es: 'Dispositivos Conectados', },
  { key: 'dashboard.heartRateTitle', ko: '심박수', en: 'Heart Rate', ja: '心拍数', ch: '心率', es: 'Frecuencia Cardíaca', },
  { key: 'dashboard.breathingRateTitle', ko: '호흡수', en: 'Breathing Rate', ja: '呼吸数', ch: '呼吸率', es: 'Frecuencia Respiratoria', },
  { key: 'dashboard.sortedByUrgency', ko: '긴급도 순 정렬', en: 'Sorted by Urgency', ja: '緊急度順', ch: '按紧急度排序', es: 'Ordenado por Urgencia', },
  { key: 'dashboard.heartEmergency', ko: '심박 위급', en: 'Heart Emergency', ja: '心拍緊急', ch: '心率紧急', es: 'Emergencia Cardíaca', },
  { key: 'dashboard.breathingEmergency', ko: '호흡 위급', en: 'Breathing Emergency', ja: '呼吸緊急', ch: '呼吸紧急', es: 'Emergencia Respiratoria', },
  { key: 'dashboard.fallDetected', ko: '낙상 감지', en: 'Fall Detected', ja: '転倒検知', ch: '跌倒检测', es: 'Caída Detectada', },
  { key: 'dashboard.headerTitle', ko: '의료 모니터링 대시보드', en: 'Medical Monitoring Dashboard', ja: '医療モニタリングダッシュボード', ch: '医疗监控仪表板', es: 'Panel de Monitoreo Médico', },
  { key: 'dashboard.headerSubtitle', ko: '환자 모니터링 시스템', en: 'Patient Monitoring System', ja: '患者監視システム', ch: '患者监控系统', es: 'Sistema de Monitoreo de Pacientes', },
  // ---------------------------------------------------------------------------
  // Sidebar
  // ---------------------------------------------------------------------------
  { key: 'sidebar.dashboard', ko: '통합 대시보드', en: 'Dashboard', ja: '統合ダッシュボード', ch: '综合仪表板', es: 'Panel Principal', },
  { key: 'sidebar.patientList', ko: '환자 목록', en: 'Patient List', ja: '患者リスト', ch: '患者列表', es: 'Lista de Pacientes', },
  { key: 'sidebar.alertHistory', ko: '알림 기록', en: 'Alert History', ja: '通知履歴', ch: '警报记录', es: 'Historial de Alertas', },
  { key: 'sidebar.sleepManagement', ko: '수면 관리', en: 'Sleep Management', ja: '睡眠管理', ch: '睡眠管理', es: 'Gestión de Sueño', },
  { key: 'sidebar.registration', ko: '환자 등록', en: 'Patient Registration', ja: '患者登録', ch: '患者注册', es: 'Registro de Pacientes', },
  { key: 'sidebar.militaryGps', ko: 'GPS 위치 추적', en: 'GPS Tracking', ja: 'GPS位置追跡', ch: 'GPS位置追踪', es: 'Rastreo GPS', },
  { key: 'sidebar.settings', ko: '설정', en: 'Settings', ja: '設定', ch: '设置', es: 'Configuración', },
  { key: 'sidebar.userName', ko: '김민준 박사', en: 'Dr. Kim Min-jun', ja: '金民俊 博士', ch: '金民俊 博士', es: 'Dr. Kim Min-jun', },
  { key: 'sidebar.role', ko: '시스템 관리자', en: 'System Administrator', ja: 'システム管理者', ch: '系统管理员', es: 'Administrador del Sistema', },
  { key: 'sidebar.brandTitle', ko: '레이더 모니터', en: 'RADAR MONITOR', ja: 'レーダーモニター', ch: '雷达监控', es: 'MONITOR DE RADAR', },
  { key: 'sidebar.brandSubtitle', ko: '60GHz 시스템', en: '60GHz SYSTEM', ja: '60GHzシステム', ch: '60GHz系统', es: 'SISTEMA 60GHz', },
  // ---------------------------------------------------------------------------
  // Header
  // ---------------------------------------------------------------------------
  { key: 'header.systemOnline', ko: '온라인', en: 'Online', ja: 'オンライン', ch: '在线', es: 'En línea', },
  { key: 'header.systemOffline', ko: '오프라인', en: 'Offline', ja: 'オフライン', ch: '离线', es: 'Desconectado', },
  { key: 'header.exportReport', ko: '보고서 내보내기', en: 'Export Report', ja: 'レポート出力', ch: '导出报告', es: 'Exportar Informe', },
  { key: 'header.liveMonitor', ko: '라이브 모니터', en: 'Live Monitor', ja: 'ライブモニター', ch: '实时监控', es: 'Monitor en Vivo', },
  { key: 'header.realtime', ko: '실시간', en: 'Real-time', ja: 'リアルタイム', ch: '实时', es: 'Tiempo real', },
  // ---------------------------------------------------------------------------
  // Alerts
  // ---------------------------------------------------------------------------
  { key: 'alerts.title', ko: '긴급 알림', en: 'Emergency Alerts', ja: '緊急通知', ch: '紧急通知', es: 'Alertas de Emergencia', },
  { key: 'alerts.description', ko: '과거 발생한 알림 내역을 확인하는 페이지입니다.', en: 'View history of past alerts and notifications.', ja: '過去の通知履歴を確認するページです。', ch: '查看过去警报记录的页面。', es: 'Página para ver el historial de alertas pasadas.', },
  { key: 'alerts.patient', ko: '환자', en: 'Patient', ja: '患者', ch: '患者', es: 'Paciente', },
  { key: 'alerts.value', ko: '수치', en: 'Value', ja: '数値', ch: '数值', es: 'Valor', },
  { key: 'alerts.acknowledge', ko: '확인', en: 'Acknowledge', ja: '確認', ch: '确认', es: 'Reconocer', },
  { key: 'alerts.resolve', ko: '해결', en: 'Resolve', ja: '解決', ch: '解决', es: 'Resolver', },
  { key: 'alerts.currentValue', ko: '현재', en: 'Current', ja: '現在', ch: '当前', es: 'Actual', },
  { key: 'alerts.threshold', ko: '임계값', en: 'Threshold', ja: 'しきい値', ch: '临界值', es: 'Umbral', },
  { key: 'alerts.viewAll', ko: '전체 보기', en: 'View All', ja: 'すべて表示', ch: '查看全部', es: 'Ver Todo', },
  // ---------------------------------------------------------------------------
  // Table
  // ---------------------------------------------------------------------------
  { key: 'table.patientId', ko: '환자 ID', en: 'Patient ID', ja: '患者ID', ch: '患者ID', es: 'ID Paciente', },
  { key: 'table.heartRate', ko: '심박수', en: 'Heart Rate', ja: '心拍数', ch: '心率', es: 'Frec. Cardíaca', },
  { key: 'table.breathingRate', ko: '호흡수', en: 'Breathing Rate', ja: '呼吸数', ch: '呼吸率', es: 'Frec. Respiratoria', },
  { key: 'table.sleepState', ko: '수면 상태', en: 'Sleep State', ja: '睡眠状態', ch: '睡眠状态', es: 'Estado de Sueño', },
  { key: 'table.alertStatus', ko: '알림 상태', en: 'Alert Status', ja: '通知状態', ch: '警报状态', es: 'Estado de Alerta', },
  { key: 'table.deviceStatus', ko: '장비 상태', en: 'Device Status', ja: 'デバイス状態', ch: '设备状态', es: 'Estado de Dispositivo', },
  { key: 'table.lastUpdated', ko: '최근 업데이트', en: 'Last Updated', ja: '最終更新', ch: '最后更新', es: 'Última Actualización', },
  { key: 'table.actions', ko: '작업', en: 'Actions', ja: '操作', ch: '操作', es: 'Acciones', },
  { key: 'table.viewDetails', ko: '상세 보기', en: 'View Details', ja: '詳細表示', ch: '查看详情', es: 'Ver Detalles', },
  { key: 'table.searchPlaceholder', ko: 'ID 또는 이름으로 검색...', en: 'Search by ID or Name...', ja: 'IDまたは名前で検索...', ch: '通过ID或姓名搜索...', es: 'Buscar por ID o Nombre...', },
  { key: 'table.showing', ko: '표시 중', en: 'Showing', ja: '表示中', ch: '显示', es: 'Mostrando', },
  { key: 'table.to', ko: '내용', en: 'to', ja: '〜', ch: '到', es: 'a', },
  { key: 'table.of', ko: '건 중', en: 'of', ja: '/', ch: '/', es: 'de', },
  { key: 'table.patients', ko: '명의 환자', en: 'patients', ja: '人の患者', ch: '名患者', es: 'pacientes', },
  { key: 'table.filteredFrom', ko: '필터링됨 (전체', en: 'filtered from', ja: 'フィルタリング済み (全', ch: '已过滤 (总共', es: 'filtrado de un total de', },
  { key: 'table.total', ko: '총', en: 'total', ja: '人中)', ch: '名中的)', es: ')', },
  { key: 'table.previous', ko: '이전', en: 'Previous', ja: '前へ', ch: '上一页', es: 'Anterior', },
  { key: 'table.next', ko: '다음', en: 'Next', ja: '次へ', ch: '下一页', es: 'Siguiente', },
  { key: 'table.page', ko: '페이지', en: 'Page', ja: 'ページ', ch: '页', es: 'Página', },
  { key: 'table.registrationDate', ko: '등록일', en: 'Registration Date', ja: '登録日', ch: '注册日期', es: 'Fecha de Registro', },
  { key: 'table.overview', ko: '환자 개요', en: 'Patient Overview', ja: '患者概要', ch: '患者概览', es: 'Resumen del Paciente', },
  { key: 'table.realTime', ko: '모든 환자의 실시간 모니터링', en: 'Real-time monitoring of all patients', ja: '全患者のリアルタイム監視', ch: '所有患者的实时监控', es: 'Monitoreo en tiempo real de todos los pacientes', },
  { key: 'table.bloodType', ko: '혈액형', en: 'Blood Type', ja: '血液型', ch: '血型', es: 'Grupo Sanguíneo', },
  // ---------------------------------------------------------------------------
  // Status
  // ---------------------------------------------------------------------------
  { key: 'status.critical', ko: '위급', en: 'Critical', ja: '危篤', ch: '危重', es: 'Crítico', },
  { key: 'status.warning', ko: '경고', en: 'Warning', ja: '警告', ch: '警告', es: 'Advertencia', },
  { key: 'status.caution', ko: '주의', en: 'Caution', ja: '注意', ch: '注意', es: 'Precaución', },
  { key: 'status.normal', ko: '정상', en: 'Normal', ja: '正常', ch: '正常', es: 'Normal', },
  { key: 'status.medium', ko: '주의', en: 'Medium', ja: '注意', ch: '注意', es: 'Medio', },
  { key: 'status.stable', ko: '안정', en: 'Stable', ja: '安定', ch: '稳定', es: 'Estable', },
  { key: 'status.online', ko: '온라인', en: 'Online', ja: 'オンライン', ch: '在线', es: 'En línea', },
  { key: 'status.offline', ko: '오프라인', en: 'Offline', ja: 'オフライン', ch: '离线', es: 'Desconectado', },
  { key: 'status.error', ko: '오류', en: 'Error', ja: 'エラー', ch: '错误', es: 'Error', },
  { key: 'status.maintenance', ko: '점검 중', en: 'Maintenance', ja: 'メンテナンス中', ch: '维护中', es: 'Mantenimiento', },
  { key: 'status.connected', ko: '연결됨', en: 'Connected', ja: '接続済み', ch: '已连接', es: 'Conectado', },
  { key: 'status.disconnected', ko: '연결 끊김', en: 'Disconnected', ja: '切断', ch: '已断开', es: 'Desconectado', },
  { key: 'status.labelPrefix', ko: '상태: ', en: 'Status: ', ja: '状態: ', ch: '状态: ', es: 'Estado: ', },
  // ---------------------------------------------------------------------------
  // Time
  // ---------------------------------------------------------------------------
  { key: 'time.justNow', ko: '방금 전', en: 'Just now', ja: '今', ch: '刚刚', es: 'Recién', },
  { key: 'time.secondsAgo', ko: '초 전', en: 's ago', ja: '秒前', ch: '秒前', es: 's atrás', },
  { key: 'time.minutesAgo', ko: '분 전', en: 'm ago', ja: '分前', ch: '分钟前', es: 'm atrás', },
  { key: 'time.hour', ko: '시간', en: 'hr', ja: '時間', ch: '小时', es: 'h', },
  { key: 'time.minute', ko: '분', en: 'min', ja: '分', ch: '分', es: 'min', },
  // ---------------------------------------------------------------------------
  // Detail
  // ---------------------------------------------------------------------------
  { key: 'detail.recent', ko: '최근', en: 'Last', ja: '最近', ch: '最近', es: 'Reciente', },
  { key: 'detail.baseline', ko: '기준치', en: 'Baseline', ja: '基準値', ch: '基准', es: 'Referencia', },
  { key: 'detail.time', ko: '시간', en: 'Time', ja: '時間', ch: '时间', es: 'Hora', },
  { key: 'detail.value', ko: '수치', en: 'Value', ja: '数値', ch: '数值', es: 'Valor', },
  { key: 'detail.roomUnit', ko: '호', en: 'Room', ja: '号', ch: '号', es: 'Sala', },
  { key: 'detail.back', ko: '이전으로', en: 'Back', ja: '戻る', ch: '返回', es: 'Volver', },
  { key: 'detail.patientInfo', ko: '환자 정보', en: 'Patient Info', ja: '患者情報', ch: '患者信息', es: 'Información del Paciente', },
  { key: 'detail.gender', ko: '성별', en: 'Gender', ja: '性別', ch: '性别', es: 'Género', },
  { key: 'detail.age', ko: '연령', en: 'Age', ja: '年齢', ch: '年龄', es: 'Edad', },
  { key: 'detail.room', ko: '병실', en: 'Room', ja: '病室', ch: '病房', es: 'Habitación', },
  { key: 'detail.admissionDate', ko: '입원일', en: 'Admission Date', ja: '入院日', ch: '入院日期', es: 'Fecha de Ingreso', },
  { key: 'detail.admissionStatus', ko: '입원 일차', en: 'Admission Day', ja: '入院日数', ch: '入院天数', es: 'Días de Ingreso', },
  { key: 'detail.diagnosis', ko: '진단명', en: 'Diagnosis', ja: '診断名', ch: '诊断', es: 'Diagnóstico', },
  { key: 'detail.doctor', ko: '주치의', en: 'Doctor', ja: '主治医', ch: '主治医生', es: 'Médico', },
  { key: 'detail.hr', ko: '심박수', en: 'Heart Rate', ja: '心拍数', ch: '心率', es: 'Frecuencia Cardíaca', },
  { key: 'detail.stress', ko: '스트레스', en: 'Stress Index', ja: 'ストレス', ch: '压力指数', es: 'Índice de Estrés', },
  { key: 'detail.rr', ko: '호흡수', en: 'Breathing Rate', ja: '呼吸数', ch: '呼吸率', es: 'Frecuencia Respiratoria', },
  { key: 'detail.sleepEfficiency', ko: '수면 효율', en: 'Sleep Efficiency', ja: '睡眠効率', ch: '睡眠效率', es: 'Eficiencia del Sueño', },
  { key: 'detail.connection', ko: '연결 상태', en: 'Connection Status', ja: '接続状態', ch: '连接状态', es: 'Estado de Conexión', },
  { key: 'detail.optimized', ko: '최적화', en: 'Optimized', ja: '最適化', ch: '已优化', es: 'Optimizado', },
  { key: 'detail.sleepAnalysis', ko: '수면 상세 분석', en: 'Sleep Record Analysis', ja: '睡眠詳細分析', ch: '睡眠详细分析', es: 'Análisis de Sueño', },
  { key: 'detail.hrMonitoring', ko: '심박수 모니터링', en: 'Heart Rate Monitoring', ja: '心拍数モニタリング', ch: '心率监控', es: 'Monitoreo de Frecuencia Cardíaca', },
  { key: 'detail.rrMonitoring', ko: '호흡수 모니터링', en: 'Breathing Rate Monitoring', ja: '呼吸数モニタリング', ch: '呼吸率监控', es: 'Monitoreo de Frecuencia Respiratoria', },
  { key: 'detail.detailedRecord', ko: '환자 상세 기록', en: 'Detailed Record', ja: '患者詳細記録', ch: '患者详细记录', es: 'Registro Detallado', },
  { key: 'detail.address', ko: '주소', en: 'Address', ja: '住所', ch: '地址', es: 'Dirección', },
  { key: 'detail.emergencyContact', ko: '비상 연락처', en: 'Emergency Contact', ja: '緊急連絡先', ch: '紧急联系人', es: 'Contacto de Emergencia', },
  { key: 'detail.allergies', ko: '알레르기', en: 'Allergies', ja: 'アレルギー', ch: '过敏', es: 'Alergias', },
  { key: 'detail.clinicalFindings', ko: '임상 소견', en: 'Clinical Findings', ja: '臨床所見', ch: '临床发现', es: 'Hallazgos Clínicos', },
  { key: 'detail.underlyingDisease', ko: '기저 질환', en: 'Underlying Disease', ja: '基礎疾患', ch: '基础疾病', es: 'Enfermedad Subyacente', },
  { key: 'detail.medications', ko: '복용 약물', en: 'Medications', ja: '服用薬', ch: '服用药物', es: 'Medicamentos', },
  { key: 'detail.diet', ko: '식단', en: 'Diet', ja: '食事', ch: '饮食', es: 'Dieta', },
  { key: 'detail.memo', ko: '메모', en: 'Memo', ja: 'メモ', ch: '备注', es: 'Memo', },
  { key: 'detail.alerts', ko: '위험 알림', en: 'Emergency Alerts', ja: '危険通知', ch: '危险通知', es: 'Alertas de Riesgo', },
  { key: 'detail.deepSleep', ko: '깊은 수면', en: 'Deep Sleep', ja: '深い睡眠', ch: '深度睡眠', es: 'Sueño Profundo', },
  { key: 'detail.lightSleep', ko: '얕은 수면', en: 'Light Sleep', ja: '浅い睡眠', ch: '浅度睡眠', es: 'Sueño Ligero', },
  { key: 'detail.remSleep', ko: 'REM 수면', en: 'REM Sleep', ja: 'レム睡眠', ch: '快动眼睡眠', es: 'Sueño REM', },
  { key: 'detail.awake', ko: '깨어남', en: 'Awake', ja: '覚醒', ch: '醒来', es: 'Despierto', },
  { key: 'detail.days', ko: '일', en: 'days', ja: '日', ch: '天', es: 'días', },
  { key: 'detail.yearsOld', ko: '세', en: 'yo', ja: '歳', ch: '岁', es: 'años', },
  { key: 'detail.roomNumber', ko: '호', en: '', ja: '号', ch: '号', es: '', },
  { key: 'detail.observe', ko: '관찰 필요', en: 'Needs Observation', ja: '観察必要', ch: '需要观察', es: 'Necesita Observación', },
  { key: 'detail.none', ko: '없음', en: 'None', ja: 'なし', ch: '无', es: 'Ninguno', },
  { key: 'detail.checkMedication', ko: '처방 내역 확인 필요', en: 'Contact Pharmacy', ja: '処方内容の確認が必要', ch: '需要确认处方', es: 'Revisar prescripción', },
  { key: 'detail.generalDiet', ko: '일반식 (병원식)', en: 'General Diet', ja: '一般食', ch: '普通饮食', es: 'Dieta General', },
  { key: 'detail.noSpecialMemo', ko: '특이사항 없음', en: 'No special notes', ja: '特記事項なし', ch: '无特殊备注', es: 'Sin notas especiales', },
  { key: 'detail.nurse', ko: '담당 간호사', en: 'Nurse', ja: '担当看護師', ch: '护士', es: 'Enfermera', },
  { key: 'detail.guardian', ko: '보호자', en: 'Guardian', ja: '保護者', ch: '监护人', es: 'Tutor/Guardián', },
  // ---------------------------------------------------------------------------
  // Gender
  // ---------------------------------------------------------------------------
  { key: 'gender.male', ko: '남', en: 'Male', ja: '男', ch: '男', es: 'Masculino', },
  { key: 'gender.female', ko: '여', en: 'Female', ja: '女', ch: '女', es: 'Femenino', },
  // ---------------------------------------------------------------------------
  // Gps
  // ---------------------------------------------------------------------------
  { key: 'gps.title', ko: 'GPS 위치 추적', en: 'GPS Tracking', ja: 'GPS位置追跡', ch: 'GPS位置追踪', es: 'Rastreo GPS', },
  { key: 'gps.description', ko: '연결된 60GHz 장비의 실시간 위치를 확인합니다.', en: 'Real-time location monitoring of connected 60GHz devices.', ja: '接続された60GHzデバイスのリアルタイム位置を確認します。', ch: '实时监控已连接的60GHz设备位置。', es: 'Monitoreo de ubicación en tiempo real de los dispositivos de 60GHz conectados.', },
  // ---------------------------------------------------------------------------
  // Registration
  // ---------------------------------------------------------------------------
  { key: 'registration.title', ko: '환자 정보 등록', en: 'Patient Registration', ja: '患者情報の登録', ch: '患者信息注册', es: 'Registro de Información del Paciente', },
  { key: 'registration.description', ko: '새로운 환자 또는 장비 정보를 등록하는 페이지입니다.', en: 'Register new patient or equipment information.', ja: '新しい患者またはデバイス情報の登録ページです。', ch: '注册新患者或设备信息的页面।', es: 'Página para registrar nuevos pacientes o equipos.', },
  { key: 'registration.basicInfo', ko: '기본 정보', en: 'Basic Information', ja: '基本情報', ch: '基本信息', es: 'Información Básica', },
  { key: 'registration.patientName', ko: '환자명', en: 'Patient Name', ja: '患者名', ch: '患者姓名', es: 'Nombre del Paciente', },
  { key: 'registration.dob', ko: '생년월일', en: 'Date of Birth', ja: '生年月日', ch: '出生日期', es: 'Fecha de Nacimiento', },
  { key: 'registration.gender', ko: '성별', en: 'Gender', ja: '性別', ch: '性别', es: 'Género', },
  { key: 'registration.select', ko: '선택하세요', en: 'Select...', ja: '選択してください', ch: '请选择', es: 'Seleccione...', },
  { key: 'registration.male', ko: '남성', en: 'Male', ja: '男性', ch: '男性', es: 'Masculino', },
  { key: 'registration.female', ko: '여성', en: 'Female', ja: '女性', ch: '女性', es: 'Femenino', },
  { key: 'registration.contact', ko: '환자 연락처', en: 'Patient Contact', ja: '患者連絡先', ch: '患者联系方式', es: 'Contacto del Paciente', },
  { key: 'registration.patientNameEn', ko: '성함 (영어)', en: 'Patient Name (EN)', ja: '氏名 (英語)', ch: '姓名 (英文)', es: 'Nombre (EN)', },
  { key: 'registration.patientCode', ko: '환자 코드', en: 'Patient Code', ja: '患者コード', ch: '患者代码', es: 'Código del Paciente', },
  { key: 'registration.emergencyPhone', ko: '비상 연락처', en: 'Emergency Contact', ja: '緊急連絡先', ch: '紧急联系人', es: 'Contacto de Emergencia', },
  { key: 'registration.wardId', ko: '병동 ID', en: 'Ward ID', ja: '病棟ID', ch: '病房 ID', es: 'ID de Pabellón', },
  { key: 'registration.roomNumber', ko: '병실 호수', en: 'Room Number', ja: '病室番号', ch: '病房号', es: 'Número de Habitación', },
  { key: 'registration.bedNumber', ko: '병상 번호', en: 'Bed Number', ja: 'ベッド番号', ch: '床位号', es: 'Número de Cama', },
  { key: 'registration.admissionDate', ko: '입원일', en: 'Admission Date', ja: '入院日', ch: '入院日期', es: 'Fecha de Ingreso', },
  { key: 'registration.status', ko: '상태', en: 'Status', ja: '状態', ch: '状态', es: 'Estado', },
  { key: 'registration.roomWard', ko: '객실', en: 'Room/Ward', ja: '客室', ch: '客房', es: 'Habitación', },
  { key: 'registration.deviceInfo', ko: '장치 정보', en: 'Device Information', ja: 'デバイス情報', ch: '设备信息', es: 'Información del Dispositivo', },
  { key: 'registration.deviceId', ko: '장치 ID', en: 'Device ID', ja: 'デバイスID', ch: '设备ID', es: 'ID del Dispositivo', },
  { key: 'registration.sensorType', ko: '센서 유형', en: 'Sensor Type', ja: 'センサータイプ', ch: '传感器类型', es: 'Tipo de Sensor', },
  { key: 'registration.radar60ghz', ko: '60GHz 레이더', en: '60GHz Radar', ja: '60GHzレーダー', ch: '60GHz雷达', es: 'Radar 60GHz', },
  { key: 'registration.careFacility', ko: '관리 시설', en: 'Care Facility', ja: '管理施設', ch: '管理设施', es: 'Instalación de Cuidado', },
  { key: 'registration.facilityName', ko: '시설명', en: 'Facility Name', ja: '施設名', ch: '设施名称', es: 'Nombre de la Instalación', },
  { key: 'registration.registrationDate', ko: '등록일', en: 'Registration Date', ja: '登録日', ch: '注册日期', es: 'Fecha de Registro', },
  { key: 'registration.reset', ko: '초기화', en: 'Reset', ja: '初期化', ch: '重置', es: 'Reiniciar', },
  { key: 'registration.submit', ko: '등록하기', en: 'Register Patient', ja: '登録する', ch: '注册', es: 'Registrar', },
  { key: 'registration.success', ko: '환자 정보가 등록되었습니다.', en: 'Patient info registered.', ja: '患者情報が登録されました。', ch: '患者信息已注册。', es: 'Información del paciente registrada.', },
  // ---------------------------------------------------------------------------
  // Sleep
  // ---------------------------------------------------------------------------
  { key: 'sleep.title', ko: '수면 관리', en: 'Sleep Management', ja: '睡眠管理', ch: '睡眠管理', es: 'Gestión del Sueño', },
  { key: 'sleep.description', ko: '환자별 수면 패턴 및 품질 분석 페이지입니다.', en: 'Analyze sleep patterns and quality per patient.', ja: '患者別睡眠パターンおよび品質分析ページです。', ch: '按患者分析睡眠模式和质量的页面。', es: 'Análisis de patrones y calidad del sueño.', },
  { key: 'sleep.sessionSummary', ko: '수면 요약', en: 'Sleep Session Summary', ja: '睡眠サマリー', ch: '睡眠摘要', es: 'Resumen de Sueño', },
  { key: 'sleep.lastNight', ko: '지난 밤', en: 'Last Night', ja: '昨夜', ch: '昨晚', es: 'Anoche', },
  { key: 'sleep.totalSleep', ko: '총 수면 시간', en: 'TOTAL SLEEP', ja: '総睡眠時間', ch: '总睡眠时间', es: 'SUEÑO TOTAL', },
  { key: 'sleep.goal', ko: '목표', en: 'Goal', ja: '目標', ch: '目标', es: 'Meta', },
  { key: 'sleep.efficiency', ko: '수면 효율', en: 'EFFICIENCY', ja: '睡眠効率', ch: '睡眠效率', es: 'EFICIENCIA', },
  { key: 'sleep.interruptions', ko: '깨어남 횟수', en: 'INTERRUPTIONS', ja: '中途覚醒', ch: '醒来次数', es: 'INTERRUPCIONES', },
  { key: 'sleep.latency', ko: '입면 시간', en: 'LATENCY', ja: '入眠潜時', ch: '入睡潜伏期', es: 'LATENCIA', },
  { key: 'sleep.normalRange', ko: '정상 범위', en: 'Normal Range', ja: '正常範囲', ch: '正常范围', es: 'Rango Normal', },
  { key: 'sleep.timesWokenUp', ko: '깨어난 횟수', en: 'Times woken up', ja: '覚醒回数', ch: '醒来次数', es: 'Veces que despertó', },
  { key: 'sleep.timeToFallAsleep', ko: '잠들 때까지 걸린 시간', en: 'Time to fall asleep', ja: '入眠時間', ch: '入睡所需时间', es: 'Tiempo para dormir', },
  { key: 'sleep.stagesDistribution', ko: '수면 단계 구성', en: 'Sleep Stages Distribution', ja: '睡眠段階構成', ch: '睡眠阶段分布', es: 'Distribución de etapas', },
  { key: 'sleep.totalTimeInBed', ko: '총 침대 체류 시간', en: 'Total time in bed', ja: '総就床時間', ch: '总在床时间', es: 'Tiempo total en cama', },
  { key: 'sleep.overallSleepScore', ko: '종합 수면 점수', en: 'Overall Sleep Score', ja: '総合睡眠スコア', ch: '综合睡眠评分', es: 'Puntuación de Sueño', },
  { key: 'sleep.excellent', ko: '우수', en: 'Excellent', ja: '非常に良い', ch: '优秀', es: 'Excelente', },
  { key: 'sleep.fair', ko: '보통', en: 'Fair', ja: '普通', ch: '一般', es: 'Regular', },
  { key: 'sleep.poor', ko: '저조', en: 'Poor', ja: '低い', ch: '较差', es: 'Pobre', },
  { key: 'sleep.avgComparedToUsers', ko: '동일 연령대 평균 대비 수치입니다.', en: 'Average compared to users in this age group.', ja: '同年齢層の平均との比較値です。', ch: '与同年龄段平均水平的对比值。', es: 'Comparación con el promedio de su edad.', },
  { key: 'sleep.hypnogram', ko: '수면 단계 그래프', en: 'Sleep Hypnogram', ja: '睡眠段階グラフ', ch: '睡眠阶段图表', es: 'Hipnograma de Sueño', },
  { key: 'sleep.timeInfo', ko: '수면 시간 정보', en: 'Sleep Time Info', ja: '睡眠時間情報', ch: '睡眠时间정보', es: 'Info de Horarios', },
  { key: 'sleep.bedIn', ko: '취침 준비', en: 'Bed in', ja: '就床', ch: '上床', es: 'A la cama', },
  { key: 'sleep.sleep', ko: '수면 시작', en: 'Sleep', ja: '入眠', ch: '入睡', es: 'Dormido', },
  { key: 'sleep.wakeUp', ko: '기상 시간', en: 'Wake up', ja: '起床', ch: '醒来', es: 'Despierto', },
  { key: 'sleep.bedOut', ko: '침대 이탈', en: 'Bed out', ja: '離床', ch: '起床', es: 'Levantado', },
  { key: 'sleep.trend', ko: '수면 트렌드', en: 'Sleep Trend', ja: '睡眠トレンド', ch: '睡眠趋势', es: 'Tendencia de Sueño', },
  { key: 'sleep.day', ko: '일별', en: 'Day', ja: '日別', ch: '每日', es: 'Diario', },
  { key: 'sleep.weekly', ko: '주간', en: 'Weekly', ja: '週間', ch: '每周', es: 'Semanal', },
  { key: 'sleep.monthly', ko: '월간', en: 'Monthly', ja: '月間', ch: '每月', es: 'Mensual', },
  { key: 'sleep.vitalsCorrelation', ko: '활력 징후 상관관계', en: 'Vitals Correlation', ja: 'バイタルサイン相関', ch: '生命体征相关性', es: 'Correlación de Vitales', },
  { key: 'sleep.avgHr', ko: '평균 심박수', en: 'Avg HR', ja: '平均心拍数', ch: '平均心率', es: 'FC Promedio', },
  { key: 'sleep.avgResp', ko: '평균 호흡수', en: 'Avg Resp', ja: '平均呼吸数', ch: '平均呼吸率', es: 'FR Promedio', },
  { key: 'sleep.avgHrv', ko: '평균 심박수변동', en: 'Avg HRV', ja: '平均心拍変動', ch: '平均心率变异', es: 'VFC Promedio', },
  { key: 'sleep.avgSpO2', ko: '평균 산소포화도', en: 'Avg SpO2', ja: '平均SpO2', ch: '平均血氧饱和度', es: 'SpO2 Promedio', },
  // ---------------------------------------------------------------------------
  // Settings
  // ---------------------------------------------------------------------------
  { key: 'settings.title', ko: '설정', en: 'Settings', ja: '設定', ch: '设置', es: 'Configuración', },
  { key: 'settings.subtitle', ko: '시스템 환경 설정', en: 'System Preferences', ja: 'システム設定', ch: '系统偏好设置', es: 'Preferencias del Sistema', },
  { key: 'settings.language', ko: '언어 설정', en: 'Language', ja: '言語設定', ch: '语言设置', es: 'Idioma', },
  { key: 'settings.selectLanguage', ko: '언어 선택', en: 'Select language', ja: '言語を選択', ch: '选择语言', es: 'Seleccionar idioma', },
  { key: 'settings.description', ko: '시스템 환경 설정을 변경하는 페이지입니다.', en: 'Configure system environment settings.', ja: 'システム環境設定を変更するページです。', ch: '配置系统环境设置的页面。', es: 'Configurar preferencias del entorno.', },
  { key: 'settings.langUpdateNote', ko: '언어를 변경하면 전체 앱의 인터페이스가 선택한 언어로 변경됩니다.', en: 'Changing the language will update the entire app interface to the selected language.', ja: '言語を変更すると、アプリ全体のインターフェースが選択した言語に変更されます。', ch: '更改语言将把整个应用程序界面更新为所选语言。', es: 'Cambiar el idioma actualizará toda la interfaz de la aplicación al idioma seleccionado.', },
  // ---------------------------------------------------------------------------
  // Common
  // ---------------------------------------------------------------------------
  { key: 'common.save', ko: '저장', en: 'Save', ja: '保存', ch: '保存', es: 'Guardar', },
  { key: 'common.cancel', ko: '취소', en: 'Cancel', ja: 'キャンセル', ch: '取消', es: 'Cancelar', },
  { key: 'common.today', ko: '오늘', en: 'Today', ja: '今日', ch: '今天', es: 'Hoy', },
  { key: 'common.reset', ko: '초기화', en: 'Reset', ja: 'リセット', ch: '重置', es: 'Reiniciar', },
  { key: 'common.collapse', ko: '접기', en: 'Collapse', ja: '折りたたむ', ch: '折叠', es: 'Contraer', },
  { key: 'common.bpm', ko: 'BPM', en: 'BPM', ja: 'BPM', ch: 'BPM', es: 'BPM', },
  { key: 'common.rpm', ko: 'RPM', en: 'RPM', ja: 'RPM', ch: 'RPM', es: 'RPM', },
  { key: 'common.close', ko: '창 닫기', en: 'Close View', ja: '閉じる', ch: '关闭', es: 'Cerrar', },
  // ---------------------------------------------------------------------------
  // Error
  // ---------------------------------------------------------------------------
  { key: 'error.loadingData', ko: '데이터를 불러오는 중 오류가 발생했습니다.', en: 'An error occurred while loading data.', ja: 'データの読み込み中にエラーが発生しました。', ch: '加载数据时出错。', es: 'Error al cargar los datos.', },
  { key: 'error.patientNotFound', ko: '환자 정보를 찾을 수 없습니다.', en: 'Patient information not found.', ja: '患者情報が見つかりません。', ch: '找不到患者信息。', es: 'Paciente no encontrado.', },
  // ---------------------------------------------------------------------------
  // Notifications
  // ---------------------------------------------------------------------------
  { key: 'notifications.table.date', ko: '날짜', en: 'Date', ja: '日付', ch: '日期', es: 'Fecha', },
  { key: 'notifications.table.system', ko: '시스템', en: 'System', ja: 'システム', ch: '系统', es: 'Sistema', },
  { key: 'notifications.table.patientId', ko: '환자 ID', en: 'Patient ID', ja: '患者ID', ch: '患者ID', es: 'ID Paciente', },
  { key: 'notifications.table.category', ko: '분류', en: 'Category', ja: '分類', ch: '分类', es: 'Categoría', },
  { key: 'notifications.table.type', ko: '유형', en: 'Type', ja: 'タイプ', ch: '类型', es: 'Tipo', },
  { key: 'notifications.table.status', ko: '상태', en: 'Status', ja: '状態', ch: '状态', es: 'Estado', },
  { key: 'notifications.table.details', ko: '상세 내용', en: 'Details', ja: '詳細内容', ch: '详细内容', es: 'Detalles', },
  { key: 'notifications.table.noLogs', ko: '표시할 로그가 없습니다.', en: 'No logs to display.', ja: '表示するログはありません。', ch: '没有可显示的日志。', es: 'No hay registros para mostrar.', },
  { key: 'notifications.table.success', ko: '성공', en: 'Success', ja: '成功', ch: '成功', es: 'Éxito', },
  { key: 'notifications.table.fail', ko: '실패', en: 'Fail', ja: '失敗', ch: '失败', es: 'Fallo', },
  { key: 'notifications.history', ko: '알림 기록', en: 'Notification History', ja: 'アラート履歴', ch: '警报记录', es: 'Historial de Notificaciones', },
  { key: 'notifications.logs', ko: '로그', en: 'Notification Logs', ja: 'ログ', ch: '日志', es: 'Registros de Notificaciones', },
  // ---------------------------------------------------------------------------
  // Filter
  // ---------------------------------------------------------------------------
  { key: 'filter.allStatus', ko: '전체 상태', en: 'All Status', ja: '全状態', ch: '全部状态', es: 'Todos los Estados', },
  { key: 'filter.active', ko: '입원중', en: 'Hospitalized', ja: '入院中', ch: '住院中', es: 'Hospitalizado', },
  { key: 'filter.active.mobile', ko: '입원중', en: 'Hosp.', ja: '入院中', ch: '住院中', es: 'Hosp.', },
  { key: 'filter.discharged', ko: '퇴원', en: 'Discharged', ja: '退院', ch: '出院', es: 'Dado de alta', },
  { key: 'filter.discharged.mobile', ko: '퇴원', en: 'Disc.', ja: '退院', ch: '出院', es: 'Alta', },
  { key: 'filter.transferred', ko: '전원', en: 'Transferred', ja: '転院', ch: '转院', es: 'Trasladado', },
  { key: 'filter.transferred.mobile', ko: '전원', en: 'Trans.', ja: '転院', ch: '转院', es: 'Traslad.', },
  { key: 'filter.searchPlaceholder', ko: '이름 또는 ID로 검색', en: 'Search by name or ID', ja: '名前またはIDで検索', ch: '按姓名或ID搜索', es: 'Buscar por nombre o ID', },
  { key: 'filter.statusActive', ko: 'ACTIVE', en: 'ACTIVE', ja: 'ACTIVE', ch: 'ACTIVE', es: 'ACTIVE', },
  { key: 'filter.statusDischarged', ko: 'DISCHARGED', en: 'DISCHARGED', ja: 'DISCHARGED', ch: 'DISCHARGED', es: 'DISCHARGED', },
  { key: 'filter.statusTransferred', ko: 'TRANSFERRED', en: 'TRANSFERRED', ja: 'TRANSFERRED', ch: 'TRANSFERRED', es: 'TRANSFERRED', },
  // ---------------------------------------------------------------------------
  // Table
  // ---------------------------------------------------------------------------
  { key: 'table.sleep', ko: '수면', en: 'Sleep', ja: '睡眠', ch: '睡眠', es: 'Sueño', },
  { key: 'table.openSleepPage', ko: '수면 페이지 열기', en: 'Open Sleep Page', ja: '睡眠ページを開く', ch: '打开睡眠页面', es: 'Abrir Página de Sueño', },
  { key: 'table.viewPatientDetails', ko: '환자 상세 보기', en: 'View Patient Details', ja: '患者詳細を表示', ch: '查看患者详情', es: 'Ver Detalles del Paciente', },
  // ---------------------------------------------------------------------------
  // Patientstatus
  // ---------------------------------------------------------------------------
  { key: 'patientStatus.label', ko: '환자 상태', en: 'Patient Status', ja: '患者状態', ch: '患者状态', es: 'Estado del Paciente', },
  { key: 'patientStatus.active', ko: '입원중', en: 'Hospitalized', ja: '入院中', ch: '住院中', es: 'Hospitalizado', },
  { key: 'patientStatus.discharged', ko: '퇴원', en: 'Discharged', ja: '退院', ch: '出院', es: 'Dado de alta', },
  { key: 'patientStatus.transferred', ko: '전원', en: 'Transferred', ja: '転院', ch: '转院', es: 'Trasladado', },
  { key: 'patientStatus.updateSuccess', ko: '상태가 업데이트되었습니다', en: 'Status updated successfully', ja: '状態が更新されました', ch: '状态已更新', es: 'Estado actualizado correctamente', },
  // ---------------------------------------------------------------------------
  // Notifications
  // ---------------------------------------------------------------------------
  { key: 'notifications.system.radar', ko: '레이더 모니터링 시스템', en: 'Radar Monitoring System', ja: 'レーダー監視システム', ch: '雷达监控系统', es: 'Sistema de Monitoreo por Radar', },
  { key: 'notifications.system.status', ko: '시스템 상태 점검', en: 'System Status Check', ja: 'システム状態チェック', ch: '系统状态检查', es: 'Verificación de Estado del Sistema', },
  { key: 'notifications.system.backup', ko: '데이터 백업 서비스', en: 'Data Backup Service', ja: 'データバックアップサービス', ch: '数据备份服务', es: 'Servicio de Respaldo de Datos', },
  { key: 'notifications.category.hr', ko: '심박수 모니터링', en: 'Heart Rate Monitoring', ja: '心拍数モニタリング', ch: '心率监控', es: 'Monitoreo de Frecuencia Cardíaca', },
  { key: 'notifications.category.rr', ko: '호흡 모니터링', en: 'Breathing Monitoring', ja: '呼吸数モニタリング', ch: '呼吸监控', es: 'Monitoreo de Respiración', },
  { key: 'notifications.category.fall', ko: '낙상 감지', en: 'Fall Detection', ja: '転倒検知', ch: '跌倒检测', es: 'Detección de Caídas', },
  { key: 'notifications.category.sysStatus', ko: '시스템 관리/상태 확인', en: 'System Mgmt/Status', ja: 'システム管理/状態確認', ch: '系统管理/状态检查', es: 'Gestión/Estado del Sistema', },
  { key: 'notifications.category.sysBackup', ko: '시스템 관리/백업', en: 'System Mgmt/Backup', ja: 'システム管理/バックアップ', ch: '系统管理/备份', es: 'Gestión/Respaldo del Sistema', },
  { key: 'notifications.category.monitoring', ko: '모니터링', en: 'Monitoring', ja: 'モニタリング', ch: '监控', es: 'Monitoreo', },
  { key: 'notifications.category.registration', ko: '환자 등록/정보 생성', en: 'Patient Reg/Info', ja: '患者登録/情報生成', ch: '患者注册/信息生成', es: 'Registro/Información de Paciente', },
  { key: 'notifications.category.emergency', ko: '긴급 알림', en: 'Emergency Alert', ja: '緊急通知', ch: '紧急通知', es: 'Alerta de Emergencia', },
  { key: 'notifications.category.warning', ko: '경고', en: 'Warning', ja: '警告', ch: '警告', es: 'Advertencia', },
  { key: 'notifications.type.hrCritical', ko: '위급_심박수', en: 'HR_CRITICAL', ja: '緊急_心拍数', ch: '危急_心率', es: 'FC_CRÍTICA', },
  { key: 'notifications.type.hrWarning', ko: '경고_심박수', en: 'HR_WARNING', ja: '警告_心拍数', ch: '警告_心率', es: 'FC_ADVERTENCIA', },
  { key: 'notifications.type.hrCaution', ko: '주의_심박수', en: 'HR_CAUTION', ja: '注意_心拍数', ch: '注意_心率', es: 'FC_PRECAUCIÓN', },
  { key: 'notifications.type.rrCritical', ko: '위급_호흡수', en: 'RR_CRITICAL', ja: '緊急_呼吸数', ch: '危急_呼吸', es: 'FR_CRÍTICA', },
  { key: 'notifications.type.rrWarning', ko: '경고_호흡수', en: 'RR_WARNING', ja: '警告_呼吸数', ch: '警告_呼吸', es: 'FR_ADVERTENCIA', },
  { key: 'notifications.type.rrCaution', ko: '주의_호흡수', en: 'RR_CAUTION', ja: '注意_呼吸数', ch: '注意_呼吸', es: 'FR_PRECAUCIÓN', },
  { key: 'notifications.type.fallDetected', ko: '낙상_감지', en: 'FALL_DETECTED', ja: '転倒_検知', ch: '跌倒_检测', es: 'CAÍDA_DETECTADA', },
  { key: 'notifications.type.event', ko: '알림_이벤트', en: 'ALERT_EVENT', ja: '通知_イベント', ch: '警报_事件', es: 'EVENTO_DE_ALERTA', },
  { key: 'notifications.type.sysCheck', ko: '시스템_상태_점검', en: 'SYSTEM_CHECK', ja: 'システム_状態_チェック', ch: '系统_状态_检查', es: 'CHEQUEO_DEL_SISTEMA', },
  { key: 'notifications.type.backup', ko: '데이터_백업', en: 'DATA_BACKUP', ja: 'データ_バックアップ', ch: '数据_备份', es: 'RESPALDO_DE_DATOS', },
  { key: 'notifications.type.patientReg', ko: '환자_등록', en: 'PATIENT_REG', ja: '患者_登録', ch: '患者_注册', es: 'REGISTRO_DE_PACIENTE', },
  { key: 'notifications.details.hrHigh', ko: '심박수가 위험 기준치를 초과했습니다', en: 'Heart rate exceeded danger threshold', ja: '心拍数が危険基準値を超えました', ch: '心率超过危险临界值', es: 'La frecuencia cardíaca superó el umbral de peligro', },
  { key: 'notifications.details.rrLow', ko: '호흡수가 안전 기준치 이하입니다', en: 'Breathing rate below safety threshold', ja: '呼吸数が安全基準値を下回っています', ch: '呼吸率低于安全临界值', es: 'La frecuencia respiratoria está por debajo del umbral de seguridad', },
  { key: 'notifications.details.fallEmergency', ko: '낙상 감지됨, 응급 프로토콜 시작', en: 'Fall detected, starting emergency protocol', ja: '転倒が検知されました。緊急プロトコルを開始します', ch: '检测到跌倒，启动应急预案', es: 'Caída detectada, iniciando protocolo de emergencia', },
  { key: 'notifications.details.ack', ko: '알림 확인됨', en: 'Alert acknowledged', ja: '通知を確認しました', ch: '警报已确认', es: 'Alerta reconocida', },
  { key: 'notifications.details.resolved', ko: '알림 해결됨', en: 'Alert resolved', ja: '通知を解決しました', ch: '警报已解决', es: 'Alerta resuelta', },
  { key: 'notifications.details.sysNormal', ko: '모든 시스템 정상 작동 중', en: 'All systems operating normally', ja: 'すべてのシステムが正常に動作しています', ch: '所有系统运行正常', es: 'Todos los sistemas funcionan normalmente', },
  { key: 'notifications.details.backupFail', ko: '백업 실패 - 연결 시간 초과', en: 'Backup failed - Connection timeout', ja: 'バックアップ失敗 - 接続タイムアウト', ch: '备份失败 - 连接超时', es: 'Fallo en respaldo - Tiempo de espera agotado', },
  { key: 'notifications.details.regSuccess', ko: '새 환자가 성공적으로 등록되었습니다', en: 'New patient registered successfully', ja: '新しい患者が正常に登録されました', ch: '新患者注册成功', es: 'Nuevo paciente registrado con éxito', },
  // ---------------------------------------------------------------------------
  // Monitoring
  // ---------------------------------------------------------------------------
  { key: 'monitoring.range.5m', ko: '5분', en: '5m', ja: '5分', ch: '5分钟', es: '5m', },
  { key: 'monitoring.range.15m', ko: '15분', en: '15m', ja: '15分', ch: '15分钟', es: '15m', },
  { key: 'monitoring.range.30m', ko: '30분', en: '30m', ja: '30分', ch: '30分钟', es: '30m', },
  { key: 'monitoring.range.1h', ko: '1시간', en: '1h', ja: '1時間', ch: '1小时', es: '1h', },
  { key: 'monitoring.range.6h', ko: '6시간', en: '6h', ja: '6時間', ch: '6小时', es: '6h', },
  { key: 'monitoring.range.24h', ko: '24시간', en: '24h', ja: '24時間', ch: '24小时', es: '24h', },
  // ---------------------------------------------------------------------------
  // Gps
  // ---------------------------------------------------------------------------
  { key: 'gps.searchPlaceholder', ko: '환자명 / 환자ID / 장비ID 검색...', en: 'Search patient / ID / Device...', ja: '患者名 / 患者ID / デバイスIDを検索...', ch: '通过患者姓名 / ID / 设备ID搜索...', es: 'Buscar paciente / ID / Dispositivo...', },
  { key: 'gps.noResults', ko: '검색 결과가 없습니다', en: 'No results found', ja: '検索結果がありません', ch: '未找到搜索结果', es: 'No se encontraron resultados', },
  { key: 'gps.autoTracking', ko: '자동 추적', en: 'Auto Tracking', ja: '自動追跡', ch: '自动追踪', es: 'Rastreo Automático', },
  { key: 'gps.autoTracking.mobile', ko: '자동 추적', en: 'Auto Track', ja: '自動追跡', ch: '自动追踪', es: 'Rastreo Auto', },
  { key: 'gps.myLocation', ko: '내 위치 표시', en: 'Show My Location', ja: '現在地を表示', ch: '显示我的位置', es: 'Mostrar mi Ubicación', },
  { key: 'gps.myLocation.mobile', ko: '내 위치', en: 'Location', ja: '現在地', ch: '位置', es: 'Ubicación', },
  { key: 'gps.errorSupport', ko: '브라우저가 위치 정보를 지원하지 않습니다.', en: 'Browser does not support geolocation.', ja: 'ブラウザが位置情報をサポートしていません。', ch: '浏览器不支持地理定位。', es: 'El navegador no soporta geolocalización.', },
  { key: 'gps.errorFetch', ko: '위치 정보를 가져올 수 없습니다.', en: 'Unable to fetch location.', ja: '位置情報を取得できません。', ch: '无法获取位置信息。', es: 'No se pudo obtener la ubicación.', },
  { key: 'gps.errorPermission', ko: '위치 정보 접근 권한이 거부되었습니다. 브라우저 설정에서 허용해주세요.', en: 'Location permission denied. Please allow in settings.', ja: '位置情報のアクセス権限が拒否されました。設定で許可してください。', ch: '地理定位权限被拒绝。请在设置中允许。', es: 'Permiso de ubicación denegado. Permítalo en ajustes.', },
  { key: 'gps.errorUnavailable', ko: '위치 정보를 사용할 수 없습니다.', en: 'Location information is unavailable.', ja: '位置情報が利用できません。', ch: '位置信息不可用。', es: 'Información de ubicación no disponible.', },
  { key: 'gps.errorTimeout', ko: '위치 정보 요청 시간이 초과되었습니다.', en: 'Location request timed out.', ja: '位置情報の要求がタイムアウトしました。', ch: '获取位置超时。', es: 'La solicitud de ubicación expiró.', },
  { key: 'gps.errorTracking', ko: '실시간 추적 중 오류가 발생했습니다.', en: 'Error occurred during real-time tracking.', ja: 'リアルタイム追跡中にエラーが発生しました。', ch: '实时追踪过程中发生错误。', es: 'Ocurrió un error en el rastreo en tiempo real.', },
  { key: 'gps.userLocation', ko: '내 위치', en: 'My Location', ja: '現在地', ch: '我的位置', es: 'Mi Ubicación', },
  { key: 'gps.fixLocation', ko: '이 위치 고정', en: 'Fix this location', ja: 'この位置を固定', ch: '固定此位置', es: 'Fijar esta ubicación', },
  { key: 'gps.assignedPatient', ko: '담당 환자', en: 'Assigned Patient', ja: '担当患者', ch: '负责患者', es: 'Paciente Asignado', },
  { key: 'gps.signalStatus', ko: '신호 상태', en: 'Signal Status', ja: '信号状態', ch: '信号状态', es: 'Estado de Señal', },
  { key: 'gps.accuracy', ko: '정확도', en: 'Accuracy', ja: '精度', ch: '准确度', es: 'Precisión', },
  { key: 'gps.activeDevices', ko: '활성 장치', en: 'Active Devices', ja: 'アクティブデバイス', ch: '活跃设备', es: 'Dispositivos Activos', },
  { key: 'gps.uptime', ko: '가동 시간', en: 'System Uptime', ja: '稼働時間', ch: '运行时间', es: 'Tiempo de Actividad', },
  { key: 'gps.horizontalPrecision', ko: '수평 정밀도', en: 'Horizontal precision', ja: '水平精度', ch: '水平精度', es: 'Precisión horizontal', },
  { key: 'gps.monitoring247', ko: '24/7 모니터링', en: '24/7 Monitoring', ja: '24時間監視', ch: '24/7 监控', es: 'Monitoreo 24/7', },
  { key: 'gps.signalDetails', ko: '장비별 신호 보기', en: 'View Device Signals', ja: 'デバイスの信号を表示', ch: '查看设备信号', es: 'Ver señales de dispositivos', },
  { key: 'gps.signalDetailsTitle', ko: '네트워크 상태 진단', en: 'Network Diagnostics', ja: 'ネットワーク診断', ch: '网络状态诊断', es: 'Diagnósticos de Red', },
  { key: 'gps.connectedNodes', ko: '활성 노드', en: 'Active Nodes', ja: 'アクティブノード', ch: '活动节点', es: 'Nodos Activos', },
  // ---------------------------------------------------------------------------
  // Common
  // ---------------------------------------------------------------------------
  { key: 'common.relationship.spouse', ko: '배우자', en: 'Spouse', ja: '配偶者', ch: '配偶', es: 'Cónyuge', },
  { key: 'common.relationship.child', ko: '자녀', en: 'Child', ja: '子供', ch: '子女', es: 'Hijo/a', },
  { key: 'common.relationship.parent', ko: '부모', en: 'Parent', ja: '親', ch: '父母', es: 'Padre/Madre', },
  { key: 'common.relationship.guardian', ko: '보호자', en: 'Guardian', ja: '保護者', ch: '监护人', es: 'Tutor/Guardián', },
  { key: 'common.hospital', ko: '국민간호병원', en: 'National Nursing Hospital', ja: '国民看護病院', ch: '国民看护医院', es: 'Hospital Nacional de Enfermería', },
  { key: 'common.warning', ko: '경고', en: 'Warning', ja: '警告', ch: '警告', es: 'Advertencia', },
  { key: 'common.noResults', ko: '검색 결과가 없습니다', en: 'No results found', ja: '検索結果がありません', ch: '没有找到结果', es: 'No se encontraron resultados', },
  { key: 'common.unknown', ko: '알 수 없음', en: 'Unknown', ja: '不明', ch: '未知', es: 'Desconocido', },
  // ---------------------------------------------------------------------------
  // Status
  // ---------------------------------------------------------------------------
  { key: 'status.abnormal', ko: '비정상', en: 'Abnormal', ja: '異常', ch: '异常', es: 'Anormal', },
  // ---------------------------------------------------------------------------
  // Dashboard
  // ---------------------------------------------------------------------------
  { key: 'dashboard.lastUpdated', ko: '마지막 업데이트', en: 'Last updated', ja: '最終更新', ch: '最后更新', es: 'Última actualización', },
  { key: 'dashboard.usingCachedData', ko: '캐시된 데이터 사용 중', en: 'Using cached data', ja: 'キャッシュデータを使用中', ch: '正在使用缓存数据', es: 'Usando datos en caché', },
  // ---------------------------------------------------------------------------
  // Alerts
  // ---------------------------------------------------------------------------
  { key: 'alerts.msg.hrExceeded', ko: '심박수가 임계치를 초과했습니다', en: 'Heart rate exceeded threshold', ja: '心拍数がしきい値を超えました', ch: '心率超过临界值', es: 'La frecuencia cardíaca excedió el umbral', },
  { key: 'alerts.msg.rrOutOfRange', ko: '호흡수가 정상 범위를 벗어났습니다', en: 'Respiratory rate out of normal range', ja: '呼吸数が正常範囲を外れています', ch: '呼吸率超出正常范围', es: 'La frecuencia respiratoria está fuera del rango normal', },
  { key: 'alerts.msg.fallDetected', ko: '낙상이 감지되었습니다', en: 'Fall detected', ja: '転倒が検知されました', ch: '检测到跌倒', es: 'Se detectó una caída', },
  { key: 'alerts.msg.hrLow', ko: '심박수가 위험 기준치 이하입니다', en: 'Heart rate below danger threshold', ja: '心拍数が危険基準値を下回っています', ch: '心率低于危险临界值', es: 'Frecuencia cardíaca por debajo del umbral peligroso', },
  { key: 'alerts.msg.rrHigh', ko: '호흡수가 위험 기준치를 초과했습니다', en: 'Respiratory rate exceeded danger threshold', ja: '呼吸数が危険基準値を超えました', ch: '呼吸率超过危险临界值', es: 'Frecuencia respiratoria excedió el umbral peligroso', },
];

/**
 * LanguageContext public API:
 * - language
 * - setLanguage
 * - t(key)
 * - getLocalizedText(value)
 */
type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  getLocalizedText: (value: unknown, fallback?: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const normalizeLanguage = (value: unknown): Language => {
  const v = String(value || '').toLowerCase();
  if (v === 'ko' || v === 'en' || v === 'ja' || v === 'ch' || v === 'es') return v;
  return 'ko';
};

const firstAvailableString = (obj: Record<string, unknown>): string | undefined => {
  for (const val of Object.values(obj)) {
    if (typeof val === 'string' && val.trim().length > 0) return val;
  }
  return undefined;
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(LANGUAGE_STORAGE_KEY) : null;
    return normalizeLanguage(saved);
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // ignore storage failures
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  /**
   * Build O(1) lookup maps ONCE.
   * lookup[lang][key] -> translation string
   */
  const lookup = useMemo<Record<Language, Record<string, string>>>(() => {
    const base: Record<Language, Record<string, string>> = {
      ko: Object.create(null),
      en: Object.create(null),
      ja: Object.create(null),
      ch: Object.create(null),
      es: Object.create(null),
    };

    for (const entry of dictionary) {
      base.ko[entry.key] = entry.ko;
      base.en[entry.key] = entry.en;
      base.ja[entry.key] = entry.ja;
      base.ch[entry.key] = entry.ch;
      base.es[entry.key] = entry.es;
    }

    return base;
  }, []);

  /**
   * Maintain fallback behavior:
   * 1) current language
   * 2) English
   * 3) Korean
   * 4) first available value
   * 5) key string
   */
  const t = (key: string): string => {
    const current = lookup[language]?.[key];
    if (current) return current;

    const en = lookup.en?.[key];
    if (en) return en;

    const ko = lookup.ko?.[key];
    if (ko) return ko;

    // first available across languages
    const first =
      lookup.ja?.[key] ||
      lookup.ch?.[key] ||
      lookup.es?.[key];

    return first || key;
  };

  /**
   * getLocalizedText must keep current behavior:
   * - Accepts string OR object
   * - Selects language → en → ko → first value → fallback
   */
  const getLocalizedText = (value: unknown, fallback: string = ''): string => {
    // If already a string, return as-is
    if (typeof value === 'string') return value;

    // If null/undefined/other primitive, fallback
    if (!value || typeof value !== 'object') return fallback;

    // Expecting an object like: { ko: "...", en: "...", ... }
    const obj = value as Record<string, unknown>;

    const langVal = obj[language];
    if (typeof langVal === 'string' && langVal.trim().length > 0) return langVal;

    const enVal = obj.en;
    if (typeof enVal === 'string' && enVal.trim().length > 0) return enVal;

    const koVal = obj.ko;
    if (typeof koVal === 'string' && koVal.trim().length > 0) return koVal;

    const first = firstAvailableString(obj);
    if (first) return first;

    return fallback;
  };

  const ctxValue = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, t, getLocalizedText }),
    [language]
  );

  return <LanguageContext.Provider value={ctxValue}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
